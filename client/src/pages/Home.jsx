import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  ClipboardList,
  Flower2,
  Leaf,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Truck,
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import StarRating from '../components/StarRating.jsx';
import { categories, products as fallbackProducts } from '../data/mockData.js';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatPrice } from '../utils/format.js';
import { fetchShopTestimonials } from '../services/shopService.js';
const faces = ['/home-lettuce.jpg', '/home-tomato.jpg', '/home-berry.jpg'];

const LeafMark = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 40c2-16 16-28 20-32 4 4 18 16 20 32-4 14-14 20-20 20S16 54 12 40z" />
    <path d="M32 12v36" fill="none" stroke="#14532D" strokeWidth="2.4" opacity="0.35" />
  </svg>
);

const SectionKicker = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
    <LeafMark className="h-4 w-4 text-lime-500" />
    {children}
  </p>
);

const Home = () => {
  const { user, products: liveProducts, orders } = useCustomer();
  const products = liveProducts?.length ? liveProducts : fallbackProducts;
  const featured = products.filter((item) => item.featured).slice(0, 6);
  const latestHarvests = [...products]
    .sort((a, b) => String(b.harvestDate || '').localeCompare(String(a.harvestDate || '')))
    .slice(0, 2);
  const harvestHeadline = latestHarvests.map((item) => item.name.replace(/s$/, '')).join(' + ') || 'Fresh beds';
  const latestOrder = orders?.[0];
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchShopTestimonials()
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  return (
    <div className="gs-home-bg relative overflow-hidden bg-[#F6F8F3]">
      <LeafMark className="gs-float pointer-events-none absolute left-4 top-24 h-16 w-16 text-emerald-400/30 sm:left-10" />
      <LeafMark className="gs-float-slow pointer-events-none absolute right-6 top-40 h-20 w-20 text-lime-500/25" />
      <LeafMark className="gs-float pointer-events-none absolute bottom-24 left-[8%] hidden h-14 w-14 text-emerald-500/20 lg:block" />

      <section className="relative">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-10 lg:grid-cols-2 lg:px-6 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur">
              <Sparkles size={16} className="text-lime-500" /> Fresh · Organic · Home Garden
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-[#14331f] sm:text-6xl lg:text-[4.4rem]">
              Fresh From Our Garden,
              <span className="block bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent">
                Directly to You
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-800/90">
              Explore vegetables, fruits, herbs, and plants harvested with care. Every product shows harvest date,
              quality grade, and available quantity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(22,163,74,0.35)]"
              >
                Browse Fresh Harvest <ArrowRight size={16} />
              </Link>
              <Link
                to="/garden"
                className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
              >
                View Our Garden
              </Link>
              <Link
                to="/garden-design"
                className="rounded-full border border-lime-300 bg-lime-50 px-6 py-3 text-sm font-semibold text-emerald-900 hover:bg-lime-100"
              >
                Design Your Garden
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                [`${products.length}+`, 'Harvest items'],
                ['Same day', 'Garden pick'],
                [products[0]?.grade || 'Grade A', 'Quality shown'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/80 bg-white/90 px-3 py-3 text-center shadow-sm backdrop-blur">
                  <p className="font-display text-xl text-emerald-800">{value}</p>
                  <p className="text-[11px] font-medium text-emerald-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.4rem] bg-gradient-to-br from-lime-200/50 via-emerald-100/40 to-amber-100/40 blur-sm" />
            <div className="relative grid grid-cols-2 gap-3">
              <img
                src="/login-garden.jpg"
                alt="Harvest baskets"
                className="h-[280px] w-full rounded-[2rem] object-cover shadow-card sm:h-[360px]"
              />
              <div className="grid gap-3">
                <img src="/home-tomato.jpg" alt="Garden tomatoes" className="h-[174px] w-full rounded-[1.6rem] object-cover shadow-card sm:h-[174px]" />
                <img src="/home-lettuce.jpg" alt="Garden lettuce" className="h-[174px] w-full rounded-[1.6rem] object-cover shadow-card" />
              </div>
            </div>
            <div className="absolute -left-3 bottom-8 hidden w-48 rotate-[-4deg] rounded-2xl border border-white bg-white p-3 shadow-card sm:block">
              <img src="/home-berry.jpg" alt="Strawberries" className="h-16 w-full rounded-xl object-cover" />
              <p className="mt-2 text-sm font-semibold text-slate-900">Strawberries</p>
              <p className="text-xs text-emerald-700">Rs. 890 / Box · Premium</p>
            </div>
            <div className="absolute -right-2 top-6 hidden rotate-[3deg] rounded-2xl border border-lime-100 bg-white px-4 py-3 shadow-card sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">Today’s harvest</p>
              <p className="font-display text-xl text-slate-900">{harvestHeadline}</p>
            </div>
            <div className="absolute bottom-4 right-6 hidden items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg sm:flex">
              <Star size={12} className="fill-yellow-300 text-yellow-300" /> Organic beds
            </div>
            <div className="gs-float absolute left-1/2 top-1/2 hidden -translate-x-6 rounded-full bg-white/90 p-3 text-emerald-700 shadow-card sm:block">
              <Flower2 size={18} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="grid gap-3 rounded-[2rem] border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur sm:grid-cols-3">
          {[
            { icon: Sun, text: 'Harvest-dated produce' },
            { icon: ShieldCheck, text: 'Quality grades shown' },
            { icon: ShoppingBasket, text: 'Easy customer orders' },
          ].map((item) => (
            <p
              key={item.text}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-lime-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800"
            >
              <item.icon size={16} className="text-emerald-600" />
              {item.text}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { src: '/home-beds.jpg', label: 'Raised beds' },
            { src: '/home-veg.jpg', label: 'Morning veg' },
            { src: '/home-tomato.jpg', label: 'Ripe tomatoes' },
            { src: '/home-lettuce.jpg', label: 'Crisp greens' },
          ].map((shot) => (
            <figure key={shot.label} className="group relative overflow-hidden rounded-[1.6rem] shadow-card">
              <img src={shot.src} alt={shot.label} className="h-36 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-44" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14532D]/80 to-transparent px-4 py-3 text-sm font-semibold text-white">
                {shot.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-white shadow-card lg:grid-cols-2">
          <div className="relative">
            <img src="/home-beds.jpg" alt="Home garden beds" className="h-64 w-full object-cover lg:h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14532D]/50 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Customer studio
            </span>
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-[#14532D]">
              <Sparkles size={12} /> Plan · Plant · Save
            </span>
          </div>
          <div className="relative p-8 lg:p-10">
            <LeafMark className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-lime-200" />
            <SectionKicker>Plan your space</SectionKicker>
            <h2 className="mt-2 font-display text-4xl text-[#14331f]">Design Your Home Garden</h2>
            <p className="mt-4 leading-7 text-emerald-800">
              Map out beds, choose vegetables, fruits, and herbs, and save a layout that fits your balcony,
              yard, or family garden. This studio is available to signed-in customers only.
            </p>
            <ul className="mt-5 grid gap-2 text-sm font-medium text-emerald-900">
              <li className="rounded-2xl bg-emerald-50 px-4 py-2">Pick a layout size that matches your space</li>
              <li className="rounded-2xl bg-lime-50 px-4 py-2">Plant GardenSphere crops into each bed</li>
              <li className="rounded-2xl bg-amber-50 px-4 py-2">Save designs to your customer account</li>
            </ul>
            {user ? (
              <Link to="/garden-design" className="btn-primary mt-6 inline-flex items-center gap-2">
                Open Garden Designer <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-amber-800">
                  Please log in as a customer to design a garden.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/login" state={{ from: '/garden-design' }} className="btn-primary inline-flex items-center gap-2">
                    Customer login <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/register"
                    state={{ from: '/garden-design' }}
                    className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-900"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionKicker>Shop</SectionKicker>
            <h2 className="mt-1 font-display text-4xl text-[#14331f]">Fresh Harvest Available Now</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-1 font-semibold text-emerald-700 sm:inline-flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="relative py-16">
        <div className="absolute inset-0 bg-[url('/home-beds.jpg')] bg-cover bg-center opacity-[0.08]" />
        <div className="gs-dot-vine absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <SectionKicker>Colourful beds</SectionKicker>
          <h2 className="mt-1 font-display text-4xl text-[#14331f]">Explore by Category</h2>
          <p className="mt-2 text-emerald-800">Colourful harvests from vegetable beds, fruit trees, and herb planters.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.name} to={`/shop?category=${category.name}`} className="group relative overflow-hidden rounded-[1.8rem] shadow-card">
                <img src={category.image} alt={category.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.tint} opacity-75`} />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  <p className="mt-1 text-sm text-white/90">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <SectionKicker>Simple path</SectionKicker>
        <h2 className="mt-1 font-display text-4xl text-[#14331f]">How GardenSphere Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            { icon: Search, title: 'Browse Products', text: 'Explore vegetables, fruits, herbs, and plants.', color: 'bg-emerald-100 text-emerald-700' },
            { icon: Leaf, title: 'View Harvest Details', text: 'Check dates, grades, and available quantity.', color: 'bg-lime-100 text-lime-700' },
            { icon: ShoppingBasket, title: 'Place Your Order', text: 'Choose quantity and share delivery details.', color: 'bg-amber-100 text-amber-700' },
            { icon: ClipboardList, title: 'Track Your Order', text: 'Follow pending, confirmed, and completed status.', color: 'bg-sky-100 text-sky-700' },
            { icon: Sprout, title: 'Enjoy Fresh Produce', text: 'Cook, share, and enjoy garden-fresh food.', color: 'bg-orange-100 text-orange-700' },
          ].map((step, index) => (
            <article key={step.title} className="relative rounded-[1.8rem] border border-emerald-50 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
              <span className="absolute -top-3 right-4 grid h-7 w-7 place-items-center rounded-full bg-[#14532D] text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${step.color}`}>
                <step.icon size={20} />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-600">Step {index + 1}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16">
        <LeafMark className="pointer-events-none absolute -right-8 top-8 h-40 w-40 text-emerald-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-6">
          <div className="grid grid-cols-2 gap-3">
            <img src="/home-beds.jpg" alt="Garden beds" className="col-span-2 h-56 w-full rounded-[2rem] object-cover shadow-card" />
            <img src="/home-veg.jpg" alt="Vegetable harvest" className="h-40 w-full rounded-[1.6rem] object-cover shadow-card" />
            <img src="/home-tomato.jpg" alt="Tomato harvest" className="h-40 w-full rounded-[1.6rem] object-cover shadow-card" />
          </div>
          <div>
            <SectionKicker>Our garden</SectionKicker>
            <h2 className="mt-2 font-display text-4xl text-[#14331f]">From Garden to Your Home</h2>
            <p className="mt-4 leading-7 text-emerald-800">
              GardenSphere manages planting, watering, pest care, and harvesting so you receive produce that is
              fresh, traceable, and grown with sustainable practices.
            </p>
            <ul className="mt-6 grid gap-3 text-sm font-medium">
              <li className="rounded-2xl bg-emerald-50 px-4 py-3">Fresh harvesting every morning</li>
              <li className="rounded-2xl bg-yellow-50 px-4 py-3">Sustainable gardening and composting</li>
              <li className="rounded-2xl bg-sky-50 px-4 py-3">Carefully maintained crops and garden beds</li>
              <li className="rounded-2xl bg-orange-50 px-4 py-3">Quality garden produce with visible grades</li>
            </ul>
            <Link to="/garden" className="btn-primary mt-6">
              Explore Our Garden
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <SectionKicker>Grown with care</SectionKicker>
        <h2 className="mt-1 font-display text-4xl text-[#14331f]">Why Choose GardenSphere?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Leaf, title: 'Fresh Harvest', text: 'Fresh products directly from the garden.', color: 'bg-emerald-100 text-emerald-700' },
            { icon: ShieldCheck, title: 'Quality Produce', text: 'Products clearly display harvest dates and quality grades.', color: 'bg-yellow-100 text-amber-700' },
            { icon: BadgeCheck, title: 'Easy Ordering', text: 'Browse products and place orders through a simple interface.', color: 'bg-orange-100 text-orange-700' },
            { icon: BellRing, title: 'Stay Updated', text: 'Receive notifications about orders and new harvest products.', color: 'bg-sky-100 text-sky-700' },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.8rem] border border-emerald-50 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
            >
              <span className={`inline-flex rounded-2xl p-3 ${item.color}`}>
                <item.icon />
              </span>
              <h3 className="mt-4 font-display text-2xl text-[#14331f]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 lg:px-6">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] bg-[#14532D] p-8 text-white lg:grid-cols-2 lg:p-10">
          <LeafMark className="pointer-events-none absolute -right-6 -top-4 h-32 w-32 text-white/10" />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Follow your harvest order</h2>
            <p className="mt-3 max-w-md text-emerald-100">
              Every customer order moves from Pending to Confirmed to Completed, and harvest sales stay in sync.
            </p>
            <Link to={user ? '/orders' : '/login'} className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900">
              {user ? 'View My Orders' : 'Sign in to track orders'}
            </Link>
          </div>
          <article className="rounded-[1.6rem] bg-white p-5 text-slate-900 shadow-card">
            <div className="flex items-center gap-3">
              <img src={latestOrder?.image || '/home-tomato.jpg'} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {latestOrder ? `Order ${latestOrder.id}` : 'Order status path'}
                </p>
                <p className="font-display text-2xl">{latestOrder?.productName || 'Cherry Tomatoes'}</p>
                {latestOrder ? (
                  <p className="text-xs text-emerald-700">
                    {latestOrder.quantity} {latestOrder.unit} · {formatPrice(latestOrder.total)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className={`rounded-full px-3 py-1 ${latestOrder?.status === 'Pending' ? 'bg-yellow-200 text-yellow-900' : 'bg-yellow-100 text-yellow-800'}`}>Pending</span>
              <Truck size={16} className="text-emerald-400" />
              <span className={`rounded-full px-3 py-1 ${latestOrder?.status === 'Confirmed' ? 'bg-sky-200 text-sky-900' : 'bg-sky-100 text-sky-800'}`}>Confirmed</span>
              <Truck size={16} className="text-emerald-400" />
              <span className={`rounded-full px-3 py-1 ${latestOrder?.status === 'Completed' ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-100 text-emerald-800'}`}>Completed</span>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <SectionKicker>From our customers</SectionKicker>
        <h2 className="mt-1 font-display text-4xl text-[#14331f]">What Our Customers Say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.length === 0 && (
            <p className="rounded-[1.8rem] bg-white p-6 text-sm text-slate-500 md:col-span-3">
              Customer reviews appear here after a completed harvest order gets feedback.
            </p>
          )}
          {reviews.map((item, index) => (
            <article key={`${item.name}-${item.productName}-${index}`} className="relative overflow-hidden rounded-[1.8rem] border border-emerald-50 bg-white p-6 shadow-sm">
              <LeafMark className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 text-lime-100" />
              <div className="flex items-center gap-3">
                <img src={item.image || faces[index % faces.length]} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-emerald-700">{item.role}</p>
                </div>
              </div>
              <div className="mt-3">
                <StarRating value={item.rating} readOnly />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">“{item.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
          <img src="/home-veg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative bg-gradient-to-r from-[#14532D]/90 to-emerald-700/75 px-8 py-14 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-200">Need something extra?</p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl">Looking for a Specific Harvest?</h2>
            <p className="mt-3 max-w-2xl text-emerald-50">
              Contact our garden manager and ask about product availability or upcoming harvests.
            </p>
            <Link to="/contact" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900">
              Contact Garden Manager
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
