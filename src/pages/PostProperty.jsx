import React, { useState } from 'react';
import { api } from '../api.jsx';

const STATE_DISTRICTS = {
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Kadapa","Krishna","Kurnool","Nellore","Prakasam","Srikakulam","Visakhapatnam","Vizianagaram","West Godavari"],
  "Arunachal Pradesh": ["Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Itanagar Capital Complex","Kamle","Lohit","Lower Dibang Valley","Lower Subansiri","Namsai","Papum Pare","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"],
  "Assam": ["Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Goalpara","Golaghat","Hailakandi","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","Tinsukia","Udalguri"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sitamarhi","Siwan","Vaishali","West Champaran"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Janjgir-Champa","Jashpur","Kabirdham","Kanker","Kondagaon","Korba","Korea","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela Kharsawan","Simdega","West Singhbhum"],
  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narmadapuram","Narsinghpur","Neemuch","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","Eastern West Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Saitual","Serchhip"],
  "Nagaland": ["Chumoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Niuland","Noklak","Peren","Phek","Shamator","Tseminyu","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Malerkotla","Mansa","Moga","Pathankot","Patiala","Rupnagar","S.A.S. Nagar","Sangrur","Shahid Bhagat Singh Nagar","Sri Muktsar Sahib","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "Sikkim": ["Gangtok","Gyalshing","Mangan","Namchi","Pakyong","Soreng"],
  "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanniyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hanamkonda","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Komaram Bheem","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal-Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttar Pradesh": ["Agra","Aligarh","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kheri","Kushinagar","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Prayagraj","Rae Bareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar","North and Middle Andaman","South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli","Daman","Diu"],
  "Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
  "Ladakh": ["Kargil","Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"]
};
const INDIAN_STATES = Object.keys(STATE_DISTRICTS).sort();

export default function PostProperty({ onBack, onAdded, user }) {
  const [form, setForm] = useState({
    title: '', description: '', city: '', address: '', state: 'Uttarakhand', district: 'Dehradun',
    price: '', propertyType: 'Apartment', purpose: 'Buy',
  });
  const [file, setFile] = useState(null);
  const [customCity, setCustomCity] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [contact, setContact] = useState({
    showEmail: true, showPhone: false, showInstagram: false, showFacebook: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const selectedDistrict = form.district === 'Other' ? customDistrict.trim() : form.district.trim();
    const selectedCity = `${selectedDistrict}, ${form.state}, India`;
    if (!form.state || !selectedDistrict || !form.address.trim()) {
      setError('Please select a state and district, then enter the full address before publishing.');
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError('Property photo must be 5 MB or smaller.');
      return;
    }
    if (!user?.email) {
      setError('Please log in again before posting a property.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // Keep the photo optional: no file means no S3 upload is requested.
      const imageToUpload = file;
      const propertyData = {
        ownerEmail: user.email,
        title: form.title.trim(),
        purpose: form.purpose,
        propertyType: form.propertyType,
        city: selectedCity,
        state: form.state,
        district: selectedDistrict,
        country: 'India',
        address: form.address.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        imageUrls: '',
        showEmail: contact.showEmail,
        showPhone: contact.showPhone,
        showInstagram: contact.showInstagram,
        showFacebook: contact.showFacebook,
      };
      const formData = new FormData();
      formData.append('property', new Blob(
        [JSON.stringify(propertyData)],
        { type: 'application/json' }
      ));
      if (imageToUpload) formData.append('file', imageToUpload);
      const created = await api('/api/properties', {
        method: 'POST',
        body: formData,
      });
      setDone(true);
      onAdded(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="simple-page container">
      <button type="button" className="back-btn" onClick={onBack}>← Back</button>
      <div className="form-card">
        <p className="section-label">For owners</p>
        <h1>Post your property</h1>
        <p className="muted">Your account email is used as the listing owner identity.</p>
        {error && <div className="form-error">{error}</div>}
        {done ? (
          <div className="success-box">✓ Property submitted successfully!</div>
        ) : (
          <form className="owner-form" onSubmit={submit}>
            <div className="two-col">
              <div className="field">
                <label>Property title</label>
                <input required maxLength={120} name="title" value={form.title}
                  onChange={update} placeholder="Spacious 2 BHK Flat" />
              </div>
              <div className="field">
                <label>Country</label>
                <select value="India" disabled aria-label="Country">
                  <option value="India">India</option>
                </select>
                <small>Country is set to India by default.</small>
              </div>
              <div className="field">
                <label>State / Union Territory</label>
                <select required name="state" value={form.state}
                  onChange={e => setForm(current => ({ ...current, state: e.target.value, district: '', city: '' }))}>
                  <option value="" disabled>Select state</option>
                  {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div className="field">
                <label>District</label>
                <select required name="district" value={form.district}
                  onChange={e => setForm(current => ({ ...current, district: e.target.value }))}>
                  <option value="" disabled>Select district</option>
                  {(STATE_DISTRICTS[form.state] || []).map(district => <option key={district} value={district}>{district}</option>)}
                  <option value="Other">Other district</option>
                </select>
                {form.district === 'Other' && <input required value={customDistrict} onChange={e => setCustomDistrict(e.target.value)} placeholder="Enter district name" aria-label="Other district name" />}
              </div>
              <div className="field">
                <label>Full address / locality</label>
                <input required name="address" value={form.address} onChange={update}
                  placeholder="House / building, street, locality, PIN code" />
              </div>
              <div className="field">
                <label>Price in ₹</label>
                <input required min="0.01" step="0.01" type="number" name="price"
                  value={form.price} onChange={update} placeholder="3500000" />
              </div>
              <div className="field">
                <label>Purpose</label>
                <select name="purpose" value={form.purpose} onChange={update}>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="field">
                <label>Property type</label>
                <select name="propertyType" value={form.propertyType} onChange={update}>
                  <option>Apartment</option>
                  <option>Independent House</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="field">
                <label>Property photo</label>
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files?.[0] || null)} />
                <small>Optional: upload a JPEG, PNG or WEBP image (maximum 5 MB). If you skip this, the default property image will be used.</small>
              </div>
              <div className="field">
                <label>Description (optional)</label>
                <textarea name="description" rows={4} maxLength={3000}
                  value={form.description} onChange={update} placeholder="Describe your property" />
              </div>
            </div>
            <section className="contact-preferences">
              <div className="form-section-heading">
                <span>✉</span>
                <div><h2>Contact preferences</h2><p>Choose which saved contact details buyers can see for this property.</p></div>
              </div>
              <p className="field-help">Your email comes from your signed-in account and is enabled by default. Phone and social links come from your Seller Profile.</p>
              <label className="contact-check"><input type="checkbox" checked={contact.showEmail} onChange={e => setContact(s => ({ ...s, showEmail: e.target.checked }))} /> Show login email (default)</label>
              <label className="contact-check"><input type="checkbox" checked={contact.showPhone} onChange={e => setContact(s => ({ ...s, showPhone: e.target.checked }))} /> Show phone number</label>
              <label className="contact-check"><input type="checkbox" checked={contact.showInstagram} onChange={e => setContact(s => ({ ...s, showInstagram: e.target.checked }))} /> Show Instagram</label>
              <label className="contact-check"><input type="checkbox" checked={contact.showFacebook} onChange={e => setContact(s => ({ ...s, showFacebook: e.target.checked }))} /> Show Facebook</label>
              <p className="field-help">Manage your saved details from Seller Profile in the top navigation.</p>
            </section>
            <button className="primary-btn" disabled={busy}>
              {busy ? 'Publishing…' : 'Publish Property'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
