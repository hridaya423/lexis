"""Collect commercially-usable (CC BY / BY-SA / CC0) instrumental tracks from Openverse (Jamendo, ccMixter, FMA)."""
import json, os, subprocess, time, urllib.parse

QS = ["epic electronic", "cinematic", "inspiring", "motivational electronic", "hybrid orchestral", "synthwave", "retrowave",
      "outrun", "uplifting", "adventure electronic", "space", "future", "innovation", "epic trailer", "dramatic electronic",
      "orchestral epic", "arpeggio", "electro", "progressive house", "techno", "big beat", "energetic", "heroic", "triumphant",
      "sci-fi", "documentary", "action", "powerful", "rise", "pulse"]
BAD = ("nc", "nd")
os.makedirs("music", exist_ok=True)
pool = json.load(open("music/pool.json")) if os.path.exists("music/pool.json") else {}
for q in QS:
    u = "https://api.openverse.org/v1/audio/?" + urllib.parse.urlencode({"q": q, "license_type": "commercial,modification", "page_size": 20})
    try:
        res = json.loads(subprocess.check_output(["curl", "-s", u])).get("results", [])
    except Exception:
        res = []
    for r in res:
        lic = (r.get("license") or "").lower()
        dur = (r.get("duration") or 0) / 1000
        tags = [t["name"] for t in (r.get("tags") or [])]
        if any(b in lic for b in BAD) or not (50 < dur < 400) or "vocal" in tags or r["id"] in pool:
            continue
        if r.get("source") not in ("jamendo", "ccmixter", "free_music_archive", "freesound"):
            continue
        pool[r["id"]] = {"title": r["title"], "creator": r.get("creator"), "license": f'{lic} {r.get("license_version")}',
                         "url": r.get("url"), "page": r.get("foreign_landing_url"), "dur": dur, "tags": tags, "q": q, "source": r.get("source")}
    time.sleep(0.6)
json.dump(pool, open("music/pool.json", "w"), indent=1)
print(len(pool), "tracks")
for k, v in pool.items():
    p = f"music/{k}.mp3"
    if not os.path.exists(p):
        subprocess.call(["curl", "-sL", "-m", "60", "-o", p, v["url"]])
print("downloaded", len([f for f in os.listdir("music") if f.endswith(".mp3")]))
