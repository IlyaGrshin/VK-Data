import { authenticateAndGetToken } from './scripts/auth'
import { getToken, setToken, getUserID, setUserID } from './scripts/utils'

import './figma-ds/figma-plugin-ds.min.js'
import './figma-ds/figma-plugin-ds.min.css'
import './css/common.css'

const API_URI = 'https://api.vk.com/method/'

window.addEventListener('message', async event => {
  if (event.data.pluginMessage.type === 'getImageBytes') {
    let url = event.data.pluginMessage.url;
    return await fetch(url)
      .then(result => result.arrayBuffer())
      .then(a => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'))
      .catch(error => console.error({ error }));
  }
})

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

function auth() {
  authenticateAndGetToken()
    .then(data => {
      let resultToken = data.access_token;
      let resultID = data.user_id;
      setToken(resultToken);
      setUserID(resultID);
      run();
    })
}

function getFriends(ACCESS_TOKEN, USER_ID) {
  getData('friends.get', {
    'user_id': USER_ID,
    'order': 'random',
    'fields': 'photo_200',
    'count': '20',
    'access_token': ACCESS_TOKEN,
    'v': '5.103'
  }).then(result => { parent.postMessage({ pluginMessage: { type: 'data', data: result['items'], method: 'friends' } }, '*') })
    .catch(error => console.error({ error }));
}

function getGroups(ACCESS_TOKEN, USER_ID) {
  getData('groups.get', {
    'user_id': USER_ID,
    'order': 'random',
    'fields': 'photo_200',
    'count': '20',
    'extended': '1',
    'access_token': ACCESS_TOKEN,
    'v': '5.103'
  }).then(result => { parent.postMessage({ pluginMessage: { type: 'data', data: result['items'], method: 'groups' } }, '*') })
    .catch(error => console.error({ error }));
}

async function run() {
  let ACCESS_TOKEN = await getToken();
  let USER_ID = await getUserID();

  if (ACCESS_TOKEN === undefined || USER_ID === undefined) {
    document.getElementById('app').innerHTML =
      '<p class="type type--pos-large-normal desc">Чтобы Вы могли вставлять данные из ВКонтакте, Вам необходимо авторизоваться и разрешить доступ приложения<p>'
      + '<button id="authBtn" class="button button--secondary styledBtn">Авторизоваться</button>'
    document.getElementById('authBtn').addEventListener('click', auth);
  } else {
    let content = document.getElementById('app')
    content.innerHTML = ''
    content.innerHTML += '<div id="getFriends" class="cell">' +
      '<div class="icon icon--share"></div>' +
      '<div class="cell_main">Friends</div>' +
      '</div>'

    content.innerHTML += '<div id="getGroups" class="cell">' +
      '<div class="icon icon--share"></div>' +
      '<div class="cell_main">Groups</div>' +
      '</div>'

    document.getElementById('getFriends').addEventListener('click', function () { getFriends(ACCESS_TOKEN, USER_ID); });
    document.getElementById('getGroups').addEventListener('click', function () { getGroups(ACCESS_TOKEN, USER_ID); });
  }
}

run()