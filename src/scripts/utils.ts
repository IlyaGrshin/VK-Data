export const config = '__'

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
  return isFrameNode(node) || isComponentOrInstance(node)
}

export function selectionContainsSettableLayers(selection) {
  return selection.some(node => node.name.startsWith(config))
}

export function getRandomElementFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child);
    }
  }
}

export function getToken () {
  return new Promise((resolve, reject) => {
      parent.postMessage({
          pluginMessage: { type: 'getToken' },
      }, '*')
      window.addEventListener('message', async event => {
          if (event.data.pluginMessage && event.data.pluginMessage.type === 'getToken') {
              resolve(event.data.pluginMessage.value)
          }
      })
  })
}

export function setToken (token: any) {
  parent.postMessage({ 
      pluginMessage: { type: 'setToken', value: token }
  }, '*')
}

export function getUserID () {
  return new Promise((resolve, reject) => {
      parent.postMessage({
          pluginMessage: { type: 'getUserID' },
      }, '*')
      window.addEventListener('message', async event => {
          if (event.data.pluginMessage && event.data.pluginMessage.type === 'getUserID') {
              resolve(event.data.pluginMessage.value)
          }
      })
  })
}

export function setUserID (id: any) {
  parent.postMessage({ 
      pluginMessage: { type: 'setUserID', value: id }
  }, '*')
}