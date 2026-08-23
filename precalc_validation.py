import json

scenarios = [
  {
    "id": 1,
    "scenario": "6 óra @ 20 °C, 58% hidr., 2.5% só (4 gombóc, 280g)",
    "roomHours": 6,
    "roomTempC": 20,
    "hydrationPct": 58,
    "saltPct": 2.5,
    "flour": 1120 / (1 + 0.58 + 0.025),
    "alkimistaCraigYeastG": 3.03,
    "alkimistaPizzAppYeastG": 4.07,
    "pizzAppFreshYeastG": 4.07
  },
  {
    "id": 2,
    "scenario": "10 óra @ 24 °C, 72% hidr., 3.2% só (4 gombóc, 280g)",
    "roomHours": 10,
    "roomTempC": 24,
    "hydrationPct": 72,
    "saltPct": 3.2,
    "flour": 639.269406392694,
    "alkimistaCraigYeastG": 0.88,
    "alkimistaPizzAppYeastG": 0.85,
    "pizzAppFreshYeastG": 0.85
  },
  {
    "id": 3,
    "scenario": "18 óra @ 19 °C, 60% hidr., 2.8% só (5 gombóc, 250g)",
    "roomHours": 18,
    "roomTempC": 19,
    "hydrationPct": 60,
    "saltPct": 2.8,
    "flour": 767.8132678132678,
    "alkimistaCraigYeastG": 1.22,
    "alkimistaPizzAppYeastG": 1.09,
    "pizzAppFreshYeastG": 1.09
  },
  {
    "id": 4,
    "scenario": "4 óra @ 25 °C, 68% hidr., 3.5% só (3 gombóc, 320g)",
    "roomHours": 4,
    "roomTempC": 25,
    "hydrationPct": 68,
    "saltPct": 3.5,
    "flour": 559.7667638483965,
    "alkimistaCraigYeastG": 1.62,
    "alkimistaPizzAppYeastG": 2.37,
    "pizzAppFreshYeastG": 2.37
  },
  {
    "id": 5,
    "scenario": "12 óra @ 21 °C, 80% hidr., 1.8% só (6 gombóc, 290g)",
    "roomHours": 12,
    "roomTempC": 21,
    "hydrationPct": 80,
    "saltPct": 1.8,
    "flour": 957.0957095709571,
    "alkimistaCraigYeastG": 1.91,
    "alkimistaPizzAppYeastG": 1.66,
    "pizzAppFreshYeastG": 1.65
  },
  {
    "id": 6,
    "scenario": "5 óra @ 23 °C, 63% hidr., 3.0% só (4 gombóc, 280g)",
    "roomHours": 5,
    "roomTempC": 23,
    "hydrationPct": 63,
    "saltPct": 3.0,
    "flour": 674.6987951807229,
    "alkimistaCraigYeastG": 2.45,
    "alkimistaPizzAppYeastG": 2.96,
    "pizzAppFreshYeastG": 2.95
  }
]

with open("yeast_validation.json", "w", encoding="utf-8") as f:
    json.dump(scenarios, f, indent=2, ensure_ascii=False)

print("Validation V3 updated!")
