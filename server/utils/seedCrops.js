import Plant from '../models/Plant.js';
import PlantVariety from '../models/PlantVariety.js';
import GardenLocation from '../models/GardenLocation.js';
import Planting from '../models/Planting.js';

const seedCrops = async () => {
  const plantingCount = await Planting.countDocuments();
  if (plantingCount > 0) {
    console.log(`Planting records already exist (${plantingCount}). Skipping crop seed.`);
    return;
  }

  // 1. Seed Plants
  const plantsData = [
    { name: 'Cherry Tomato', category: 'Vegetable', description: 'Small, sweet tomato variety' },
    { name: 'Carrot', category: 'Vegetable', description: 'Root vegetable, crunchy and orange' },
    { name: 'Lettuce', category: 'Vegetable', description: 'Leafy green vegetable for salads' },
    { name: 'Mint', category: 'Herb', description: 'Aromatic herb for culinary use' },
    { name: 'Tomato', category: 'Vegetable', description: 'Standard garden tomato' },
    { name: 'Strawberry', category: 'Fruit', description: 'Sweet red berries' },
    { name: 'Spinach', category: 'Vegetable', description: 'Nutrient-rich leafy green' },
    { name: 'Chili', category: 'Vegetable', description: 'Spicy peppers' },
  ];

  const seededPlants = [];
  for (const plantInfo of plantsData) {
    let plant = await Plant.findOne({ name: plantInfo.name });
    if (!plant) {
      plant = await Plant.create(plantInfo);
    }
    seededPlants.push(plant);
  }
  console.log('Plants seeded.');

  // Helper to find a seeded plant by name
  const findPlant = (name) => seededPlants.find((p) => p.name === name);

  // 2. Seed Varieties
  const varietiesData = [
    { plantName: 'Cherry Tomato', name: 'Sweet 100', description: 'Prolific cherry tomato variety' },
    { plantName: 'Carrot', name: 'Nantes', description: 'Sweet medium-sized cylindrical root' },
    { plantName: 'Lettuce', name: 'Butterhead', description: 'Soft, tender, green leaves' },
    { plantName: 'Mint', name: 'Spearmint', description: 'Classic spearmint variety' },
    { plantName: 'Tomato', name: 'Roma', description: 'Plum tomato variety ideal for sauces' },
    { plantName: 'Strawberry', name: 'Albion', description: 'Day-neutral strawberry with sweet fruit' },
    { plantName: 'Spinach', name: 'Green Giant', description: 'Large crinkly leaves' },
    { plantName: 'Chili', name: 'Bird’s Eye', description: 'Very hot small chili pepper' },
  ];

  const seededVarieties = [];
  for (const varInfo of varietiesData) {
    const parentPlant = findPlant(varInfo.plantName);
    if (parentPlant) {
      let variety = await PlantVariety.findOne({ plant: parentPlant._id, name: varInfo.name });
      if (!variety) {
        variety = await PlantVariety.create({
          plant: parentPlant._id,
          name: varInfo.name,
          description: varInfo.description,
        });
      }
      seededVarieties.push(variety);
    }
  }
  console.log('Plant varieties seeded.');

  const findVariety = (plantName, name) =>
    seededVarieties.find((v) => v.name === name && String(v.plant) === String(findPlant(plantName)._id));

  // 3. Seed Locations
  const locationsData = [
    { name: 'Bed A1', description: 'North bed, gets morning sun' },
    { name: 'Bed A2', description: 'North bed, adjacent to A1' },
    { name: 'Bed B2', description: 'Middle bed, ideal for roots' },
    { name: 'Bed C1', description: 'South bed, partial shade' },
    { name: 'Bed C2', description: 'South bed, adjacent to C1' },
    { name: 'Bed D1', description: 'West bed, full afternoon sun' },
    { name: 'Herb bed', description: 'Raised bed for kitchen herbs' },
    { name: 'Fruit bed', description: 'Protected bed for berries' },
  ];

  const seededLocations = [];
  for (const locInfo of locationsData) {
    let location = await GardenLocation.findOne({ name: locInfo.name });
    if (!location) {
      location = await GardenLocation.create(locInfo);
    }
    seededLocations.push(location);
  }
  console.log('Garden locations seeded.');

  const findLocation = (name) => seededLocations.find((l) => l.name === name);

  // 4. Seed Plantings
  const plantingsData = [
    {
      plantName: 'Cherry Tomato',
      varietyName: 'Sweet 100',
      locationName: 'Bed A1',
      plantedDate: new Date('2026-06-12'),
      quantity: 40,
      stage: 'Fruiting',
      status: 'Active',
      expectedHarvestDate: new Date('2026-09-12'),
      notes: 'Planted as seedlings. Looking very healthy.',
    },
    {
      plantName: 'Carrot',
      varietyName: 'Nantes',
      locationName: 'Bed B2',
      plantedDate: new Date('2026-06-20'),
      quantity: 80,
      stage: 'Growing',
      status: 'Active',
      expectedHarvestDate: new Date('2026-09-20'),
      notes: 'Direct seeded, thinned twice.',
    },
    {
      plantName: 'Lettuce',
      varietyName: 'Butterhead',
      locationName: 'Bed C1',
      plantedDate: new Date('2026-07-15'),
      quantity: 36,
      stage: 'Ready',
      status: 'Active',
      expectedHarvestDate: new Date('2026-08-15'),
      notes: 'Succession planting. Ready for harvest.',
    },
    {
      plantName: 'Mint',
      varietyName: 'Spearmint',
      locationName: 'Herb bed',
      plantedDate: new Date('2026-05-02'),
      quantity: 18,
      stage: 'Harvesting',
      status: 'Active',
      expectedHarvestDate: new Date('2026-08-02'),
      notes: 'Perennial. Spreading nicely in herb bed.',
    },
  ];

  for (const plantingInfo of plantingsData) {
    const plant = findPlant(plantingInfo.plantName);
    const variety = findVariety(plantingInfo.plantName, plantingInfo.varietyName);
    const location = findLocation(plantingInfo.locationName);

    if (plant && location) {
      await Planting.create({
        plant: plant._id,
        variety: variety ? variety._id : null,
        location: location._id,
        plantedDate: plantingInfo.plantedDate,
        quantity: plantingInfo.quantity,
        stage: plantingInfo.stage,
        status: plantingInfo.status,
        expectedHarvestDate: plantingInfo.expectedHarvestDate,
        notes: plantingInfo.notes,
        recordedByName: 'Garden Manager',
      });
    }
  }
  console.log('Plantings (crops) seeded.');
};

export default seedCrops;
