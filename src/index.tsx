import * as React from 'react';
import * as ReactDOM from 'react-dom';

import I18n from 'react-light-i18n';

import { authenticateAndGetToken } from './src/auth'
import { getToken, getUserID, setToken, setUserID } from './src/utils'
import { getFriends, getGroups, getByUserID, getFriendsHints } from './src/api'

import './css/common.css';

I18n.setTranslations({
  ru: require('./localization/ru.json'),
  en: require('./localization/en.json')
})

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
      {I18n.t('logout')}
    </div>
  );
}

class List extends React.Component<any> {
  SECTIONS: any[] = [
    { label: I18n.t('friendsHints'), click: () => getFriendsHints(this.props.access_token) },
    { label: I18n.t('friendsRandom'), click: () => getFriends(this.props.access_token, this.props.user_id, 'random') },
    { label: I18n.t('friendsByName'), click: () => getFriends(this.props.access_token, this.props.user_id, 'name') },
    { label: I18n.t('communitiesHints'), click: () => getGroups(this.props.access_token, this.props.user_id, 'hints') },
    { label: I18n.t('communitiesRandom'), click: () => getGroups(this.props.access_token, this.props.user_id, 'random') },
    { label: I18n.t('yourProfile'), click: () => getByUserID(this.props.access_token, this.props.user_id) },
  ]

  render() {
    return (
      <div className="list">
        {this.SECTIONS.map(section => (
          <Cell
            name={section.label}
            onClick={section.click}
          />
        ))}
      </div>
    );
  }
}

function AuthGreeting(props) {
  return (
    <div>
      <p className="desc">
        {I18n.t('signInDesc')}
      </p>
      <button className="button button--secondary styledBtn" onClick={props.onClick}>
        {I18n.t('signIn')}
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