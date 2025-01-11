document.getElementById('addSite').addEventListener('click', () => {
  const name = document.getElementById('siteName').value;
  const url = document.getElementById('siteUrl').value;
  const group = document.getElementById('siteGroup').value;

  if (name && url) {
    fetch('http://localhost:3001/api/sites', { // 使用 fetch 与后端 API 通信
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: Date.now().toString(), name, url, group })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('siteName').value = '';
      document.getElementById('siteUrl').value = '';
      document.getElementById('siteGroup').value = '';
      renderSiteList();
    });
  }
});

function renderSiteList() {
  fetch('http://localhost:3001/api/sites') // 使用 fetch 获取数据
    .then(response => response.json())
    .then(sites => {
      const siteList = document.getElementById('siteList');
      siteList.innerHTML = '';
      sites.forEach(site => {
        const li = document.createElement('li');
        li.textContent = `${site.name} - ${site.group}`;
        siteList.appendChild(li);
      });
    });
}

renderSiteList();