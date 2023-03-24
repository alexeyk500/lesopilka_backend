const getLicensesRunOutHTML = (manufacturerTitle) => {
  const siteName = process.env.SITE_NAME;
  const siteHost = process.env.SITE_HOST;
  return `
    <p style="color: #4A90E2; margin-bottom: 24px">Сообщение об исчерпании количества лицензий для ${manufacturerTitle} на ${siteName}</p>
    <p style="color: #FF0000;">На вашем акаунте закончился пакет лицензий для публикации товаров.</p>
    <p style="color: #4A4A4A; margin-bottom: 24px; line-height: 12px; white-space: pre-line">
      Следующей ночью ваши товары будут сняты с публикации и станут недоступны для поиска и заказа покупателями.<br />
      Если вы хотите продолжать продажи своих товаров через наш сайт, то приобретите лицензии и продолжайте публикацию товаров.
    </p>
    <p style="color: #979797; margin-bottom: 24px">
      Прямая ссылка на страницу управления лицензиями для публикации товаров ${siteHost}/licenses
    </p>
    <p style="color: #FF8E00; margin-bottom: 48px">Данное письмо сформировано автоматически и отвечать на него не нужно</p>
  `;
};

module.exports.getLicensesRunOutHTML = getLicensesRunOutHTML;
