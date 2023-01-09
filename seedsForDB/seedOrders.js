const { PaymentMethod, DeliveryMethod } = require('../models/orderModels');

const paymentMethods = ['Банковский перевод', 'Перевод на карту', 'Картой', 'Наличными'];
const seedPaymentMethods = async () => {
  await PaymentMethod.truncate({ cascade: true, restartIdentity: true });
  for (let paymentMethod of paymentMethods) {
    await PaymentMethod.create({
      title: paymentMethod,
    });
    console.log(`PaymentMethod ${paymentMethod} - создан`);
  }
};

const deliveryMethods = ['Самовывоз', 'Доставка'];
const seedDeliveryMethods = async () => {
  await DeliveryMethod.truncate({ cascade: true, restartIdentity: true });
  for (let deliveryMethod of deliveryMethods) {
    await DeliveryMethod.create({
      title: deliveryMethod,
    });
    console.log(`DeliveryMethod ${deliveryMethod} - создан`);
  }
};

module.exports = { seedPaymentMethods, seedDeliveryMethods };
