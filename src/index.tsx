import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { authenticateAndGetToken } from './scripts/auth';
import { getToken, getUserID, setToken, setUserID, shuffle } from './scripts/utils';

import './figma-ds/figma-plugin-ds.min.js';
import './figma-ds/figma-plugin-ds.min.css';
import './css/common.css';

const API_URI = 'https://api.vk.com/method/';

window.addEventListener('message', async (event) => {
  if (event.data.pluginMessage.type === 'getImageBytes') {
    const url = event.data.pluginMessage.url;
    try {
      await fetch(url)
        .then((result) => result.arrayBuffer())
        .then((a) => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'));
    } catch (error) {
      console.error(error);
    }
  }
});

function getData(method, options) {
  const query = Object.keys(options)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(options[key]))
    .join('&');

  const url = API_URI + method + '?' + query + '&callback=jsonpCallback';

  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback';
    const timeoutTrigger = window.setTimeout(function () {
      window[callbackName] = Function.prototype;
      reject(new Error('Timeout'));
    }, 10000);

    window[callbackName] = function (data) {
      window.clearTimeout(timeoutTrigger);
      resolve(data);
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;

    document.head.appendChild(script);
  });
}

function Cell(props) {
  return (
    <div className="cell" onClick={props.onClick}>
      <div className="icon icon--share" />
      <div className="cell_main">{props.name}</div>
    </div>
  );
}

function Logout(props) {
  return (
    <div className="logout" onClick={props.onClick}>
      Выйти
    </div>
  );
}

class List extends React.Component<any> {
  getFriends = (ACCESS_TOKEN: any, USER_ID: any, order: any) => {
    getData('friends.get', {
      user_id: USER_ID,
      order: order,
      fields: 'photo_200,occupation,city,bdate,verified,online',
      count: '20',
      access_token: ACCESS_TOKEN,
      v: '5.103',
    })
      .then((result) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'data',
              data: result['response']['items'],
              method: 'person',
            },
          },
          '*'
        );
      })
      .catch((error) => console.error({ error }));
  };

  getGroups = (ACCESS_TOKEN: any, USER_ID: any, order: any) => {
    let items: [];
    const count = 100;

    getData('groups.get', {
      user_id: USER_ID,
      fields: 'photo_200,activity,verified',
      count: count,
      extended: '1',
      access_token: ACCESS_TOKEN,
      v: '5.103',
    })
      .then((result) => {
        items = result['response']['items'];

        if (order === 'random') items = shuffle(items);

        parent.postMessage(
          {
            pluginMessage: { type: 'data', data: items, method: 'groups' },
          },
          '*'
        );
      })
      .catch((error) => console.error({ error }));
  };

  getByUserID = (ACCESS_TOKEN: any, USER_ID: any) => {
    getData('users.get', {
      user_ids: USER_ID,
      fields: 'photo_200,occupation,city,bdate,verified,online',
      access_token: ACCESS_TOKEN,
      v: '5.103',
    })
      .then((result) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'data',
              data: result['response'],
              method: 'person',
            },
          },
          '*'
        );
      })
      .catch((error) => console.error({ error }));
  };

  getFriendsHints = (ACCESS_TOKEN: any) => {
    getData('search.getHints', {
      fields: 'photo_200,occupation,city,bdate,verified,online',
      limit: '20',
      filters: 'friends',
      access_token: ACCESS_TOKEN,
      v: '5.103',
    })
      .then((result) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'data',
              data: result['response']['items'],
              method: 'search',
            },
          },
          '*'
        );
      })
      .catch((error) => console.error({ error }));
  };

  render() {
    return (
      <div className="list">
        <Cell name="Друзья · Хинты" onClick={() => this.getFriendsHints(this.props.access_token)} />
        <Cell
          name="Друзья · Рандом"
          onClick={() => this.getFriends(this.props.access_token, this.props.user_id, 'random')}
        />
        <Cell
          name="Друзья · По имени"
          onClick={() => this.getFriends(this.props.access_token, this.props.user_id, 'name')}
        />
        <Cell
          name="Сообщества  · Хинты"
          onClick={() => this.getGroups(this.props.access_token, this.props.user_id, 'hints')}
        />
        <Cell
          name="Сообщества  · Рандом"
          onClick={() => this.getGroups(this.props.access_token, this.props.user_id, 'random')}
        />
        <Cell name="Твой профиль" onClick={() => this.getByUserID(this.props.access_token, this.props.user_id)} />
      </div>
    );
  }
}

function AuthGreeting(props) {
  return (
    <div>
      <p className="type type--pos-large-normal desc">
        Чтобы вставлять данные из ВКонтакте, Вам необходимо авторизоваться и разрешить доступ приложению
      </p>
      <button className="button button--secondary styledBtn" onClick={props.onClick}>
        Авторизоваться
      </button>
    </div>
  );
}

class App extends React.Component<any> {
  state = {
    ACCESS_TOKEN: null,
    USER_ID: null,
  };

  async componentDidMount() {
    const token = await getToken();
    const id = await getUserID();

    this.setState({
      ACCESS_TOKEN: token,
      USER_ID: id,
    });
  }

  auth = () => {
    authenticateAndGetToken().then((data) => {
      const resultToken = data.access_token;
      const resultID = data.user_id;
      setToken(resultToken);
      setUserID(resultID);

      this.setState({
        ACCESS_TOKEN: resultToken,
        USER_ID: resultID,
      });
    });
  };

  logout = () => {
    setToken(undefined);
    setUserID(undefined);

    this.setState({
      ACCESS_TOKEN: undefined,
      USER_ID: undefined,
    });
  };

  render() {
    const { ACCESS_TOKEN, USER_ID } = this.state;
    let content, logout;

    if (ACCESS_TOKEN === undefined || USER_ID === undefined) {
      content = <AuthGreeting onClick={this.auth} />;
      logout = null;
    } else {
      content = <List access_token={ACCESS_TOKEN} user_id={USER_ID} />;
      logout = <Logout onClick={this.logout} />;
    }

    return (
      <div>
        {content}
        {logout}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'));
