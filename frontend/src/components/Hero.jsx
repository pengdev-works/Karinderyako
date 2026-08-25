import React from 'react';

export default function Hero({ searchQuery, setSearchQuery }) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-badge">
          <i className="fas fa-fire"></i> Poblacion, Laang, Abra
        </div>
        <h1 className="hero-title">
          Order Homemade Food<br />
          from <span className="highlight">Local Karinderyas</span>
        </h1>
        <p className="hero-subtitle">
          Discover and order from home-based food businesses in your community.
          Fresh, affordable, and delivered right to your door.
        </p>
        <div className="search-bar">
          <div className="search-icon">
            <i className="fas fa-search"></i>
          </div>
          <input
            type="text"
            placeholder="Search karinderya or dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="hero-search"
          />
          <button className="btn btn-primary" style={{ borderRadius: '10px', padding: '0.55rem 1.25rem' }}>
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
