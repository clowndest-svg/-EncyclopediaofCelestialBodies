#!/usr/bin/env python3
"""Build the real-object catalog; standard library only, no services or credentials.

Run with Python isolated mode from outside downloaded source directories:
  python -I server/scripts/catalog-build.py
  python -I server/scripts/catalog-build.py --download
  python -I server/scripts/catalog-build.py --openngc-dir ABS_PATH --nasa-dir ABS_PATH
  python -I server/scripts/catalog-build.py --validate-only

Without --download, reuse the checksummed snapshots in catalog-sources.json.
--download always creates a new, initially empty directory for each source.
Only server/data is written. Catalog bytes are deterministic for fixed snapshots.
"""
import sys

if not sys.flags.isolated:
    raise SystemExit("Required: run this script with python -I (isolated mode).")

import argparse
from collections import Counter, defaultdict
import csv
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import time
import unicodedata
import urllib.parse
import urllib.request
import uuid

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
ACQUIRED_DATE = "2026-11-20"
PC_TO_LY = 3.26156
OPENNGC_REPO = "https://github.com/mattiaverga/OpenNGC"
OPENNGC_RAW = "https://raw.githubusercontent.com/mattiaverga/OpenNGC"
CC_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/"
NASA_BASE = "https://exoplanetarchive.ipac.caltech.edu"
PS_FIELDS = [
    "pl_name", "hostname", "default_flag", "disc_year", "discoverymethod",
    "disc_facility", "pl_orbper", "pl_rade", "pl_bmasse", "pl_bmassprov",
    "pl_eqt", "pl_orbsmax", "pl_orbeccen", "st_teff", "st_rad", "st_mass",
    "st_spectype", "st_age", "sy_dist", "ra", "dec", "sy_vmag", "sy_snum",
    "pl_controv_flag", "hd_name", "hip_name", "tic_id", "gaia_dr2_id",
    "gaia_dr3_id", "pl_refname", "st_refname", "sy_refname",
    "pl_orbperlim", "pl_radelim", "pl_bmasselim", "pl_eqtlim",
    "pl_orbsmaxlim", "pl_orbeccenlim", "st_tefflim", "st_radlim",
    "st_masslim", "st_agelim",
]
PS_QUERY = "select " + ",".join(PS_FIELDS) + " from ps where default_flag=1 order by pl_name"
TYPE_MAP = {
    "*": ("star", "恒星", "star"),
    "**": ("star", "双星条目", "binary"),
    "Nova": ("star", "新星", "star"),
    "*Ass": ("cluster", "星协", "cluster"),
    "OCl": ("cluster", "疏散星团", "cluster"),
    "GCl": ("cluster", "球状星团", "cluster"),
    "Cl+N": ("cluster", "伴星云的星团", "cluster"),
    "G": ("galaxy", "星系", "nebula"),
    "GPair": ("galaxy", "星系对", "nebula"),
    "GTrpl": ("galaxy", "三重星系", "nebula"),
    "GGroup": ("galaxy", "星系群", "nebula"),
    "PN": ("nebula", "行星状星云", "nebula"),
    "HII": ("nebula", "电离氢区", "nebula"),
    "DrkN": ("nebula", "暗星云", "nebula"),
    "EmN": ("nebula", "发射星云", "nebula"),
    "Neb": ("nebula", "星云", "nebula"),
    "RfN": ("nebula", "反射星云", "nebula"),
    "SNR": ("nebula", "超新星遗迹", "nebula"),
}
KINDS = {"planet", "moon", "star", "exoplanet", "galaxy", "nebula", "cluster",
         "blackhole", "comet", "asteroid"}
PRESETS = {"rocky", "gas", "star", "spiral", "elliptical", "nebula", "cluster", "binary"}
CONSTELLATIONS = dict(pair.split(":", 1) for pair in (
    "And:仙女座 Ant:唧筒座 Aps:天燕座 Aqr:宝瓶座 Aql:天鹰座 Ara:天坛座 "
    "Ari:白羊座 Aur:御夫座 Boo:牧夫座 Cae:雕具座 Cam:鹿豹座 Cnc:巨蟹座 "
    "CVn:猎犬座 CMa:大犬座 CMi:小犬座 Cap:摩羯座 Car:船底座 Cas:仙后座 "
    "Cen:半人马座 Cep:仙王座 Cet:鲸鱼座 Cha:蝘蜓座 Cir:圆规座 Col:天鸽座 "
    "Com:后发座 CrA:南冕座 CrB:北冕座 Crv:乌鸦座 Crt:巨爵座 Cru:南十字座 "
    "Cyg:天鹅座 Del:海豚座 Dor:剑鱼座 Dra:天龙座 Equ:小马座 Eri:波江座 "
    "For:天炉座 Gem:双子座 Gru:天鹤座 Her:武仙座 Hor:时钟座 Hya:长蛇座 "
    "Hyi:水蛇座 Ind:印第安座 Lac:蝎虎座 Leo:狮子座 LMi:小狮座 Lep:天兔座 "
    "Lib:天秤座 Lup:豺狼座 Lyn:天猫座 Lyr:天琴座 Men:山案座 Mic:显微镜座 "
    "Mon:麒麟座 Mus:苍蝇座 Nor:矩尺座 Oct:南极座 Oph:蛇夫座 Ori:猎户座 "
    "Pav:孔雀座 Peg:飞马座 Per:英仙座 Phe:凤凰座 Pic:绘架座 Psc:双鱼座 "
    "PsA:南鱼座 Pup:船尾座 Pyx:罗盘座 Ret:网罟座 Sge:天箭座 Sgr:人马座 "
    "Sco:天蝎座 Scl:玉夫座 Sct:盾牌座 Ser:巨蛇座 Se1:巨蛇座（头部） "
    "Se2:巨蛇座（尾部） Sex:六分仪座 Tau:金牛座 Tel:望远镜座 Tri:三角座 "
    "TrA:南三角座 Tuc:杜鹃座 UMa:大熊座 UMi:小熊座 Vel:船帆座 "
    "Vir:室女座 Vol:飞鱼座 Vul:狐狸座"
).split())
METHODS = {
    "Radial Velocity": "径向速度法", "Imaging": "直接成像法",
    "Eclipse Timing Variations": "食时变化法", "Microlensing": "微引力透镜法",
    "Transit": "凌日法", "Transit Timing Variations": "凌日时刻变化法",
    "Astrometry": "天体测量法", "Disk Kinematics": "盘运动学方法",
    "Orbital Brightness Modulation": "轨道亮度调制法",
    "Pulsation Timing Variations": "脉动计时变化法", "Pulsar Timing": "脉冲星计时法",
}
SOURCE_CODES = {
    "1": "NASA Extragalactic Database (NED)", "2": "SIMBAD",
    "3": "HyperLEDA", "4": "Harold Corwin NGC/IC Positions and Notes",
    "5": "HEASARC mwsc", "6": "HEASARC smcclustrs", "7": "HEASARC lmcextobj",
    "8": "HEASARC plnebulae", "9": "HEASARC lbn", "10": "HEASARC messier",
    "11": "HEASARC lyngaclust", "99": "OpenNGC revised data",
}
FIELD_DESCRIPTIONS = {
    "distanceLy": "光年；NASA sy_dist(pc) × 3.26156。OpenNGC仅对*或Nova且Pax>0使用1000/Pax(mas) × 3.26156，不从红移推距。",
    "radiusEarth": "系外行星半径，地球半径；pl_rade，非上/下限。",
    "massEarth": "系外行星质量，地球质量；仅pl_bmassprov=Mass或Msin(i)/sin(i)，非上/下限。",
    "minimumMassEarth": "径向速度最小质量M·sin(i)，地球质量；pl_bmassprov=Msini，不当作真实质量。",
    "massEstimateEarth": "来源类型未能识别的质量估计，保留massProvenance，不升级为真实质量。",
    "radiusSolar": "宿主半径，太阳半径；st_rad，非上/下限。",
    "massSolar": "宿主质量，太阳质量；st_mass，非上/下限。",
    "periodDays": "公转周期，天；pl_orbper，非上/下限。",
    "tempK": "开尔文；宿主为有效温度st_teff，行星为pl_eqt温度估计（直接成像时可能为有效温度）；tempKind区分。",
    "magnitude": "视星等，必须连同magnitudeBand使用。OpenNGC优先V、再B/J/H/K总星等；宿主为sy_vmag，可能含系统混合光。",
    "hostMagnitude": "行星条目的宿主系统V波段视星等sy_vmag；绝不是行星视星等。",
    "raDeg": "赤经，J2000度；NGC的时分秒×15，NASA原字段已是度。",
    "decDeg": "赤纬，J2000带符号度；NGC角分秒转度，NASA原字段已是度。",
    "coordinateTarget": "NASA坐标指宿主系统位置，而非单独分辨的行星位置。",
    "constellation": "OpenNGC的IAU星座缩写，Se1/Se2分别为巨蛇座头部/尾部；constellationName为中文。",
    "discoveryYear": "行星发现年份disc_year；不用于猜测宿主恒星发现年份。",
    "hostStar": "NASA hostname原始宿主名称；hostStarId连接本目录派生宿主条目。",
    "catalog": "来源目录NGC、IC或NASA Exoplanet Archive PS。",
    "angularMajorArcmin": "视长轴，角分；OpenNGC MajAx。",
    "angularMinorArcmin": "视短轴，角分；OpenNGC MinAx。",
    "positionAngleDeg": "长轴位置角，自北向东；OpenNGC PosAng。",
    "redshift": "日心红移，无量纲；可为负，不由此推断距离。",
    "morphology": "OpenNGC Hubble原始分类；只有明确螺旋类型或E才选择spiral/elliptical。",
    "parallaxMas": "仅单恒星/新星条目的正视差，毫角秒；未做误差或零点校正。",
    "distanceMethod": "标明parsec_conversion或positive_parallax_inverse。",
    "radialVelocityKms": "OpenNGC日心径向速度，km/s，可为负。",
    "catalogType": "OpenNGC原始Type或NASA PS行类型标记，用于审计主分类。",
    "openngcSources": "OpenNGC逐字段来源编码原文；sourceCodeMap给出编码对应机构。",
    "discoveryMethod": "NASA原始发现方法；discoveryMethodZh为中文规则映射。",
    "discoveryFacility": "NASA disc_facility原文。",
    "semiMajorAxisAu": "轨道半长轴，AU；pl_orbsmax，非上/下限。",
    "orbitalEccentricity": "轨道偏心率，无量纲；pl_orbeccen；已知0保留。",
    "spectralType": "宿主st_spectype原文；不据光谱/温度编造恒星演化阶段。",
    "stellarAgeGyr": "宿主st_age，十亿年，非上/下限。",
    "systemStarCount": "sy_snum，系统恒星数；宿主可以是分量或未分辨系统。",
    "catalogPlanetCount": "此hostname在本次PS默认快照中的行星条目数，含标记存在文献争议者。",
    "firstPlanetDiscoveryYear": "此宿主当前关联行星disc_year最小值，不是宿主的发现年。",
    "derivedFromPlanetRows": "宿主的stellar/system所选默认行名称；不跨不同恒星文献平均或逐字段拼接。",
    "hasControversialPlanets": "宿主是否关联pl_controv_flag=1的默认行。",
    "confirmationControversial": "pl_controv_flag=1；档案默认记录并不保证没有文献争议。",
    "massProvenance": "NASA pl_bmassprov原文，区分质量、M·sin(i)与利用倾角校正的质量。",
    "limitFields": "任意数值字段后缀UpperLimit/LowerLimit均为边界而非测量中心值；由对应NASA *lim=1/-1生成，中心值字段同时省略。",
    "knownMeasurementPolicy": "空、无效或非有限值省略；质量/半径/距离/温度/周期非正值省略；真实0星等/坐标/红移/偏心率保留。误差区间未纳入本目录。",
}
PHYSICAL_FIELDS = {"distanceLy", "radiusEarth", "massEarth", "minimumMassEarth",
                   "radiusSolar", "massSolar", "periodDays", "tempK", "magnitude",
                   "hostMagnitude", "raDeg", "decDeg", "angularMajorArcmin",
                   "angularMinorArcmin", "redshift", "semiMajorAxisAu"}


def clean(value):
    return re.sub(r"[\x00-\x1f\x7f]", " ", value or "").strip()


def number(value, positive=False):
    value = clean(value)
    if not value:
        return None
    try:
        result = float(value)
    except (ValueError, TypeError):
        return None
    if not math.isfinite(result) or (positive and result <= 0):
        return None
    return round(result, 10)


def put(facts, key, value):
    if value is not None and value != "":
        facts[key] = value


def bounded(facts, row, column, key, positive=True):
    value = number(row.get(column), positive)
    if value is None:
        return
    flag = clean(row.get(column + "lim"))
    if flag not in {"", "0", "1", "-1"}:
        raise ValueError(f"Unexpected {column}lim: {flag}")
    suffix = {"1": "UpperLimit", "-1": "LowerLimit"}.get(flag, "")
    facts[key + suffix] = value


def degrees(value, ra=False):
    value = clean(value)
    if not value:
        return None
    match = re.fullmatch(r"([+-]?)(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)", value)
    if not match:
        raise ValueError(f"Invalid sexagesimal coordinate: {value}")
    sign, hours, minutes, seconds = match.groups()
    h, m, s = int(hours), int(minutes), float(seconds)
    # IC3322A has +07:12:60.0: a rounded boundary, exactly +07:13:00.
    # Carry seconds=60 through arithmetic, but reject values exceeding 60.
    if m >= 60 or s > 60 or (ra and (sign or h >= 24)) or (not ra and h > 90):
        raise ValueError(f"Coordinate outside range: {value}")
    result = (h + m / 60 + s / 3600) * (15 if ra else 1)
    result *= -1 if sign == "-" else 1
    if not ra and abs(result) > 90:
        raise ValueError(f"Declination outside range: {value}")
    return round(result % 360 if ra else result, 8)


def slug(name):
    text = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower().replace("+", "-plus-")).strip("-")
    return text or hashlib.sha256(name.encode()).hexdigest()[:16]


def unique_strings(values, exclude=""):
    return sorted({clean(x) for x in values if clean(x) and clean(x) != exclude})


def ngc_designation(raw):
    match = re.fullmatch(r"(NGC|IC)(\d{4})(.*)", raw)
    if not match:
        raise ValueError(f"Unexpected OpenNGC designation: {raw}")
    catalog, digits, suffix = match.groups()
    name = f"{catalog} {int(digits)}{suffix}"
    identifier = catalog.lower() + "-" + digits
    if suffix.strip():
        identifier += "-" + slug(suffix)
    return identifier, name, catalog


def morphology_preset(value):
    # S0, E-S0, irregular, uncertain or missing types have no invented shape.
    if re.fullmatch(r"S(?:AB|B)?(?:a|ab|b|bc|c|cd|d|m)", value):
        return "spiral"
    if re.fullmatch(r"E[0-7]?", value):
        return "elliptical"
    return "nebula"


def fmt(value):
    return f"{value:.5g}"


def seed(identifier):
    return int(hashlib.sha256(identifier.encode("utf-8")).hexdigest()[:8], 16)


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs, self.text = [], []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href", "")
            if href.startswith(("https://", "http://")):
                self.hrefs.append(href)

    def handle_data(self, text):
        self.text.append(text)


def references(raws):
    result = {}
    for raw in raws:
        if not raw:
            continue
        parser = ReferenceParser()
        parser.feed(raw)
        name = clean(" ".join(parser.text))
        for url in parser.hrefs:
            if name:
                result[url] = {"name": name, "url": url}
    return [result[url] for url in sorted(result)]


def nasa_source(name):
    return {"name": "NASA Exoplanet Archive — Planetary Systems (PS)",
            "url": NASA_BASE + "/overview/" + urllib.parse.quote(name, safe="")}


def csv_rows(path, delimiter=",", required=()):
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream, delimiter=delimiter)
        if not reader.fieldnames or not set(required) <= set(reader.fieldnames):
            raise ValueError(f"Required CSV fields missing in {path.name}")
        rows = []
        for row in reader:
            if None in row or any(value is None for value in row.values()):
                raise ValueError(f"Malformed CSV row in {path.name}, line {reader.line_num}")
            rows.append(row)
    return rows


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while block := stream.read(1024 * 1024):
            digest.update(block)
    return digest.hexdigest()


def write_json(path, value, catalog=False):
    # All writes remain under server/data; write a temporary sibling atomically.
    if not path.resolve().is_relative_to(DATA_DIR.resolve()):
        raise ValueError("Output outside server/data is forbidden.")
    temporary = path.with_name(path.name + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="\n") as out:
        if catalog:
            out.write("[\n")
            for i, item in enumerate(value):
                out.write(json.dumps(item, ensure_ascii=False, allow_nan=False, separators=(",", ":")))
                out.write(",\n" if i < len(value) - 1 else "\n")
            out.write("]\n")
        else:
            json.dump(value, out, ensure_ascii=False, allow_nan=False, indent=2)
            out.write("\n")
    temporary.replace(path)


def manifest(folder):
    value = json.loads((folder / "fetch-info.json").read_text("utf-8"))
    names = set()
    for item in value["downloads"]:
        filename = item["file"]
        if Path(filename).name != filename or filename in names:
            raise ValueError("Invalid or duplicate manifest filename.")
        names.add(filename)
        path = folder / filename
        if path.stat().st_size != item["bytes"] or sha256(path) != item["sha256"]:
            raise ValueError(f"Snapshot checksum mismatch: {filename}")
    return value


def ngc_records(rows, source_url):
    records, exclusions = [], Counter()
    ignored_parallaxes = 0
    for row in rows:
        original_type = clean(row["Type"])
        if original_type not in TYPE_MAP:
            exclusions[original_type or "blankType"] += 1
            continue
        identifier, name, catalog = ngc_designation(clean(row["Name"]))
        kind, subtype, preset = TYPE_MAP[original_type]
        facts = {"catalog": catalog, "catalogType": original_type}
        put(facts, "raDeg", degrees(row["RA"], ra=True))
        put(facts, "decDeg", degrees(row["Dec"]))
        const = clean(row["Const"])
        put(facts, "constellation", const)
        put(facts, "constellationName", CONSTELLATIONS.get(const))
        for column, key, positive in [
            ("MajAx", "angularMajorArcmin", True), ("MinAx", "angularMinorArcmin", True),
            ("PosAng", "positionAngleDeg", False), ("Redshift", "redshift", False),
            ("RadVel", "radialVelocityKms", False),
        ]:
            put(facts, key, number(row[column], positive))
        for band in ["V", "B", "J", "H", "K"]:
            magnitude = number(row[band + "-Mag"])
            if magnitude is not None:
                facts.update(magnitude=magnitude, magnitudeBand=band)
                break
        parallax = number(row["Pax"], positive=True)
        if parallax is not None:
            if original_type in {"*", "Nova"}:
                facts.update(parallaxMas=parallax,
                             distanceLy=round(1000 / parallax * PC_TO_LY, 6),
                             distanceMethod="positive_parallax_inverse")
            else:
                ignored_parallaxes += 1
        if kind == "galaxy":
            morphology = clean(row["Hubble"])
            put(facts, "morphology", morphology)
            if original_type == "G":
                preset = morphology_preset(morphology)
        put(facts, "openngcSources", clean(row["Sources"]))
        aliases = [clean(row["Name"]), name.replace(" ", "")]
        for field, prefix in [("M", "M"), ("NGC", "NGC"), ("IC", "IC")]:
            for other in clean(row[field]).split(","):
                if other.strip():
                    match = re.fullmatch(r"(\d+)(.*)", other.strip())
                    if match:
                        aliases.append(f"{prefix} {int(match[1])}{match[2]}")
        for field in ["Identifiers", "Common names"]:
            aliases.extend(clean(row[field]).split(","))
        tags = ["真实天体", "OpenNGC", catalog, subtype, "可视化示意"]
        if const:
            tags.append(CONSTELLATIONS.get(const, const))
        if kind == "galaxy" and preset == "nebula":
            tags.append("不指定螺旋或椭圆外观")
        if original_type == "Cl+N":
            tags.append("伴随星云")
        description = f"{name}是OpenNGC收录的{subtype}"
        if const:
            description += f"，位于{CONSTELLATIONS.get(const, const + '星座')}"
        sentences = [description + "。"]
        if "morphology" in facts:
            sentences.append(f"目录形态标记为{facts['morphology']}。")
        if "distanceLy" in facts:
            sentences.append(f"由目录视差直接换算，距离约{fmt(facts['distanceLy'])}光年。")
        if "magnitude" in facts:
            sentences.append(f"{facts['magnitudeBand']}波段视星等为{fmt(facts['magnitude'])}。")
        if "angularMajorArcmin" in facts:
            extent = fmt(facts["angularMajorArcmin"])
            if "angularMinorArcmin" in facts:
                extent += "×" + fmt(facts["angularMinorArcmin"])
                sentences.append(f"视尺度约{extent}角分。")
            else:
                sentences.append(f"视长轴约{extent}角分。")
        elif "raDeg" in facts and "decDeg" in facts:
            sentences.append(f"J2000坐标为赤经{fmt(facts['raDeg'])}°、赤纬{fmt(facts['decDeg'])}°。")
        if "redshift" in facts and kind == "galaxy":
            sentences.append(f"目录日心红移为{fmt(facts['redshift'])}。")
        if original_type == "**":
            sentences.append("目录的双星标记不等于已证实的物理束缚系统。")
        records.append({"id": identifier, "name": name, "aliases": unique_strings(aliases, name),
                        "kind": kind, "subtype": subtype, "realm": "real",
                        "summary": "".join(sentences), "facts": facts,
                        "tags": unique_strings(tags),
                        "visual": {"preset": preset, "seed": seed(identifier)},
                        "sources": [{"name": "OpenNGC — Mattia Verga et al.",
                                     "url": source_url, "license": "CC-BY-SA-4.0"}]})
    return records, {"excludedByType": dict(sorted(exclusions.items())),
                     "ignoredNonSingleStarParallaxes": ignored_parallaxes}


def nasa_records(rows):
    planets, hosts = [], defaultdict(list)
    names = set()
    for row in rows:
        if clean(row["default_flag"]) != "1":
            raise ValueError("NASA input contains a non-default row.")
        name, hostname = clean(row["pl_name"]), clean(row["hostname"])
        if not name or not hostname or name in names:
            raise ValueError("NASA input contains a blank name/host or duplicate planet.")
        names.add(name)
        hosts[hostname].append(row)
        identifier, host_id = "exo-" + slug(name), "exo-host-" + slug(hostname)
        facts = {"catalog": "NASA Exoplanet Archive PS", "catalogType": "PS default planet",
                 "hostStar": hostname, "hostStarId": host_id}
        for column, key in [("pl_orbper", "periodDays"), ("pl_rade", "radiusEarth"),
                            ("pl_eqt", "tempK"), ("pl_orbsmax", "semiMajorAxisAu")]:
            bounded(facts, row, column, key)
        bounded(facts, row, "pl_orbeccen", "orbitalEccentricity", positive=False)
        mass_provenance = clean(row["pl_bmassprov"])
        put(facts, "massProvenance", mass_provenance)
        mass_key = ("minimumMassEarth" if mass_provenance == "Msini" else
                    "massEarth" if mass_provenance in {"Mass", "Msin(i)/sin(i)", "M*sin(i)/sin(i)"}
                    else "massEstimateEarth")
        bounded(facts, row, "pl_bmasse", mass_key)
        distance = number(row["sy_dist"], positive=True)
        if distance is not None:
            facts.update(distanceLy=round(distance * PC_TO_LY, 6), distanceMethod="parsec_conversion")
        for column, key in [("ra", "raDeg"), ("dec", "decDeg"), ("sy_vmag", "hostMagnitude")]:
            put(facts, key, number(row[column]))
        if "hostMagnitude" in facts:
            facts["hostMagnitudeBand"] = "V"
        if "raDeg" in facts or "decDeg" in facts:
            facts["coordinateTarget"] = "宿主系统"
        if any(key.startswith("tempK") for key in facts):
            facts["tempKind"] = ("equilibrium_or_effective_estimate" if row["discoverymethod"] == "Imaging"
                                 else "equilibrium_estimate")
        year = number(row["disc_year"], positive=True)
        if year is not None:
            if not year.is_integer():
                raise ValueError("Noninteger discovery year.")
            facts["discoveryYear"] = int(year)
        method = clean(row["discoverymethod"])
        put(facts, "discoveryMethod", method)
        put(facts, "discoveryMethodZh", METHODS.get(method))
        put(facts, "discoveryFacility", clean(row["disc_facility"]))
        disputed = clean(row["pl_controv_flag"])
        if disputed not in {"0", "1", ""}:
            raise ValueError("Unexpected confirmation controversy flag.")
        if disputed == "1":
            facts["confirmationControversial"] = True
        tags = ["真实天体", "系外行星", "NASA Exoplanet Archive", "可视化示意"]
        if method:
            tags.append(METHODS.get(method, method))
        if disputed == "1":
            tags.append("确认存在文献争议")
        sentences = [f"{name}是围绕{hostname}的系外行星。"]
        if "discoveryYear" in facts:
            phrase = f"档案发现年份为{facts['discoveryYear']}年"
            if method:
                phrase += f"，发现方法为{METHODS.get(method, method)}"
            sentences.append(phrase + "。")
        if "periodDays" in facts:
            sentences.append(f"公转周期约{fmt(facts['periodDays'])}天。")
        elif "periodDaysLowerLimit" in facts:
            sentences.append(f"目录公转周期下限为{fmt(facts['periodDaysLowerLimit'])}天。")
        if "radiusEarth" in facts:
            sentences.append(f"半径约为地球的{fmt(facts['radiusEarth'])}倍。")
        if "distanceLy" in facts:
            sentences.append(f"宿主系统距地球约{fmt(facts['distanceLy'])}光年。")
        if "minimumMassEarth" in facts:
            sentences.append(f"目录最小质量M·sin(i)约为{fmt(facts['minimumMassEarth'])}个地球质量。")
        if disputed == "1":
            sentences.append("档案标记其确认存在文献争议。")
        # Radius selects a schematic only; this does not assert actual composition.
        preset = "gas" if facts.get("radiusEarth", 0) >= 1.6 else "rocky"
        planets.append({"id": identifier, "name": name, "aliases": [], "kind": "exoplanet",
                        "subtype": "系外行星", "realm": "real", "summary": "".join(sentences),
                        "facts": facts, "tags": unique_strings(tags),
                        "visual": {"preset": preset, "seed": seed(identifier)},
                        "sources": [nasa_source(name)] + references([row["pl_refname"]])})
    stars, conflicts = [], Counter()
    for hostname, group in sorted(hosts.items()):
        # Pick whole stellar and system solutions separately, never average values.
        def stellar_score(row):
            return sum(number(row[c], positive=True) is not None
                       for c in ["st_teff", "st_rad", "st_mass", "st_age"]) + bool(clean(row["st_spectype"]))

        def system_score(row):
            return sum(number(row[c]) is not None for c in ["sy_dist", "ra", "dec", "sy_vmag", "sy_snum"])

        stellar = min(group, key=lambda r: (-stellar_score(r), clean(r["pl_name"])))
        system = min(group, key=lambda r: (-system_score(r), clean(r["pl_name"])))
        facts = {"catalog": "NASA Exoplanet Archive PS", "catalogType": "PS derived host",
                 "catalogPlanetCount": len(group),
                 "derivedFromPlanetRows": {"stellar": clean(stellar["pl_name"]),
                                           "system": clean(system["pl_name"])}}
        for column, key in [("st_rad", "radiusSolar"), ("st_mass", "massSolar"),
                            ("st_teff", "tempK"), ("st_age", "stellarAgeGyr")]:
            bounded(facts, stellar, column, key)
        if any(key.startswith("tempK") for key in facts):
            facts["tempKind"] = "stellar_effective"
        put(facts, "spectralType", clean(stellar["st_spectype"]))
        distance = number(system["sy_dist"], positive=True)
        if distance is not None:
            facts.update(distanceLy=round(distance * PC_TO_LY, 6), distanceMethod="parsec_conversion")
        for column, key in [("ra", "raDeg"), ("dec", "decDeg"), ("sy_vmag", "magnitude")]:
            put(facts, key, number(system[column]))
        if "magnitude" in facts:
            facts.update(magnitudeBand="V", magnitudeTarget="宿主系统（可能含混合光）")
        star_count = number(system["sy_snum"], positive=True)
        if star_count is not None:
            if not star_count.is_integer():
                raise ValueError("Noninteger system star count.")
            facts["systemStarCount"] = int(star_count)
        years = [int(y) for row in group if (y := number(row["disc_year"], positive=True)) is not None]
        if years:
            facts["firstPlanetDiscoveryYear"] = min(years)
        if any(clean(row["pl_controv_flag"]) == "1" for row in group):
            facts["hasControversialPlanets"] = True
        aliases = []
        for row in group:
            for column in ["hd_name", "hip_name", "tic_id", "gaia_dr2_id", "gaia_dr3_id"]:
                if clean(row[column]):
                    aliases.append(clean(row[column]))
        subtype = "系外行星宿主"
        if any(row["discoverymethod"] == "Pulsar Timing" for row in group):
            subtype = "脉冲星宿主"
        elif facts.get("massSolar", 1) < 0.075:
            subtype = "行星宿主（亚恒星质量）"
        tags = ["真实天体", "NASA Exoplanet Archive", "行星宿主", subtype, "可视化示意"]
        if facts.get("systemStarCount", 1) > 1:
            tags.append("属于多恒星系统")
        sentences = [f"{hostname}是NASA行星目录中的{subtype}，本次默认记录关联{len(group)}颗行星。"]
        if "distanceLy" in facts:
            sentences.append(f"目录系统距离约{fmt(facts['distanceLy'])}光年。")
        if "spectralType" in facts:
            sentences.append(f"所选恒星记录的光谱型为{facts['spectralType']}。")
        if "tempK" in facts:
            sentences.append(f"有效温度约{fmt(facts['tempK'])}K。")
        if "radiusSolar" in facts:
            sentences.append(f"半径约为太阳的{fmt(facts['radiusSolar'])}倍。")
        elif "massSolar" in facts:
            sentences.append(f"质量约为太阳的{fmt(facts['massSolar'])}倍。")
        identifier = "exo-host-" + slug(hostname)
        stars.append({"id": identifier, "name": hostname,
                      "aliases": unique_strings(aliases, hostname), "kind": "star", "subtype": subtype,
                      "realm": "real", "summary": "".join(sentences), "facts": facts,
                      "tags": unique_strings(tags), "visual": {"preset": "star", "seed": seed(identifier)},
                      "sources": [nasa_source(hostname)] + references([stellar["st_refname"], system["sy_refname"]])})
        for field in ["st_teff", "st_rad", "st_mass", "st_age", "sy_dist", "sy_vmag", "sy_snum"]:
            if len({clean(row[field]) for row in group if clean(row[field])}) > 1:
                conflicts[field] += 1
    return planets + stars, {"planetRows": len(planets), "uniqueHosts": len(stars),
                             "controversialPlanetRows": sum(bool(p["facts"].get("confirmationControversial")) for p in planets),
                             "hostsWithDifferentSuppliedValues": dict(sorted(conflicts.items()))}


def validate(records):
    if not isinstance(records, list) or not records:
        raise ValueError("The catalog must be a nonempty array.")
    ids = set()
    required = {"id", "name", "aliases", "kind", "subtype", "realm", "summary", "facts", "tags", "visual", "sources"}
    limit_count, summaries, source_counts = 0, set(), Counter()

    def inspect(value):
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError("Nonfinite catalog number.")
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValueError("Empty/null value inside a catalog record.")
        if isinstance(value, dict):
            for nested in value.values():
                inspect(nested)
        elif isinstance(value, list):
            for nested in value:
                inspect(nested)

    for record in records:
        if set(record) != required or not all(isinstance(record[k], str) and record[k] for k in ["id", "name", "kind", "subtype", "realm", "summary"]):
            raise ValueError("Catalog contract keys/types are invalid.")
        identifier = record["id"]
        if identifier in ids or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", identifier):
            raise ValueError(f"Duplicate or invalid stable ID: {identifier}")
        ids.add(identifier)
        if record["kind"] not in KINDS or record["realm"] != "real":
            raise ValueError(f"Invalid kind/realm: {identifier}")
        if not re.search(r"[一-鿿]", record["subtype"]) or not re.search(r"[一-鿿]", record["summary"]):
            raise ValueError("Missing Chinese subtype/summary.")
        for key in ["aliases", "tags"]:
            if not isinstance(record[key], list) or any(not isinstance(x, str) or not x for x in record[key]) or len(set(record[key])) != len(record[key]):
                raise ValueError(f"Invalid {key}: {identifier}")
        if not isinstance(record["facts"], dict):
            raise ValueError("facts must be an object.")
        visual = record["visual"]
        if visual.get("preset") not in PRESETS or type(visual.get("seed")) is not int or not 0 <= visual["seed"] <= 0xffffffff:
            raise ValueError(f"Invalid visualization: {identifier}")
        if not isinstance(record["sources"], list) or not record["sources"]:
            raise ValueError("Missing sources.")
        for source in record["sources"]:
            if not {"name", "url"} <= source.keys() or not source["url"].startswith(("https://", "http://")):
                raise ValueError("Invalid source URL/name.")
        facts = record["facts"]
        if "raDeg" in facts and not 0 <= facts["raDeg"] < 360:
            raise ValueError("RA outside [0,360).")
        if "decDeg" in facts and not -90 <= facts["decDeg"] <= 90:
            raise ValueError("Declination outside [-90,90].")
        for field in list(facts):
            for suffix in ["UpperLimit", "LowerLimit"]:
                if field.endswith(suffix):
                    limit_count += 1
                    if field.removesuffix(suffix) in facts:
                        raise ValueError("Limit incorrectly duplicated as central value.")
        if facts.get("catalogType") in {"Dup", "NonEx", "Other"}:
            raise ValueError("Excluded OpenNGC type survived.")
        if record["kind"] == "galaxy" and visual["preset"] in {"spiral", "elliptical"}:
            if facts.get("catalogType") != "G" or morphology_preset(facts.get("morphology", "")) != visual["preset"]:
                raise ValueError("Unjustified galaxy morphology visualization.")
        if record["kind"] == "exoplanet":
            if "magnitude" in facts or ("massEarth" in facts and facts.get("massProvenance") == "Msini"):
                raise ValueError("Host brightness/minimum mass mislabeled as planetary measurement.")
        if record["kind"] == "star" and facts.get("catalogType") == "PS derived host" and "discoveryYear" in facts:
            raise ValueError("Planet discovery year mislabeled as stellar discovery year.")
        inspect(record)
        summaries.add(record["summary"])
        source_counts[record["sources"][0]["name"]] += 1
    for record in records:
        if record["kind"] == "exoplanet" and record["facts"]["hostStarId"] not in ids:
            raise ValueError("Dangling host ID.")
    return {"passed": True, "recordsChecked": len(records), "uniqueIds": len(ids),
            "uniqueSummaries": len(summaries), "limitValuedFields": limit_count,
            "blankOrNullValues": 0, "nonfiniteNumbers": 0, "duplicateIds": 0,
            "checks": ["contract", "Chinese text", "type mapping", "excluded types", "finite numbers",
                       "coordinate ranges", "unique IDs", "host links", "bounds vs values",
                       "minimum mass semantics", "host magnitude semantics", "known morphology only"]}


def download(url, folder, filename, info, post=False):
    target = folder / filename
    for attempt in range(3):
        try:
            request_url, body = url, None
            if post:
                request_url, query = url.split("?", 1)
                body = query.encode("ascii")
            request = urllib.request.Request(request_url, data=body,
                                             headers={"User-Agent": "CosmicCatalogBuild/1.0", "Accept": "*/*"})
            with urllib.request.urlopen(request, timeout=180) as response, target.open("wb") as out:
                while block := response.read(1024 * 1024):
                    out.write(block)
            result = {"url": url, "method": "POST" if post else "GET", "file": filename,
                      "bytes": target.stat().st_size, "sha256": sha256(target),
                      "retrievedAt": datetime.now(timezone.utc).isoformat()}
            info["downloads"].append(result)
            return result
        except Exception as error:
            if target.exists():
                target.unlink()
            info["fetchAttempts"].append({"url": url, "attempt": attempt + 1, "error": str(error)})
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def tap_url(query):
    return NASA_BASE + "/TAP/sync?" + urllib.parse.urlencode({"query": query, "format": "csv"})


def tap_download(query, folder, filename, info):
    url = tap_url(query)
    try:
        return download(url, folder, filename, info)
    except Exception:
        # Official TAP form-encoded POST is the fallback for a GET failure.
        return download(url, folder, filename, info, post=True)


def download_snapshots():
    base = DATA_DIR / "source-downloads"
    base.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    folders = [base / (name + "-" + stamp + "-" + uuid.uuid4().hex[:8]) for name in ["openngc", "nasa-ps"]]
    for folder in folders:
        folder.mkdir(exist_ok=False)
        if any(folder.iterdir()):
            raise ValueError("Download directory must be new and empty.")
    od, nd = folders
    info = {"source": "OpenNGC", "fetchAttempts": [], "downloads": [], "dataFile": "NGC.csv"}
    primary = OPENNGC_RAW + "/master/database/NGC.csv"
    try:
        download(primary, od, "NGC.csv", info)
        revision = "master"
    except Exception:
        download("https://api.github.com/repos/mattiaverga/OpenNGC/commits?path=database_files/NGC.csv&per_page=1",
                 od, "revision.json", info)
        revision = json.loads((od / "revision.json").read_text("utf-8"))[0]["sha"]
        info["revision"] = revision
        try:
            download(OPENNGC_RAW + f"/{revision}/database_files/NGC.csv", od, "NGC.csv", info)
        except Exception:
            download(OPENNGC_REPO + f"/raw/{revision}/database_files/NGC.csv", od, "NGC.csv", info)
    for filename, remote_path in [
        ("LICENSE-CC-BY-SA-4.0.txt", "LICENSES/CC-BY-SA-4.0.txt"),
        ("attribution.dep5", ".reuse/dep5"), ("NGC_guide.txt", "NGC_guide.txt"), ("AUTHORS.txt", "AUTHORS"),
    ]:
        download(OPENNGC_RAW + f"/{revision}/{remote_path}", od, filename, info)
    write_json(od / "fetch-info.json", info)
    info = {"source": "NASA Exoplanet Archive PS", "fetchAttempts": [], "downloads": [],
            "dataFile": "ps-default-limits.csv", "query": PS_QUERY}
    tap_download("select column_name,datatype,description from TAP_SCHEMA.columns where table_name='ps'",
                 nd, "ps-schema.csv", info)
    schema = {r["column_name"].lower() for r in csv_rows(nd / "ps-schema.csv", required=["column_name"])}
    if not set(PS_FIELDS) <= schema:
        raise ValueError("NASA PS schema changed; refusing to invent missing fields.")
    for filename, url in [
        ("ps-columns.html", NASA_BASE + "/docs/API_PS_columns.html"),
        ("acknowledge.html", NASA_BASE + "/docs/acknowledge.html"),
        ("doi.html", NASA_BASE + "/docs/doi.html"),
    ]:
        download(url, nd, filename, info)
    tap_download(PS_QUERY, nd, "ps-default-limits.csv", info)
    tap_download("select count(*) as row_count from ps where default_flag=1", nd, "row-count.csv", info)
    write_json(nd / "fetch-info.json", info)
    return od, nd


def source_metadata(od, nd, om, nm, ngc, ps, ngc_stats, nasa_stats, records):
    authors = (od / "AUTHORS.txt").read_text("utf-8").strip()
    acknowledgement_parser = ReferenceParser()
    acknowledgement_parser.feed((nd / "acknowledge.html").read_text("utf-8"))
    text = " ".join(" ".join(acknowledgement_parser.text).split())
    match = re.search(r"This research has made use of the NASA Exoplanet Archive,.*?Exoplanet Exploration Program\.", text)
    if not match:
        raise ValueError("Could not preserve the official NASA acknowledgement.")
    og_download = next(d for d in om["downloads"] if d["file"] == "NGC.csv")
    return {
        "schemaVersion": 1, "acquiredDate": ACQUIRED_DATE, "buildScript": "server/scripts/catalog-build.py",
        "output": "server/data/catalog-real.json", "recordCount": len(records),
        "collectionLicense": "CC-BY-SA-4.0",
        "licenseScope": "本地转换、中文摘要及数据库编排按CC-BY-SA-4.0提供，遵守OpenNGC署名/相同方式共享；不声称重授NASA及原论文自身的权利。原始数据分别遵守来源说明。",
        "licenseUrl": CC_LICENSE_URL,
        "modifications": ["目录字段选择与单位换算", "按源类型白名单过滤", "稳定ID与中文规则摘要",
                          "从PS默认记录派生唯一宿主", "保存质量最小值与上/下限语义"],
        "warrantyNotice": "原始来源与本目录均按现状提供；无准确性、完整性、适用性或无第三方权利的保证；非来源机构背书。",
        "rebuild": {"offline": "python -I server/scripts/catalog-build.py",
                    "refresh": "python -I server/scripts/catalog-build.py --download",
                    "explicitInputs": "python -I server/scripts/catalog-build.py --openngc-dir ABS_PATH --nasa-dir ABS_PATH",
                    "validate": "python -I server/scripts/catalog-build.py --validate-only",
                    "requirements": "Python 3.10+，仅标准库，下载需联网；无API密钥、账号、PG或Redis。",
                    "determinism": "同一checksummed快照产生相同目录和统计字节；刷新在线快照的条数可变化。",
                    "downloadSecurity": "每源独立新建空目录；下载内容只作为数据读入，Python必须-I，脚本不放在下载目录。"},
        "sources": [
            {"id": "openngc", "name": "OpenNGC", "projectUrl": OPENNGC_REPO,
             "requestedUrl": OPENNGC_RAW + "/master/database/NGC.csv", "downloadUrl": og_download["url"],
             "revision": om.get("revision", "master"),
             "localDirectory": od.relative_to(DATA_DIR).as_posix(), "dataFile": "NGC.csv",
             "acquiredDate": ACQUIRED_DATE, "license": "CC-BY-SA-4.0", "licenseUrl": CC_LICENSE_URL,
             "licenseEvidenceUrl": OPENNGC_RAW + "/master/LICENSES/CC-BY-SA-4.0.txt",
             "licenseFile": "LICENSE-CC-BY-SA-4.0.txt", "attributionEvidence": "attribution.dep5",
             "copyright": "2023 Mattia Verga <mattia.verga@tiscali.it>", "authorsNotice": authors,
             "sourceRowCount": len(ngc), "includedRowCount": len(ngc) - sum(ngc_stats["excludedByType"].values()),
             **ngc_stats, "delimiter": ";", "coordinatesEpoch": "J2000",
             "typeMapping": {key: {"kind": value[0], "subtype": value[1]} for key, value in TYPE_MAP.items()},
             "sourceCodeMap": SOURCE_CODES, "downloads": om["downloads"], "fetchAttempts": om.get("fetchAttempts", []),
             "limitations": ["NonEx、Dup、Other及未知Type均排除；Other未必不存在，只是不足以安全归类。",
                             "星系对/三重星系/星系群为明确标记的集合条目，不等同于单个星系，可能与成员条目重叠。",
                             "**只是目录双星标记，不保证物理束缚；Cl+N主分类为星团并保留伴星云标签。",
                             "NGC的Pax可能关联前景天体；只对*与Nova的正视差直接换算，其他类型绝不推距。",
                             "星系距离大多未提供；不采用红移/哈勃定律或外部记忆补值。",
                             "形态S0、E-S0、不规则、带问号及缺失值都采用不指定形态的示意预设。",
                             "星云中心星的Cstar字段不是星云总量，不放入星云半径/星等或别名。"]},
            {"id": "nasa-ps", "name": "NASA Exoplanet Archive — Planetary Systems (PS)",
             "projectUrl": NASA_BASE, "downloadUrl": next(d["url"] for d in nm["downloads"] if d["file"] == nm["dataFile"]),
             "query": nm["query"], "localDirectory": nd.relative_to(DATA_DIR).as_posix(), "dataFile": nm["dataFile"],
             "acquiredDate": ACQUIRED_DATE, "sourceRowCount": len(ps), "includedRowCount": len(ps),
             "derivedHostCount": nasa_stats["uniqueHosts"], **nasa_stats,
             "licenseStatus": "未在已检查的官方字段/致谢/DOI页面发现明确通用数据许可证；不标注公有领域或虚构CC许可。",
             "licenseEvidenceUrls": [NASA_BASE + "/docs/acknowledge.html", NASA_BASE + "/docs/doi.html", NASA_BASE + "/docs/API_PS_columns.html"],
             "acknowledgement": match[0], "acknowledgementUrl": NASA_BASE + "/docs/acknowledge.html",
             "datasetDoi": "https://doi.org/10.26133/NEA12",
             "overviewCitation": "Christiansen et al. (2025), The Planetary Science Journal",
             "overviewDoi": "https://doi.org/10.3847/PSJ/ade3c2",
             "citationPolicy": "公开使用时保留官方致谢、PS数据DOI及总览引用；具体文献参数的原论文链接保存在每条sources中。",
             "downloads": nm["downloads"], "fetchAttempts": nm.get("fetchAttempts", []),
             "limitations": ["只取ps.default_flag=1的确认行星默认参数集，不是pscomppars，也不是候选列表。",
                             "pl_controv_flag=1保留并明确标记文献争议，不当作毫无争议的确认。",
                             "Msini与上/下限单列；空字段不从非默认参数集或记忆补齐，误差区间未纳入。",
                             "宿主按hostname唯一派生；同系统多个分量名仍是不同hostname，不做未经验证的跨目录/坐标合并。",
                             "宿主恒星和系统各自选已知字段最多的一整行，平局按行星名排序；不跨恒星解逐字段拼接或平均。",
                             "kind枚举无褐矮星项，NASA宿主归star目录类；低于0.075太阳质量的已知估计单独标记亚恒星质量，不泛称主序星。",
                             "行星坐标/距离/hostMagnitude属于宿主系统，宿主V星等也可能含混合光。",
                             "以半径1.6地球半径阈值选择gas/rocky仅为示意；不声称成分、宜居性、云层或观测照片。"]},
        ],
        "fieldDescriptions": FIELD_DESCRIPTIONS,
        "visualPolicy": {"allPresets": "程序化可视化示意，不是观测照片；seed=稳定ID的SHA256前32位。",
                         "galaxies": "仅单星系且明确Hubble螺旋/E分类用spiral/elliptical，其他用nebula通用示意，主分类仍为galaxy。",
                         "exoplanets": "radiusEarth>=1.6时gas，否则rocky（包括半径未知）；无真实表面/气体成分断言。",
                         "stars": "无凭据不推断光谱、演化阶段或物理双星关系；无依据不设置color。"},
        "unavailableData": ["OpenNGC旧database/NGC.csv路径404；已改用官方database_files/NGC.csv，不是缺失源。",
                            "两源不覆盖太阳系行星、卫星、彗星、小行星或独立黑洞目录，本次不伪造这些类别条目。",
                            "两源未提供的距离、物理量与误差区间均不补假值；NASA明确通用许可证未能确认。"],
    }


def summary_metadata(records, validation):
    counts = Counter(record["kind"] for record in records)
    coverage = {}
    for kind in sorted(KINDS):
        group = [r for r in records if r["kind"] == kind]
        if not group:
            continue
        fields = sorted(PHYSICAL_FIELDS | {key for r in group for key in r["facts"] if key.endswith(("UpperLimit", "LowerLimit"))})
        coverage[kind] = {field: {"known": sum(field in r["facts"] for r in group),
                                  "missing": sum(field not in r["facts"] for r in group)} for field in fields}
    return {"schemaVersion": 1, "acquiredDate": ACQUIRED_DATE, "totalRecords": len(records),
            "countsByKind": {kind: counts[kind] for kind in sorted(KINDS)},
            "countsBySubtype": dict(sorted(Counter(r["subtype"] for r in records).items())),
            "fieldCoverageByKind": coverage,
            "missingAnyCoordinates": sum("raDeg" not in r["facts"] or "decDeg" not in r["facts"] for r in records),
            "missingDistance": sum("distanceLy" not in r["facts"] for r in records),
            "noPhysicalMeasurement": sum(not PHYSICAL_FIELDS.intersection(r["facts"]) for r in records),
            "galaxyVisualPresets": dict(sorted(Counter(r["visual"]["preset"] for r in records if r["kind"] == "galaxy").items())),
            "coverageNote": "missing表示中心值字段未提供，不是0；某类别不适用的字段亦缺失，上/下限在独立字段统计。",
            "validation": validation}


def build(od, nd):
    od, nd = od.resolve(), nd.resolve()
    if not od.is_relative_to(DATA_DIR.resolve()) or not nd.is_relative_to(DATA_DIR.resolve()):
        raise ValueError("Snapshots must stay under server/data.")
    om, nm = manifest(od), manifest(nd)
    attribution = (od / "attribution.dep5").read_text("utf-8")
    license_text = (od / "LICENSE-CC-BY-SA-4.0.txt").read_text("utf-8")
    if "License: CC-BY-SA-4.0" not in attribution or "Attribution-ShareAlike 4.0" not in license_text:
        raise ValueError("OpenNGC license audit failed.")
    ngc = csv_rows(od / "NGC.csv", delimiter=";", required=["Name", "Type", "RA", "Dec", "Pax", "Hubble"])
    ps = csv_rows(nd / nm.get("dataFile", "ps-default-limits.csv"), required=PS_FIELDS)
    count = csv_rows(nd / "row-count.csv", required=["row_count"])
    if len(count) != 1 or int(count[0]["row_count"]) != len(ps):
        raise ValueError("NASA snapshot may be truncated or changed during download: independent count mismatch.")
    source_url = next(item["url"] for item in om["downloads"] if item["file"] == "NGC.csv")
    records, ngc_stats = ngc_records(ngc, source_url)
    nasa, nasa_stats = nasa_records(ps)
    records.extend(nasa)
    records.sort(key=lambda record: record["id"])
    validation = validate(records)
    meta = source_metadata(od, nd, om, nm, ngc, ps, ngc_stats, nasa_stats, records)
    stats = summary_metadata(records, validation)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    write_json(DATA_DIR / "catalog-real.json", records, catalog=True)
    write_json(DATA_DIR / "catalog-sources.json", meta)
    write_json(DATA_DIR / "catalog-summary.json", stats)
    # Read back generated JSON, not entire files into the model's output.
    saved = json.loads((DATA_DIR / "catalog-real.json").read_text("utf-8"))
    validate(saved)
    print(json.dumps({"totalRecords": len(records), "countsByKind": stats["countsByKind"],
                      "openngcIncluded": meta["sources"][0]["includedRowCount"],
                      "nasaPlanets": len(ps), "derivedHosts": nasa_stats["uniqueHosts"],
                      "excludedOpenNGC": ngc_stats["excludedByType"],
                      "validation": validation,
                      "outputs": {name: {"path": str(DATA_DIR / name), "bytes": (DATA_DIR / name).stat().st_size,
                                          "sha256": sha256(DATA_DIR / name)}
                                  for name in ["catalog-real.json", "catalog-sources.json", "catalog-summary.json"]}},
                     ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--download", action="store_true", help="Fetch fresh snapshots into new source directories")
    parser.add_argument("--openngc-dir", type=Path)
    parser.add_argument("--nasa-dir", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    if args.validate_only:
        records = json.loads((DATA_DIR / "catalog-real.json").read_text("utf-8"))
        print(json.dumps(validate(records), ensure_ascii=False, indent=2))
        return
    if args.download:
        if args.openngc_dir or args.nasa_dir:
            parser.error("--download cannot be combined with explicit input paths")
        od, nd = download_snapshots()
    elif args.openngc_dir or args.nasa_dir:
        if not args.openngc_dir or not args.nasa_dir:
            parser.error("Both explicit source directories are required")
        od, nd = args.openngc_dir, args.nasa_dir
    else:
        metadata = json.loads((DATA_DIR / "catalog-sources.json").read_text("utf-8"))
        sources = {source["id"]: source for source in metadata["sources"]}
        od = DATA_DIR / sources["openngc"]["localDirectory"]
        nd = DATA_DIR / sources["nasa-ps"]["localDirectory"]
    build(od, nd)


if __name__ == "__main__":
    main()
