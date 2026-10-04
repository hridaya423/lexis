"""Bulk-fetch a strobe library from Wikimedia Commons: patent drawings + archival progress photos.
Keeps only public-domain / CC0 / CC BY / CC BY-SA results, one best match per query."""
import json, os, subprocess, time, urllib.parse

UA = "lexis-ad-research/1.0 (contact: hridya@lexis.hridya.tech)"
OK = ("public domain", "cc0", "cc by 2.0", "cc by 3.0", "cc by 4.0", "cc by-sa 2.0", "cc by-sa 3.0", "cc by-sa 4.0", "no restrictions", "pd")

Q = [
    ("hu_mcc_celebrate", "Apollo 11 mission control celebrate splashdown"), ("hu_spectators", "spectators watch Apollo 11 launch"),
    ("hu_kjohnson", "Katherine Johnson at desk NASA 1962"), ("hu_kids", "children using computers classroom 1980s"),
    ("hu_parade", "John Glenn ticker tape parade New York"), ("hu_edwhite", "Ed White spacewalk Gemini 4"),
    ("hu_engineers", "Apollo engineers celebrating"), ("hu_ibm_women", "women computer operators 1960s"),
    ("hu_launchcrowd", "crowd watching rocket launch Cape Canaveral"), ("hu_moonwalk", "Aldrin on the Moon Apollo 11 visor"),
    ("hu_shuttlecrew", "Space Shuttle crew walkout"), ("hu_firstweb", "Tim Berners-Lee CERN 1994"),
    ("e8_voyager", "Voyager spacecraft"), ("e8_viking", "Viking lander Mars surface"), ("e8_skylab", "Skylab space station 1973"),
    ("e8_ibmpc", "IBM Personal Computer 5150"), ("e8_mac", "Macintosh 128K"), ("e8_dynatac", "Motorola DynaTAC 8000X"),
    ("e8_pet", "Commodore PET 2001"), ("e8_floppy", "8-inch floppy disk"), ("e8_columbia", "STS-1 Columbia launch 1981"),
    ("e8_hubble90", "Hubble Space Telescope released STS-31"), ("e8_pong", "Pong arcade"), ("e8_fiber", "fiber optic bundle light"),
]


def get(url):
    for _ in range(4):
        out = subprocess.check_output(["curl", "-s", "-A", UA, url])
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            time.sleep(4)
    return {}


def best(q):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": q + " filetype:bitmap", "gsrlimit": 10, "prop": "imageinfo",
        "iiprop": "url|size|extmetadata", "iiurlwidth": 1800})
    pages = sorted(get(u).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    for p in pages:
        ii = p["imageinfo"][0]
        lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "").lower()
        if ii["width"] >= 700 and any(lic.startswith(o) for o in OK):
            return p["title"], ii
    return None, None


os.makedirs("img2", exist_ok=True)
credits = json.load(open("img2/credits.json")) if os.path.exists("img2/credits.json") else {}
for name, q in Q:
    if name in credits:
        continue
    title, ii = best(q)
    time.sleep(1.2)
    if not title:
        print("miss", name, q)
        continue
    ext = ".png" if (ii.get("thumburl") or ii["url"]).lower().endswith(".png") else ".jpg"
    subprocess.call(["curl", "-sL", "-A", UA, "-o", f"img2/{name}{ext}", ii.get("thumburl") or ii["url"]])
    em = ii.get("extmetadata", {})
    credits[name] = {"file": f"img2/{name}{ext}", "title": title, "license": em.get("LicenseShortName", {}).get("value"),
                     "artist": em.get("Artist", {}).get("value", "")[:200], "url": ii.get("descriptionurl")}
    json.dump(credits, open("img2/credits.json", "w"), indent=1)
    print("ok", name, credits[name]["license"], title[:70], flush=True)
    time.sleep(1.2)
