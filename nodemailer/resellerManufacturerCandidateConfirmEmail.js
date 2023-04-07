const logoBase64 = require('../templates/logoBase64');
const resellerManufacturerCandidateConfirmEmail = ({ resellerFIO, resellerPhone, resellerEmail, code }) => {
  const siteHost = process.env.SITE_HOST;
  const siteName = process.env.SITE_NAME;
  const emailAddress = process.env.EMAIL_ADDRESS;
  const confirmUrl = `${siteHost}/${siteName}/${code}`;

  return `
    <style>
      .green {color: #84b000; font-size: 1.17em; font-weight: bold;}
    </style>
    <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
       <table style="width: 100%; margin: 32px 0 24px 0">
          <tr>
            <td style="width: 80px;">
              <img style="width: 64px; height: 64px" src=${logoBase64} alt="logo" />
            </td>
            <td class="green" style="width: 100%; padding-left: 12px">
              Вы были зарегестрированы на площадке ${siteName},
              <br>как поставщик пиломатериалов.
            </td>
          </tr>
      </table>

      <h4 style="color: #4A90E2" >
          Для того что бы начать публиковать и продавать свои товары через площадку,
          <br>активируйте личный кабинет перейдя по этой прямой ссылке: &nbsp;<a href="${confirmUrl}">Личный кабинет</a>
      </h4>

      <p style="color: #4A90E2">
          <br>В своем личном кабинете вы сможете проверить и изменить ваши регистрационные данные,
          <br>а так же при необходимости изменить пароль для входа на площадку.
          <br>(Для этого вам понадобится ваш текущий пароль сгенерированный системой: <span style="color: #000000">${code}</span>)
      </p>

      <p style="color: #4A90E2; margin-bottom: 12px">
          В момент активации мы начислим вам 500 приветственных лицензий для публикации ваших товаров,
          <br>что бы вы смогли расширить географию продаж и разместить свои первые обьявления.
          <br>
          <br>Правила и контакты нашей площадки вы найдете в главном меню, в разделе "Справочная"
      </p>

      <p style="color: #FF8E00; margin-bottom: 32px; white-space: pre-line" >
          - Если у вас есть вопросы по работе площадки или по активации своего аккаунта,
          &nbsp;&nbsp;&nbsp;то ваш реселлер проконсультирует вас. Вот его контактные данные:
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${resellerFIO}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${resellerPhone}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${resellerEmail}
      </p>

      <p style="color: #FF0000; margin-bottom: 32px; white-space: pre-line" >
          - В случае, если по нажатию ссылки в письме, переход на площадку не произошел,
          &nbsp;&nbsp;&nbsp;то скопируйте эту ссылку ${confirmUrl} и вставьте ее в адресную строку браузера.
      </p>

      <p style="color: #4A90E2; margin-bottom: 48px">Служба поддержки: ${emailAddress}</p>
    </body>
  `;
};

module.exports = resellerManufacturerCandidateConfirmEmail;
