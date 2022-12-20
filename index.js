require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const router = require('./routers/router');
const cors = require('cors');
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const path = require('path');
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`server version: 1.0.2, Server started on PORT ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start().then(() => {});
