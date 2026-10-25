# eli-video

Код ролика «12 ошибок, из-за которых сайт не продаёт». Подробное ТЗ лежит в TZ.md.

## Установка

    pip install -r requirements.txt
    playwright install chromium
    # нужен ffmpeg в PATH и шрифты: Noto Sans CJK SC, Liberation Sans/Serif, DejaVu Sans, Lora

## Сборка

    python build.py                       # все части → out/full.mp4 и out/full.srt
    python build.py block2                # одна часть → out/block2.mp4
    python build.py --check block3 40 61  # контрольные кадры в check/

Рендер детерминированный: в каждой странице src/*.html есть функция render(t), которая рисует кадр на момент t. Страницу можно открыть в браузере и в консоли вызвать render(12.5), чтобы посмотреть любой момент.

## Структура

    src/intro.html     вступление, 30 с
    src/block1.html    ошибки 1–3
    src/block2.html    ошибки 4–7
    src/block3.html    ошибки 8–10
    src/block4.html    ошибки 11–12 и финал
    src/parts/         исходные куски, из которых собраны block3 и block4 (общие стили, хелперы, сцены)
    build.py           рендер кадров, MP4, склейка, общие субтитры

## Как править

Текст и тайминги задаются массивом C (фразы) и PRE (паузы) в начале скрипта каждого блока. Сцены привязаны к T[i], началу i-й фразы. Цвета лежат в :root в <style>.
