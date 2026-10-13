import { photos } from './photos.js';

const industries = [
  {
    title: 'Grocery & Supermarkets',
    benefit: 'Pack and weight units are part of the supermarket catalog in the retail demo.',
    image: photos.grocery,
    alt: 'Supermarket produce aisle',
    status: 'In the demo',
  },
  {
    title: 'Fashion & Apparel',
    benefit: 'Size and color sit on the clothing catalog used by apparel shops.',
    image: photos.fashion,
    alt: 'Fashion boutique clothing racks',
    status: 'In the demo',
  },
  {
    title: 'Electronics',
    benefit: 'A dedicated electronics catalog is planned. It is not a live module yet.',
    image: photos.electronics,
    alt: 'Electronics store display tables',
    status: 'Planned',
  },
  {
    title: 'Pharmacy',
    benefit: 'A pharmacy can use the general retail catalog. There is no separate pharmacy module.',
    image: photos.pharmacy,
    alt: 'Pharmacy shelves and counter',
    status: 'General catalog',
  },
  {
    title: 'Beauty & Cosmetics',
    benefit: 'Beauty counters can sell from the general retail catalog today.',
    image: photos.beauty,
    alt: 'Cosmetics arranged on a counter',
    status: 'General catalog',
  },
  {
    title: 'Footwear',
    benefit: 'Footwear sizes fit the general retail catalog. A specialist module is not separate.',
    image: photos.footwear,
    alt: 'Shoes displayed in a store',
    status: 'General catalog',
  },
  {
    title: 'General Retail',
    benefit: 'Shops without a specialist field set use the general retail catalog.',
    image: photos.retail,
    alt: 'A general retail shop interior',
    status: 'In the demo',
  },
];

function Card({ item }) {
  return (
    <article className="group relative h-72 w-[280px] shrink-0 overflow-hidden rounded-3xl shadow-lg sm:w-[320px]">
      <img src={item.image} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">{item.status}</p>
        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{item.benefit}</p>
      </div>
    </article>
  );
}

export function IndustryMarquee() {
  const loop = [...industries, ...industries];
  return (
    <section id="retail-industries" className="bg-canvas py-16" aria-labelledby="industries-title">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Retail scenes</p>
        <h2 id="industries-title" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-content">Built around the shop floor</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted">
          Clothing, grocery, tiles and hardware, and general retail are catalogs in the current product. The other scenes show where a general catalog can be used, or where a specialist catalog is still planned.
        </p>
      </div>
      <div className="home-marquee home-marquee-motion mt-8 overflow-hidden">
        <div className="home-marquee-track flex w-max gap-4 px-4">
          {loop.map((item, index) => (
            <div key={`${item.title}-${index}`} aria-hidden={index >= industries.length ? true : undefined}>
              <Card item={item} />
            </div>
          ))}
        </div>
      </div>
      <div className="home-marquee-still mx-auto mt-8 max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((item) => <Card key={item.title} item={item} />)}
      </div>
    </section>
  );
}
