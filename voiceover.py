"""Текст для озвучки из out/full.srt и out/chapters.txt.

  python voiceover.py

out/voiceover.txt      — для записи голосом: главы, таймкоды, паузы, подсказки чтения
out/voiceover_tts.txt  — для синтеза: фраза на строку, числа и названия словами
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "out")

# как читать трудные места: (что в тексте, как произносить)
SAY = [
    ("67-90%", "от шестидесяти семи до девяноста процентов"),
    ("17-33%", "от семнадцати до тридцати трёх процентов"),
    ("от 4,2 до 4,7", "от четырёх и двух до четырёх и семи"),
    ("выше 4,7", "выше четырёх и семи"),
    ("2684 человека", "две тысячи шестьсот восемьдесят четыре человека"),
    ("В 2006 году", "В две тысячи шестом году"),
    ("2002 год", "две тысячи второй год"),
    ("в 1950-х", "в тысяча девятьсот пятидесятых"),
    ("53%", "пятьдесят три процента"),
    ("75%", "семьдесят пять процентов"),
    ("46%", "сорок шесть процентов"),
    ("270%", "двести семьдесят процентов"),
    ("380%", "триста восемьдесят процентов"),
    ("70%", "семьдесят процентов"),
    ("40%", "сорок процентов"),
    ("17%", "семнадцать процентов"),
    ("12 пунктов", "двенадцать пунктов"),
    ("50 миллисекунд", "пятьдесят миллисекунд"),
    ("10 секунд", "десять секунд"),
    ("14 дней", "четырнадцать дней"),
    ("30 заявок", "тридцать заявок"),
    ("Nielsen Norman Group", "Нильсен Норман Груп"),
    ("Baymard Institute", "Бэймард Инститьют"),
    ("Baymard", "Бэймард"),
    ("PageSpeed Insights", "Пейдж Спид Инсайтс"),
    ("Spiegel", "Спигел"),
    ("Northwestern University", "Нортвестерн Юниверсити"),
    ("PowerReviews", "Пауэр Ревьюс"),
    ("Telegram-канале", "телеграм-канале"),
    ("Google", "Гугл"),
    ("Eli's", "Элис"),
]
# в версии для чтения подсказываем только то, где легко споткнуться
HINT = {"67-90%", "17-33%", "от 4,2 до 4,7", "выше 4,7", "2684 человека", "в 1950-х",
        "Nielsen Norman Group", "Baymard", "PageSpeed Insights", "Spiegel", "Northwestern University", "PowerReviews"}


def srt(path):
    rows = []
    for block in open(path, encoding="utf-8").read().strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) < 3: continue
        a, b = lines[1].split(" --> ")
        sec = lambda x: int(x[:2]) * 3600 + int(x[3:5]) * 60 + int(x[6:8]) + int(x[9:]) / 1000
        rows.append((sec(a), sec(b), " ".join(lines[2:])))
    return rows


def mmss(x):
    x = int(x); return f"{x // 60}:{x % 60:02d}"


def spoken(text):
    for a, b in SAY:
        text = text.replace(a, b)
    return text


def hinted(text):
    return [f"{a} — «{b}»" for a, b in SAY if a in HINT and a in text]


def main():
    rows = srt(os.path.join(OUT, "full.srt"))
    chapters = []
    for line in open(os.path.join(OUT, "chapters.txt"), encoding="utf-8"):
        t, title = line.strip().split(" ", 1)
        m, s = t.split(":"); chapters.append((int(m) * 60 + int(s), title))
    words = sum(len(r[2].split()) for r in rows)
    dur = rows[-1][1]

    out = [
        "ТЕКСТ ДЛЯ ОЗВУЧКИ",
        "«12 ошибок, из-за которых сайт не продаёт» · Eli's",
        "",
        f"Длина ролика {mmss(dur + 20)} (голос до {mmss(dur)}, дальше концевая заставка) · {words} слов · {len(rows)} фраз",
        "",
        "КАК ЧИТАТЬ",
        "• Темп около 150 слов в минуту: бодро, как объясняешь знакомому, без рекламной интонации.",
        "• Таймкод слева — где фраза стоит в ролике. Попадать секунда в секунду не нужно, тайминги подгоню под запись.",
        "• ▮ ПАУЗА — красная карточка «Ошибка N из 12». Помолчи около секунды.",
        "• В квадратных скобках — как произносить трудное место. Скобки не читать.",
        "• Записывай одним файлом без музыки: телефон или петличка, тихая комната, 20–30 см от рта.",
        "• Ошибся — сделай паузу и повтори фразу целиком, лишнее вырежу.",
        "",
    ]
    ci = 0
    for a, b, text in rows:
        while ci < len(chapters) and a + 0.9 >= chapters[ci][0]:
            t, title = chapters[ci]
            out += ["", f"━━━ {title.upper()} · {mmss(t)} ━━━"]
            if ci > 0 and title != "Чек-лист":
                out.append("▮ ПАУЗА ~1 с")
            ci += 1
        line = f"{mmss(a):>5}  {text}"
        notes = hinted(text)
        if "Baymard Institute" in text:   # «Baymard» внутри названия института не дублируем
            notes = [n for n in notes if not n.startswith("Baymard —")] + ["Baymard Institute — «Бэймард Инститьют»"]
        if notes:
            line += "  [" + "; ".join(notes) + "]"
        out.append(line)
    out += ["", f"━━━ КОНЦЕВАЯ ЗАСТАВКА · {mmss(dur)}–{mmss(dur + 20)} ━━━", "Молчание, здесь пойдёт музыка."]
    open(os.path.join(OUT, "voiceover.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")

    tts = [spoken(t) for _, _, t in rows]
    open(os.path.join(OUT, "voiceover_tts.txt"), "w", encoding="utf-8").write("\n".join(tts) + "\n")
    left = [t for t in tts if re.search(r"\d|[A-Za-z]", t)]
    print(f"готово: {len(rows)} фраз, {words} слов")
    if left:
        print("в версии для синтеза остались цифры или латиница:", *left, sep="\n  ")


if __name__ == "__main__":
    main()
