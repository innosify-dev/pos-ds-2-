import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { photos } from './photos.js';
import { useReducedMotion } from './useReducedMotion.js';

const SLIDES = [
  {
    id: 'billing',
    title: 'Smart retail billing',
    caption: 'Scan a product, watch the cart fill, and close a sample bill.',
    image: photos.billing,
    alt: 'A clothing boutique checkout counter with a tablet point of sale',
  },
  {
    id: 'inventory',
    title: 'Inventory intelligence',
    caption: 'Stock levels and a low-stock notice on a sample grocery catalog.',
    image: photos.grocery,
    alt: 'A supermarket produce aisle',
  },
  {
    id: 'catalog',
    title: 'Fashion and electronics retail',
    caption: 'A catalog search across apparel. Electronics is a planned catalog, not a live module.',
    image: photos.fashion,
    alt: 'A fashion boutique interior with clothing racks',
  },
  {
    id: 'branches',
    title: 'Multi-branch management',
    caption: 'One business, two sample branches, one owner view.',
    image: photos.retail,
    alt: 'A general retail shop interior',
  },
  {
    id: 'analytics',
    title: 'Sales analytics',
    caption: 'Sample revenue, transactions, and top products. Not a live shop.',
    image: photos.electronics,
    alt: 'An electronics store display used as atmosphere behind sample charts',
  },
];

function Stage({ slide, active }) {
  return (
    <div className={`absolute inset-0 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-700`} aria-hidden={active ? undefined : true}>
      <img
        src={slide.image}
        alt={active ? slide.alt : ''}
        className={`h-full w-full object-cover ${active && slide.id !== 'analytics' ? 'home-ken' : ''}`}
        draggable="false"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/35 to-[#070b14]/20" />
      <div className="absolute inset-0 flex items-end p-3 sm:p-5">
        {slide.id === 'billing' && <BillingCard active={active} />}
        {slide.id === 'inventory' && <InventoryCard active={active} />}
        {slide.id === 'catalog' && <CatalogCard active={active} />}
        {slide.id === 'branches' && <BranchCard active={active} />}
        {slide.id === 'analytics' && <AnalyticsCard active={active} />}
      </div>
    </div>
  );
}

function BillingCard({ active }) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-[0.9fr_1.1fr]">
      <div className={`home-float rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-md ${active ? '' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-200">Scan</p>
        <div className="relative mt-2 h-16 overflow-hidden rounded-xl bg-white/10">
          <div className="home-scan absolute inset-x-3 top-2 h-0.5 bg-cyan-300" />
          <p className="px-3 pt-6 text-xs text-white/80">8901 0000 0001 1</p>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Billing</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Sample</span>
        </div>
        <ul className="mt-2 space-y-1.5 text-xs">
          <li className={`flex justify-between ${active ? 'home-pop' : ''}`}><span>Cotton saree</span><span>₹2,800</span></li>
          <li className={`flex justify-between ${active ? 'home-pop' : ''}`} style={{ animationDelay: '0.35s' }}><span>Silk blouse</span><span>₹1,450</span></li>
        </ul>
        <div className="mt-2 flex items-end justify-between border-t border-slate-100 pt-2">
          <div>
            <p className="text-[10px] text-slate-500">GST 5% · sample</p>
            <p className="text-sm font-semibold">₹4,462</p>
          </div>
          <span className={`rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white ${active ? 'home-pop' : ''}`} style={{ animationDelay: '0.8s' }}>Sale completed</span>
        </div>
      </div>
    </div>
  );
}

function InventoryCard() {
  const rows = [
    ['Basmati rice 5 kg', '42', 'In stock'],
    ['Sunflower oil 1 L', '6', 'Low'],
    ['Toor dal 1 kg', '18', 'In stock'],
  ];
  return (
    <div className="w-full rounded-2xl bg-white p-3 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Inventory</p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Low stock · sample</span>
      </div>
      <ul className="mt-2 divide-y divide-slate-100 text-xs">
        {rows.map(([name, qty, state]) => (
          <li key={name} className="flex items-center justify-between py-1.5">
            <span>{name}</span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums">{qty}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${state === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{state}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CatalogCard() {
  const cards = [
    ['Silk saree', 'Apparel'],
    ['Cotton kurta', 'Apparel'],
    ['Headphones', 'Planned'],
  ];
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow">
        <span className="text-slate-400">Search</span>
        <span className="font-medium text-slate-900">saree</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(([name, tag], index) => (
          <article key={name} className="home-pop rounded-xl bg-white p-2 text-slate-900 shadow-lg" style={{ animationDelay: `${index * 0.12}s` }}>
            <div className={`h-10 rounded-lg ${index === 2 ? 'bg-slate-200' : 'bg-indigo-100'}`} />
            <p className="mt-1.5 text-[11px] font-semibold">{name}</p>
            <p className="text-[10px] text-slate-500">{tag}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function BranchCard() {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-[1fr_0.8fr]">
      <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Owner view · sample</p>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="rounded-full bg-indigo-600 px-2 py-1 font-semibold text-white">Main Store</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">City Showroom</span>
        </div>
        <p className="mt-3 text-lg font-semibold tabular-nums">₹28,400</p>
        <p className="text-[10px] text-slate-500">Sample sales today · Main Store</p>
      </div>
      <div className="home-float-late home-float rounded-2xl border border-white/20 bg-[#111827]/80 p-3 text-xs text-white backdrop-blur-md">
        <p className="text-white/60">City Showroom</p>
        <p className="mt-1 font-semibold">₹14,200 sample</p>
        <p className="mt-2 text-white/70">Stock stays with this branch.</p>
      </div>
    </div>
  );
}

function AnalyticsCard() {
  const bars = [42, 68, 54, 80, 62, 90];
  return (
    <div className="w-full rounded-2xl bg-white p-3 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Analytics</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Sample data</span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-2">
        {bars.map((height, index) => (
          <div key={height + index} className="home-bar flex-1 rounded-t bg-indigo-500" style={{ height: `${height}%`, animationDelay: `${index * 0.08}s` }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
        <p><span className="block text-sm font-semibold text-slate-900">₹1.8L</span>Revenue</p>
        <p><span className="block text-sm font-semibold text-slate-900">146</span>Bills</p>
        <p><span className="block text-sm font-semibold text-slate-900">Saree</span>Top product</p>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  const root = useRef(null);
  const slide = SLIDES[index];

  useEffect(() => {
    if (reduced || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reduced, paused, index]);

  const go = (next) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
  };

  return (
    <section className="home-hero relative overflow-hidden text-white" aria-labelledby="home-hero-title">
      <div className="home-beam" aria-hidden />
      <div className="home-beam home-beam-b" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[0.86fr_1.14fr] lg:py-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-200">India-first retail operating platform</p>
          <h1 id="home-hero-title" className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Run Every Branch.
            <span className="mt-1 block"><span className="home-sheen">Bill Faster.</span></span>
            <span className="mt-1 block"><span className="home-sheen">Grow Smarter.</span></span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Innosify POS brings billing, inventory, employees, branches, and sales insights into one connected retail platform — built for growing Indian businesses.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Start Free Trial</Link>
            <Link to="/features" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Explore Features</Link>
          </div>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400">Retail billing in the demo is live. Payments are simulated and are not collected. Signup continues into business setup.</p>
          <a href="#retail-industries" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
            Explore the platform
            <span aria-hidden className="text-cyan-200">↓</span>
          </a>
        </div>

        <div
          ref={root}
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="Innosify product scenes"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
          onTouchStart={(event) => {
            touch.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touch.current == null) return;
            const delta = event.changedTouches[0].clientX - touch.current;
            if (delta > 48) go(index - 1);
            if (delta < -48) go(index + 1);
            touch.current = null;
          }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl sm:aspect-[16/11]">
            {SLIDES.map((item, itemIndex) => (
              <Stage key={item.id} slide={item} active={itemIndex === index} />
            ))}
            <p className="sr-only" aria-live="polite">{slide.title}. {slide.caption}</p>
          </div>
          <div className="home-float pointer-events-none absolute -left-3 top-6 hidden rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur-md sm:block">
            Register 01 · sample
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" onClick={() => go(index - 1)} aria-label="Previous scene">Previous</button>
            <button type="button" className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" onClick={() => go(index + 1)} aria-label="Next scene">Next</button>
            <div className="ml-auto flex gap-1.5" role="tablist" aria-label="Scenes">
              {SLIDES.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={itemIndex === index}
                  aria-label={item.title}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${itemIndex === index ? 'w-8 bg-cyan-300' : 'w-3 bg-white/30'}`}
                  onClick={() => setIndex(itemIndex)}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-200">
            <span className="font-semibold text-white">{slide.title}.</span> {slide.caption}
          </p>
        </div>
      </div>
    </section>
  );
}
