import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ManageStylists() {
  const [stylists, setStylists] = useState([
    { id: 1, name: 'Jane Doe', specialty: 'Haircut' },
    { id: 2, name: 'John Smith', specialty: 'Coloring' },
  ]);

  const [newStylist, setNewStylist] = useState({ name: '', specialty: '' });

  const addStylist = () => {
    if (!newStylist.name || !newStylist.specialty) return;
    setStylists([...stylists, { id: Date.now(), ...newStylist }]);
    setNewStylist({ name: '', specialty: '' });
  };

  const deleteStylist = (id) => {
    setStylists(stylists.filter(stylist => stylist.id !== id));
  };

  return (
    <div>
      <h1>Manage Stylists</h1>
      <Link to="/admin-dashboard">
        <button>Back to Dashboard</button>
      </Link>
      <hr />
      
      <h2>Add Stylist</h2>
      <input 
        type="text" 
        placeholder="Name" 
        value={newStylist.name} 
        onChange={(e) => setNewStylist({...newStylist, name: e.target.value})} 
      />
      <input 
        type="text" 
        placeholder="Specialty" 
        value={newStylist.specialty} 
        onChange={(e) => setNewStylist({...newStylist, specialty: e.target.value})} 
      />
      <button onClick={addStylist}>Add</button>

      <h2>Existing Stylists</h2>
      <ul>
        {stylists.map(stylist => (
          <li key={stylist.id}>
            {stylist.name} - {stylist.specialty} 
            <button onClick={() => deleteStylist(stylist.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}