import json

# Definiáljuk az új teszteseteket
scenarios = []

# Sweep 1: Idő lépések (Hőmérséklet fix 22 °C, 4 db 280g gombóc, 65% hidr, 3.0% só)
hours_sweep = [3, 5, 7, 9, 11, 13, 15, 20]
idx = 1
for h in hours_sweep:
    scenarios.append({
        "id": idx,
        "type": "Idő söprés (Sweep 1)",
        "scenario": f"{h} óra @ 22 °C (4 gombóc, 280g, 65% hidr., 3.0% só)",
        "roomHours": h,
        "roomTempC": 22,
        "coldHours": 0,
        "coldTempC": 0,
        "flour": 1120 / 1.68
    })
    idx += 1

# Sweep 2: Hőmérséklet lépések (Idő fix 8 óra, 4 db 280g gombóc, 65% hidr, 3.0% só)
temp_sweep = [18, 19, 20, 21, 23, 24, 25, 26]
for t in temp_sweep:
    scenarios.append({
        "id": idx,
        "type": "Hőmérséklet söprés (Sweep 2)",
        "scenario": f"8 óra @ {t} °C (4 gombóc, 280g, 65% hidr., 3.0% só)",
        "roomHours": 8,
        "roomTempC": t,
        "coldHours": 0,
        "coldTempC": 0,
        "flour": 1120 / 1.68
    })
    idx += 1

# Kiszámoljuk a Craig és a fitted PizzApp élesztő grammokat
def temp_rate_factor_craig(temp):
    return Math_pow(2, (temp - 21) / 9.0)

def temp_rate_factor_pizzapp(temp):
    return Math_pow(1.13, temp - 21)

def Math_pow(base, exp):
    return base ** exp

def clamp(v, lo, hi):
    return min(hi, max(lo, v))

for s in scenarios:
    # 1. Craig számítás
    eff_craig = s["roomHours"] * temp_rate_factor_craig(s["roomTempC"])
    y_pct_craig = (0.10 * 24 / eff_craig) if eff_craig > 0 else 3.0
    y_pct_craig = clamp(y_pct_craig, 0.01, 3.0)
    # A Craig élesztőnk jelenleg 75%-os alapértelmezett korrekción fut!
    s["alkimistaCraigYeastG"] = round(s["flour"] * (y_pct_craig / 100) * 0.75, 2)

    # 2. Új fitted PizzApp számítás (100% szorzónál)
    eff_pizzapp = s["roomHours"] * temp_rate_factor_pizzapp(s["roomTempC"])
    y_pct_pizzapp = (7.10 / Math_pow(eff_pizzapp, 1.50)) if eff_pizzapp > 0 else 3.0
    y_pct_pizzapp = clamp(y_pct_pizzapp, 0.01, 3.0)
    s["alkimistaPizzAppYeastG"] = round(s["flour"] * (y_pct_pizzapp / 100), 2)
    s["pizzAppFreshYeastG"] = 0.0

# Kiírjuk a JSON fájlba
with open("yeast_tests.json", "w", encoding="utf-8") as f:
    json.dump(scenarios, f, indent=2, ensure_ascii=False)

print("Precalc done!")
