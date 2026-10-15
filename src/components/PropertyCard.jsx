import React from 'react';

const money = value => {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

function postedLabel(property) {
  const raw = property.createdAt || property.postedAt || property.createdDate || property.postedDate;
  if (!raw) return 'Posting date unavailable';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Posting date unavailable';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((today - day) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `Posted ${days} days ago`;
  return `Posted ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function PropertyCard({ property, saved, onSave, onDetails }) {
  const location = [property.address, property.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  return (
    <article className="property-card">
      <button className="property-image-button" onClick={() => onDetails(property)} aria-label={`View ${property.title || 'property'}`}>
        <img src={property.image} alt={property.title || 'Property'} loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-property.png'; }} />
        <span className="owner-badge">● Owner listing</span>
        <span className="purpose-badge">{property.purpose || 'Property'}</span>
      </button>
      <button className={`heart-btn ${saved ? 'saved' : ''}`} aria-label="Save property" onClick={() => onSave(property.id)}>{saved ? '♥' : '♡'}</button>
      <div className="property-body">
        <div className="price-row"><strong>{money(property.price)}</strong><span>{property.propertyType || 'Property'}</span></div>
        <h3>{property.title || 'Property listing'}</h3>
        <p className="property-location">⌖ {location || 'Location not provided'}</p>
        <p className="property-posted-date">◷ {postedLabel(property)}</p>
        <div className="property-meta"><span>⌂ {property.propertyType || 'Property'}</span><span>● {property.active === false ? 'Unavailable' : 'Available'}</span></div>
        <button className="details-btn" onClick={() => onDetails(property)}>View property details <b>→</b></button>
      </div>
    </article>
  );
}
