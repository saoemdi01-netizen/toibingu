export interface WorldInfo {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  coords: string;
  coverImage: string;
  detailImage: string;
  bgHex: string;
  accentColor: string;
  stats: {
    label: string;
    value: string;
    unit?: string;
  }[];
  overview: string;
  explorationSteps: {
    title: string;
    description: string;
    time: string;
  }[];
}

export const ATTRACTION_WORLDS: WorldInfo[] = [
  {
    id: "gargantua-00",
    title: "Gargantua Singularity",
    subtitle: "A majestic supermassive black hole with a sweeping accretion disk.",
    tag: "Aura-X",
    coords: "00.0000° Singularity Grid",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_Gargantua_Interstellar.png/1280px-Black_hole_Gargantua_Interstellar.png",
    detailImage: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Black_hole_Gargantua_Interstellar.png",
    bgHex: "#020204",
    accentColor: "from-amber-400 to-indigo-900",
    stats: [
      { label: "Gravity Level", value: "Infinite", unit: "G" },
      { label: "Time Dilat.", value: "1h = 7yr", unit: "(Earth)" },
      { label: "Disk Temp", value: "3.2M", unit: "K" },
    ],
    overview: "Formed by the collapse of an ancient titanic star, Gargantua is the crown jewel of modern cosmic tourism. Explore the intense, curved gravitational fields that bend physics, watch stars split into perfect Einstein rings, and experience absolute silent time dilation on our custom high-tensile glass observation decks suspended hovering safely over the singularity’s endless event horizon.",
    explorationSteps: [
      { title: "Sling-shot Maneuver", description: "Utilize low-gravity fusion engines to enter the stable orbit corridor.", time: "09:00" },
      { title: "Horizon Observation Desk", description: "Float above the sweeping accretion disk, viewing the fiery flow of interstellar gas and matter.", time: "12:00" },
      { title: "Time Distortion Lock", description: "Synchronize chronometer feeds with the home galaxy before executing a subtle safe hyper-jump departure.", time: "16:00" },
    ]
  },
  {
    id: "nordic-01",
    title: "Nordic Solitude",
    subtitle: "A silent micro-cabin framed by Iceland's frozen basalt pillars.",
    tag: "Aura-I",
    coords: "64.1466° N, 21.9426° W",
    coverImage: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    detailImage: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=800&q=80",
    bgHex: "#0c151c",
    accentColor: "from-cyan-400 to-sky-600",
    stats: [
      { label: "Ambient Temp", value: "-4", unit: "°C" },
      { label: "Silence Index", value: "98", unit: "%" },
      { label: "Wind Velocity", value: "12", unit: "km/h" },
    ],
    overview: "Suspended amidst the raw elements of southern Iceland, this architectural glass sanctuary lets guests witness the aurora borealis resting atop high-contrast black sand cliffs. Engineered with clean thermal loops, it remains warm while you observe the wild glacier winds outside.",
    explorationSteps: [
      { title: "Arrival via Snowcat", description: "Cross the glacier plateau in a custom heated rover under complete darkness.", time: "18:00" },
      { title: "Basalt Thermal Soak", description: "Submerge in the natural volcanic steam pool surrounded by ice basalt carvings.", time: "21:00" },
      { title: "Midnight Horizon Watching", description: "Dimmable interior lights and premium high-clarity sky projection for the northern lights.", time: "00:00" },
    ]
  },
  {
    id: "tokyo-02",
    title: "Tokyo Neon Noir",
    subtitle: "A cyber-minimalist studio floating above the rainy heart of Shinjuku.",
    tag: "Aura-II",
    coords: "35.6762° N, 139.6503° E",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80",
    detailImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    bgHex: "#12081c",
    accentColor: "from-fuchsia-500 to-indigo-600",
    stats: [
      { label: "Visual Noise", value: "75", unit: "dB" },
      { label: "Elevation Grid", value: "48", unit: "F" },
      { label: "Rain probability", value: "92", unit: "%" },
    ],
    overview: "Nestled between soaring LED skyscraper screens and historical narrow alleys, this studio offers a high-intensity urban retreat. Fully sound-insulated, yet visually connected to the hyper-vibrant energy of the continuous cyberpunk rain traffic below.",
    explorationSteps: [
      { title: "Rooftop Drone Landing", description: "Welcome tea served on the private helipad overlooking the glowing metropolis.", time: "19:30" },
      { title: "Neon Alley Wander", description: "Guided exploration of Shinjuku's hidden high-contrast ramen counters and vintage tape shops.", time: "21:30" },
      { title: "Synth Synthesis Lounge", description: "Calibrate modular synthesizer channels syncing to outer city heartbeat signals.", time: "23:30" },
    ]
  },
  {
    id: "sahara-03",
    title: "Sahara Dunes Oasis",
    subtitle: "A modern nomadic structure designed around a warm golden sand ripple.",
    tag: "Aura-III",
    coords: "24.8864° N, 6.3313° E",
    coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1200&q=80",
    detailImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
    bgHex: "#1f1004",
    accentColor: "from-amber-500 to-orange-700",
    stats: [
      { label: "Dry Humidity", value: "4", unit: "%" },
      { label: "Dune Shift", value: "24", unit: "cm/d" },
      { label: "Star Density", value: "9.8", unit: "k/deg" },
    ],
    overview: "Surrounded by a sea of orange sand ripples, this lightweight canvas structure blends ancient tent crafts with sophisticated high-tensile carbon components. Features a retractable stargazing skyroof directly looking up into the milky way under zero light pollution.",
    explorationSteps: [
      { title: "Sunset Camel Ascent", description: "Witness the transition of amber dunes from high crests on organic camelbacks.", time: "17:00" },
      { title: "Retractable Skyroof Reveal", description: "Slide back the canopy to unveil millions of desert constellations overhead in real time.", time: "20:00" },
      { title: "Oud & Ember Dinner", description: "Underneath subterranean dune caves, relish slow-cooked mint lamb around glowing clay pits.", time: "21:30" },
    ]
  },
  {
    id: "amalfi-04",
    title: "Amalfi Coastal Terrace",
    subtitle: "A suspended concrete villa hugging Italy's sheer limestone sea cliff.",
    tag: "Aura-IV",
    coords: "40.6340° N, 14.6027° E",
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    detailImage: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80",
    bgHex: "#021c17",
    accentColor: "from-teal-400 to-emerald-600",
    stats: [
      { label: "Ocean Salt", value: "34", unit: "ug" },
      { label: "Sea Depth Grid", value: "220", unit: "m" },
      { label: "Solar Wave", value: "880", unit: "W" },
    ],
    overview: "Hovering gracefully between blue salt currents and golden sunbaked cliffs, this brutalist architecture gem integrates raw stone tables with seamless water elements. Ideal for watching luxury yacht lights drift over the horizon during quiet Mediterranean sundown.",
    explorationSteps: [
      { title: "Cliffside Descent", description: "Travel down a private brass-trimmed elevator carved straight into the volcanic limestone face.", time: "14:00" },
      { title: "Sailing & Coral Dive", description: "Charter a retro mahogany speedboat to explore pristine turquoise coastal arches.", time: "15:30" },
      { title: "Aperol Sunset Acoustic", description: "Unwind on the warm saltwater terrace listening to ambient jazz and breaking waves.", time: "18:00" },
    ]
  },
  {
    id: "bioluminescent-05",
    title: "Bioluminescent Lagoon",
    subtitle: "Underground water-domes glowing with millions of self-luminous neon lifeforms.",
    tag: "Aura-V",
    coords: "-38.2612° S, 175.1118° E",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    detailImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    bgHex: "#050f14",
    accentColor: "from-blue-400 to-violet-600",
    stats: [
      { label: "Neon Glow", value: "480", unit: "lm" },
      { label: "Cave Humidity", value: "99", unit: "%" },
      { label: "Aura Spark", value: "1.4", unit: "M" },
    ],
    overview: "Carved into deep oceanic chambers in New Zealand, this underground lake home mimics planetary bioluminescence. Thousands of organic tiny glowing glowworms drape from the dark dome ceiling, matching the pulse of azure neon waters.",
    explorationSteps: [
      { title: "Fluorescent Boat Cradle", description: "Drift in a glass-bottom boat that triggers bright blue neon sparks under each paddle stroke.", time: "20:00" },
      { title: "Azure Cave Swimming", description: "Swim in skin-temperature volcanic mineral waters that illuminate your every movement.", time: "22:00" },
      { title: "Chamber Echo Meditation", description: "A therapeutic sound bath reflecting deep low-frequency crystal resonates off basalt caverns.", time: "23:45" },
    ]
  }
];
