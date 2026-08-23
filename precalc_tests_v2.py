import json

scenarios = []
idx = 1

# Sweep 1: Hidratáció lépések (Fix 8 óra, 22 °C, 4 db 280g gombóc, 3.0% só)
hyd_sweep = [55, 60, 65, 70, 75, 80]
for hyd in hyd_sweep:
    # Liszt tömeg kiszámítása (Total = 1120g)
    flour = 1120 / (1 + hyd/100.0 + 0.03)
    scenarios.append({
        "id": idx,
        "type": "Hidratáció söprés (Sweep 1)",
        "scenario": f"8 óra @ 22 °C, {hyd}% hidr., 3.0% só (4 gombóc, 280g)",
        "hydrationPct": hyd,
        "saltPct": 3.0,
        "roomHours": 8,
        "roomTempC": 22,
        "coldHours": 0,
        "coldTempC": 0,
        "flour": flour
    })
    idx += 1

# Sweep 2: Só lépések (Fix 8 óra, 22 °C, 4 db 280g gombóc, 65% hidr)
salt_sweep = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0]
for salt in salt_sweep:
    flour = 1120 / (1 + 0.65 + salt/100.0)
    scenarios.append({
        "id": idx,
        "type": "Só söprés (Sweep 2)",
        "scenario": f"8 óra @ 22 °C, 65% hidr., {salt}% só (4 gombóc, 280g)",
        "hydrationPct": 65,
        "saltPct": salt,
        "roomHours": 8,
        "roomTempC": 22,
        "coldHours": 0,
        "coldTempC": 0,
        "flour": flour
    })
    idx += 1

# Kiszámoljuk az élesztő értékeket
def temp_rate_factor_craig(temp):
    return (2 ** ((temp - 21) / 9.0))

def temp_rate_factor_pizzapp(temp):
    return (1.135 ** (temp - 21))

def clamp(v, lo, hi):
    return min(hi, max(lo, v))

for s in scenarios:
    # 1. Craig (100% szorzó!)
    eff_craig = s["roomHours"] * temp_rate_factor_craig(s["roomTempC"])
    y_pct_craig = (0.10 * 24 / eff_craig) if eff_craig > 0 else 3.0
    y_pct_craig = clamp(y_pct_craig, 0.01, 3.0)
    s["alkimistaCraigYeastG"] = round(s["flour"] * (y_pct_craig / 100), 2)

    # 2. PizzApp Fitted (100% szorzó)
    eff_pizzapp = s["roomHours"] * temp_rate_factor_pizzapp(s["roomTempC"])
    y_pct_pizzapp = (6.50 / (eff_pizzapp ** 1.45)) if eff_pizzapp > 0 else 3.0
    y_pct_pizzapp = clamp(y_pct_pizzapp, 0.01, 3.0)
    s["alkimistaPizzAppYeastG"] = round(s["flour"] * (y_pct_pizzapp / 100), 2)
    s["pizzAppFreshYeastG"] = 0.0

with open("yeast_tests.json", "w", encoding="utf-8") as f:
    json.dump(scenarios, f, indent=2, ensure_ascii=False)

print("Precalc V2 done!")
