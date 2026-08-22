import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Eraser,
  Leaf,
  Link2,
  Printer,
  Redo2,
  Save,
  Search,
  Sprout,
  Sun,
  Trash2,
  Droplets,
  Undo2,
  X,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { products as fallbackProducts } from '../data/mockData.js';
import { formatDate } from '../utils/format.js';
import {
  GARDEN_LAYOUTS,
  encodeGardenShare,
  guideFor,
  harvestDateFor,
  harvestLabel,
  makePlot,
  neighborConflicts,
  normalizePlot,
  plotPlantId,
} from '../utils/gardenGuide.js';

const CARE = {
  Fruiting: { sun: 'Full sun', water: 'Regular' },
  Root: { sun: 'Full sun', water: 'Moderate' },
  Leafy: { sun: 'Partial sun', water: 'Frequent' },
  Herb: { sun: 'Bright light', water: 'Light' },
  Flower: { sun: 'Full sun', water: 'Regular' },
  Plant: { sun: 'Filtered light', water: 'Low' },
};

const CATEGORY_ORDER = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Flowers', 'Plants'];
const emptyPlots = (rows, cols) => Array.from({ length: rows * cols }, () => null);
const imageCache = new Map();

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    if (imageCache.has(src)) return resolve(imageCache.get(src));
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

const countBy = (items, pick) => {
  const map = {};
  items.forEach((item) => {
    const key = pick(item);
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
};

const GardenDesign = () => {
  const { user, gardenDesigns, saveGardenDesign, deleteGardenDesign, products: liveProducts } = useCustomer();
  const products = liveProducts?.length ? liveProducts : fallbackProducts;
  const plantable = products.filter((item) => item.available);
  const plantFromPlot = (plot) => plantable.find((item) => item.id === plotPlantId(plot) || String(item.id) === String(plotPlantId(plot))) || null;
  const [name, setName] = useState(`${user?.name?.split(' ')[0] || 'My'} Home Garden`);
  const [layoutId, setLayoutId] = useState('yard');
  const [plots, setPlots] = useState(() => emptyPlots(3, 4));
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(plantable[0]?.id || null);
  const [eraser, setEraser] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [noteIndex, setNoteIndex] = useState(null);
  const [noteForm, setNoteForm] = useState(null);

  const layout = GARDEN_LAYOUTS.find((item) => item.id === layoutId) || GARDEN_LAYOUTS[1];
  const selectedPlant = plantable.find((item) => item.id === selectedPlantId) || null;
  const selectedGuide = guideFor(selectedPlant);
  const categories = CATEGORY_ORDER.filter(
    (category) => category === 'All' || plantable.some((item) => item.category === category)
  );
  const palette = plantable.filter((item) => {
    if (filter !== 'All' && item.category !== filter) return false;
    return `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  const planted = useMemo(() => plots.map(plantFromPlot).filter(Boolean), [plots]);
  const summary = useMemo(() => {
    const counts = {};
    planted.forEach((item) => {
      counts[item.name] = (counts[item.name] || 0) + 1;
    });
    return Object.entries(counts);
  }, [planted]);
  const sunMix = useMemo(() => countBy(planted, (item) => CARE[item.cropType]?.sun), [planted]);
  const waterMix = useMemo(() => countBy(planted, (item) => CARE[item.cropType]?.water), [planted]);
  const conflicts = useMemo(() => neighborConflicts(plots, layout.cols, plantable), [layout.cols, plots]);

  const commit = (nextPlots, nextLayoutId = layoutId) => {
    setHistory((prev) => [...prev, { plots, layoutId }].slice(-40));
    setFuture([]);
    setPlots(nextPlots);
    if (nextLayoutId !== layoutId) setLayoutId(nextLayoutId);
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setFuture((prev) => [{ plots, layoutId }, ...prev].slice(0, 40));
    setHistory((prev) => prev.slice(0, -1));
    setPlots(last.plots);
    setLayoutId(last.layoutId);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((prev) => [...prev, { plots, layoutId }].slice(-40));
    setFuture((prev) => prev.slice(1));
    setPlots(next.plots);
    setLayoutId(next.layoutId);
  };

  useEffect(() => {
    const shared = sessionStorage.getItem('gs_shared_garden');
    if (!shared) return;
    try {
      const parsed = JSON.parse(shared);
      sessionStorage.removeItem('gs_shared_garden');
      setName(parsed.name || name);
      setLayoutId(parsed.layoutId || 'yard');
      setPlots((parsed.plots || []).map(normalizePlot));
      setMessage('Opened a shared garden layout.');
    } catch {
      sessionStorage.removeItem('gs_shared_garden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleLayout = (id) => {
    const next = GARDEN_LAYOUTS.find((item) => item.id === id);
    const resized = emptyPlots(next.rows, next.cols);
    plots.slice(0, resized.length).forEach((value, index) => {
      resized[index] = normalizePlot(value);
    });
    commit(resized, id);
  };

  const plantBed = (index, plantId, extras) => {
    commit(plots.map((plot, i) => (i === index ? makePlot(plantId, extras || normalizePlot(plot) || {}) : plot)));
  };

  const handlePlot = (index) => {
    const current = normalizePlot(plots[index]);
    if (eraser) {
      if (!current) return;
      commit(plots.map((plot, i) => (i === index ? null : plot)));
      return;
    }
    if (current) {
      setNoteIndex(index);
      setNoteForm({ ...current });
      return;
    }
    if (selectedPlantId) plantBed(index, selectedPlantId);
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const from = event.dataTransfer.getData('fromIndex');
    const plantId = Number(event.dataTransfer.getData('plantId'));
    if (from !== '') {
      const fromIndex = Number(from);
      if (fromIndex === index) return;
      const next = [...plots];
      const moving = next[fromIndex];
      next[fromIndex] = next[index];
      next[index] = moving;
      commit(next);
      return;
    }
    if (plantId) plantBed(index, plantId);
  };

  const saveNotes = (event) => {
    event.preventDefault();
    commit(plots.map((plot, i) => (i === noteIndex ? normalizePlot(noteForm) : plot)));
    setNoteIndex(null);
    setNoteForm(null);
    setMessage('Bed notes saved.');
  };

  const loadDesign = (design) => {
    setActiveId(design.id);
    setName(design.name);
    setLayoutId(design.layoutId);
    setPlots((design.plots || []).map(normalizePlot));
    setHistory([]);
    setFuture([]);
    setMessage(`Loaded “${design.name}”.`);
  };

  const renderGardenCanvas = async (cellSize = 150) => {
    const pad = 18;
    const header = 64;
    const canvas = document.createElement('canvas');
    canvas.width = layout.cols * cellSize + pad * 2;
    canvas.height = layout.rows * cellSize + pad * 2 + header;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#14532D';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ECFCCB';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(name.trim() || 'My Home Garden', pad, 36);
    ctx.fillStyle = '#BBF7D0';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${layout.name} · ${layout.rows} × ${layout.cols} beds · GardenSphere`, pad, 56);

    await Promise.all(
      plots.map(async (plot, index) => {
        const col = index % layout.cols;
        const row = Math.floor(index / layout.cols);
        const x = pad + col * cellSize;
        const y = header + pad + row * cellSize;
        const gap = 8;
        ctx.fillStyle = '#6B4F2A';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, cellSize - gap, cellSize - gap, 16);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, cellSize - gap, cellSize - gap);
        }
        const plant = plantFromPlot(plot);
        const size = cellSize - gap;
        if (plant) {
          const img = await loadImage(plant.image);
          if (img) ctx.drawImage(img, x, y, size, size);
          ctx.fillStyle = 'rgba(20, 83, 45, 0.82)';
          ctx.fillRect(x, y + size - 28, size, 28);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(plant.name, x + 8, y + size - 10, size - 16);
        } else {
          ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
          ctx.font = '12px sans-serif';
          ctx.fillText('Empty bed', x + 16, y + size / 2);
        }
      })
    );
    return canvas;
  };

  const handleSavePhoto = async () => {
    if (!planted.length) {
      setMessage('Plant at least one bed before saving a photo.');
      return;
    }
    setSavingPhoto(true);
    try {
      const canvas = await renderGardenCanvas(150);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.88);
      link.download = `${(name.trim() || 'garden-sphere').replace(/\s+/g, '-').toLowerCase()}-garden.jpg`;
      link.click();
      setMessage('Garden photo downloaded.');
    } catch {
      setMessage('Could not save the garden photo. Try again.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleSave = async () => {
    let photo = '';
    if (planted.length) {
      try {
        const canvas = await renderGardenCanvas(72);
        photo = canvas.toDataURL('image/jpeg', 0.55);
      } catch {
        photo = '';
      }
    }
    const saved = await saveGardenDesign({
      id: activeId,
      name: name.trim() || 'My Home Garden',
      layoutId,
      plots: plots.map(normalizePlot),
      photo,
    });
    setActiveId(saved.id);
    setMessage(`Saved “${saved.name}” to your customer account.`);
  };

  const handleShare = async () => {
    const token = encodeGardenShare({
      name: name.trim() || 'My Home Garden',
      layoutId,
      plots: plots.map(normalizePlot),
    });
    const url = `${window.location.origin}/garden-share?d=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Share link copied. Anyone with the link can view this layout.');
    } catch {
      setMessage(url);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setName(`${user?.name?.split(' ')[0] || 'My'} Home Garden`);
    setLayoutId('yard');
    commit(emptyPlots(3, 4), 'yard');
    setMessage('Started a new garden layout.');
  };

  const handleDelete = (id) => {
    deleteGardenDesign(id);
    if (activeId === id) handleNew();
    setMessage('Garden design removed.');
  };

  const notePlant = noteForm ? plantable.find((item) => item.id === noteForm.plantId) : null;

  return (
    <div className="overflow-hidden bg-[#F6F8F3]">
      <section className="no-print relative">
        <img src="/home-beds.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative bg-[#14532D]/80 px-4 py-12 text-white lg:px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-200">Customer garden studio</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Design Your Home Garden</h1>
            <p className="mt-3 max-w-2xl text-emerald-50">
              Drag plants onto beds, add notes, and save or share the layout. Signed in as {user?.name}.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr_280px] lg:px-6">
        <aside className="no-print space-y-4">
          <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <h2 className="font-display text-xl text-[#14331f]">Choose a plant</h2>
            <p className="mt-1 text-xs text-slate-500">Drag a plant onto a bed, or click a bed to plant.</p>
            <label className="relative mt-3 block">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                className="input-field pl-9 text-sm"
                placeholder="Search plants"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
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
              {palette.length === 0 && (
                <p className="rounded-2xl bg-emerald-50 px-3 py-4 text-center text-sm text-slate-500">No plants match “{query}”.</p>
              )}
              {palette.map((plant) => (
                <button
                  key={plant.id}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('plantId', String(plant.id));
                    setSelectedPlantId(plant.id);
                    setEraser(false);
                  }}
                  onClick={() => {
                    setSelectedPlantId(plant.id);
                    setEraser(false);
                  }}
                  className={`flex cursor-grab items-center gap-3 rounded-2xl border p-2 text-left ${
                    selectedPlantId === plant.id && !eraser
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-emerald-100 bg-white hover:bg-emerald-50'
                  }`}
                >
                  <img src={plant.image} alt="" className="h-12 w-12 rounded-xl object-cover" onError={(event) => { event.currentTarget.src = '/login-garden.jpg'; }} />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{plant.name}</span>
                    <span className="text-[11px] text-emerald-700">{plant.category}</span>
                    <span className="block text-[11px] text-slate-500">{harvestLabel(plant)}</span>
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
          {message && <p className="no-print rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p>}
          <article id="garden-print" className="rounded-[1.8rem] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[220px] flex-1 text-sm font-medium text-emerald-900">
                Garden name
                <input className="input-field mt-1" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <div className="no-print flex flex-wrap gap-2">
                {GARDEN_LAYOUTS.map((item) => (
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
              {layout.hint} · {layout.rows} × {layout.cols} beds · drag a plant or click a bed. Click a planted bed for notes.
            </p>

            <div
              className="mt-5 grid gap-3 rounded-[1.6rem] bg-[#3d6b3a] p-4"
              style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
            >
              {plots.map((plot, index) => {
                const plant = plantFromPlot(plot);
                const record = normalizePlot(plot);
                const harvestOn = plant && record ? harvestDateFor(plant, record.plantedAt) : '';
                return (
                  <button
                    key={index}
                    type="button"
                    draggable={Boolean(plant)}
                    onDragStart={(event) => event.dataTransfer.setData('fromIndex', String(index))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, index)}
                    onClick={() => handlePlot(index)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-lime-200/40 bg-[#6b4f2a] shadow-inner"
                  >
                    {plant ? (
                      <>
                        <img src={plant.image} alt={plant.name} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-[#14532D]/85 px-2 py-1 text-left text-[10px] font-semibold leading-tight text-white">
                          <span className="block truncate">{plant.name}</span>
                          {harvestOn ? <span className="font-normal opacity-90">Harvest {formatDate(harvestOn)}</span> : <span className="font-normal opacity-90">{harvestLabel(plant)}</span>}
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

          <div className="no-print grid gap-3 sm:grid-cols-2">
            <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
              <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[#14331f]">
                <Sun size={16} className="text-amber-500" /> Sun for this layout
              </h3>
              {planted.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Plant beds to see sun needs.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {sunMix.map(([label, count]) => (
                    <li key={label} className="flex justify-between rounded-xl bg-amber-50 px-3 py-2 text-amber-900">
                      <span>{label}</span>
                      <span className="font-semibold">{count} bed{count > 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
              <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[#14331f]">
                <Droplets size={16} className="text-sky-500" /> Water for this layout
              </h3>
              {planted.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Plant beds to see watering needs.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {waterMix.map(([label, count]) => (
                    <li key={label} className="flex justify-between rounded-xl bg-sky-50 px-3 py-2 text-sky-900">
                      <span>{label}</span>
                      <span className="font-semibold">{count} bed{count > 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          {conflicts.length > 0 && (
            <article className="no-print rounded-[1.6rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">Companion planting notes</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {conflicts.map((item) => (
                  <li key={item}>{item}. Consider moving one bed.</li>
                ))}
              </ul>
            </article>
          )}

          <div className="no-print flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
              <Save size={16} /> Save garden
            </button>
            <button type="button" onClick={handleSavePhoto} disabled={savingPhoto} className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              <Camera size={16} /> {savingPhoto ? 'Saving photo…' : 'Save photo'}
            </button>
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900">
              <Link2 size={16} /> Share link
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900">
              <Printer size={16} /> Print
            </button>
            <button type="button" onClick={undo} disabled={!history.length} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 disabled:opacity-40">
              <Undo2 size={16} /> Undo
            </button>
            <button type="button" onClick={redo} disabled={!future.length} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 disabled:opacity-40">
              <Redo2 size={16} /> Redo
            </button>
            <button type="button" onClick={handleNew} className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900">
              New layout
            </button>
            <button type="button" onClick={() => commit(emptyPlots(layout.rows, layout.cols))} className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900">
              Clear all beds
            </button>
          </div>
        </section>

        <aside className="no-print space-y-4">
          {selectedPlant && !eraser && (
            <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
              <img src={selectedPlant.image} alt="" className="h-28 w-full rounded-2xl object-cover" onError={(event) => { event.currentTarget.src = '/login-garden.jpg'; }} />
              <h3 className="mt-3 font-display text-xl text-[#14331f]">{selectedPlant.name}</h3>
              <p className="mt-1 text-sm text-emerald-800">{selectedPlant.category}</p>
              <p className="mt-2 rounded-xl bg-lime-50 px-3 py-2 text-xs font-semibold text-emerald-900">{harvestLabel(selectedPlant)}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-emerald-800">
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-2"><Sun size={14} /> {CARE[selectedPlant.cropType]?.sun || 'Sun'}</span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-2 py-2"><Droplets size={14} /> {CARE[selectedPlant.cropType]?.water || 'Water'}</span>
              </div>
              {selectedGuide.companions?.length > 0 && (
                <p className="mt-3 text-xs text-emerald-800"><span className="font-semibold">Grows well with:</span> {selectedGuide.companions.join(', ')}</p>
              )}
              {selectedGuide.avoid?.length > 0 && (
                <p className="mt-1 text-xs text-amber-800"><span className="font-semibold">Keep away from:</span> {selectedGuide.avoid.join(', ')}</p>
              )}
              {selectedGuide.note && <p className="mt-1 text-xs text-slate-500">{selectedGuide.note}</p>}
              <Link to={`/shop/${selectedPlant.id}`} className="mt-3 inline-flex text-sm font-semibold text-emerald-700">Order this harvest</Link>
            </article>
          )}

          <article className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <h3 className="font-display text-xl text-[#14331f]">Planted now</h3>
            {summary.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Empty beds — drag a plant onto a plot.</p>
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
            <h3 className="inline-flex items-center gap-2 font-display text-xl text-[#14331f]"><Leaf size={18} /> Saved designs</h3>
            {gardenDesigns.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No saved gardens yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {gardenDesigns.map((design) => (
                  <li key={design.id} className="rounded-2xl border border-emerald-100 p-3">
                    {design.photo && <img src={design.photo} alt="" className="mb-2 h-16 w-full rounded-xl object-cover" />}
                    <p className="text-sm font-semibold text-slate-900">{design.name}</p>
                    <p className="text-[11px] text-emerald-700">{GARDEN_LAYOUTS.find((item) => item.id === design.layoutId)?.name || 'Garden'}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => loadDesign(design)} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Open</button>
                      <button type="button" onClick={() => handleDelete(design.id)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-red-600">
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

      {noteForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/45 px-4" onClick={() => setNoteIndex(null)} role="presentation">
          <form
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            onSubmit={saveNotes}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-2xl text-[#14331f]">{notePlant?.name || 'Bed notes'}</h3>
              <button type="button" onClick={() => setNoteIndex(null)} className="rounded-full p-1 text-slate-500" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              {notePlant && harvestDateFor(notePlant, noteForm.plantedAt)
                ? `Expected harvest ${formatDate(harvestDateFor(notePlant, noteForm.plantedAt))}`
                : harvestLabel(notePlant)}
            </p>
            <label className="mt-4 block text-sm font-medium">
              Planting date
              <input type="date" className="input-field mt-1" value={noteForm.plantedAt} onChange={(event) => setNoteForm({ ...noteForm, plantedAt: event.target.value })} required />
            </label>
            <label className="mt-3 block text-sm font-medium">
              Soil
              <input className="input-field mt-1" placeholder="e.g. Compost mix, loam" value={noteForm.soil} onChange={(event) => setNoteForm({ ...noteForm, soil: event.target.value })} />
            </label>
            <label className="mt-3 block text-sm font-medium">
              Compost
              <input className="input-field mt-1" placeholder="e.g. Applied 2 cups" value={noteForm.compost} onChange={(event) => setNoteForm({ ...noteForm, compost: event.target.value })} />
            </label>
            <label className="mt-3 block text-sm font-medium">
              Last watered
              <input type="date" className="input-field mt-1" value={noteForm.lastWatered} onChange={(event) => setNoteForm({ ...noteForm, lastWatered: event.target.value })} />
            </label>
            <div className="mt-5 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setNoteIndex(null)}>Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save notes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GardenDesign;
