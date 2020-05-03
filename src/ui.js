var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { authenticateAndGetToken } from './scripts/auth';
import { getToken, setToken, getUserID, setUserID, shuffle } from './scripts/utils';
import './figma-ds/figma-plugin-ds.min.js';
import './figma-ds/figma-plugin-ds.min.css';
import './css/common.css';
const API_URI = 'https://api.vk.com/method/';
window.addEventListener('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.data.pluginMessage.type === 'getImageBytes') {
        let url = event.data.pluginMessage.url;
        try {
            yield fetch(url)
                .then(result => result.arrayBuffer())
                .then(a => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'));
        }
        catch (error) {
            console.error(error);
        }
    }
}));
function getData(method, options) {
    let esc = encodeURIComponent;
    let query = Object.keys(options)
        .map(key => esc(key) + '=' + esc(options[key]))
        .join('&');
    let url = API_URI + method + '?' + query + '&callback=jsonpCallback';
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
        document.head.appendChild(script);
    });
}
function Cell(props) {
    return (React.createElement("div", { className: "cell", onClick: props.onClick },
        React.createElement("div", { className: "icon icon--share" }),
        React.createElement("div", { className: "cell_main" }, props.name)));
}
class List extends React.Component {
    constructor() {
        super(...arguments);
        this.getFriends = (ACCESS_TOKEN, USER_ID) => {
            getData('friends.get', {
                'user_id': USER_ID,
                'order': 'random',
                'fields': 'photo_200',
                'count': '20',
                'access_token': ACCESS_TOKEN,
                'v': '5.103'
            })
                .then(result => {
                parent.postMessage({
                    pluginMessage: { type: 'data', data: result['items'], method: 'friends' }
                }, '*');
            })
                .catch(error => console.error({ error }));
        };
        this.getGroups = (ACCESS_TOKEN, USER_ID) => {
            let items;
            getData('groups.get', {
                'user_id': USER_ID,
                'fields': 'photo_200',
                'count': '100',
                'extended': '1',
                'access_token': ACCESS_TOKEN,
                'v': '5.103'
            }).then(result => {
                items = result['items'];
                items = shuffle(items);
                let arrRand = [];
                for (let i = 0; i < 100; i++) {
                    arrRand.splice(i, 0, String(items[i]));
                }
                parent.postMessage({
                    pluginMessage: { type: 'data', data: items, method: 'groups' }
                }, '*');
            })
                .catch(error => console.error({ error }));
        };
    }
    render() {
        return React.createElement("div", { className: "list" },
            React.createElement(Cell, { name: "\u0414\u0440\u0443\u0437\u044C\u044F", onClick: () => this.getFriends(this.props.access_token, this.props.user_id) }),
            React.createElement(Cell, { name: "\u0421\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u0430", onClick: () => this.getGroups(this.props.access_token, this.props.user_id) }));
    }
}
function AuthGreeting(props) {
    return (React.createElement("div", null,
        React.createElement("p", { className: "type type--pos-large-normal desc" }, "\u0427\u0442\u043E\u0431\u044B \u0432\u0441\u0442\u0430\u0432\u043B\u044F\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0437\u00A0\u0412\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0435, \u0412\u0430\u043C \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0438\u00A0\u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0443\u043F \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044E"),
        React.createElement("button", { className: "button button--secondary styledBtn", onClick: props.onClick }, "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F")));
}
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            ACCESS_TOKEN: null,
            USER_ID: null
        };
        this.auth = () => {
            authenticateAndGetToken()
                .then(data => {
                let resultToken = data.access_token;
                let resultID = data.user_id;
                setToken(resultToken);
                setUserID(resultID);
                this.setState({
                    ACCESS_TOKEN: resultToken,
                    USER_ID: resultID
                });
            });
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield getToken();
            const id = yield getUserID();
            this.setState({
                ACCESS_TOKEN: token,
                USER_ID: id
            });
        });
    }
    render() {
        const { ACCESS_TOKEN, USER_ID } = this.state;
        let content;
        if (ACCESS_TOKEN === undefined || USER_ID === undefined) {
            content = React.createElement(AuthGreeting, { onClick: this.auth });
        }
        else {
            content = React.createElement(List, { access_token: ACCESS_TOKEN, user_id: USER_ID });
        }
        return React.createElement("div", null, content);
    }
}
ReactDOM.render(React.createElement(App, null), document.getElementById('react-page'));
