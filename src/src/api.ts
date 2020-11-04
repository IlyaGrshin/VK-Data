import { shuffle } from './utils'

const API_URI = 'https://api.vk.com/method/';

function getData(method: string, options: any) {
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
            if (data.error) console.log(data.error.error_msg) // TODO: access_token is expires
            resolve(data);
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url;

        document.head.appendChild(script);
    });
}

export function getFriends(ACCESS_TOKEN: string, USER_ID: number, order: string) {
    getData('friends.get', {
        user_id: USER_ID,
        order: order,
        fields: 'photo_200,photo_100,occupation,city,bdate,verified,online',
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

export function getGroups(ACCESS_TOKEN: string, USER_ID: number, order: string) {
    let items: [];
    const count = 100;

    getData('groups.get', {
        user_id: USER_ID,
        fields: 'photo_200,photo_100,activity,verified',
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

export function getByUserID(ACCESS_TOKEN: string, USER_ID: number) {
    getData('users.get', {
        user_ids: USER_ID,
        fields: 'photo_200,photo_100,occupation,city,bdate,verified,online',
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

export function getFriendsHints(ACCESS_TOKEN: string) {
    getData('search.getHints', {
        fields: 'photo_200,photo_100,occupation,city,bdate,verified,online',
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