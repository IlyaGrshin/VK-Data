var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const HOST = 'https://www.ilyagrshn.com';
export function authenticateAndGetToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const { read_key, write_key } = yield (yield fetch(HOST + '/keys')).json();
        let url = authUrl(HOST, write_key);
        window.open(url);
        let access_token;
        let user_id;
        while (true) {
            try {
                const json = yield (yield fetch(HOST + '/finish?read_key=' + encodeURIComponent(read_key))).json();
                if (json !== null) {
                    access_token = json.access_token;
                    user_id = json.user_id;
                    break;
                }
            }
            catch (e) {
                // console.error(e)
            }
            yield new Promise(resolve => setTimeout(resolve, 500 + 1000 * Math.random()));
        }
        return { access_token: access_token, user_id: user_id };
    });
}
function authUrl(host, write_key) {
    const APP_ID = '7433966';
    const SCOPE = 'offline,friends,groups,video';
    let url = 'https://oauth.vk.com/authorize' +
        '?client_id=' + encodeURIComponent(APP_ID) +
        '&redirect_uri=' + encodeURIComponent(host + '/callback') +
        '&display=page' +
        '&scope=' + encodeURIComponent(SCOPE) +
        '&response_type=token' +
        '&state=' + encodeURIComponent(write_key) +
        '&revoke=1';
    return url;
}
