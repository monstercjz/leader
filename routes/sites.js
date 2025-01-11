const express = require('express');
const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块
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
