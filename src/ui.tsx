import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { authenticateAndGetToken } from './scripts/auth'
import { getToken, setToken, getUserID, setUserID, shuffle } from './scripts/utils'

import './figma-ds/figma-plugin-ds.min.js'
import './figma-ds/figma-plugin-ds.min.css'
import './css/common.css'

const API_URI = 'https://api.vk.com/method/'

window.addEventListener('message', async event => {
  if (event.data.pluginMessage.type === 'getImageBytes') {
    let url = event.data.pluginMessage.url;
    try {
      await fetch(url)
        .then(result => result.arrayBuffer())
        .then(a => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'))
    } catch (error) {
      console.error(error);
    }
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
      resolve(data);
    };

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;

    document.head.appendChild(script);
  });
}

function Cell(props) {
  return (
    <div className="cell" onClick={props.onClick}>
      <div className="icon icon--share"></div>
      <div className="cell_main">{props.name}</div>
    </div>
  )
}

function Logout(props) {
  return (
    <div className="logout" onClick={props.onClick}>Выйти</div>
  )
}

class List extends React.Component<any> {
  getFriends = (ACCESS_TOKEN: any, USER_ID: any, order: any) => {
    getData('friends.get', {
      'user_id': USER_ID,
      'order': order,
      'fields': 'photo_200',
      'count': '20',
      'access_token': ACCESS_TOKEN,
      'v': '5.103'
    })
      .then(result => {
        parent.postMessage({
          pluginMessage: { type: 'data', data: result['response']['items'], method: 'friends' }
        }, '*')
      })
      .catch(error => console.error({ error }));
  }

  getGroups = (ACCESS_TOKEN: any, USER_ID: any, order: any) => {
    let items: [];
    const count = 100;

    getData('groups.get', {
      'user_id': USER_ID,
      'fields': 'photo_200',
      'count': count,
      'extended': '1',
      'access_token': ACCESS_TOKEN,
      'v': '5.103'
    }).then(result => {
      items = result['response']['items'];

      if(order === 'random') {
        items = shuffle(items);
        let arrRand = []
        for (let i = 0; i < count; i++) {
          arrRand.splice(i, 0, String(items[i]))
        }
      }

      parent.postMessage({
        pluginMessage: { type: 'data', data: items, method: 'groups' }
      }, '*')
    })
      .catch(error => console.error({ error }));
  }

  render() {
    return <div className="list">
      <Cell 
        name="Друзья · Топ" 
        onClick={() => this.getFriends(this.props.access_token, this.props.user_id, 'hints')} 
      />
       <Cell 
        name="Друзья · Рандом" 
        onClick={() => this.getFriends(this.props.access_token, this.props.user_id, 'random')} 
      />
      <Cell 
        name="Сообщества  · Топ" 
        onClick={() => this.getGroups(this.props.access_token, this.props.user_id, 'hints')} 
      />
      <Cell 
        name="Сообщества  · Рандом" 
        onClick={() => this.getGroups(this.props.access_token, this.props.user_id, 'random')} 
      />
    </div>
  }
}

function AuthGreeting(props) {
  return (
    <div>
      <p className="type type--pos-large-normal desc">
        Чтобы вставлять данные из ВКонтакте, Вам необходимо авторизоваться и разрешить доступ приложению
      </p>
      <button className="button button--secondary styledBtn" onClick={props.onClick}>Авторизоваться</button>
    </div>
  )
}

class App extends React.Component<any> {
  state = {
    ACCESS_TOKEN: null,
    USER_ID: null
  }

  async componentDidMount() {
    const token = await getToken();
    const id = await getUserID();

    this.setState({
      ACCESS_TOKEN: token,
      USER_ID: id
    })
  }

  auth = () => {
    authenticateAndGetToken()
      .then(data => {
        let resultToken = data.access_token;
        let resultID = data.user_id;
        setToken(resultToken);
        setUserID(resultID);

        this.setState({
          ACCESS_TOKEN: resultToken,
          USER_ID: resultID
        })
      })
  }

  logout = () => {
    setToken(undefined);
    setUserID(undefined);

    this.setState({
      ACCESS_TOKEN: undefined,
      USER_ID: undefined
    })
  }

  render() {
    const { ACCESS_TOKEN, USER_ID } = this.state;
    let content, logout;
    
    if(ACCESS_TOKEN === undefined || USER_ID === undefined) {
      content = <AuthGreeting onClick={this.auth} />
      logout = null;
    } else {
      content = <List access_token={ACCESS_TOKEN} user_id={USER_ID} />
      logout = <Logout onClick={this.logout} />
    }

    return <div>
      {content}
      {logout}
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))