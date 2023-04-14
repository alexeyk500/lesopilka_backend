const logoBase64 = require('../templates/logoBase64');
const passwordRecoveryCodeEmail = (code) => {
  const siteName = process.env.SITE_NAME;
  const emailAddress = process.env.EMAIL_ADDRESS;
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
              Запрошен код восстановления пароля на площадке ${siteName},
            </td>
          </tr>
      </table>
      <h3 style="margin-bottom: 32px">
          <span style="color: #4A90E2">Код восстановления -&nbsp;</span>
          <span style="color: #000000; font-size: 24px">${code}</span>
      </h3>
      <h4 style="color: #4A90E2; margin-bottom: 32px">
          <span>Введите данный код в форме восстановления пароля</span>
      </h4>
      <p style="color: #FF0000; margin-top: 64px margin-bottom: 32px; white-space: pre-line" >
          - Если Вы не запрашивали востановление пароля, то просто проигнорируйте данное письмо.
          <br>
          &nbsp;&nbsp;&nbsp;Ваши данные по прежнему в безопасности.
      </p>
      <p style="color: #4A90E2; margin-bottom: 48px">Служба поддержки: ${emailAddress}</p>
    </body>
  `;
};

module.exports.passwordRecoveryCodeEmail = passwordRecoveryCodeEmail;
