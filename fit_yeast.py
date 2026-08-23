# Összesített 46 adatpont
data = [
    # Eredeti pontok
    {"roomHours": 4, "roomTempC": 20, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 7.01, "flour": 1120 / 1.68},
    {"roomHours": 4, "roomTempC": 24, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.34, "flour": 1120 / 1.68},
    {"roomHours": 6, "roomTempC": 21, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.24, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.78, "flour": 1120 / 1.68},
    {"roomHours": 10, "roomTempC": 20, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.87, "flour": 1120 / 1.68},
    {"roomHours": 12, "roomTempC": 19, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.72, "flour": 1120 / 1.68},
    {"roomHours": 18, "roomTempC": 20, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.8, "flour": 1120 / 1.682},
    {"roomHours": 5, "roomTempC": 25, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.01, "flour": 1120 / 1.678},
    {"roomHours": 9, "roomTempC": 17, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.78, "flour": 1120 / 1.68},
    {"roomHours": 6, "roomTempC": 22, "coldHours": 18, "coldTempC": 4, "pizzAppFreshYeastG": 1.24, "flour": 1120 / 1.68},
    {"roomHours": 12, "roomTempC": 20, "coldHours": 24, "coldTempC": 4, "pizzAppFreshYeastG": 1.03, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 23, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.49, "flour": 3000 / 1.728},
    
    # 1. Sweep (idő)
    {"roomHours": 3, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 7.33, "flour": 1120 / 1.68},
    {"roomHours": 5, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.51, "flour": 1120 / 1.68},
    {"roomHours": 7, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.16, "flour": 1120 / 1.68},
    {"roomHours": 9, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.5, "flour": 1120 / 1.68},
    {"roomHours": 11, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.12, "flour": 1120 / 1.68},
    {"roomHours": 13, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.88, "flour": 1120 / 1.68},
    {"roomHours": 15, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.72, "flour": 1120 / 1.68},
    {"roomHours": 20, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.47, "flour": 1120 / 1.68},
    
    # 2. Sweep (hőmérséklet)
    {"roomHours": 8, "roomTempC": 18, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.73, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 19, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 3.10, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 20, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.58, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 21, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.14, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 23, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.48, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 24, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.23, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 25, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.02, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 26, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.85, "flour": 1120 / 1.68},

    # Hidratációs és só sweep
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.88, "flour": 1120 / 1.58},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.83, "flour": 1120 / 1.63},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.78, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.73, "flour": 1120 / 1.73},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.69, "flour": 1120 / 1.78},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.65, "flour": 1120 / 1.83},
    
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.79, "flour": 1120 / 1.665},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.79, "flour": 1120 / 1.67},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.78, "flour": 1120 / 1.675},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.78, "flour": 1120 / 1.68},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.77, "flour": 1120 / 1.685},
    {"roomHours": 8, "roomTempC": 22, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.77, "flour": 1120 / 1.69},
    
    # Új validációs pontok
    {"roomHours": 6, "roomTempC": 20, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 4.07, "flour": 1120 / (1 + 0.58 + 0.025)},
    {"roomHours": 10, "roomTempC": 24, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 0.85, "flour": 1120 / (1 + 0.72 + 0.032)},
    {"roomHours": 18, "roomTempC": 19, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.09, "flour": 1250 / (1 + 0.60 + 0.028)},
    {"roomHours": 4, "roomTempC": 25, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.37, "flour": 960 / (1 + 0.68 + 0.035)},
    {"roomHours": 12, "roomTempC": 21, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 1.65, "flour": 1740 / (1 + 0.80 + 0.018)},
    {"roomHours": 5, "roomTempC": 23, "coldHours": 0, "coldTempC": 0, "pizzAppFreshYeastG": 2.95, "flour": 1120 / (1 + 0.63 + 0.03)}
]

for d in data:
    d["y_pct"] = (d["pizzAppFreshYeastG"] / d["flour"]) * 100

def get_loss(a, b, temp_base):
    loss = 0.0
    for d in data:
        r_temp_factor = temp_base ** (d["roomTempC"] - 21)
        total_rate = d["roomHours"] * r_temp_factor
        if d["coldHours"] > 0:
            c_temp_factor = temp_base ** (d["coldTempC"] - 21)
            total_rate += d["coldHours"] * c_temp_factor
        pred = a / (total_rate ** b)
        loss += (pred - d["y_pct"]) ** 2
    return loss

best_loss = float('inf')
best_a = 0.0
best_b = 0.0
best_tb = 0.0

# Precízebb keresés
for tb_int in range(1120, 1150, 1):
    tb = tb_int / 1000.0
    for a_int in range(600, 750, 2):
        a = a_int / 100.0
        for b_int in range(140, 155, 1):
            b = b_int / 100.0
            loss = get_loss(a, b, tb)
            if loss < best_loss:
                best_loss = loss
                best_a = a
                best_b = b
                best_tb = tb

print(f"Optimal parameters: a = {best_a:.4f}, b = {best_b:.4f}, temp_base = {best_tb:.4f} (Loss: {best_loss:.6f})")
