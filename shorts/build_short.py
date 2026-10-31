"""Сборка вертикальных роликов из shorts/<имя>.html (1080×1920, 30 fps).

  python shorts/build_short.py short1             # → out/short1.mp4
  python shorts/build_short.py --check short1 5 20 # контрольные кадры в check/
"""
import asyncio, base64, os, shutil, subprocess, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
from build import FPS, write_sfx, loudness   # тот же синтез звуков и выравнивание громкости, что у большого ролика

CHROME = os.environ.get("CHROME_PATH")
W, H = 1080, 1920


async def open_page(p, name):
    br = await (p.chromium.launch(executable_path=CHROME) if CHROME else p.chromium.launch())
    pg = await br.new_page(viewport={"width": W, "height": H})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto("file://" + os.path.join(HERE, name + ".html"))
    await pg.wait_for_timeout(500)
    if errs: raise RuntimeError(f"{name}: {errs}")
    return br, pg


async def main():
    args = sys.argv[1:]
    async with async_playwright() as p:
        if args[0] == "--check":
            br, pg = await open_page(p, args[1]); os.makedirs(os.path.join(ROOT, "check"), exist_ok=True)
            for t in map(float, args[2:]):
                await pg.evaluate(f"render({t})")
                await pg.screenshot(path=os.path.join(ROOT, "check", f"{args[1]}_{t:06.2f}.png"))
            await br.close(); return
        name = args[0]
        br, pg = await open_page(p, name)
        dur = await pg.evaluate("DUR"); n = int(dur * FPS) + 1
        frames = os.path.join(ROOT, "frames", name); shutil.rmtree(frames, ignore_errors=True); os.makedirs(frames)
        cdp = await pg.context.new_cdp_session(pg)
        for i in range(n):
            await pg.evaluate(f"render({i / FPS})")
            r = await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 92})
            open(f"{frames}/{i:05d}.jpg", "wb").write(base64.b64decode(r["data"]))
        events = await pg.evaluate("sfxEvents()")
        await br.close()
    out = os.path.join(ROOT, "out"); sfx = os.path.join(out, name + "_sfx.wav")
    write_sfx(events, n / FPS, sfx)
    mp4 = os.path.join(out, name + ".mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{frames}/%05d.jpg", "-i", sfx,
                    "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
                    "-c:a", "aac", "-movflags", "+faststart", mp4], check=True)
    loudness(mp4, target=-16.0)   # только звуки, без голоса и музыки: тише, чем −14
    print("готово:", mp4, f"{dur:.1f} с")


asyncio.run(main())
