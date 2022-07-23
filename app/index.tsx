import * as React from 'react';
import { createRoot } from 'react-dom/client';

import I18n from 'react-light-i18n';

import { authenticateAndGetToken } from './src/auth'
import { getBannerShow, setBannerShow, getToken, getUserID, setToken, setUserID } from './src/utils'

import './css/common.css';

import { List } from './components/List';
import { Logout } from './components/Logout';
import { AuthPlaceholder } from './components/AuthPlaceholder';
import { InfoBanner } from './components/InfoBanner';

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
    loadingState: false,
    bannerState: null,
  };

  async componentDidMount() {
    const token = await getToken();
    const id = await getUserID();
    const value = await getBannerShow();

    this.setState({
      ACCESS_TOKEN: token,
      USER_ID: id,
      bannerState: value,
    });
  }

  auth = () => {
    this.setState({
      loadingState: true,
      bannerState: true
    })

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
    setBannerShow(true);

    this.setState({
      ACCESS_TOKEN: undefined,
      USER_ID: undefined,
      loadingState: false,
      bannerState: false
    });
  };

  bannerHide = () => {
    setBannerShow(false);

    this.setState({
      bannerState: false
    });
  };

  render() {
    const { ACCESS_TOKEN, USER_ID, loadingState, bannerState } = this.state;
    let banner;
    let content;
    let logout;

    if (ACCESS_TOKEN === undefined || USER_ID === undefined) {
      banner = null;
      content = <AuthPlaceholder loadingState={loadingState} onClick={this.auth} />;
      logout = null;
    } else {
      banner = <InfoBanner bannerState={bannerState} onClick={this.bannerHide} />;
      content = <List access_token={ACCESS_TOKEN} user_id={USER_ID} />;
      logout = <Logout onClick={this.logout} />;
    }

    return (
      <div>
        {banner}
        {content}
        {logout}
      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);