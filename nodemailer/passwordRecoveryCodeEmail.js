const passwordRecoveryCodeEmail = (code) => {
  const siteName = process.env.SITE_NAME;
  const emailAddress = process.env.EMAIL_ADDRESS;
  return `
    <h3 style="color: #4A90E2; margin-bottom: 32px">
        <span>Был запрошен код восстановления пароля на сайте ${siteName}</span>
    </h3>
    <h3 style="margin-bottom: 32px">
        <span style="color: #4A90E2">код восстановления -&nbsp;</span>
        <span style="color: #000000; font-size: 24px">${code}</span>
    </h3>
    <h4 style="color: #4A90E2; margin-bottom: 32px">
        <span>Введите данный код в форме восстановления пароля</span>
    </h4>
    <p style="color: #FF0000; margin-top: 64px margin-bottom: 32px; white-space: pre-line" >
        - Если Вы не запрашивали востановление пароля,то просто проигнорируйте данное письмо.
        <br>
        &nbsp;&nbsp;&nbsp;Ваши данные по прежнему в безопасности.
    </p>
    <p style="color: #4A90E2; margin-bottom: 48px">Служба поддержки: ${emailAddress}</p>

  `;
};

module.exports.passwordRecoveryCodeEmail = passwordRecoveryCodeEmail;
