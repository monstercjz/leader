import React, { useState, useEffect } from 'react';
import SiteForm from './components/SiteForm';
import SiteList from './components/SiteList';

function App() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/sites') // 确保API路径正确
      .then(response => response.json())
      .then(data => setSites(data));
  }, []);

  const addSite = (site) => {
    fetch('http://localhost:3001/api/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(site)
    })
    .then(response => response.json())
    .then(data => setSites([...sites, data]));
  };

  const updateSite = (site) => {
    fetch(`http://localhost:3001/api/sites/${site.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(site)
    })
    .then(response => response.json())
    .then(data => {
      const updatedSites = sites.map(s => s.id === data.id ? data : s);
      setSites(updatedSites);
    });
  };

  const deleteSite = (id) => {
    fetch(`http://localhost:3001/api/sites/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      const updatedSites = sites.filter(s => s.id !== id);
      setSites(updatedSites);
    });
  };

  return (
    <div>
      <h1>Personal Navigation</h1>
      <SiteForm addSite={addSite} />
      <SiteList sites={sites} updateSite={updateSite} deleteSite={deleteSite} />
    </div>
  );
}

export default App;