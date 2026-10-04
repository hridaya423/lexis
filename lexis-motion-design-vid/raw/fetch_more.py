"""Bulk-fetch a strobe library from Wikimedia Commons: patent drawings + archival progress photos.
Keeps only public-domain / CC0 / CC BY / CC BY-SA results, one best match per query."""
import json, os, subprocess, time, urllib.parse

UA = "lexis-ad-research/1.0 (contact: hridya@lexis.hridya.tech)"
OK = ("public domain", "cc0", "cc by 2.0", "cc by 3.0", "cc by 4.0", "cc by-sa 2.0", "cc by-sa 3.0", "cc by-sa 4.0", "no restrictions", "pd")

Q = [
    # patents, oldest -> newest
    ("pat_typewriter", "Sholes typewriter patent drawing"), ("pat_telephone", "Bell telephone patent 174465 drawing"),
    ("pat_lamp", "Edison electric lamp patent drawing"), ("pat_tabulator", "Hollerith tabulating machine patent drawing"),
    ("pat_flyer", "Wright brothers flying machine patent drawing"), ("pat_television", "Farnsworth television patent drawing"),
    ("pat_transistor", "transistor patent 2524035"), ("pat_ic", "Kilby integrated circuit patent drawing"),
    ("pat_noyce", "Noyce semiconductor patent 2981877"), ("pat_mouse", "Engelbart mouse patent drawing"),
    ("pat_eniac", "ENIAC patent drawing"), ("pat_laser", "laser patent drawing 1960"),
    ("pat_rocket", "Goddard rocket patent drawing"), ("pat_computer", "electronic computer patent drawing 1950s"),
    ("pat_keyboard", "keyboard patent drawing"), ("pat_crt", "cathode ray tube patent drawing"),
    # machines and people
    ("ph_mark1", "Harvard Mark I computer"), ("ph_colossus", "Colossus computer"), ("ph_whirlwind", "Whirlwind computer MIT"),
    ("ph_univac", "UNIVAC I computer 1951"), ("ph_7090", "IBM 7090 NASA"), ("ph_ibm360", "IBM System/360"),
    ("ph_bellxtor", "first transistor Bell Labs replica"), ("ph_pdp1", "PDP-1 computer"), ("ph_cray", "Cray-1 supercomputer"),
    ("ph_arpanet", "ARPANET logical map 1977"), ("ph_mcc", "Apollo mission control room 1969"),
    ("ph_launch", "Apollo 11 launch Saturn V"), ("ph_shuttle", "Space Shuttle launch Columbia"),
    ("ph_hubble", "Hubble Space Telescope deployment"), ("ph_earthmoon", "Earth and Moon from space NASA"),
    ("ph_pleiades", "Pleiades supercomputer NASA"), ("ph_frontier", "Frontier supercomputer ORNL"),
    ("ph_datacenter", "data center server racks"), ("ph_wafer", "silicon wafer dies"), ("ph_die", "microprocessor die shot"),
    ("ph_keypunch", "IBM 029 keypunch operator"), ("ph_coremem", "magnetic core memory plane"),
    ("ph_telstar", "Telstar satellite"), ("ph_sputnik", "Sputnik 1"), ("ph_cables", "punched card sorter operators"),
    ("ph_bigboard", "NORAD SAGE direction center"), ("ph_terminal", "computer terminal 1970s operator"),
    ("ph_altair", "Altair 8800 computer"), ("ph_apple1", "Apple I computer"), ("ph_xerox", "Xerox Alto"),
    ("ph_mosaic", "NCSA Mosaic web browser screenshot"), ("ph_server", "first web server NeXT CERN"),
    ("ph_iss", "International Space Station from shuttle"), ("ph_mars", "Curiosity rover selfie"),
    ("ph_falcon", "Falcon 9 landing"), ("ph_gpu", "graphics card GPU chip"), ("ph_fiber", "optical fiber light"),
    ("ph_radar", "radar antenna 1950s"), ("ph_tower", "transmission tower lines"), ("ph_vacuum", "vacuum tube computer valves"),
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
