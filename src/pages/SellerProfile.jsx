import React, { useEffect, useState } from 'react';
import { api } from '../api.jsx';

const emptyProfile = { phone: '', instagramUrl: '', facebookUrl: '' };

export default function SellerProfile({ user, onBack }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let alive = true;
    api('/api/properties/seller-profile')
      .then(data => {
        if (alive) setProfile({
          phone: data?.phone || '',
          instagramUrl: data?.instagramUrl || '',
          facebookUrl: data?.facebookUrl || '',
        });
      })
      .catch(err => { if (alive) setError(err.message || 'Could not load seller profile.'); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, []);

  function update(e) {
    setProfile(old => ({ ...old, [e.target.name]: e.target.value }));
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const result = await api('/api/properties/seller-profile', {
        method: 'PUT',
        body: {
          phone: profile.phone.trim(),
          instagramUrl: profile.instagramUrl.trim(),
          facebookUrl: profile.facebookUrl.trim(),
        },
      });
      setProfile({
        phone: result?.phone ?? profile.phone.trim(),
        instagramUrl: result?.instagramUrl ?? profile.instagramUrl.trim(),
        facebookUrl: result?.facebookUrl ?? profile.facebookUrl.trim(),
      });
      setSuccess('Your seller contact profile has been saved.');
    } catch (err) {
      setError(err.message || 'Could not save seller profile. Make sure the backend profile API is implemented.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container page-content seller-profile-page">
      <button type="button" className="back-btn" onClick={onBack}>← Back</button>
      <div className="form-card seller-profile-card">
        <p className="section-eyebrow">SELLER WORKSPACE</p>
        <h1>Seller profile</h1>
        <p className="muted">Save your contact details once. When you post a property, choose which details buyers can see for that particular listing.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        {success && <div className="notice-bar">{success}</div>}
        {busy ? <p className="muted">Loading profile…</p> : (
          <form className="owner-form" onSubmit={save}>
            <div className="field">
              <label>Login email address</label>
              <input type="email" value={user?.email || ''} readOnly />
              <small className="field-help">Taken from your signed-in account. Email is enabled by default for new listings, but can be hidden per property.</small>
            </div>
            <div className="field">
              <label>Phone number</label>
              <input name="phone" type="tel" maxLength={20} value={profile.phone} onChange={update} placeholder="+91 98765 43210" />
            </div>
            <div className="field">
              <label>Instagram profile URL</label>
              <input name="instagramUrl" type="url" maxLength={300} value={profile.instagramUrl} onChange={update} placeholder="https://instagram.com/your-profile" />
            </div>
            <div className="field">
              <label>Facebook profile URL</label>
              <input name="facebookUrl" type="url" maxLength={300} value={profile.facebookUrl} onChange={update} placeholder="https://facebook.com/your-profile" />
            </div>
            <button className="primary-btn" disabled={saving}>{saving ? 'Saving…' : 'Save seller profile'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
