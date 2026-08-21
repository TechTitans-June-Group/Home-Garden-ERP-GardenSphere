import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Edit2,
  Layers,
  Leaf,
  MapPin,
  Plus,
  Search,
  Sprout,
  Trash2,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate } from '../../utils/format.js';

const Hero = ({ kicker, title, subtitle, icon: Icon, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <Leaf className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">
          <Icon size={14} /> {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-emerald-50 sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/45 px-4" onClick={onClose} role="presentation">
    <div
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_60px_rgba(20,83,45,0.25)]"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Toast = ({ notice }) =>
  notice ? (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {notice}
    </div>
  ) : null;

const CropsPage = () => {
  const { crops, plants, varieties, locations, staff } = useStaff();
  const [activeTab, setActiveTab] = useState('plantings');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Modals visibility
  const [showPlantingModal, setShowPlantingModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showVarietyModal, setShowVarietyModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Forms values
  const [plantingForm, setPlantingForm] = useState({
    id: '',
    plantId: '',
    varietyId: '',
    locationId: '',
    planted: new Date().toISOString().slice(0, 10),
    quantity: '',
    stage: 'Growing',
    status: 'Active',
    expectedHarvestDate: '',
    notes: '',
  });

  const [plantForm, setPlantForm] = useState({
    id: '',
    name: '',
    category: 'Vegetable',
    description: '',
  });

  const [varietyForm, setVarietyForm] = useState({
    id: '',
    plantId: '',
    name: '',
    description: '',
  });

  const [locationForm, setLocationForm] = useState({
    id: '',
    name: '',
    description: '',
  });

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const plantingsList = crops.items || [];
    const active = plantingsList.filter((p) => p.status === 'Active');
    const totalPlants = active.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const readyForHarvest = active.filter((p) => ['Ready', 'Harvesting'].includes(p.stage)).length;
    const completed = plantingsList.filter((p) => p.status === 'Harvested' || p.status === 'Inactive').length;

    return {
      activeCount: active.length,
      totalPlants,
      readyForHarvest,
      completed,
    };
  }, [crops.items]);

  // Filters
  const filteredPlantings = useMemo(() => {
    const items = crops.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.variety?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.stage?.toLowerCase().includes(query) ||
        p.status?.toLowerCase().includes(query)
    );
  }, [crops.items, searchQuery]);

  const filteredPlants = useMemo(() => {
    const items = plants.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [plants.items, searchQuery]);

  const filteredVarieties = useMemo(() => {
    const items = varieties.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (v) =>
        v.name?.toLowerCase().includes(query) ||
        v.plantName?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
    );
  }, [varieties.items, searchQuery]);

  const filteredLocations = useMemo(() => {
    const items = locations.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (l) => l.name?.toLowerCase().includes(query) || l.description?.toLowerCase().includes(query)
    );
  }, [locations.items, searchQuery]);

  // Planting form variety filter based on plant selection
  const availableVarieties = useMemo(() => {
    if (!plantingForm.plantId) return [];
    return (varieties.items || []).filter((v) => v.plantId === plantingForm.plantId);
  }, [plantingForm.plantId, varieties.items]);

  // Operations
  const handleSavePlanting = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await crops.save({
        ...plantingForm,
        quantity: Number(plantingForm.quantity),
      });
      setShowPlantingModal(false);
      showNotice(plantingForm.id ? 'Planting record updated successfully.' : 'Planting record added.');
    } catch (err) {
      setError(err.message || 'Failed to save planting');
    }
  };

  const handleSavePlant = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await plants.save(plantForm);
      setShowPlantModal(false);
      showNotice(plantForm.id ? 'Plant type updated successfully.' : 'New plant type added.');
    } catch (err) {
      setError(err.message || 'Failed to save plant');
    }
  };

  const handleSaveVariety = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await varieties.save(varietyForm);
      setShowVarietyModal(false);
      showNotice(varietyForm.id ? 'Variety updated.' : 'New plant variety added.');
    } catch (err) {
      setError(err.message || 'Failed to save variety');
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await locations.save(locationForm);
      setShowLocationModal(false);
      showNotice(locationForm.id ? 'Location details updated.' : 'New garden location added.');
    } catch (err) {
      setError(err.message || 'Failed to save location');
    }
  };

  const handleEditPlanting = (item) => {
    setPlantingForm({
      id: item.id,
      plantId: item.plantId,
      varietyId: item.varietyId || '',
      locationId: item.locationId,
      planted: item.planted,
      quantity: item.quantity,
      stage: item.stage,
      status: item.status,
      expectedHarvestDate: item.expectedHarvestDate || '',
      notes: item.notes,
    });
    setError('');
    setShowPlantingModal(true);
  };

  const handleEditPlant = (item) => {
    setPlantForm({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
    });
    setError('');
    setShowPlantModal(true);
  };

  const handleEditVariety = (item) => {
    setVarietyForm({
      id: item.id,
      plantId: item.plantId,
      name: item.name,
      description: item.description,
    });
    setError('');
    setShowVarietyModal(true);
  };

  const handleEditLocation = (item) => {
    setLocationForm({
      id: item.id,
      name: item.name,
      description: item.description,
    });
    setError('');
    setShowLocationModal(true);
  };

  const handleDeletePlanting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this planting record?')) return;
    try {
      await crops.remove(id);
      showNotice('Planting record deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete planting');
    }
  };

  const handleDeletePlant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plant? It will fail if there are active varieties or plantings.')) return;
    try {
      await plants.remove(id);
      showNotice('Plant type removed.');
    } catch (err) {
      alert(err.message || 'Failed to delete plant');
    }
  };

  const handleDeleteVariety = async (id) => {
    if (!window.confirm('Are you sure you want to delete this variety? It will fail if there are active plantings.')) return;
    try {
      await varieties.remove(id);
      showNotice('Variety removed.');
    } catch (err) {
      alert(err.message || 'Failed to delete variety');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location? It will fail if there are plantings located here.')) return;
    try {
      await locations.remove(id);
      showNotice('Garden location removed.');
    } catch (err) {
      alert(err.message || 'Failed to delete location');
    }
  };

  const isManager = ['admin', 'garden_manager'].includes(staff?.role);

  // Badge Style Helpers
  const getStageBadgeClass = (stage) => {
    switch (stage) {
      case 'Seeding':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sprouting':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'Growing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Flowering':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Fruiting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Harvesting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Done':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Harvested':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Failed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <Hero
        kicker="Ops Desk"
        title="Plant & Crop Management"
        subtitle="Manage seed sowings, plant varieties, growth stages, locations, and crop records throughout their lifecycle."
        icon={Sprout}
      />

      <Toast notice={notice} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_30px_rgba(20,83,45,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Active Crops</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{stats.activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Currently in growth stages</p>
        </article>
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_30px_rgba(20,83,45,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total Plants</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.totalPlants}</p>
          <p className="mt-1 text-xs text-slate-500">Combined planted quantity</p>
        </article>
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_30px_rgba(20,83,45,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Ready for Harvest</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.readyForHarvest}</p>
          <p className="mt-1 text-xs text-slate-500">Stages: Ready or Harvesting</p>
        </article>
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_30px_rgba(20,83,45,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Harvested / Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{stats.completed}</p>
          <p className="mt-1 text-xs text-slate-500">Completed or inactive listings</p>
        </article>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-50 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'plantings', label: 'Active Plantings', icon: Sprout },
            { id: 'plants', label: 'Plant Types', icon: Leaf },
            { id: 'varieties', label: 'Varieties', icon: Layers },
            { id: 'locations', label: 'Locations', icon: MapPin },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-emerald-50/50 hover:text-emerald-800'
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center gap-3 justify-end max-w-md w-full">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 grid place-items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full rounded-2xl border border-emerald-100 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isManager && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-emerald-700 hover:to-lime-600 shrink-0"
              onClick={() => {
                setError('');
                if (activeTab === 'plantings') {
                  setPlantingForm({
                    id: '',
                    plantId: plants.items?.[0]?.id || '',
                    varietyId: '',
                    locationId: locations.items?.[0]?.id || '',
                    planted: new Date().toISOString().slice(0, 10),
                    quantity: '',
                    stage: 'Growing',
                    status: 'Active',
                    expectedHarvestDate: '',
                    notes: '',
                  });
                  setShowPlantingModal(true);
                } else if (activeTab === 'plants') {
                  setPlantForm({ id: '', name: '', category: 'Vegetable', description: '' });
                  setShowPlantModal(true);
                } else if (activeTab === 'varieties') {
                  setVarietyForm({ id: '', plantId: plants.items?.[0]?.id || '', name: '', description: '' });
                  setShowVarietyModal(true);
                } else if (activeTab === 'locations') {
                  setLocationForm({ id: '', name: '', description: '' });
                  setShowLocationModal(true);
                }
              }}
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>

      {/* Main Table Views */}
      <div className="overflow-hidden rounded-[24px] bg-white border border-emerald-50 shadow-[0_10px_40px_rgba(20,83,45,0.03)]">
        {activeTab === 'plantings' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700 font-semibold border-b border-emerald-50">
              <tr>
                <th className="px-5 py-3">Plant & Variety</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Planted</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Expected Harvest</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredPlantings.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 8 : 7} className="px-5 py-8 text-center text-slate-500">
                    No planting records found. Click "Add" to record a new sowing/planting.
                  </td>
                </tr>
              ) : (
                filteredPlantings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.variety || 'No variety specified'}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">{item.location}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(item.planted)}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-800">{item.quantity}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getStageBadgeClass(item.stage)}`}>
                        {item.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.expectedHarvestDate ? formatDate(item.expectedHarvestDate) : '--'}
                    </td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleEditPlanting(item)}
                            title="Edit Record"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeletePlanting(item.id)}
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'plants' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700 font-semibold border-b border-emerald-50">
              <tr>
                <th className="px-5 py-3">Plant Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Description</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredPlants.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 4 : 3} className="px-5 py-8 text-center text-slate-500">
                    No plant records defined.
                  </td>
                </tr>
              ) : (
                filteredPlants.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="px-5 py-3 font-medium text-emerald-800">{item.category}</td>
                    <td className="px-5 py-3 text-slate-500">{item.description || '--'}</td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleEditPlant(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeletePlant(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'varieties' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700 font-semibold border-b border-emerald-50">
              <tr>
                <th className="px-5 py-3">Plant Type</th>
                <th className="px-5 py-3">Variety Name</th>
                <th className="px-5 py-3">Description</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredVarieties.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 4 : 3} className="px-5 py-8 text-center text-slate-500">
                    No plant varieties defined.
                  </td>
                </tr>
              ) : (
                filteredVarieties.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.plantName}</td>
                    <td className="px-5 py-3 font-medium text-emerald-800">{item.name}</td>
                    <td className="px-5 py-3 text-slate-500">{item.description || '--'}</td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleEditVariety(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteVariety(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'locations' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700 font-semibold border-b border-emerald-50">
              <tr>
                <th className="px-5 py-3">Location Name</th>
                <th className="px-5 py-3">Description</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 3 : 2} className="px-5 py-8 text-center text-slate-500">
                    No garden locations defined.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="px-5 py-3 text-slate-500">{item.description || '--'}</td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleEditLocation(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteLocation(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PLANTING MODAL */}
      {showPlantingModal && (
        <Modal
          title={plantingForm.id ? 'Edit Planting Record' : 'Record New Sowing / Planting'}
          onClose={() => setShowPlantingModal(false)}
        >
          <form onSubmit={handleSavePlanting} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Plant Type *
                <select
                  className="input-field mt-1 w-full"
                  value={plantingForm.plantId}
                  onChange={(e) => setPlantingForm({ ...plantingForm, plantId: e.target.value, varietyId: '' })}
                  required
                >
                  <option value="">Select Plant</option>
                  {(plants.items || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Variety
                <select
                  className="input-field mt-1 w-full"
                  value={plantingForm.varietyId}
                  onChange={(e) => setPlantingForm({ ...plantingForm, varietyId: e.target.value })}
                  disabled={!plantingForm.plantId}
                >
                  <option value="">Select Variety (Optional)</option>
                  {availableVarieties.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Location *
                <select
                  className="input-field mt-1 w-full"
                  value={plantingForm.locationId}
                  onChange={(e) => setPlantingForm({ ...plantingForm, locationId: e.target.value })}
                  required
                >
                  <option value="">Select Location</option>
                  {(locations.items || []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Quantity *
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  className="input-field mt-1 w-full"
                  value={plantingForm.quantity}
                  onChange={(e) => setPlantingForm({ ...plantingForm, quantity: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Planting Date *
                <input
                  type="date"
                  className="input-field mt-1 w-full"
                  value={plantingForm.planted}
                  onChange={(e) => setPlantingForm({ ...plantingForm, planted: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Expected Harvest Date
                <input
                  type="date"
                  className="input-field mt-1 w-full"
                  value={plantingForm.expectedHarvestDate}
                  onChange={(e) => setPlantingForm({ ...plantingForm, expectedHarvestDate: e.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Growth Stage *
                <select
                  className="input-field mt-1 w-full"
                  value={plantingForm.stage}
                  onChange={(e) => setPlantingForm({ ...plantingForm, stage: e.target.value })}
                  required
                >
                  {['Seeding', 'Sprouting', 'Growing', 'Flowering', 'Fruiting', 'Ready', 'Harvesting', 'Done'].map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status *
                <select
                  className="input-field mt-1 w-full"
                  value={plantingForm.status}
                  onChange={(e) => setPlantingForm({ ...plantingForm, status: e.target.value })}
                  required
                >
                  {['Active', 'Inactive', 'Harvested', 'Failed'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Notes
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Details about soil amendments, seed health, etc."
                value={plantingForm.notes}
                onChange={(e) => setPlantingForm({ ...plantingForm, notes: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 py-3 font-semibold text-white shadow-md hover:from-emerald-700 hover:to-lime-600"
            >
              Save Record
            </button>
          </form>
        </Modal>
      )}

      {/* PLANT MODAL */}
      {showPlantModal && (
        <Modal
          title={plantForm.id ? 'Edit Plant Type' : 'Add New Plant Type'}
          onClose={() => setShowPlantModal(false)}
        >
          <form onSubmit={handleSavePlant} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Plant Name *
              <input
                type="text"
                placeholder="e.g. Bell Pepper"
                className="input-field mt-1 w-full"
                value={plantForm.name}
                onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Category *
              <select
                className="input-field mt-1 w-full"
                value={plantForm.category}
                onChange={(e) => setPlantForm({ ...plantForm, category: e.target.value })}
                required
              >
                {['Vegetable', 'Fruit', 'Herb', 'Flower', 'Other'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Description
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Describe growing conditions, water requirements, etc."
                value={plantForm.description}
                onChange={(e) => setPlantForm({ ...plantForm, description: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 py-3 font-semibold text-white shadow-md hover:from-emerald-700 hover:to-lime-600"
            >
              Save Plant Type
            </button>
          </form>
        </Modal>
      )}

      {/* VARIETY MODAL */}
      {showVarietyModal && (
        <Modal
          title={varietyForm.id ? 'Edit Variety' : 'Add Plant Variety'}
          onClose={() => setShowVarietyModal(false)}
        >
          <form onSubmit={handleSaveVariety} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Associated Plant Type *
              <select
                className="input-field mt-1 w-full"
                value={varietyForm.plantId}
                onChange={(e) => setVarietyForm({ ...varietyForm, plantId: e.target.value })}
                required
              >
                <option value="">Select Plant</option>
                {(plants.items || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Variety Name *
              <input
                type="text"
                placeholder="e.g. California Wonder"
                className="input-field mt-1 w-full"
                value={varietyForm.name}
                onChange={(e) => setVarietyForm({ ...varietyForm, name: e.target.value })}
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Description
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Sourcing details, unique features, or seed specs."
                value={varietyForm.description}
                onChange={(e) => setVarietyForm({ ...varietyForm, description: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 py-3 font-semibold text-white shadow-md hover:from-emerald-700 hover:to-lime-600"
            >
              Save Variety
            </button>
          </form>
        </Modal>
      )}

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <Modal
          title={locationForm.id ? 'Edit Garden Location' : 'Add Garden Location'}
          onClose={() => setShowLocationModal(false)}
        >
          <form onSubmit={handleSaveLocation} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Location Name *
              <input
                type="text"
                placeholder="e.g. Greenhouse A Bed 3"
                className="input-field mt-1 w-full"
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Description
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Notes on size, soil type, irrigation setup, or microclimate."
                value={locationForm.description}
                onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 py-3 font-semibold text-white shadow-md hover:from-emerald-700 hover:to-lime-600"
            >
              Save Location
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CropsPage;
export { CropsPage };
