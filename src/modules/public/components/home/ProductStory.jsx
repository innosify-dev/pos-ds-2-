import { useEffect, useState } from 'react';

const stories = [
  {
    id: 'bill',
    title: 'Bill in seconds',
    copy: 'Search or scan, add the line, and see GST on the sample bill. Cash, card, UPI, and split amounts in the app are recorded as simulated payments.',
  },
  {
    id: 'stock',
    title: "Know what's in stock",
    copy: 'Products, quantities, and low-stock alerts stay with the business. Purchases, adjustments, and transfers explain how stock moved.',
  },
  {
    id: 'branch',
    title: 'Manage every branch',
    copy: 'A branch selector keeps registers and sales with that location. Plan limits decide how many branches and registers the business can add.',
  },
  {
    id: 'decide',
    title: 'Make smarter decisions',
    copy: 'Sales charts read the transactions already stored for that business. They are sample insights here, not a filing-ready GST return.',
  },
];

function StoryVisual({ id }) {
  if (id === 'bill') {
    return (
      <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Checkout</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Sample bill</span>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">Scan or search · cotton saree</div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>Cotton saree × 1</span>
          <span className="font-medium">₹2,800</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
          <p className="text-slate-500">GST 5%</p>
          <p className="text-right font-semibold">Total ₹2,940</p>
        </div>
      </div>
    );
  }
  if (id === 'stock') {
    return (
      <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
        <p className="text-sm font-semibold">Stock</p>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ['Kanjivaram saree', '8', false],
            ['Organza saree', '2', true],
            ['Cotton saree', '14', false],
          ].map(([name, qty, low]) => (
            <li key={name} className="flex items-center justify-between">
              <span>{name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{qty} {low ? '· low' : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (id === 'branch') {
    return (
      <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Branch</p>
        <div className="mt-3 flex gap-2 text-sm">
          <span className="rounded-full bg-indigo-600 px-3 py-1 font-semibold text-white">Main Store</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">City Showroom</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Sales</p><p className="mt-1 font-semibold">₹28,400</p><p className="text-[10px] text-slate-400">Sample</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Registers</p><p className="mt-1 font-semibold">2 open</p><p className="text-[10px] text-slate-400">Sample</p></div>
        </div>
      </div>
    );
  }
  const bars = [36, 58, 48, 76, 64, 88];
  return (
    <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Revenue trend</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Sample data</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-2">
        {bars.map((height, index) => (
          <div key={index} className="home-bar flex-1 rounded-t bg-indigo-500" style={{ height: `${height}%`, animationDelay: `${index * 0.06}s` }} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Top sample product · silk saree</p>
    </div>
  );
}

export function ProductStory() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-home-story]')];
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number(visible.target.getAttribute('data-home-story')));
    }, { rootMargin: '-35% 0px -40% 0px', threshold: [0.3, 0.6] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#070b14] py-20 text-white" aria-labelledby="story-title">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Product</p>
          <h2 id="story-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">One platform. Every part of your retail business.</h2>
          <div className="mt-10 space-y-16">
            {stories.map((story, index) => (
              <article key={story.id} data-home-story={index} className={`home-story ${index === active ? 'is-active' : ''}`}>
                <p className="text-xs font-semibold text-cyan-200">0{index + 1}</p>
                <h3 className="mt-2 text-2xl font-semibold">{story.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{story.copy}</p>
                <div className="mt-5 lg:hidden">
                  <StoryVisual id={story.id} />
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="sticky top-24 hidden h-fit lg:block">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 p-4">
            <StoryVisual id={stories[active].id} />
          </div>
          <p className="mt-3 text-xs text-slate-400">The panel follows the story in view. Figures are samples.</p>
        </div>
      </div>
    </section>
  );
}
