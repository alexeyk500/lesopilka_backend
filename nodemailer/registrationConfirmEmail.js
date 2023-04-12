const logoBase64 = require('../templates/logoBase64');
const makeRegistrationConfirmLetter = (code) => {
  const siteName = process.env.SITE_NAME;
  const userActivationUrl = process.env.USER_ACTIVATION_URL;
  const emailAddress = process.env.EMAIL_ADDRESS;

  const confirmUrl = `${userActivationUrl}/${code}`;

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
              Вы предварительно зарегестрировались ${siteName},
              <br>как пользователь площадки.
            </td>
          </tr>
      </table>

      <h4 style="color: #4A90E2" >
          Для того, что бы начать пользоваться площадкой активируйте свой личный кабинет,
          <br>перейдя по прямой ссылке: &nbsp;<a href="${confirmUrl}">Личный кабинет пользователя</a>
      </h4>

      <p style="color: #4A90E2">
          <br>В своем личном кабинете вы сможете проверить и изменить ваши регистрационные данные,
          <br>а так же при необходимости изменить пароль для входа на площадку.
          <br>(Для этого вам понадобится пароль котрый вы указывали при регистрации)
      </p>

      <p style="color: #4A90E2; margin-bottom: 12px">
          <br>Правила и контакты нашей площадки вы найдете в главном меню, в разделе "Справочная"
      </p>

      <p style="color: #4A90E2; margin-bottom: 12px">
          <br>Произведя активацию своего личного кабинета, вы тем самым соглашаетесь соблюдать правила нашей площадки.
          <br>И даете свое согласие на хранение и обработку ваших персональных данных на нашей площадке согласно ее правил.
          <br>
          <br>В случае грубого или неоднократного нарушения вами правил нашей площадки,
          <br>администрация без предварительного уведомления может заблокировать ваш аккаунт.
          <br>Блокировка аккаунта может быть рассмотрена и отменена через ваше обращение в службу поддержки.
      </p>

      <p style="color: #979797; margin-bottom: 32px; white-space: pre-line" >
          - В случае, если по нажатию ссылки в письме, переход на площадку не произошел,
          &nbsp;&nbsp;&nbsp;то скопируйте эту ссылку ${confirmUrl} и вставьте ее в адресную строку браузера.
      </p>

      <p style="color: #4A90E2; margin-bottom: 48px">Служба поддержки: ${emailAddress}</p>
    </body>
  `;
};

module.exports.makeRegistrationConfirmLetter = makeRegistrationConfirmLetter;
