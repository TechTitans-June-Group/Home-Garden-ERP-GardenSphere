import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { products } from '../data/mockData.js';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDate } from '../utils/format.js';
import {
  GARDEN_LAYOUTS,
  decodeGardenShare,
  harvestDateFor,
  harvestLabel,
  normalizePlot,
  plotPlantId,
} from '../utils/gardenGuide.js';

const GardenShare = () => {
  const [params] = useSearchParams();
  const { user } = useCustomer();
  const navigate = useNavigate();
  const shared = decodeGardenShare(params.get('d') || '');
  const layout = GARDEN_LAYOUTS.find((item) => item.id === shared?.layoutId) || GARDEN_LAYOUTS[1];
  const plots = Array.from({ length: layout.rows * layout.cols }, (_, index) =>
    normalizePlot(shared?.plots?.[index])
  );

  if (!shared) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Garden link not found</h1>
        <p className="mt-3 text-emerald-800">This share link is missing or invalid.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
      </div>
    );
  }

  const openInDesigner = () => {
    sessionStorage.setItem('gs_shared_garden', JSON.stringify(shared));
    navigate('/garden-design');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Shared garden</p>
      <h1 className="mt-2 font-display text-4xl">{shared.name || 'Home garden'}</h1>
      <p className="mt-2 text-emerald-800">
        {layout.name} · {layout.rows} × {layout.cols} beds
      </p>
      <div
        className="mt-6 grid gap-3 rounded-[1.6rem] bg-[#3d6b3a] p-4"
        style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
      >
        {plots.map((plot, index) => {
          const plant = products.find((item) => item.id === plotPlantId(plot));
          const harvestOn = plant ? harvestDateFor(plant, plot?.plantedAt) : '';
          return (
            <div key={index} className="relative aspect-square overflow-hidden rounded-2xl bg-[#6b4f2a]">
              {plant ? (
                <>
                  <img src={plant.image} alt={plant.name} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-[#14532D]/85 px-2 py-1 text-[11px] font-semibold text-white">
                    {plant.name}
                    {harvestOn ? ` · harvest ${formatDate(harvestOn)}` : ` · ${harvestLabel(plant)}`}
                  </span>
                </>
              ) : (
                <span className="grid h-full place-items-center text-amber-100/80">
                  <Sprout size={22} />
                  <span className="text-[10px] font-semibold">Empty bed</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {user ? (
          <button type="button" className="btn-primary" onClick={openInDesigner}>
            Open in my designer
          </button>
        ) : (
          <Link to="/login" className="btn-primary">
            Log in to edit this garden
          </Link>
        )}
        <Link to="/shop" className="btn-secondary">
          Shop harvests
        </Link>
      </div>
    </div>
  );
};

export default GardenShare;
