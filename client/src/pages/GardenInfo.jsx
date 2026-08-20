import { ArrowRight, Droplets, Leaf, Recycle, Shield, Sprout, Sun } from 'lucide-react';

const crops = [
  { name: 'Tomato', image: '/products/tomato.jpg' },
  { name: 'Carrot', image: '/products/carrot.jpg' },
  { name: 'Lettuce', image: '/products/lettuce.jpg' },
  { name: 'Chili', image: '/products/chili.jpg' },
  { name: 'Cucumber', image: '/products/cucumber.jpg' },
  { name: 'Spinach', image: '/products/spinach.jpg' },
  { name: 'Strawberry', image: '/products/strawberry.jpg' },
  { name: 'Herbs', image: '/products/mint.jpg' },
  { name: 'Marigold', image: '/products/marigold.jpg' },
  { name: 'Hibiscus', image: '/products/hibiscus.jpg' },
];

const GardenInfo = () => {
  return (
    <div>
      <div className="relative h-72">
        <img
          src="/home-beds.jpg"
          alt="GardenSphere home garden"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 grid place-items-center bg-gs-deep/50">
          <h1 className="font-display text-4xl text-white sm:text-5xl">Our Garden</h1>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <h2 className="section-title">About GardenSphere</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-emerald-800">
          GardenSphere manages home-garden activities—from planting and irrigation to harvest records—and
          gives customers a simple way to browse fresh produce, place orders, and stay updated on new harvests.
        </p>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
          {[
            { icon: Leaf, title: 'Fresh Crops', text: 'Vegetables, fruits, herbs, and flowers grown in seasonal garden beds.' },
            { icon: Sun, title: 'Available Harvests', text: 'Customers see harvest dates and remaining quantities before ordering.' },
            { icon: Recycle, title: 'Sustainable Gardening', text: 'Compost, mulch, and water-wise irrigation keep the garden healthy.' },
            { icon: Shield, title: 'Natural Growing Practices', text: 'We prefer careful garden care over harsh chemical shortcuts.' },
            { icon: Droplets, title: 'Garden Care', text: 'Irrigation, fertilizer, and pest records stay connected in one ERP.' },
            { icon: Sprout, title: 'From Seed to Sale', text: 'Planting, growing, harvesting, and customer orders in one flow.' },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl bg-gs-bg p-6">
              <item.icon className="text-gs-primary" />
              <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-emerald-800">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <h2 className="section-title">Available Crops</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {crops.map((crop) => (
            <article key={crop.name} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <img src={crop.image} alt={crop.name} className="h-40 w-full object-cover" />
              <p className="p-4 font-semibold">{crop.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="section-title">Harvesting Process</h2>
          <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-between">
            {['Planting', 'Growing', 'Caring', 'Harvesting', 'Available for Customers'].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-2xl bg-gs-light px-4 py-3 text-center">
                  <p className="text-xs font-bold text-gs-orange">0{index + 1}</p>
                  <p className="font-semibold">{step}</p>
                </div>
                {index < 4 && <ArrowRight className="hidden text-gs-primary md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GardenInfo;
