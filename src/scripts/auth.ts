// probably deprecated

const OAUTH_HOST = 'https://oauth.vk.com/';
const PROXY_DOMAIN = 'https://ilyagrshn.com/'

const APP_ID = '6742961'
const SCOPE = 'offline,friends,groups,video'

const CODE_SUCCESS = 200;

export async function auth_url() {
    const get_auth_code = await fetch(PROXY_DOMAIN + 'get_auth_code/?scope=' + SCOPE + '&client_id=' + APP_ID, { cache: 'no-cache' });
    const get_auth_code_res = await get_auth_code.json();
  
    if (get_auth_code_res.error !== void 0) {
      throw new Error(JSON.stringify(get_auth_code_res.error));
    }
  
    if (get_auth_code_res.response !== void 0) {
      console.log('fail, get_auth_code response ', get_auth_code_res);
      return get_auth_code_res.response;
    }
  
    if (get_auth_code_res.auth_code) {

      const { auth_code, device_id } = get_auth_code_res;
  
      const url = OAUTH_HOST + 'code_auth?stage=check&code=' + auth_code;

      return {'url': url, 'device_id': device_id};
    }
}

export async function auth_check (device_id) {
    let handled = false;

    do {
        const code_auth_token = await fetch(PROXY_DOMAIN + 'code_auth_token/?device_id=' + device_id + '&client_id=' + APP_ID);
        const code_auth_token_json = await code_auth_token.json();
  
        if (code_auth_token.status !== CODE_SUCCESS) {
          console.error('code_auth_token.status: ', code_auth_token.status, code_auth_token_json);
          continue;
        }
  
        const { access_token } = code_auth_token_json;
        if (access_token || access_token === null) {
          handled = true;
        }
        console.log('test');
  
        return Promise.resolve(access_token);
  
    } while (handled === false);
}