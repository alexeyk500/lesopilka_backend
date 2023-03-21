const { MessageFromToOptions } = require('../utils/constants');
const getOrderMessageHTML = (orderId, messageFromTo, messageText) => {
  const siteName = process.env.SITE_NAME;
  const siteHost = process.env.SITE_HOST;
  if (messageFromTo === MessageFromToOptions.ManufacturerToUser) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Новое сообщение от поставщика по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для ответа на сообщение, перейдите по ссылке ${siteHost}/orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  } else if (messageFromTo === MessageFromToOptions.UserToManufacturer) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Новое сообщение от покупателя по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для ответа на сообщение, перейдите по ссылке ${siteHost}/manufacturer_orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  }
};

module.exports.getOrderMessageHTML = getOrderMessageHTML;
