import React from 'react';

function SiteList({ sites, updateSite, deleteSite }) {
  return (
    <ul>
      {sites.map(site => (
        <li key={site.id}>
          <a href={site.url} target="_blank" rel="noopener noreferrer">{site.name}</a> - {site.group}
          <button onClick={() => deleteSite(site.id)}>Delete</button>
          <button onClick={() => {
            const newName = prompt('Enter new name:', site.name);
            const newUrl = prompt('Enter new URL:', site.url);
            const newGroup = prompt('Enter new group:', site.group);
            if (newName && newUrl) {
              updateSite({ ...site, name: newName, url: newUrl, group: newGroup });
            }
          }}>Edit</button>
        </li>
      ))}
    </ul>
  );
}

export default SiteList;