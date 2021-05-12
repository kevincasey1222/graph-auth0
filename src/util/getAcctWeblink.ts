export function getAcctWeblink(domain) {
  const domainPortions: string[] = domain.split('.');
  let webLink;
  if (domainPortions[2] === 'auth0') {
    webLink =
      'https://manage.auth0.com/dashboard/' +
      domainPortions[1] +
      '/' +
      domainPortions[0] +
      '/';
  } else {
    webLink = '';
  }
  return webLink;
}
