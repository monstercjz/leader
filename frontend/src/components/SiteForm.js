import React, { useState } from 'react';

function SiteForm({ addSite }) {
  const [site, setSite] = useState({ id: Date.now().toString(), name: '', url: '', group: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSite({ ...site, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addSite(site);
    setSite({ id: Date.now().toString(), name: '', url: '', group: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={site.name} onChange={handleChange} placeholder="Site Name" required />
      <input type="url" name="url" value={site.url} onChange={handleChange} placeholder="Site URL" required />
      <input type="text" name="group" value={site.group} onChange={handleChange} placeholder="Group" />
      <button type="submit">Add Site</button>
    </form>
  );
}

export default SiteForm;