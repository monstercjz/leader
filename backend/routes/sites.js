const express = require('express');
const axios = require('axios'); // 引入 axios 模块
const https = require('https'); // 引入 https 模块
const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块
const url = require('url'); // 引入 url 模块
const router = express.Router();

let sites = [];

// 读取 sites.json 文件
try {
  const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'sites.json'), 'utf8');
  if (!data.trim()) { // 检查文件内容是否为空
    sites = [];
  } else {
    try {
      sites = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing sites.json:', parseErr);
      sites = []; // 初始化 sites 为一个空数组
    }
  }
} catch (err) {
  if (err instanceof SyntaxError || err.code === 'ENOENT') {
    console.error('Error reading sites.json:', err);
    sites = []; // 初始化 sites 为一个空数组
  } else {
    console.error('Error reading sites.json:', err);
    throw err; // 重新抛出其他类型的错误
  }
}

// Get all sites
router.get('/', (req, res) => {
  res.json(sites);
});

// Add a new site
router.post('/', async (req, res) => {
  const site = req.body;
  let siteUrl = site.url;
  console.log('kaishi yanz', siteUrl);
  // 验证并补全 URL 前缀
  try {
    
    if (!/^https?:\/\//i.test(siteUrl)) {
      // 尝试补全 URL 前缀
      siteUrl = `https://${siteUrl}`;
    }
    const parsedUrl = new URL(siteUrl);
    if (!parsedUrl.hostname) {
      throw new Error('Invalid URL: No hostname found');
    }
  } catch (err) {
    console.error('Invalid URL:', siteUrl);
    return res.status(400).send('Invalid URL. Please provide a valid URL.');
  }
  console.log('jieshu yanz', siteUrl);
  const faviconUrl = getFaviconUrl(siteUrl);
  console.log('faviconUrl', faviconUrl);
  try {
    const iconPath = await downloadFavicon(faviconUrl, site.id);
    site.icon = iconPath; // 添加 icon 字段
  } catch (err) {
    console.error('Error downloading favicon:', err);
    // 如果下载 favicon 失败，可以选择忽略或设置默认图标
    site.icon = '/path/to/default/icon.png'; // 设置默认图标路径
  }

  sites.push(site);
  console.log('kaishi ', siteUrl);
  saveSites(); // 保存数据到文件
  res.status(201).json(site);
});

// 获取 favicon URL
function getFaviconUrl(siteUrl) {
  const urlObj = new URL(siteUrl);
  const hostname = urlObj.hostname.replace(/^www\./, ''); // 去除 www 前缀
  return `${urlObj.protocol}//${hostname}/favicon.ico`;
}

// 下载 favicon 并保存到本地目录
async function downloadFavicon(faviconUrl, siteId) {
  const domain = new URL(faviconUrl).hostname.replace(/^www\./, ''); // 去除 www 前缀
  const iconPath = path.join(__dirname, '..', 'data', 'icons', `${domain}.ico`); // 使用域名作为文件名
  // 确认存储路径
  console.log('Favicon will be saved to:', iconPath);

  const maxRetries = 3; // 设置最大重试次数
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.get(faviconUrl, { responseType: 'stream', timeout: 5000 }); // 增加超时设置
      return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(iconPath);
        response.data.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(iconPath);
        });

        fileStream.on('error', (err) => {
          fs.unlink(iconPath, () => {}); // 删除已创建的文件
          reject(err);
        });
      });
    } catch (err) {
      console.error(`Error downloading favicon from primary URL (Attempt ${retries + 1}):`, err);
      retries++;
      if (retries >= maxRetries) {
        // 尝试从 Google 提供的接口获取 favicon
        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`; // 使用域名
        try {
          const response = await axios.get(googleFaviconUrl, { responseType: 'stream', timeout: 5000 }); // 增加超时设置
          return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(iconPath);
            response.data.pipe(fileStream);

            fileStream.on('finish', () => {
              fileStream.close();
              resolve(iconPath);
            });

            fileStream.on('error', (err) => {
              fs.unlink(iconPath, () => {}); // 删除已创建的文件
              reject(err);
            });
          });
        } catch (googleErr) {
          console.error('Error downloading favicon from Google:', googleErr);
          // 尝试从 faviconkit 提供的接口获取 favicon
          const faviconKitUrl = `https://api.faviconkit.com/${encodeURIComponent(domain)}/32`; // 使用域名
          try {
            const response = await axios.get(faviconKitUrl, { responseType: 'stream', timeout: 5000 }); // 增加超时设置
            return new Promise((resolve, reject) => {
              const fileStream = fs.createWriteStream(iconPath);
              response.data.pipe(fileStream);

              fileStream.on('finish', () => {
                fileStream.close();
                resolve(iconPath);
              });

              fileStream.on('error', (err) => {
                fs.unlink(iconPath, () => {}); // 删除已创建的文件
                reject(err);
              });
            });
          } catch (faviconKitErr) {
            console.error('Error downloading favicon from faviconkit:', faviconKitErr);
            throw faviconKitErr; // 重新抛出错误
          }
        }
      }
    }
  }
}

// Update a site
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const siteIndex = sites.findIndex(s => s.id === id);
  if (siteIndex !== -1) {
    sites[siteIndex] = req.body;
    saveSites(); // 保存数据到文件
    res.json(sites[siteIndex]);
  } else {
    res.status(404).send('Site not found');
  }
});

// Delete a site
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const siteIndex = sites.findIndex(s => s.id === id);
  if (siteIndex !== -1) {
    sites.splice(siteIndex, 1);
    saveSites(); // 保存数据到文件
    res.status(204).send();
  } else {
    res.status(404).send('Site not found');
  }
});

// 保存 sites 数组到 sites.json 文件
function saveSites() {
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'sites.json'), JSON.stringify(sites, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing sites.json:', err);
  }
}

module.exports = router;