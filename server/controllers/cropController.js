import Plant from '../models/Plant.js';
import PlantVariety from '../models/PlantVariety.js';
import GardenLocation from '../models/GardenLocation.js';
import Planting from '../models/Planting.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatPlanting = (doc) => ({
  id: String(doc._id),
  plantId: doc.plant ? String(doc.plant._id || doc.plant) : '',
  name: doc.plant ? (doc.plant.name || '') : '',
  category: doc.plant ? (doc.plant.category || '') : '',
  varietyId: doc.variety ? String(doc.variety._id || doc.variety) : '',
  variety: doc.variety ? (doc.variety.name || '') : '',
  locationId: doc.location ? String(doc.location._id || doc.location) : '',
  location: doc.location ? (doc.location.name || '') : '',
  planted: toDateString(doc.plantedDate),
  quantity: doc.quantity,
  stage: doc.stage,
  status: doc.status,
  expectedHarvestDate: toDateString(doc.expectedHarvestDate),
  notes: doc.notes || '',
  recordedByName: doc.recordedByName || '',
});

const formatPlant = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  category: doc.category,
  description: doc.description || '',
});

const formatVariety = (doc) => ({
  id: String(doc._id),
  plantId: doc.plant ? String(doc.plant._id || doc.plant) : '',
  plantName: doc.plant ? (doc.plant.name || '') : '',
  name: doc.name,
  description: doc.description || '',
});

const formatLocation = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  description: doc.description || '',
});

// GET /api/crops
export const getCropsDesk = async (req, res, next) => {
  try {
    const [plantings, plants, varieties, locations] = await Promise.all([
      Planting.find()
        .populate('plant')
        .populate('variety')
        .populate('location')
        .sort({ plantedDate: -1, createdAt: -1 }),
      Plant.find().sort({ name: 1 }),
      PlantVariety.find().populate('plant').sort({ name: 1 }),
      GardenLocation.find().sort({ name: 1 }),
    ]);

    res.json({
      plantings: plantings.map(formatPlanting),
      plants: plants.map(formatPlant),
      varieties: varieties.map(formatVariety),
      locations: locations.map(formatLocation),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops/plantings
export const createPlanting = async (req, res, next) => {
  try {
    const { plantId, varietyId, locationId, planted, quantity, stage, status, expectedHarvestDate, notes } = req.body;

    if (!plantId) throw fail('Plant is required.');
    if (!locationId) throw fail('Location is required.');
    if (!planted) throw fail('Planting date is required.');
    if (quantity === undefined || quantity < 0) throw fail('Quantity must be 0 or more.');

    const plantExists = await Plant.findById(plantId);
    if (!plantExists) throw fail('Select a valid plant.');

    const locationExists = await GardenLocation.findById(locationId);
    if (!locationExists) throw fail('Select a valid location.');

    let varId = null;
    if (varietyId) {
      const varietyExists = await PlantVariety.findById(varietyId);
      if (!varietyExists) throw fail('Select a valid variety.');
      varId = varietyExists._id;
    }

    const planting = await Planting.create({
      plant: plantExists._id,
      variety: varId,
      location: locationExists._id,
      plantedDate: new Date(planted),
      quantity: Number(quantity),
      stage: stage || 'Growing',
      status: status || 'Active',
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      notes: notes || '',
      recordedBy: req.user?._id,
      recordedByName: req.user?.name || 'System',
    });

    const populated = await Planting.findById(planting._id)
      .populate('plant')
      .populate('variety')
      .populate('location');

    res.status(201).json({ planting: formatPlanting(populated) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/plantings/:id
export const updatePlanting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plantId, varietyId, locationId, planted, quantity, stage, status, expectedHarvestDate, notes } = req.body;

    const plantingObj = await Planting.findById(id);
    if (!plantingObj) throw fail('Planting record not found.', 404);

    if (req.user?.role === 'gardener') {
      if (stage) plantingObj.stage = stage;
      if (status) plantingObj.status = status;
      if (notes !== undefined) plantingObj.notes = notes;
      await plantingObj.save();
      const populated = await Planting.findById(plantingObj._id)
        .populate('plant')
        .populate('variety')
        .populate('location');
      return res.json({ planting: formatPlanting(populated) });
    }

    if (plantId) {
      const plantExists = await Plant.findById(plantId);
      if (!plantExists) throw fail('Select a valid plant.');
      plantingObj.plant = plantExists._id;
    }
    if (locationId) {
      const locationExists = await GardenLocation.findById(locationId);
      if (!locationExists) throw fail('Select a valid location.');
      plantingObj.location = locationExists._id;
    }
    if (varietyId !== undefined) {
      if (varietyId) {
        const varietyExists = await PlantVariety.findById(varietyId);
        if (!varietyExists) throw fail('Select a valid variety.');
        plantingObj.variety = varietyExists._id;
      } else {
        plantingObj.variety = null;
      }
    }

    if (planted) plantingObj.plantedDate = new Date(planted);
    if (quantity !== undefined) {
      if (quantity < 0) throw fail('Quantity must be 0 or more.');
      plantingObj.quantity = Number(quantity);
    }
    if (stage) plantingObj.stage = stage;
    if (status) plantingObj.status = status;
    if (expectedHarvestDate !== undefined) {
      plantingObj.expectedHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
    }
    if (notes !== undefined) plantingObj.notes = notes;

    await plantingObj.save();

    const populated = await Planting.findById(plantingObj._id)
      .populate('plant')
      .populate('variety')
      .populate('location');

    res.json({ planting: formatPlanting(populated) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/plantings/:id
export const deletePlanting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Planting.findByIdAndDelete(id);
    if (!deleted) throw fail('Planting record not found.', 404);
    res.json({ success: true, message: 'Planting record deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops/plants
export const createPlant = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    if (!name) throw fail('Plant name is required.');

    const exists = await Plant.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) throw fail('A plant with this name already exists.');

    const plant = await Plant.create({
      name: name.trim(),
      category: category || 'Vegetable',
      description: description || '',
    });

    res.status(201).json({ plant: formatPlant(plant) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/plants/:id
export const updatePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const plant = await Plant.findById(id);
    if (!plant) throw fail('Plant not found.', 404);

    if (name) {
      const trimmedName = name.trim();
      const exists = await Plant.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (exists) throw fail('A plant with this name already exists.');
      plant.name = trimmedName;
    }
    if (category) plant.category = category;
    if (description !== undefined) plant.description = description;

    await plant.save();
    res.json({ plant: formatPlant(plant) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/plants/:id
export const deletePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if any varieties refer to this plant
    const hasVarieties = await PlantVariety.exists({ plant: id });
    if (hasVarieties) throw fail('Cannot delete plant: it has associated varieties.');

    // Check if any plantings refer to this plant
    const hasPlantings = await Planting.exists({ plant: id });
    if (hasPlantings) throw fail('Cannot delete plant: it has active plantings.');

    const deleted = await Plant.findByIdAndDelete(id);
    if (!deleted) throw fail('Plant not found.', 404);

    res.json({ success: true, message: 'Plant deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops/varieties
export const createVariety = async (req, res, next) => {
  try {
    const { plantId, name, description } = req.body;
    if (!plantId) throw fail('Plant is required.');
    if (!name) throw fail('Variety name is required.');

    const plant = await Plant.findById(plantId);
    if (!plant) throw fail('Selected plant does not exist.');

    const exists = await PlantVariety.findOne({
      plant: plantId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (exists) throw fail('A variety with this name already exists for this plant.');

    const variety = await PlantVariety.create({
      plant: plant._id,
      name: name.trim(),
      description: description || '',
    });

    const populated = await PlantVariety.findById(variety._id).populate('plant');
    res.status(201).json({ variety: formatVariety(populated) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/varieties/:id
export const updateVariety = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plantId, name, description } = req.body;

    const variety = await PlantVariety.findById(id);
    if (!variety) throw fail('Variety not found.', 404);

    if (plantId) {
      const plant = await Plant.findById(plantId);
      if (!plant) throw fail('Selected plant does not exist.');
      variety.plant = plant._id;
    }

    if (name) {
      const trimmedName = name.trim();
      const pId = plantId || variety.plant;
      const exists = await PlantVariety.findOne({
        _id: { $ne: id },
        plant: pId,
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (exists) throw fail('A variety with this name already exists for this plant.');
      variety.name = trimmedName;
    }

    if (description !== undefined) variety.description = description;

    await variety.save();
    const populated = await PlantVariety.findById(variety._id).populate('plant');
    res.json({ variety: formatVariety(populated) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/varieties/:id
export const deleteVariety = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if any plantings refer to this variety
    const hasPlantings = await Planting.exists({ variety: id });
    if (hasPlantings) throw fail('Cannot delete variety: it has active plantings.');

    const deleted = await PlantVariety.findByIdAndDelete(id);
    if (!deleted) throw fail('Variety not found.', 404);

    res.json({ success: true, message: 'Variety deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops/locations
export const createLocation = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) throw fail('Location name is required.');

    const exists = await GardenLocation.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) throw fail('A garden location with this name already exists.');

    const location = await GardenLocation.create({
      name: name.trim(),
      description: description || '',
    });

    res.status(201).json({ location: formatLocation(location) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/locations/:id
export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const location = await GardenLocation.findById(id);
    if (!location) throw fail('Location not found.', 404);

    if (name) {
      const trimmedName = name.trim();
      const exists = await GardenLocation.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (exists) throw fail('A garden location with this name already exists.');
      location.name = trimmedName;
    }
    if (description !== undefined) location.description = description;

    await location.save();
    res.json({ location: formatLocation(location) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/locations/:id
export const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if any plantings refer to this location
    const hasPlantings = await Planting.exists({ location: id });
    if (hasPlantings) throw fail('Cannot delete location: it has active plantings.');

    const deleted = await GardenLocation.findByIdAndDelete(id);
    if (!deleted) throw fail('Location not found.', 404);

    res.json({ success: true, message: 'Location deleted.' });
  } catch (error) {
    next(error);
  }
};
