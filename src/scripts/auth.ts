const HOST = 'https://www.ilyagrshn.com'

export async function authenticateAndGetToken() {
  const { read_key, write_key } = await (await fetch(HOST + '/keys')).json()
  let url = authUrl(HOST, write_key);
  window.open(url);

  let access_token
  let user_id
  while (true) {
      try {
          const json = await (await fetch(HOST + '/finish?read_key=' + encodeURIComponent(read_key))).json()
          if (json !== null) {
              access_token = json.access_token
              user_id = json.user_id
              break
          }
      } catch (e) {
          // console.error(e)
      }
      await new Promise(resolve => setTimeout(resolve, 500 + 1000 * Math.random()))
  }

  return { access_token: access_token, user_id: user_id }
}

function authUrl(host, write_key) {
  const APP_ID = '7433966'
  const SCOPE = 'offline,friends,groups,video'

  let url = 'https://oauth.vk.com/authorize' +
      '?client_id=' + encodeURIComponent(APP_ID) +
      '&redirect_uri=' + encodeURIComponent(host + '/callback') +
      '&display=page' +
      '&scope=' + encodeURIComponent(SCOPE) +
      '&response_type=token' +
      '&state=' + encodeURIComponent(write_key) +
      '&revoke=1';

  return url;
}