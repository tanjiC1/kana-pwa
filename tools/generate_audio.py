import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
ITEMS = ROOT / "tools" / "audio-items.json"
AUDIO = ROOT / "audio"
VOICE = "ja-JP-NanamiNeural"
RATE = "-15%"

async def generate_one(item):
    target = ROOT / item["file"]
    if target.exists() and target.stat().st_size > 0:
        return "skip", target.name
    target.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(item["text"], VOICE, rate=RATE)
    await communicate.save(str(target))
    return "ok", target.name

async def main():
    items = json.loads(ITEMS.read_text(encoding="utf-8"))
    ok = skipped = 0
    for index, item in enumerate(items, 1):
        status, name = await generate_one(item)
        if status == "ok":
            ok += 1
        else:
            skipped += 1
        print(f"[{index}/{len(items)}] {status}: {name}")
    print(f"done: generated={ok}, skipped={skipped}, total={len(items)}")

if __name__ == "__main__":
    asyncio.run(main())
