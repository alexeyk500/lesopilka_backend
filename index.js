require('dotenv').config();
const express = require('express');
const schedule = require('node-schedule');
const sequelize = require('./db');
const router = require('./routers/router');
const cors = require('cors');
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const path = require('path');
const fileUpload = require('express-fileupload');
const licenseJob = require('./jobs/licenseJob');

const PORT = process.env.SERVER_PORT || 5500;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await schedule.gracefulShutdown();
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`server version: 1.0.3, Server started on PORT ${PORT}`);
      const job = schedule.scheduleJob('42 * * * * *', function () {
        licenseJob();
      });
      console.log('Started licenseJob as', job.name);
    });
  } catch (e) {
    await schedule.gracefulShutdown();
    console.log(e);
  }
};

start().then(() => {});
