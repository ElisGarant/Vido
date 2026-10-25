"""Сборка ролика «12 ошибок, из-за которых сайт не продаёт».
Рендер: каждая часть (src/*.html) — детерминированная анимация, функция render(t).
Playwright снимает кадры 1920x1080 @30fps, ffmpeg собирает MP4, затем всё склеивается.

  python build.py              # все части + full.mp4 + full.srt
  python build.py block3       # одна часть
  python build.py --check block2 12.5 40   # контрольные кадры в check/
"""
import asyncio, base64, os, subprocess, sys
from playwright.async_api import async_playwright

PARTS = ["intro", "block1", "block2", "block3", "block4"]
FPS = 30
CHROME = os.environ.get("CHROME_PATH")  # необязательно: свой путь к Chromium
ROOT = os.path.dirname(os.path.abspath(__file__))

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
    n = int(await duration(pg) * FPS) + 1 if name != "intro" else 30 * FPS
    out = os.path.join(ROOT, "frames", name); os.makedirs(out, exist_ok=True)
    cdp = await pg.context.new_cdp_session(pg)
    for i in range(n):
        await pg.evaluate(f"render({i / FPS})")
        r = await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 92})
        open(f"{out}/{i:05d}.jpg", "wb").write(base64.b64decode(r["data"]))
        if i % 300 == 0: print(name, i, "/", n, flush=True)
    await br.close()
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{out}/%05d.jpg",
        "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-r", str(FPS),
        "-c:a", "aac", "-movflags", "+faststart", os.path.join(ROOT, "out", name + ".mp4")], check=True)

async def subs(p, name):
    br, pg = await open_page(p, name)
    if name == "intro":
        rows = await pg.evaluate("SUBS.map(s=>[s[0],s[1],s[2]])"); d = 30.0
    else:
        C, T, E = await pg.evaluate("[C,T,E]"); d = await duration(pg)
        rows = [[a, b + .1, c] for c, a, b in zip(C, T, E)]
    await br.close()
    return rows, d

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
        for name in parts: await render_part(p, name)
        if args: return
        # склейка + общие субтитры
        lst = os.path.join(ROOT, "out", "list.txt")
        open(lst, "w").write("".join(f"file '{os.path.join(ROOT, 'out', n + '.mp4')}'\n" for n in PARTS))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c", "copy", os.path.join(ROOT, "out", "full.mp4")], check=True)
        off, k, lines = 0.0, 1, []
        for name in PARTS:
            rows, d = await subs(p, name)
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
        print("готово: out/full.mp4, out/full.srt")

asyncio.run(main())
