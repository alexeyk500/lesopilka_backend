require('dotenv').config();
const express = require('express');
const schedule = require('node-schedule');
const sequelize = require('./db');
const router = require('./routers/router');
const cors = require('cors');
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const path = require('path');
const fileUpload = require('express-fileupload');
const {
  doJobForManufacturers,
  depublishProductsByManufacturerId,
  redeemLicenseByManufacturerId,
  informLicensesRunOutByManufacturerId,
} = require('./jobs/licenseJob');

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
    app.listen(PORT, async () => {
      // Production actions for licenses with daily routine
      console.log(
        '---------------------------------------------------------------------------------------------------'
      );
      console.log(`   - server version: 1.0.5, Server started on PORT ${PORT}`);
      const firstJob = schedule.scheduleJob('0 0 13 * * *', async () => {
        await doJobForManufacturers(depublishProductsByManufacturerId);
      });
      console.log('   - started nightDepublishProductsJob as', firstJob.name);
      const secondJob = schedule.scheduleJob('0 30 13 * * *', async () => {
        await doJobForManufacturers(redeemLicenseByManufacturerId);
      });
      console.log('   - started nightRedeemLicenseJob as', secondJob.name);
      const thirdJob = schedule.scheduleJob('0 0 14 * * *', async () => {
        await doJobForManufacturers(informLicensesRunOutByManufacturerId);
      });
      console.log('   - started nightInformLicensesRunOutJob as', thirdJob.name);
      console.log(
        '|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||'
      );

      // Test for actions for licenses with one minute routine
      // console.log('--------------------------------------------------------------------------------------------')
      // console.log(`   - server version: 1.0.5, Server started on PORT ${PORT}`);
      // const firstJob = schedule.scheduleJob('15 * * * * *',  async () => {
      //   await doJobForManufacturers(depublishProductsByManufacturerId);
      // });
      // console.log('   - started nightDepublishProductsJob as', firstJob.name);
      // const secondJob = schedule.scheduleJob('20 * * * * *',  async () => {
      //   await doJobForManufacturers(redeemLicenseByManufacturerId);
      // });
      // console.log('   - started nightRedeemLicenseJob as', secondJob.name);
      // const thirdJob = schedule.scheduleJob('30 * * * * *',  async () => {
      //   await doJobForManufacturers(informLicensesRunOutByManufacturerId);
      // });
      // console.log('   - started nightInformLicensesRunOutJob as', thirdJob.name);
      // console.log('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
    });
  } catch (e) {
    console.log(e);
    await schedule.gracefulShutdown();
  }
};

start().then(() => {});
