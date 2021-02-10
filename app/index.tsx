import * as React from 'react';
import * as ReactDOM from 'react-dom';

import I18n from 'react-light-i18n';

import { authenticateAndGetToken } from './src/auth'
import { getToken, getUserID, setToken, setUserID } from './src/utils'

import './css/common.css';

import { List } from './components/List';
import { Logout } from './components/Logout';
import { AuthPlaceholder } from './components/AuthPlaceholder';

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
    let content;
    let logout;

    if (ACCESS_TOKEN === undefined || USER_ID === undefined) {
      content = <AuthPlaceholder onClick={this.auth} />;
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