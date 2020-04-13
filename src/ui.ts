import './figma-ds/figma-plugin-ds.min.js'
import './figma-ds/figma-plugin-ds.min.css'

const APP_ID = '6477972'
const REDIRECT_URI = 'https://oauth.vk.com/blank.html'
const SCOPE = 'offline,friends,groups,video'
const API_URI = 'https://api.vk.com/method/'
const ACCESS_TOKEN = 'c95e33e5f1a22a026d532694c831818aa541d7e859b3fb7364bc9218ef181a9ad6879016962fbee291468'

const friendsGet = document.getElementById('friendsGet')

window.onmessage = async event => {
  if (event.data.pluginMessage.type === 'getImageBytes') {
    let url = event.data.pluginMessage.url;
    return await fetch(url)
      .then(result => result.arrayBuffer())
      .then(a => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'))
      .catch(error => console.error({ error }));
  }
}

friendsGet.onclick = () => {
  getData('friends.get', {
    'user_id': '92093600',
    'order': 'random',
    'fields': 'photo_200,photo_100',
    'count': '20',
    'access_token': ACCESS_TOKEN,
    'v': '5.101'
  }).then(result => { parent.postMessage({ pluginMessage: { data: result['items'] }}, '*')})
    .catch(error => console.error({ error }));
}

function auth() {
  let authURL = 'https://oauth.vk.com/authorize?client_id=' + APP_ID + '&display=page&redirect_uri=' + REDIRECT_URI + '&scope=' + SCOPE + '&response_type=token&v=' + '5.101' + '&revoke=1'
  console.log(authURL)
}

function getData(method, options) {
  let esc = encodeURIComponent
  let query = Object.keys(options)
    .map(key => esc(key) + '=' + esc(options[key]))
    .join('&')

  let url = API_URI + method + '?' + query + '&callback=jsonpCallback'

  return new Promise((resolve, reject) => {
    let callbackName = 'jsonpCallback';
    let timeoutTrigger = window.setTimeout(function () {
      window[callbackName] = Function.prototype;
      reject(new Error('Timeout'));
    }, 10000);

    window[callbackName] = function (data) {
      window.clearTimeout(timeoutTrigger);
      resolve(data.response);
    };

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;

    document.getElementsByTagName('head')[0].appendChild(script);
  });
}