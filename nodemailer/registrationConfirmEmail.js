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
    <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:16px 32px 16px 64px;Margin:0">
       <table style="width: 100%; margin: 32px 0 24px 0">
          <tr>
            <td style="width: 80px;">
              <img style="width: 64px; height: 64px" src=${logoBase64} alt="logo" />
            </td>
            <td class="green" style="width: 100%; padding-left: 12px">
              Вы зарегестрировались на площадкe ${siteName},
            </td>
          </tr>
      </table>

      <h4 style="color: #4A90E2" >
          Для того, что бы начать пользоваться площадкой, активируйте свой личный кабинет.
          <br>Прямая ссылка для активации: &nbsp;<a href="${confirmUrl}">Личный кабинет пользователя</a>
      </h4>

      <p style="color: #4A90E2">
          <br>В своем личном кабинете можно изменить свои регистрационные данные и пароль.
          <br>Там же, можно получить статус поставщика пиломатериалов и получить доступ к созданию
          <br>карточек товаров и их публикации. Или зарегестрироваться как ресселлер и получать комиссию
          <br>с публикаций обьявлений тех постащиков пиломатериалов, которых реселлер привлек на площадку.
      </p>

      <p style="color: #4A90E2; margin-bottom: 12px">
          <br>Правила и контакты нашей площадки находятся в главном меню, в разделе "Справочная"
      </p>

      <p style="color: #4A90E2; margin-bottom: 12px">
          <br>Производя активацию своего личного кабинета, пользователь соглашается с правилами нашей площадки.
          <br>А так же дает согласие на хранение и обработку своих персональных данных на площадке.
          <br>
          <br>В случае грубого или неоднократного нарушения правил площадки,
          <br>администрация без предварительного уведомления может заблокировать аккаунт нарушителя.
          <br>Последующая разблокировка будет возможна только через обращение в нашу службу поддержки.
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
