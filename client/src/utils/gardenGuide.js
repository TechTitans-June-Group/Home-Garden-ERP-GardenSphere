export const PLANT_GUIDE = {
  1: {
    days: 70,
    companions: ['Sweet Basil', 'Marigolds', 'Fresh Carrots'],
    avoid: ['Fresh Mint', 'Cucumber'],
  },
  2: {
    days: 70,
    companions: ['Green Lettuce', 'Cherry Tomatoes', 'Garden Chili'],
    avoid: ['Fresh Mint'],
  },
  3: {
    days: 45,
    companions: ['Fresh Carrots', 'Strawberries', 'Garden Spinach'],
    avoid: ['Sunflowers'],
  },
  4: {
    days: 75,
    companions: ['Sweet Basil', 'Marigolds', 'Cherry Tomatoes'],
    avoid: ['Fresh Mint'],
  },
  5: {
    days: 40,
    companions: ['Strawberries', 'Green Lettuce'],
    avoid: ['Sunflowers'],
  },
  6: {
    days: 90,
    companions: ['Green Lettuce', 'Garden Spinach', 'Marigolds'],
    avoid: ['Fresh Mint'],
  },
  7: {
    days: 0,
    ready: 'Perennial fruit tree',
    companions: ['Hibiscus', 'Aloe Vera Plant'],
    avoid: [],
  },
  8: {
    days: 30,
    companions: ['Green Lettuce'],
    avoid: ['Cherry Tomatoes', 'Garden Roses', 'Strawberries'],
    note: 'Keep mint in its own bed — it spreads quickly.',
  },
  9: {
    days: 40,
    companions: ['Cherry Tomatoes', 'Bell Peppers', 'Marigolds'],
    avoid: [],
  },
  10: {
    days: 80,
    companions: ['Sweet Basil', 'Marigolds', 'Fresh Carrots'],
    avoid: ['Fresh Mint'],
  },
  11: {
    days: 55,
    companions: ['Sunflowers', 'Green Lettuce'],
    avoid: ['Cherry Tomatoes'],
  },
  12: {
    days: 0,
    ready: 'Perennial succulent',
    companions: ['Hibiscus', 'Ripe Mangoes'],
    avoid: [],
  },
  14: {
    days: 14,
    ready: 'Ready to transplant in about 14 days',
    companions: ['Cherry Tomatoes', 'Green Lettuce', 'Garden Spinach'],
    avoid: [],
  },
  15: {
    days: 50,
    companions: ['Cherry Tomatoes', 'Bell Peppers', 'Garden Chili'],
    avoid: [],
    note: 'Marigolds help keep common garden pests away.',
  },
  16: {
    days: 80,
    companions: ['Cucumber'],
    avoid: ['Green Lettuce', 'Garden Spinach'],
  },
  17: {
    days: 0,
    ready: 'Perennial bloom',
    companions: ['Marigolds', 'Sweet Basil'],
    avoid: ['Fresh Mint'],
  },
  18: {
    days: 0,
    ready: 'Perennial bloom',
    companions: ['Marigolds', 'Aloe Vera Plant'],
    avoid: ['Fresh Mint'],
  },
};

export const guideFor = (plant) =>
  PLANT_GUIDE[plant?.id] || { days: 60, companions: [], avoid: [], ready: '' };

export const GARDEN_LAYOUTS = [
  { id: 'balcony', name: 'Balcony', rows: 2, cols: 3, hint: 'Pots and herbs' },
  { id: 'yard', name: 'Small Yard', rows: 3, cols: 4, hint: 'Raised beds' },
  { id: 'family', name: 'Family Garden', rows: 4, cols: 5, hint: 'Full home garden' },
];

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const plotPlantId = (plot) => {
  if (plot == null) return null;
  if (typeof plot === 'object') return plot.plantId || null;
  return plot;
};

export const normalizePlot = (plot) => {
  const plantId = plotPlantId(plot);
  if (!plantId) return null;
  const source = typeof plot === 'object' ? plot : {};
  return {
    plantId,
    plantedAt: source.plantedAt || todayIso(),
    soil: source.soil || '',
    compost: source.compost || '',
    lastWatered: source.lastWatered || '',
  };
};

export const makePlot = (plantId, extras = {}) => {
  if (!plantId) return null;
  return normalizePlot({
    plantId,
    plantedAt: extras.plantedAt || todayIso(),
    soil: extras.soil || '',
    compost: extras.compost || '',
    lastWatered: extras.lastWatered || todayIso(),
  });
};

export const addDaysIso = (iso, days) => {
  const date = new Date(`${iso || todayIso()}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
};

export const harvestDateFor = (plant, plantedAt) => {
  const guide = guideFor(plant);
  if (!guide.days) return '';
  return addDaysIso(plantedAt, guide.days);
};

export const encodeGardenShare = (payload) => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
};

export const decodeGardenShare = (value) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
};

export const harvestLabel = (plant) => {
  const guide = guideFor(plant);
  if (guide.ready) return guide.ready;
  if (guide.days) return `About ${guide.days} days to harvest`;
  return 'Harvest time varies';
};

export const neighborConflicts = (plots, cols, plants) => {
  const warnings = [];
  const seen = new Set();
  plots.forEach((plot, index) => {
    const id = plotPlantId(plot);
    if (!id) return;
    const plant = plants.find((item) => item.id === id);
    if (!plant) return;
    const avoid = new Set(guideFor(plant).avoid);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const neighbors = [
      [row, col - 1],
      [row, col + 1],
      [row - 1, col],
      [row + 1, col],
    ];
    neighbors.forEach(([nextRow, nextCol]) => {
      if (nextCol < 0 || nextCol >= cols || nextRow < 0) return;
      const nextIndex = nextRow * cols + nextCol;
      const nextId = plotPlantId(plots[nextIndex]);
      if (!nextId) return;
      const neighbor = plants.find((item) => item.id === nextId);
      if (!neighbor || !avoid.has(neighbor.name)) return;
      const key = [plant.name, neighbor.name].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      warnings.push(`${plant.name} sits next to ${neighbor.name}`);
    });
  });
  return warnings;
};
