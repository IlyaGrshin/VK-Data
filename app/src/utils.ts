export const config = {
  main: '↳ ',
  show: 'Show/',
  onlineBadge: 'x / Cell / Avatar Badge / Regular / ',
  image: 'Image',
  avatar: 'Avatar',
  hide: 'Hide',
  hideBadge: 'Hide Badge',
  online: 'Online',
  title: 'Title',
  subtitle: 'Subtitle',
  secondSubtitle: 'Second Subtitle'
};

const validShapeTypes = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'];

export function isShapeNode(node) {
  return validShapeTypes.indexOf(node.type) >= 0;
}

export function isTextNode(node) {
  return node.type === 'TEXT';
}

export function isFrameNode(node) {
  return node.type === 'FRAME';
}

export function isComponentOrInstance(node) {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

export function isFramelikeNode(node) {
  return isFrameNode(node) || isComponentOrInstance(node);
}

export function selectionContainsSettableLayers(selection) {
  let getConfigKey = function () {
    let keys = [];
    let conf = Object.keys(config);
    for (let key in conf) {
      keys.push(key);
    }
    return keys;
  };

  return selection.some((node) => node.name.startsWith(getConfigKey));
}

export function* walkTree(node) {
  yield node;
  const children = node.children;
  if (children) {
    for (const child of children) {
      yield* walkTree(child);
    }
  }
}

export function getToken() {
  return new Promise((resolve) => {
    parent.postMessage(
      {
        pluginMessage: { type: 'getToken' },
      },
      '*'
    );
    window.addEventListener('message', async (event) => {
      if (event.data.pluginMessage && event.data.pluginMessage.type === 'getToken') {
        resolve(event.data.pluginMessage.value);
      }
    });
  });
}

export function setToken(token: any) {
  parent.postMessage(
    {
      pluginMessage: { type: 'setToken', value: token },
    },
    '*'
  );
}

export function getUserID() {
  return new Promise((resolve) => {
    parent.postMessage(
      {
        pluginMessage: { type: 'getUserID' },
      },
      '*'
    );
    window.addEventListener('message', async (event) => {
      if (event.data.pluginMessage && event.data.pluginMessage.type === 'getUserID') {
        resolve(event.data.pluginMessage.value);
      }
    });
  });
}

export function setUserID(id: any) {
  parent.postMessage(
    {
      pluginMessage: { type: 'setUserID', value: id },
    },
    '*'
  );
}

export function getBannerShow() {
  return new Promise((resolve) => {
    parent.postMessage(
      {
        pluginMessage: { type: 'getBannerShow' },
      },
      '*'
    );
    window.addEventListener('message', async (event) => {
      if (event.data.pluginMessage && event.data.pluginMessage.type === 'getBannerShow') {
        resolve(event.data.pluginMessage.value);
      }
    });
  });
}

export function setBannerShow(value: any) {
  parent.postMessage(
    {
      pluginMessage: { type: 'setBannerShow', value: value },
    },
    '*'
  );
}

export function shuffle(array: any) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}