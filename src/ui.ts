//import vkQr from '@vkontakte/vk-qr';
// import { auth_url, auth_check } from './scripts/auth'

import './figma-ds/figma-plugin-ds.min.js'
import './figma-ds/figma-plugin-ds.min.css'
import './css/common.css'

const API_URI = 'https://api.vk.com/method/'
const ACCESS_TOKEN = 'c95e33e5f1a22a026d532694c831818aa541d7e859b3fb7364bc9218ef181a9ad6879016962fbee291468'
// const ACCESS_TOKEN = getToken();

window.onmessage = async event => {
  if (event.data.pluginMessage.type === 'getImageBytes') {
    let url = event.data.pluginMessage.url;
    return await fetch(url)
      .then(result => result.arrayBuffer())
      .then(a => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'))
      .catch(error => console.error({ error }));
  }
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

// function launchCheckAuth(device_id) {
//   console.log(device_id);
//   auth_check(device_id).then((result) => {
//     console.log(result)
//     setToken(result);
//   })
// }

// if(getToken() === undefined) {
  // auth_url().then(result =>{
  //   document.getElementById('app').innerHTML = 
  //   '<p class="type type--pos-large-normal desc">Чтобы Вы могли вставлять данные из ВКонтакте, Вам необходимо авторизоваться и разрешить доступ приложения<p>'
  //   + '<a id="authBtn" class="button button--secondary styledBtn" href=' + result.url + ' target="_blank">Авторизоваться</a>'
  //   document.getElementById('authBtn').addEventListener('click', function() {
  //     launchCheckAuth(result.device_id);
  //   });
  // })

// } else {
  // setToken('undefined')
  document.getElementById('friends').onclick = () => {
    getData('friends.get', {
      'user_id': '92093600',
      'order': 'random',
      'fields': 'photo_200,photo_100',
      'count': '20',
      'access_token': ACCESS_TOKEN,
      'v': '5.101'
    }).then(result => { parent.postMessage({ pluginMessage: { type: 'data', data: result['items'] }}, '*')})
      .catch(error => console.error({ error }));
  }
// }