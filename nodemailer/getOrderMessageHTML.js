const { MessageFromToOptions } = require('../utils/constants');
const getOrderMessageHTML = (orderId, messageFromTo, messageText) => {
  const siteName = process.env.SITE_NAME;
  const siteHost = process.env.SITE_HOST;
  if (messageFromTo === MessageFromToOptions.ManufacturerToUser) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Сообщение от поставщика по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для ответа на сообщение или просмотра заказа, перейдите по ссылке ${siteHost}/orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  } else if (messageFromTo === MessageFromToOptions.UserToManufacturer) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Сообщение от покупателя по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для ответа на сообщение или просмотра заказа, перейдите по ссылке ${siteHost}/manufacturer-orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  } else if (messageFromTo === MessageFromToOptions.RobotToManufacturer) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Автоматическое сообщение по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для просмотра заказа, перейдите по ссылке ${siteHost}/manufacturer-orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  } else if (messageFromTo === MessageFromToOptions.RobotToUser) {
    return `
    <p style="color: #4A90E2; margin-bottom: 24px">Автоматическое сообщение по заказу № ${orderId} на ${siteName}</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; white-space: pre-line">${messageText}</p>
    <p style="color: #979797; margin-bottom: 24px">Для просмотра заказа, перейдите по ссылке ${siteHost}/orders/${orderId}</p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
  }
};

module.exports.getOrderMessageHTML = getOrderMessageHTML;
