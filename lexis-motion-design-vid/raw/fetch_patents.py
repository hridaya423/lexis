import json, os, subprocess, time, urllib.parse
UA = "lexis-ad-research/1.0 (contact: hridya@lexis.hridya.tech)"
def get(url):
    for _ in range(4):
        try: return json.loads(subprocess.check_output(["curl", "-s", "-A", UA, url]))
        except json.JSONDecodeError: time.sleep(4)
    return {}
QS = ["patent drawing telephone", "patent drawing calculating machine", "patent drawing radio", "patent drawing television",
      "patent drawing rocket", "patent drawing electric motor", "patent drawing airplane", "patent drawing amplifier",
      "patent drawing typewriter", "patent drawing phonograph", "patent drawing telegraph", "patent drawing cash register",
      "patent drawing adding machine", "patent drawing engine", "patent drawing dynamo", "patent drawing camera",
      "patent drawing tabulating", "patent drawing vacuum tube", "patent drawing transistor", "patent drawing computer"]
os.makedirs("pat", exist_ok=True)
cred = json.load(open("pat/credits.json")) if os.path.exists("pat/credits.json") else {}
for q in QS:
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search",
        "gsrnamespace": 6, "gsrsearch": q + " filetype:bitmap", "gsrlimit": 12, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1600})
    pages = sorted(get(u).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    n = 0
    for p in pages:
        ii = p["imageinfo"][0]; lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "")
        t = p["title"]
        if "atent" not in t and "NARA" not in t: continue
        if lic.lower() not in ("public domain", "cc0", "no restrictions") or ii["width"] < 800: continue
        name = f"p{len(cred):02d}"
        subprocess.call(["curl", "-sL", "-A", UA, "-o", f"pat/{name}.jpg", ii.get("thumburl") or ii["url"]])
        cred[name] = {"title": t, "license": lic, "url": ii.get("descriptionurl")}
        n += 1; time.sleep(1.0)
        if n >= 3: break
    json.dump(cred, open("pat/credits.json", "w"), indent=1)
    print(q, n, flush=True); time.sleep(1.0)
