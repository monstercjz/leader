const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // 引入 cors 中间件
const siteRoutes = require('./routes/sites');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors()); // 使用 cors 中间件
app.use('/api/sites', siteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});