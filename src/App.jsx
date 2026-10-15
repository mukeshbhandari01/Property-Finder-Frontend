import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import SearchBox from './components/SearchBox.jsx';
import PropertyCard from './components/PropertyCard.jsx';
import Footer from './components/Footer.jsx';
import AuthPage from './pages/AuthPage.jsx';
import PostProperty from './pages/PostProperty.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import { api } from './api.jsx';

const FAVORITES_KEY = 'pf_favorites_red_v1';
const FALLBACK = '/images/default-property.png';
const purposeOf = p => { const v=String(p||'').toLowerCase(); return v.includes('rent') ? 'Rent' : v.includes('commercial') ? 'Commercial' : 'Buy'; };
const normalizeProperty = (p, index = 0) => {
 const image = p?.imageUrl || (typeof p?.imageUrls === 'string' && /^https?:\/\//i.test(p.imageUrls) ? p.imageUrls : '') || p?.image || FALLBACK;
 const id = p?.id ?? p?.propertyId ?? `${p?.title || 'property'}-${p?.city || ''}-${p?.price || ''}-${index}`;
 return {
  ...p,
  id,
  image,
  imageUrls: image,
  address: p?.address || p?.city || '',
  propertyType: p?.propertyType || 'Property',
  purpose: p?.purpose || '',
  active: p?.active ?? true,
 };
};
export default function App() {
 const [page,setPage]=useState('home'), [properties,setProperties]=useState([]), [myProperties,setMyProperties]=useState([]), [user,setUser]=useState(null), [authChecked,setAuthChecked]=useState(false);
 const [favorites,setFavorites]=useState(()=>{try{return JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]')}catch{return []}});
 const [filters,setFilters]=useState({mode:'All',query:'',type:'All Types'}), [selected,setSelected]=useState(null), [error,setError]=useState(''), [notice,setNotice]=useState(''), [loading,setLoading]=useState(false);
 useEffect(()=>{api('/api/auth/me').then(setUser).catch(()=>setUser(null)).finally(()=>setAuthChecked(true))},[]);
 const loadProperties=useCallback(async()=>{setLoading(true);try{
  const query=filters.query.trim();
  const path=query ? `/api/properties?city=${encodeURIComponent(query)}` : '/api/properties/home';
  let data;
  try {
    data = await api(path);
  } catch (primaryError) {
    // Some backend versions expose the collection endpoint but not /home.
    if (!query && path === '/api/properties/home') data = await api('/api/properties');
    else throw primaryError;
  }
  let rows = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
  if (!query && path === '/api/properties/home' && rows.length === 0) {
    try {
      const collection = await api('/api/properties');
      rows = Array.isArray(collection) ? collection : (Array.isArray(collection?.content) ? collection.content : []);
    } catch {
      // Keep the empty home response; the page will show its empty state.
    }
  }
  // The current home/search response only contains id, title, city, price and imageUrl.
  // Fetch the actual listing record so cards can show the saved purpose, type and address.
  const enriched = await Promise.all(rows.map(async item => {
    const id = item?.id ?? item?.propertyId;
    if (!id) return item;
    try {
      const full = await api(`/api/properties/${encodeURIComponent(id)}`);
      // Do not retain owner identity or contact-visibility internals in frontend state.
      const { ownerEmail, showEmail, showPhone, showInstagram, showFacebook, ...safe } = full || {};
      return { ...item, ...safe, id };
    } catch {
      return item;
    }
  }));
  setProperties(enriched.map(normalizeProperty));
  setError('');
 }catch(e){setError(`Properties could not be loaded. Check that the API gateway and property-service are running. ${e.message}`)}finally{setLoading(false)}},[filters.query]);
 useEffect(()=>{loadProperties()},[loadProperties]); useEffect(()=>{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites))},[favorites]);
 const loadMine=async(u=user)=>{if(!u?.email||u?.role!=='SELLER'){setMyProperties([]);return}try{const d=await api(`/api/properties/owner/${encodeURIComponent(u.email)}`);setMyProperties(Array.isArray(d)?d.map(normalizeProperty):[])}catch(e){setError(e.message)}};
 const navigate=next=>{setError('');setNotice('');setSelected(null);if(next==='seller-profile'&&(!user||user?.role!=='SELLER')){setNotice('Log in with a Seller account to manage your contact profile.');setPage('login');return}if(next==='post'&&!user){setNotice('Please log in with a Seller account to post a property.');setPage('login');return}if(next==='post'&&user?.role!=='SELLER'){setNotice('Posting properties is available to Seller accounts.');setPage('home');return}if(next==='my-listings'){if(!user){setPage('login');setNotice('Log in as a seller to manage listings.');return}loadMine(user)}setPage(next)};
 const save=id=>setFavorites(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 const search=v=>{setFilters({mode:v?.mode||'All',query:(v?.query||'').trim(),type:v?.type||'All Types'});setPage('home');};
 const logout=async()=>{try{await api('/api/auth/logout',{method:'POST'})}catch(e){setError(e.message)}setUser(null);setMyProperties([]);setFilters({mode:'All',query:'',type:'All Types'});setPage('home');setNotice('You have been logged out.')};
 const loginSuccess=u=>{setUser(u);setPage('home');setNotice(`Welcome back, ${u.name||'there'}!`)};
 const deleteListing=async id=>{if(!window.confirm('Delete this property listing?'))return;try{await api(`/api/properties/${encodeURIComponent(id)}`,{method:'DELETE'});setMyProperties(s=>s.filter(p=>String(p.id)!==String(id)));await loadProperties();setNotice('Property listing deleted.')}catch(e){setError(e.message)}};
 const shown=useMemo(()=>properties.filter(p=>(filters.mode==='All'||!p.purpose||purposeOf(p.purpose)===purposeOf(filters.mode))&&(filters.type==='All Types'||!p.propertyType||p.propertyType==='Property'||String(p.propertyType).toLowerCase()===filters.type.toLowerCase())),[properties,filters.mode,filters.type]);
 const visible=page==='favorites'?shown.filter(p=>favorites.includes(p.id)):shown;
 if(!authChecked)return <div className="boot-screen"><span className="brand-mark">⌂</span><p>Getting your home search ready…</p></div>;
 if(page==='login'||page==='signup')return <AuthPage mode={page} onModeChange={setPage} onBack={()=>navigate('home')} onSuccess={loginSuccess}/>;
 return <div className="app-shell"><Navbar user={user} onNavigate={navigate} onLogout={logout} favoritesCount={favorites.length}/>
 {notice&&<div className="container notice-bar"><span>{notice}</span><button onClick={()=>setNotice('')}>×</button></div>}{error&&<div className="container global-error"><span>{error}</span><button onClick={()=>setError('')}>Dismiss</button></div>}
 {page==='post'?<PostProperty user={user} onBack={()=>navigate('home')} onAdded={async()=>{await loadProperties();await loadMine(user);setPage('home');setNotice('Your property listing was created successfully.')}}/>:
 page==='details'&&selected?<PropertyDetails property={selected} user={user} onBack={()=>navigate('home')} onSave={save} saved={favorites.includes(selected.id)}/>:
 page==='seller-profile'?<SellerProfile user={user} onBack={()=>navigate('home')}/>:
 page==='my-listings'?<main className="container page-content"><div className="section-heading"><div><p className="section-eyebrow">SELLER WORKSPACE</p><h1>My property listings</h1><p className="muted">Manage the properties posted from your account.</p></div><button className="primary-btn" onClick={()=>navigate('post')}>＋ Post a property</button></div>{myProperties.length?<div className="property-grid">{myProperties.map(p=><div className="manage-card" key={p.id}><PropertyCard property={{...p,image:p.imageUrl || p.image || FALLBACK}} saved={favorites.includes(p.id)} onSave={save} onDetails={x=>{setSelected(x);setPage('details')}}/><button className="danger-btn" onClick={()=>deleteListing(p.id)}>Delete listing</button></div>)}</div>:<div className="empty-state"><div className="empty-icon">⌂</div><h2>No listings yet</h2><p>Your properties will appear here after you publish them.</p><button className="primary-btn" onClick={()=>navigate('post')}>Post your first property</button></div>}</main>:
 <main>{page==='home'&&<section className="hero-section"><div className="container hero-layout"><div className="hero-copy"><div className="hero-kicker"><i/> A simpler way to find your place</div><h1>Find a place<br/>to <span>call home.</span></h1><p>Explore homes for sale and rent. Search by city, compare options, and save the places you love.</p><div className="hero-trust"><span>✓ Owner listings</span><span>✓ Easy search</span><span>✓ Saved homes</span></div></div><div className="hero-art" aria-label="Decorative illustration of a home"><div className="sun"/><div className="cloud cloud-a"/><div className="cloud cloud-b"/><div className="illustrated-house"><div className="roof"/><div className="house-body"><i/><i/><b/></div></div><div className="tree tree-a"><i/><b/></div><div className="tree tree-b"><i/><b/></div><div className="ground"/><div className="art-caption"><span>⌂</span><div><b>Your next chapter</b><small>Starts with the right home</small></div></div></div></div><div className="container search-container"><SearchBox onSearch={search} initialMode={filters.mode} initialQuery={filters.query} initialType={filters.type}/></div></section>}
 <section className="container quick-strip"><button onClick={()=>search({mode:'Buy',query:'',type:'All Types'})}><span className="quick-icon">⌂</span><span><b>Buy a home</b><small>Find your own space</small></span><em>→</em></button><button onClick={()=>search({mode:'Rent',query:'',type:'All Types'})}><span className="quick-icon">⌑</span><span><b>Rent a home</b><small>Move in with ease</small></span><em>→</em></button><button onClick={()=>user?.role==='SELLER'?navigate('post'):navigate(user?'home':'signup')}><span className="quick-icon">＋</span><span><b>Post property</b><small>{user?.role==='SELLER'?'Reach new buyers':'Create a seller account'}</small></span><em>→</em></button><button onClick={()=>navigate('favorites')}><span className="quick-icon">♡</span><span><b>Saved homes</b><small>{favorites.length} saved so far</small></span><em>→</em></button></section>
 <section id="property-listings" className="container listings-section"><div className="section-heading"><div><p className="section-eyebrow">{page==='favorites'?'YOUR SHORTLIST':'EXPLORE PROPERTIES'}</p><h2>{page==='favorites'?'Your saved homes':filters.mode==='All'?'All available properties':filters.mode==='Rent'?'Homes for rent':filters.mode==='Commercial'?'Commercial spaces':'Homes for sale'}</h2><p className="muted">Listings are loaded from your Property Finder backend.</p></div><div className="listing-actions"><span className="result-count">{visible.length} properties</span><button className="text-btn" onClick={()=>{setFilters({mode:'All',query:'',type:'All Types'});setPage('home')}}>Clear filters ↗</button></div></div><div className="filter-line"><label>Property type <select value={filters.type} onChange={e=>setFilters(s=>({...s,type:e.target.value}))}><option>All Types</option><option>Apartment</option><option>Independent House</option><option>Villa</option><option>Plot</option><option>Commercial</option></select></label><span>Showing {filters.mode==='All'?'all':filters.mode.toLowerCase()} listings{filters.query?` in ${filters.query}`:''}</span></div>
 {loading?<div className="property-grid">{[1,2,3].map(n=><div className="skeleton-card" key={n}/>)}</div>:visible.length?<div className="property-grid">{visible.map(p=><PropertyCard key={p.id} property={p} saved={favorites.includes(p.id)} onSave={save} onDetails={x=>{setSelected(x);setPage('details')}}/>)}</div>:<div className="empty-state"><div className="empty-icon">{page==='favorites'?'♡':'⌂'}</div><h2>{page==='favorites'?'No saved homes yet':'No matching properties yet'}</h2><p>{page==='favorites'?'Tap the heart on a property to save it here.':'Try another city or property type, or be the first seller to add a listing.'}</p><button className="primary-btn" onClick={()=>page==='favorites'?navigate('home'):user?.role==='SELLER'?navigate('post'):navigate('signup')}>{page==='favorites'?'Explore properties':user?.role==='SELLER'?'Post a property':'Join Property Finder'}</button></div>}</section>
 <section className="why-section"><div className="container"><div className="why-heading"><p className="section-eyebrow">MADE FOR REAL PEOPLE</p><h2>Less searching. More settling in.</h2><p>Everything you need to get started, without the clutter.</p></div><div className="why-grid"><article><span>⌕</span><h3>Search simply</h3><p>Filter by city and property type to narrow down options that fit you.</p></article><article><span>♡</span><h3>Keep favourites</h3><p>Save homes to your shortlist and come back to compare them later.</p></article><article><span>⌂</span><h3>List as an owner</h3><p>Seller accounts can publish listings and manage their own properties.</p></article></div></div></section></main>}
 <Footer onNavigate={navigate}/></div>;
}
