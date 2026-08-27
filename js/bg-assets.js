/**
 * PizzaAlkimista — Dynamic Background SVG Assets Library
 * Designed as line-art (stroke="currentColor", fill="none", stroke-width="2")
 * ViewBox: 0 0 100 100
 */
window.PizzaAlkimistaBgAssets = {
  // COMMON (Súly: 5)
  "flour": {
    category: "COMMON",
    weight: 5,
    svg: `<path d="M 30 35 C 25 35, 25 85, 30 85 L 70 85 C 75 85, 75 35, 70 35 C 65 30, 35 30, 30 35 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 28 35 C 35 40, 65 40, 72 35 M 32 30 C 35 25, 45 28, 48 32 M 68 30 C 65 25, 55 28, 52 32" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 50 L 50 70 M 45 55 L 50 50 L 55 55 M 45 65 L 50 60 L 55 65" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "flour-cloud": {
    category: "COMMON",
    weight: 5,
    svg: `<path d="M 25 55 C 20 50, 20 35, 30 30 C 40 25, 55 25, 65 35 C 75 30, 85 40, 80 50 C 85 60, 75 70, 65 65 C 55 75, 35 75, 25 65 Z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />`
  },
  "dough-ball": {
    category: "COMMON",
    weight: 5,
    svg: `<path d="M 25 70 C 20 60, 20 45, 35 35 C 50 25, 65 30, 75 45 C 80 55, 80 65, 70 75 C 60 80, 30 80, 25 70 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 35 50 C 40 45, 50 45, 55 52 M 45 60 C 50 57, 58 58, 62 64" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "wheat": {
    category: "COMMON",
    weight: 5,
    svg: `<path d="M 50 90 L 50 15 M 50 45 C 40 38, 42 28, 50 35 C 58 28, 60 38, 50 45 M 50 60 C 40 53, 42 43, 50 50 C 58 43, 60 53, 50 60 M 50 75 C 40 68, 42 58, 50 65 C 58 58, 60 68, 50 75 M 50 30 C 42 23, 44 13, 50 20 C 58 13, 60 23, 50 30" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "water-drop": {
    category: "COMMON",
    weight: 5,
    svg: `<path d="M 50 15 C 50 15, 80 50, 80 68 A 30 30 0 0 1 20 68 C 20 50, 50 15, 50 15 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 40 68 A 18 18 0 0 1 35 55" stroke="currentColor" stroke-width="1" fill="none" />`
  },
  "crumbs": {
    category: "COMMON",
    weight: 5,
    svg: `<g stroke="none" fill="currentColor"><circle cx="20" cy="30" r="1.5" /><circle cx="28" cy="22" r="1" /><circle cx="35" cy="32" r="2" /><circle cx="65" cy="68" r="1.5" /><circle cx="78" cy="74" r="2.2" /><circle cx="70" cy="80" r="1" /></g>`
  },

  // MEDIUM (Súly: 3)
  "rolling-pin": {
    category: "MEDIUM",
    weight: 3,
    svg: `<rect x="20" y="42" width="60" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 20 50 L 8 50 C 6 50, 6 46, 8 46 L 20 46 M 80 50 L 92 50 C 94 50, 94 46, 92 46 L 80 46" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "pizza-cutter": {
    category: "MEDIUM",
    weight: 3,
    svg: `<circle cx="50" cy="38" r="22" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="38" r="4" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 60 L 50 85 C 50 88, 46 90, 50 90 M 50 60 L 40 50 M 50 60 L 60 50" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "scale": {
    category: "MEDIUM",
    weight: 3,
    svg: `<rect x="25" y="65" width="50" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="75" r="8" stroke="currentColor" stroke-width="1.5" fill="none" /><line x1="50" y1="75" x2="53" y2="70" stroke="currentColor" stroke-width="1.5" /><path d="M 15 45 L 85 45 L 75 65 L 25 65 Z" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "bowl": {
    category: "MEDIUM",
    weight: 3,
    svg: `<path d="M 15 35 C 15 35, 20 80, 50 80 C 80 80, 85 35, 85 35 Z" stroke="currentColor" stroke-width="2" fill="none" /><ellipse cx="50" cy="35" rx="35" ry="6" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "timer": {
    category: "MEDIUM",
    weight: 3,
    svg: `<circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 15 L 50 8 M 45 8 L 55 8 M 50 50 L 50 30 L 62 38" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="50" r="3" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 75 25 A 35 35 0 0 1 85 50" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "thermometer": {
    category: "MEDIUM",
    weight: 3,
    svg: `<path d="M 45 20 L 45 65 A 12 12 0 1 0 55 65 L 55 20 A 5 5 0 0 0 45 20 Z" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="72" r="6" stroke="currentColor" stroke-width="1.5" fill="none" /><line x1="50" y1="66" x2="50" y2="35" stroke="currentColor" stroke-width="2.5" /><line x1="40" y1="30" x2="45" y2="30" stroke="currentColor" stroke-width="1.5" /><line x1="40" y1="40" x2="45" y2="40" stroke="currentColor" stroke-width="1.5" /><line x1="40" y1="50" x2="45" y2="50" stroke="currentColor" stroke-width="1.5" />`
  },
  "wooden-spoon": {
    category: "MEDIUM",
    weight: 3,
    svg: `<path d="M 50 15 C 43 15, 43 35, 50 35 C 57 35, 57 15, 50 15 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 35 L 50 85 M 46 85 L 54 85" stroke="currentColor" stroke-width="2" fill="none" />`
  },
  "yeast": {
    category: "MEDIUM",
    weight: 3,
    svg: `<rect x="25" y="25" width="50" height="50" rx="4" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 25 45 C 35 40, 65 40, 75 45 M 25 60 C 35 55, 65 55, 75 60 M 45 25 C 40 35, 40 65, 45 75 M 60 25 C 55 35, 55 65, 60 75" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "olive-oil": {
    category: "MEDIUM",
    weight: 3,
    svg: `<rect x="35" y="40" width="30" height="45" rx="5" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 45 40 L 45 25 C 45 22, 55 22, 55 25 L 55 40" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 47 25 L 53 15 M 50 15 L 55 10" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 50 C 45 55, 45 70, 50 75 C 55 70, 55 55, 50 50 Z" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "tomato": {
    category: "MEDIUM",
    weight: 3,
    svg: `<circle cx="50" cy="55" r="30" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 25 C 45 20, 48 12, 50 16 C 52 12, 55 20, 50 25 Z" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M 45 23 L 38 18 M 55 23 L 62 18" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "mozzarella": {
    category: "MEDIUM",
    weight: 3,
    svg: `<ellipse cx="45" cy="55" rx="25" ry="18" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 30 45 C 40 38, 70 38, 80 50 C 75 65, 45 75, 30 45 Z" stroke="currentColor" stroke-width="1.5" fill="none" /><ellipse cx="55" cy="45" rx="20" ry="14" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },

  // RARE (Súly: 1)
  "pizza-peel": {
    category: "RARE",
    weight: 1,
    svg: `<rect x="32" y="10" width="36" height="40" rx="4" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 50 50 L 50 95 M 42 95 L 58 95" stroke="currentColor" stroke-width="2" fill="none" /><line x1="32" y1="42" x2="68" y2="42" stroke="currentColor" stroke-width="2" />`
  },
  "oven": {
    category: "RARE",
    weight: 1,
    svg: `<path d="M 10 85 A 40 40 0 0 1 90 85 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 25 85 A 25 25 0 0 1 75 85 Z" stroke="currentColor" stroke-width="2" fill="none" /><line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" stroke-width="2" />`
  },
  "pizza": {
    category: "RARE",
    weight: 1,
    svg: `<circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M 50 8 A 42 42 0 0 1 85 24 M 18 30 A 42 42 0 0 1 50 8" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="35" cy="40" r="5" stroke="currentColor" stroke-width="1.5" fill="none" /><circle cx="65" cy="45" r="4" stroke="currentColor" stroke-width="1.5" fill="none" /><circle cx="48" cy="65" r="6" stroke="currentColor" stroke-width="1.5" fill="none" /><path d="M 30 52 Q 35 56 32 60 M 58 35 Q 63 32 60 38" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "pizza-slice": {
    category: "RARE",
    weight: 1,
    svg: `<path d="M 50 15 L 15 75 A 42 42 0 0 0 85 75 Z" stroke="currentColor" stroke-width="2" fill="none" /><path d="M 17 71 A 42 42 0 0 0 83 71" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="50" cy="45" r="4" stroke="currentColor" stroke-width="1.5" fill="none" /><circle cx="38" cy="60" r="3" stroke="currentColor" stroke-width="1.5" fill="none" /><circle cx="62" cy="60" r="3" stroke="currentColor" stroke-width="1.5" fill="none" />`
  },
  "baking-stone": {
    category: "RARE",
    weight: 1,
    svg: `<ellipse cx="50" cy="65" rx="42" ry="18" stroke="currentColor" stroke-width="2" fill="none" /><ellipse cx="50" cy="61" rx="42" ry="18" stroke="currentColor" stroke-width="2" fill="none" /><line x1="8" y1="61" x2="8" y2="65" stroke="currentColor" stroke-width="2" /><line x1="92" y1="61" x2="92" y2="65" stroke="currentColor" stroke-width="2" />`
  }
};
