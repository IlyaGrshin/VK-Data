const HOST = 'https://www.ilyagrshn.com/pluginServer';

export async function authenticateAndGetToken() {
  const { read_key, write_key } = await (await fetch(HOST + '/keys.php')).json();
  let url = authUrl(write_key);
  window.open(url);

  let access_token;
  let user_id;
  while (true) {
    try {
      const json = await (await fetch(HOST + '/finish.php?read_key=' + encodeURIComponent(read_key))).json();
      if (json !== null) {
        access_token = json.access_token;
        user_id = json.user_id;
        break;
      }
    } catch (e) {
      // console.error(e)
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return { access_token: access_token, user_id: user_id };
}

function authUrl(write_key) {
  return HOST + '/start.php?write_key=' + write_key;
}
