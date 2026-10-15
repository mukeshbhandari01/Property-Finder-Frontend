import React, { useState } from 'react';
import { api } from '../api.jsx';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const propertyImage = (property) =>
  property?.image || property?.imageUrl ||
  (typeof property?.imageUrls === 'string' && /^https?:\/\//i.test(property.imageUrls)
    ? property.imageUrls
    : '/images/default-property.png');

export default function PropertyDetails({ property, onBack, onSave, saved, user, onContactLogin }) {
  const [sellerContact, setSellerContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  async function contactSeller() {
    setContactError('');
    if (!user) {
      setContactError('Please log in to view the seller email.');
      return;
    }
    if (!property.id) {
      setContactError('This listing does not include a property ID. Update the backend PropertyResponse API first.');
      return;
    }
    setContactLoading(true);
    try {
      const response = await api(`/api/properties/${encodeURIComponent(property.id)}/contact`);
      const contact = response && typeof response === 'object' ? response : {};
      setSellerContact(contact);
      if (!contact.email && !contact.phone && !contact.instagramUrl && !contact.facebookUrl) {
        setContactError('The seller has not enabled any contact details for this property.');
      }
    } catch (error) {
      setContactError(error.message || 'Could not load seller email.');
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <div className="details-page container">
      <button type="button" className="back-btn" onClick={onBack}>← Back to properties</button>
      <div className="details-layout">
        <img className="details-image" src={propertyImage(property)} alt={property.title} />
        <div className="details-info">
          <span className="verified">Owner listing</span>
          <h1>{property.title}</h1>
          <p className="muted">{property.address}, {property.city}</p>
          <div className="big-price">{money(property.price)}</div>
          <div className="detail-spec-grid">
            <div><b>{property.propertyType || 'Property'}</b><span>Type</span></div>
            <div><b>{property.purpose || '—'}</b><span>Purpose</span></div>
            <div><b>{property.city || '—'}</b><span>City</span></div>
            <div><b>{property.active ? 'Available' : 'Unavailable'}</b><span>Status</span></div>
          </div>
          <p className="description">{property.description || 'No additional description provided.'}</p>
          <div className="details-actions contact-actions">
            <button className="outline-btn" onClick={() => onSave(property.id)}>
              {saved ? '♥ Saved' : '♡ Save Property'}
            </button>
            <button className="primary-btn contact-seller-btn" onClick={contactSeller} disabled={contactLoading}>
              {contactLoading ? 'Loading contact details…' : 'Contact Seller'}
            </button>
          </div>
          <div className="form-card seller-contact-card" style={{ marginTop: 20 }}>
            <h3>Contact seller</h3>
            <p className="muted">Only contact details the seller enabled for this property are shown.</p>
            {sellerContact?.email && <p className="seller-email-row"><b>Email:</b> <a href={`mailto:${sellerContact.email}`}>{sellerContact.email}</a></p>}
            {sellerContact?.phone && <p className="seller-email-row"><b>Phone:</b> <a href={`tel:${sellerContact.phone}`}>{sellerContact.phone}</a></p>}
            {sellerContact?.instagramUrl && <p className="seller-email-row"><b>Instagram:</b> <a href={sellerContact.instagramUrl} target="_blank" rel="noreferrer">Open profile ↗</a></p>}
            {sellerContact?.facebookUrl && <p className="seller-email-row"><b>Facebook:</b> <a href={sellerContact.facebookUrl} target="_blank" rel="noreferrer">Open profile ↗</a></p>}
            {contactError && <p className="contact-error" role="alert">{contactError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
