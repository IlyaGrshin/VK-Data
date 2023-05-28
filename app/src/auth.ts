const HOST = 'https://www.ilyagrshn.com/pluginServer';

export async function authenticateAndGetToken() {
  const { read_key, write_key } = await (await fetch(HOST + '/keys.php')).json();
  const url = authUrl(write_key);
  window.open(url);

  let access_token;
  let user_id;

  const json = await (await fetch(HOST + '/finish.php?read_key=' + encodeURIComponent(read_key))).json();
  if (json === null) {
    throw new Error('Failed to retrieve data from server');
  }

  ({ access_token, user_id } = json);

  return { access_token, user_id };
}

function authUrl(write_key) {
  return HOST + '/start.php?write_key=' + write_key;
}
