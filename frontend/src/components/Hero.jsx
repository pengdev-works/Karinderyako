import React from 'react';

export default function Hero({ searchQuery, setSearchQuery }) {
  return (
    <section className="bg-palayok text-kanin py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b-4 border-atsuete relative overflow-hidden">
      {/* Background Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#C1440E_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-banana-leaf/40 text-emerald-200 border border-banana-leaf/60 px-3.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <i className="fas fa-fire-flame-curved text-amber-300"></i>
            <span>Poblacion, Laang, Abra · Marketplace</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-kanin leading-tight mb-4">
            Order From Poblacion's <span className="text-atsuete underline decoration-banig decoration-wavy decoration-2">Home Kitchens</span>
          </h1>

          <p className="text-banig/90 text-sm sm:text-base max-w-xl mx-auto font-body">
            Daily homemade dishes served straight from neighborhood food sellers in Poblacion. Fresh, affordable, and delivered to your doorstep.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center bg-kanin rounded-2xl p-1.5 shadow-xl border-2 border-banig">
              <div className="pl-3.5 text-uling-light/60">
                <i className="fas fa-search text-base text-atsuete"></i>
              </div>
              <input
                type="text"
                id="hero-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish (e.g. Sinigang, Sisig) or karinderya..."
                className="w-full bg-transparent border-none focus:outline-none text-uling placeholder:text-uling-light/50 px-3 py-2 text-sm font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-uling-light/60 hover:text-uling text-xs"
                >
                  <i className="fas fa-xmark"></i>
                </button>
              )}
              <button className="bg-atsuete hover:bg-atsuete-dark text-kanin font-display font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
