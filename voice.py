"""Подгонка ролика под готовую запись голоса.

  python voice.py            # сопоставить фразы с записью, собрать out/voice/voice.wav и src/timing_*.js
  python build.py            # отрендерить с новыми таймингами и свести голос

Вход:  out/voice/source.mp3 (запись), out/voice/words.json (распознанные слова с таймингами:
       [начало, конец, слово, уверенность]), фразы сценария берутся из страниц src/*.html.
Выход: out/voice/voice.wav       — голос с паузами под красные карточки и стыки частей
       out/voice/voice_<часть>.wav — тот же голос по частям, длиной ровно в часть
       out/voice/alignment.txt   — где в записи нашлась каждая фраза (для проверки)
       src/timing_<часть>.js     — опорные точки «новое время → старое время» для каждой части
"""
import asyncio, difflib, json, os, re, subprocess, sys, wave
import numpy as np
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "out", "voice")
PARTS = ["intro", "block1", "block2", "block3", "block4"]
SR = 48000
CHROME = os.environ.get("CHROME_PATH")
TAIL = {"intro": None, "block4": None}   # None — хвост части как в коде (шторка, концевая заставка)
BLOCK_TAIL = 1.0                          # хвост между блоками, с: затухание перед следующей карточкой


async def script():
    """Фразы, их старые тайминги и длительность каждой части — прямо из страниц."""
    parts = []
    async with async_playwright() as p:
        br = await (p.chromium.launch(executable_path=CHROME) if CHROME else p.chromium.launch())
        for name in PARTS:
            pg = await br.new_page()
            await pg.goto("file://" + os.path.join(ROOT, "src", name + ".html"))
            await pg.wait_for_timeout(300)
            # T, E и DUR в коде не меняются подгонкой (она только пересчитывает время), поэтому читаем их как есть
            d = await pg.evaluate("""() => {
              if (typeof SUBS !== 'undefined') return {text: SUBS.map(s => s[2]), T: SUBS.map(s => s[0]), E: SUBS.map(s => s[1]), dur: DUR};
              return {text: C, T: T, E: E, dur: DUR};
            }""")
            d["name"] = name
            parts.append(d)
            await pg.close()
        await br.close()
    return parts


def norm(w):
    w = w.lower().replace("ё", "е")
    return re.sub(r"[^0-9a-zа-я-]", "", w).strip("-")


def align(parts, words):
    """Каждой фразе — начало и конец в записи. Слова сценария и распознанные сопоставляются по порядку."""
    stoks, owner = [], []
    for pi, part in enumerate(parts):
        for k, text in enumerate(part["text"]):
            for w in text.split():
                if norm(w):
                    stoks.append(norm(w)); owner.append((pi, k))
    atoks = [norm(w[2]) for w in words]
    sm = difflib.SequenceMatcher(None, stoks, atoks, autojunk=False)
    match = {}
    for a, b, n in sm.get_matching_blocks():
        for i in range(n): match[a + i] = b + i
    print(f"совпало слов: {len(match)} из {len(stoks)} в сценарии и {len(atoks)} в записи")

    # фраза → индексы слов записи, которые ей принадлежат: между совпавшими соседями
    ranges, si = {}, 0
    keys = [(pi, k) for pi, part in enumerate(parts) for k in range(len(part["text"]))]
    idx_by_phrase = {key: [] for key in keys}
    for i, key in enumerate(owner): idx_by_phrase[key].append(i)
    prev_b = -1
    for key in keys:
        ids = idx_by_phrase[key]
        got = [match[i] for i in ids if i in match]
        if got:
            first_i = ids.index(next(i for i in ids if i in match))
            last_i = len(ids) - 1 - ids[::-1].index(next(i for i in ids[::-1] if i in match))
            lo = max(prev_b + 1, min(got) - first_i)          # несовпавшие слова в начале фразы
            hi = max(got) + (len(ids) - 1 - last_i)            # и в конце
        else:
            lo = prev_b + 1; hi = lo + len(ids) - 1            # фраза не нашлась — берём следующие слова
        hi = min(max(hi, lo), len(words) - 1)
        ranges[key] = (lo, hi); prev_b = hi
    return keys, ranges


def load_audio(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "quiet", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def quietest(a, t0, t1):
    """Самая тихая точка между t0 и t1 — там режем, чтобы не задеть согласные."""
    i0, i1 = int(t0 * SR), int(t1 * SR)
    if i1 - i0 < int(0.02 * SR): return (t0 + t1) / 2
    win = int(0.01 * SR)
    seg = a[i0:i1] ** 2
    e = np.convolve(seg, np.ones(win) / win, mode="same")
    return (i0 + int(np.argmin(e))) / SR


def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def main():
    words = json.load(open(os.path.join(VOICE, "words.json")))
    parts = asyncio.run(script())
    keys, ranges = align(parts, words)
    a = load_audio(os.path.join(VOICE, "source.mp3"))
    total = len(a) / SR

    # начало и конец речи каждой фразы в записи
    sp = [(words[ranges[k][0]][0], words[ranges[k][1]][1]) for k in keys]
    # точки разреза — самая тихая точка между фразами
    cuts = [0.0] + [quietest(a, max(sp[i][1], sp[i + 1][0] - 0.6), sp[i + 1][0]) if sp[i + 1][0] > sp[i][1]
                    else (sp[i][1] + sp[i + 1][0]) / 2 for i in range(len(sp) - 1)] + [total]

    out, timing, log, g = [], {}, [], 0
    for pi, part in enumerate(parts):
        n = len(part["text"]); T, E, dur = part["T"], part["E"], part["dur"]
        name = part["name"]
        local = []                    # новые начало/конец фраз внутри части
        t = 0.0                       # текущее время в части
        piece = []
        for k in range(n):
            gi = g + k
            c0, c1 = cuts[gi], cuts[gi + 1]
            s0, s1 = sp[gi]
            lead = s0 - c0            # тишина записи перед словами внутри куска
            if k == 0:
                start = T[0]          # первая фраза части — там же, где в коде
                pad = max(0.0, start - lead - t)
            else:
                natural = s0 - sp[gi - 1][1]
                old_gap = T[k] - E[k - 1]
                need = old_gap if old_gap >= 0.45 else 0.0    # паузы, заложенные в коде: карточки, смена сцен
                pad = max(0.0, need - natural)
            piece.append(np.zeros(int(pad * SR), np.float32)); t += pad
            clip = a[int(c0 * SR):int(c1 * SR)]
            ns = t + lead; ne = t + (s1 - c0)
            local.append((round(ns, 3), round(ne, 3)))
            piece.append(clip); t += len(clip) / SR
            log.append(f"{name:7s} {k:3d}  запись {s0:7.2f}–{s1:7.2f}  в части {ns:7.2f}–{ne:7.2f}  "
                       f"{' '.join(w[2] for w in words[ranges[keys[gi]][0]:ranges[keys[gi]][1] + 1])[:60]}  |  {part['text'][k][:50]}")
        g += n
        # хвост части: шторка вступления и концевая заставка как в коде, между блоками короче
        old_tail = dur - E[-1]
        tail = old_tail if name in TAIL else min(old_tail, BLOCK_TAIL)
        speech_end = local[-1][1]
        new_dur = max(speech_end + tail, t)
        piece.append(np.zeros(int((new_dur - t) * SR), np.float32))
        out.extend(piece)
        write_wav(os.path.join(VOICE, f"voice_{name}.wav"), np.concatenate(piece))
        # опорные точки: новое время → старое; начало и конец каждой фразы
        anchors = [(0.0, 0.0)]
        for k, (ns, ne) in enumerate(local):
            for nt, ot in ((ns, T[k]), (ne, E[k])):
                if nt > anchors[-1][0] + 1e-3 and ot > anchors[-1][1] + 1e-3: anchors.append((nt, ot))
        anchors.append((round(new_dur, 3), dur))
        timing[name] = {"dur": round(new_dur, 3), "anchors": anchors, "phrases": local}
        js = ("// Создано voice.py: время части подогнано под запись голоса. Удалите файл, чтобы вернуть расчётные тайминги.\n"
              f"window.WARP = {json.dumps(timing[name], ensure_ascii=False)};\n")
        open(os.path.join(ROOT, "src", f"timing_{name}.js"), "w", encoding="utf-8").write(js)
        print(f"{name}: было {dur:.1f} с, стало {new_dur:.1f} с")

    voice = np.concatenate(out)
    write_wav(os.path.join(VOICE, "voice.wav"), voice)
    open(os.path.join(VOICE, "alignment.txt"), "w", encoding="utf-8").write("\n".join(log) + "\n")
    print(f"голос: {len(voice) / SR:.1f} с → out/voice/voice.wav")


if __name__ == "__main__":
    main()
