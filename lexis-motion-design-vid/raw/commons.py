import json, subprocess, sys, urllib.parse


def get(url):
    return json.loads(subprocess.check_output(["curl", "-s", "-A", "lexis-ad-research/1.0 (contact: hridya@lexis.hridya.tech)", url]))


def search(q, n=12):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": q + " filetype:bitmap", "gsrlimit": n, "prop": "imageinfo",
        "iiprop": "url|size|extmetadata", "iiurlwidth": 2400})
    pages = get(u).get("query", {}).get("pages", {})
    for p in sorted(pages.values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]
        lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "?")
        print(f"  {ii['width']}x{ii['height']} | {lic} | {p['title']}\n      {ii.get('thumburl') or ii['url']}")


if __name__ == "__main__":
    for q in sys.argv[1:]:
        print("##", q)
        search(q)


def download(title, out, width=2400):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "titles": title, "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": width})
    p = next(iter(get(u)["query"]["pages"].values()))
    ii = p["imageinfo"][0]
    url = ii.get("thumburl") or ii["url"]
    subprocess.check_call(["curl", "-sL", "-A", "lexis-ad-research/1.0 (contact: hridya@lexis.hridya.tech)", "-o", out, url])
    em = ii.get("extmetadata", {})
    return {"file": out, "title": title, "license": em.get("LicenseShortName", {}).get("value"),
            "artist": em.get("Artist", {}).get("value", "")[:200], "url": ii.get("descriptionurl")}
