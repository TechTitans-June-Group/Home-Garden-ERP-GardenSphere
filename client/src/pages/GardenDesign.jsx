import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eraser, Leaf, Save, Sprout, Sun, Trash2, Droplets } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { products } from '../data/mockData.js';

const LAYOUTS = [
  { id: 'balcony', name: 'Balcony', rows: 2, cols: 3, hint: 'Pots and herbs' },
  { id: 'yard', name: 'Small Yard', rows: 3, cols: 4, hint: 'Raised beds' },
  { id: 'family', name: 'Family Garden', rows: 4, cols: 5, hint: 'Full home garden' },
];

const CARE = {
  Fruiting: { sun: 'Full sun', water: 'Regular' },
  Root: { sun: 'Full sun', water: 'Moderate' },
  Leafy: { sun: 'Partial sun', water: 'Frequent' },
  Herb: { sun: 'Bright light', water: 'Light' },
  Plant: { sun: 'Filtered light', water: 'Low' },
};

const plantable = products.filter((item) => item.available);

const emptyPlots = (rows, cols) => Array.from({ length: rows * cols }, () => null);

const GardenDesign = () => {
  const { user, gardenDesigns, saveGardenDesign, deleteGardenDesign } = useCustomer();
  const [name, setName] = useState(`${user?.name?.split(' ')[0] || 'My'} Home Garden`);
  const [layoutId, setLayoutId] = useState('yard');
  const [plots, setPlots] = useState(() => emptyPlots(3, 4));
  const [selectedPlantId, setSelectedPlantId] = useState(plantable[0]?.id || null);
  const [eraser, setEraser] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('All');

  const layout = LAYOUTS.find((item) => item.id === layoutId) || LAYOUTS[1];
  const selectedPlant = plantable.find((item) => item.id === selectedPlantId) || null;
  const categories = ['All', ...new Set(plantable.map((item) => item.category))];
  const palette = plantable.filter((item) => filter === 'All' || item.category === filter);

  const planted = useMemo(
    () =>
      plots
        .map((id) => plantable.find((item) => item.id === id))
        .filter(Boolean),
    [plots]
  );

  const summary = useMemo(() => {
    const counts = {};
    planted.forEach((item) => {
      counts[item.name] = (counts[item.name] || 0) + 1;
    });
    return Object.entries(counts);
  }, [planted]);

  const resizePlots = (nextLayout) => {
    const next = emptyPlots(nextLayout.rows, nextLayout.cols);
    plots.slice(0, next.length).forEach((value, index) => {
      next[index] = value;
    });
    setPlots(next);
  };

  const handleLayout = (id) => {
    const next = LAYOUTS.find((item) => item.id === id);
    setLayoutId(id);
    resizePlots(next);
  };

  const handlePlot = (index) => {
    setPlots((prev) => {
      const next = [...prev];
      if (eraser) {
        next[index] = null;
        return next;
      }
      next[index] = selectedPlantId;
      return next;
    });
  };

  const loadDesign = (design) => {
    setActiveId(design.id);
    setName(design.name);
    setLayoutId(design.layoutId);
    setPlots(design.plots);
    setMessage(`Loaded “${design.name}”.`);
  };

  const handleSave = () => {
    const saved = saveGardenDesign({
      id: activeId,
      name: name.trim() || 'My Home Garden',
      layoutId,
      plots,
    });
    setActiveId(saved.id);
    setMessage(`Saved “${saved.name}” to your customer account.`);
  };

  const handleNew = () => {
    setActiveId(null);
    setName(`${user?.name?.split(' ')[0] || 'My'} Home Garden`);
    setLayoutId('yard');
    setPlots(emptyPlots(3, 4));
    setMessage('Started a new garden layout.');
  };

  const handleDelete = (id) => {
    deleteGardenDesign(id);
    if (activeId === id) handleNew();
    setMessage('Garden design removed.');
  };

  return (
    <div className="overflow-hidden bg-[#F6F8F3]">
      <section className="relative">
        <img src="/home-beds.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative bg-[#14532D]/80 px-4 py-12 text-white lg:px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-200">Customer garden studio</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Design Your Home Garden</h1>
            <p className="mt-3 max-w-2xl text-emerald-50">
              Plan beds, pick crops from GardenSphere harvests, and save the layout to your account.
              Signed in as {user?.name}.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr_280px] lg:px-6">
        <aside className="space-y-4">
          <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <h2 className="font-display text-xl text-[#14331f]">Choose a plant</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilter(category)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    filter === category ? 'bg-[#14532D] text-white' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
              {palette.map((plant) => (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlantId(plant.id);
                    setEraser(false);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-2 text-left ${
                    selectedPlantId === plant.id && !eraser
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-emerald-100 bg-white hover:bg-emerald-50'
                  }`}
                >
                  <img src={plant.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{plant.name}</span>
                    <span className="text-[11px] text-emerald-700">{plant.category}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEraser((prev) => !prev)}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                eraser ? 'bg-amber-500 text-white' : 'border border-emerald-200 text-emerald-800'
              }`}
            >
              <Eraser size={16} /> {eraser ? 'Eraser on' : 'Clear a bed'}
            </button>
          </article>
        </aside>

        <section className="space-y-4">
          {message && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p>
          )}
          <article className="rounded-[1.8rem] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[220px] flex-1 text-sm font-medium text-emerald-900">
                Garden name
                <input
                  className="input-field mt-1"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {LAYOUTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLayout(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      layoutId === item.id ? 'bg-[#14532D] text-white' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-emerald-700">
              {layout.hint} · {layout.rows} × {layout.cols} beds · click a bed to plant
            </p>

            <div
              className="mt-5 grid gap-3 rounded-[1.6rem] bg-[#3d6b3a] p-4"
              style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
            >
              {plots.map((plantId, index) => {
                const plant = plantable.find((item) => item.id === plantId);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePlot(index)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-lime-200/40 bg-[#6b4f2a] shadow-inner"
                  >
                    {plant ? (
                      <>
                        <img src={plant.image} alt={plant.name} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-[#14532D]/80 px-2 py-1 text-[11px] font-semibold text-white">
                          {plant.name}
                        </span>
                      </>
                    ) : (
                      <span className="grid h-full place-items-center text-amber-100/80">
                        <Sprout size={22} />
                        <span className="mt-1 text-[10px] font-semibold">Empty bed</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </article>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
              <Save size={16} /> Save garden
            </button>
            <button
              type="button"
              onClick={handleNew}
              className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900"
            >
              New layout
            </button>
            <button
              type="button"
              onClick={() => setPlots(emptyPlots(layout.rows, layout.cols))}
              className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900"
            >
              Clear all beds
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          {selectedPlant && !eraser && (
            <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
              <img src={selectedPlant.image} alt="" className="h-28 w-full rounded-2xl object-cover" />
              <h3 className="mt-3 font-display text-xl text-[#14331f]">{selectedPlant.name}</h3>
              <p className="mt-1 text-sm text-emerald-800">{selectedPlant.category}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-emerald-800">
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-2">
                  <Sun size={14} /> {CARE[selectedPlant.cropType]?.sun || 'Sun'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-2 py-2">
                  <Droplets size={14} /> {CARE[selectedPlant.cropType]?.water || 'Water'}
                </span>
              </div>
              <Link to={`/shop/${selectedPlant.id}`} className="mt-3 inline-flex text-sm font-semibold text-emerald-700">
                Order this harvest
              </Link>
            </article>
          )}

          <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <h3 className="font-display text-xl text-[#14331f]">Planted now</h3>
            {summary.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Empty beds — pick a plant and click a plot.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {summary.map(([crop, count]) => (
                  <li key={crop} className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2">
                    <span>{crop}</span>
                    <span className="font-semibold text-emerald-800">{count} bed{count > 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <h3 className="inline-flex items-center gap-2 font-display text-xl text-[#14331f]">
              <Leaf size={18} /> Saved designs
            </h3>
            {gardenDesigns.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No saved gardens yet. Design and save one to your account.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {gardenDesigns.map((design) => (
                  <li key={design.id} className="rounded-2xl border border-emerald-100 p-3">
                    <p className="text-sm font-semibold text-slate-900">{design.name}</p>
                    <p className="text-[11px] text-emerald-700">
                      {LAYOUTS.find((item) => item.id === design.layoutId)?.name || 'Garden'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadDesign(design)}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(design.id)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-red-600"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </aside>
      </div>
    </div>
  );
};

export default GardenDesign;
