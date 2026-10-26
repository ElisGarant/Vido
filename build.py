"""Сборка ролика «12 ошибок, из-за которых сайт не продаёт».
Рендер: каждая часть (src/*.html) — детерминированная анимация, функция render(t).
Playwright снимает кадры 1920x1080 @30fps, ffmpeg собирает MP4, затем всё склеивается.

  python build.py              # все части + full.mp4 + full.srt
  python build.py block3       # одна часть
  python build.py --check block2 12.5 40   # контрольные кадры в check/
"""
import asyncio, base64, os, shutil, subprocess, sys, wave
import numpy as np
from playwright.async_api import async_playwright

SR = 48000
PARTS = ["intro", "block1", "block2", "block3", "block4"]
FPS = 30
CHROME = os.environ.get("CHROME_PATH")  # необязательно: свой путь к Chromium
ROOT = os.path.dirname(os.path.abspath(__file__))

# ---------- звук: синтез эффектов по событиям страницы (sfxEvents в src/motion.js)
def _svf_bp(x, fc, q=.9):
    """полосовой фильтр с меняющейся частотой среза fc[i]"""
    lp = bp = 0.0; out = np.empty_like(x); f = 2 * np.sin(np.pi * np.clip(fc, 20, 12000) / SR)
    for i in range(len(x)):
        hp = x[i] - lp - q * bp; bp += f[i] * hp; lp += f[i] * bp; out[i] = bp
    return out

def _norm(x, db): return x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)

def _whoosh(d, f0, f1, f2, peak=.65, rng=None):
    n = int(d * SR); t = np.arange(n) / n
    env = np.where(t < peak, (t / peak) ** 2, np.exp(-(t - peak) / (1 - peak) * 4))
    fc = np.where(t < peak, f0 + (f1 - f0) * t / peak, f1 + (f2 - f1) * (t - peak) / (1 - peak))
    return _svf_bp(rng.standard_normal(n), fc) * env

def sound(kind, rng):
    if kind == "whoosh": return _norm(_whoosh(.6, 300, 2800, 700, rng=rng), -16), "sweep"
    if kind == "swish": return _norm(_whoosh(.35, 1200, 4200, 2000, .55, rng), -24), "sweep"
    t = np.arange(int(.9 * SR)) / SR
    if kind == "hit":
        body = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 28)) / SR) * np.exp(-t * 4.5)
        click = rng.standard_normal(len(t)) * np.exp(-t * 300) * .5
        return _norm(body + click, -10), "center"
    t = t[: int(.14 * SR)]
    if kind == "pop":
        return _norm(np.sin(2 * np.pi * np.cumsum(500 + 500 * (1 - np.exp(-t * 60))) / SR) * np.exp(-t * 38), -21), "rand"
    if kind == "tick":
        x = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 160) + np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t * 400) * .3
        return _norm(x, -25), "rand"
    raise ValueError(kind)

def write_sfx(events, dur, path):
    rng = np.random.default_rng(12); n = int(round(dur * SR)); mix = np.zeros((n, 2))
    for k, (t0, kind, gain) in enumerate(events):
        x, pan = sound(kind, rng); x = x * gain; i = int(max(t0, 0) * SR)
        if i >= n: continue
        x = x[: n - i]
        if pan == "sweep": p = np.linspace(-.6, .6, len(x))          # слева направо, как шторка
        elif pan == "rand": p = np.full(len(x), ((k * 37) % 9 - 4) / 10)
        else: p = np.zeros(len(x))
        mix[i:i + len(x), 0] += x * np.sqrt((1 - p) / 2) * 1.414
        mix[i:i + len(x), 1] += x * np.sqrt((1 + p) / 2) * 1.414
    mix = np.tanh(mix * 1.2) / 1.2
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype("<i2").tobytes())

async def open_page(p, name):
    br = await p.chromium.launch(executable_path=CHROME) if CHROME else await p.chromium.launch()
    pg = await br.new_page(viewport={"width": 1920, "height": 1080})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto("file://" + os.path.join(ROOT, "src", name + ".html"))
    await pg.wait_for_timeout(500)
    if errs: raise RuntimeError(f"{name}: {errs}")
    return br, pg

async def duration(pg):
    return await pg.evaluate("typeof DUR!=='undefined'?DUR:30")

async def render_part(p, name):
    br, pg = await open_page(p, name)
    n = int(await duration(pg) * FPS) + 1
    out = os.path.join(ROOT, "frames", name); shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    cdp = await pg.context.new_cdp_session(pg)
    for i in range(n):
        await pg.evaluate(f"render({i / FPS})")
        r = await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 92})
        open(f"{out}/{i:05d}.jpg", "wb").write(base64.b64decode(r["data"]))
        if i % 300 == 0: print(name, i, "/", n, flush=True)
    events = await pg.evaluate("sfxEvents()")
    await br.close()
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    sfx = os.path.join(ROOT, "out", name + "_sfx.wav"); await asyncio.to_thread(write_sfx, events, n / FPS, sfx)
    await asyncio.to_thread(subprocess.run, ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{out}/%05d.jpg",
        "-i", sfx, "-shortest",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-r", str(FPS),
        "-c:a", "aac", "-movflags", "+faststart", os.path.join(ROOT, "out", name + ".mp4")], check=True)

async def subs(p, name):
    br, pg = await open_page(p, name)
    if name == "intro":
        rows = await pg.evaluate("SUBS.map(s=>[s[0],s[1],s[2]])"); d = await duration(pg)
        ttl = [[0, "Вступление"]]
    else:
        C, T, E = await pg.evaluate("[C,T,E]"); d = await duration(pg)
        rows = [[a, b + .1, c] for c, a, b in zip(C, T, E)]
        ttl = await pg.evaluate("TTL")
    await br.close()
    return rows, d, ttl

def mmss(x):
    x = int(x); return f"{x // 60}:{x % 60:02d}"

def ts(x):
    ms = int(round(x * 1000))
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"

async def main():
    args = sys.argv[1:]
    async with async_playwright() as p:
        if args and args[0] == "--check":
            name = args[1]; br, pg = await open_page(p, name); os.makedirs("check", exist_ok=True)
            for t in map(float, args[2:]):
                await pg.evaluate(f"render({t})"); await pg.screenshot(path=f"check/{name}_{t:07.2f}.png")
            await br.close(); return
        parts = args or PARTS
        # части рендерятся параллельно, по одной вкладке Chromium на часть
        sem = asyncio.Semaphore(int(os.environ.get("JOBS", 3)))
        async def one(name):
            async with sem: await render_part(p, name)
        await asyncio.gather(*(one(n) for n in parts))
        if args: return
        # склейка + общие субтитры
        lst = os.path.join(ROOT, "out", "list.txt")
        open(lst, "w").write("".join(f"file '{os.path.join(ROOT, 'out', n + '.mp4')}'\n" for n in PARTS))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c", "copy", os.path.join(ROOT, "out", "full.mp4")], check=True)
        off, k, lines, chap = 0.0, 1, [], []
        for name in PARTS:
            rows, d, ttl = await subs(p, name)
            # главы YouTube: начинаем чуть раньше заголовка, чтобы попасть на красную карточку
            for a, title in ttl:
                title = "Чек-лист" if title == "Итог" else title.replace("Ошибка ", "")
                chap.append(f"{mmss(max(a + off - (0 if title == 'Чек-лист' else .8), 0))} {title}")
            part = []
            for a, b, c in rows:
                lines.append(f"{k}\n{ts(a + off)} --> {ts(b + off)}\n{c}\n"); k += 1
                part.append(f"{len(part)+1}\n{ts(a)} --> {ts(b)}\n{c}\n")
            open(os.path.join(ROOT, "out", name + ".srt"), "w", encoding="utf-8").write("\n".join(part))
            # реальная длина части берётся из готового mp4, чтобы субтитры не уплывали
            dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "csv=p=0", os.path.join(ROOT, "out", name + ".mp4")]).decode())
            off += dur
        open(os.path.join(ROOT, "out", "full.srt"), "w", encoding="utf-8").write("\n".join(lines))
        open(os.path.join(ROOT, "out", "chapters.txt"), "w", encoding="utf-8").write("\n".join(chap) + "\n")
        print("готово: out/full.mp4, out/full.srt")

asyncio.run(main())
