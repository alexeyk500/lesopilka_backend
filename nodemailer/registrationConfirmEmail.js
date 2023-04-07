const makeRegistrationConfirmLetter = (code) => {
  const siteHost = process.env.SITE_HOST;
  const siteName = process.env.SITE_NAME;
  const baseConfirmURL = process.env.BASE_CONFIRM_URL;
  const emailAddress = process.env.EMAIL_ADDRESS;
  const confirmUrl = `${baseConfirmURL}/${code}`;
  return `
    <h3 style="color: #4A90E2; margin-bottom: 32px">
        <span>Подтвердите регистрацию на сайте:&nbsp;</span>
        <a href=${siteHost}>${siteName}</a>
        <span>&nbsp;перейдя по ссылке:</span>
    </h3>
    <p style="color: #000000; margin-bottom: 32px">
        <a href=${confirmUrl}>${confirmUrl}</a>
    </p>
    <p style="color: #FF0000; margin-top: 64px margin-bottom: 32px; white-space: pre-line" >
        - Если по нажатию ссылки в письме переход на сайт не произошел,<br>&nbsp;&nbsp;&nbsp;то скопируйте данную ссылку
        и вставьте ее в адресную сроку браузера.
    </p>
    <p style="color: #4A90E2; margin-bottom: 48px">Служба поддержки: ${emailAddress}</p>
  `;
};

module.exports.makeRegistrationConfirmLetter = makeRegistrationConfirmLetter;
