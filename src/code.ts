import { config, walkTree, isFramelikeNode, selectionContainsSettableLayers, isShapeNode, isTextNode } from './scripts/utils'

figma.showUI(__html__, { width: 400, height: 400 });

figma.ui.onmessage = async action => {
  switch(action.type) {
    case 'data':
      let selection = figma.currentPage.selection

      if (!selection || selection.length === 0) console.log('No selection');
      if (selection.length === 1) {
        for (let i = 0; i < selection.length; i++) {
          await transformNodeWithData(selection[i], action.data[i], action.method)
        }
      }
      else if (selection.every(isFramelikeNode)) { 
        for (let i = 0; i < selection.length; i++) {
          await transformNodeWithData(selection[i], action.data[i], action.method)
        }
      }
      else if (selectionContainsSettableLayers(selection)) { 
        for (let i = 0; i < selection.length; i++) {
          await transformNodeWithData(selection[i], action.data[i], action.method)
        }
      } else { 
        console.log(selection)
      }
      break;

    case 'getToken':
      figma.clientStorage.getAsync('access_token_test')
      .then(value => {
        figma.ui.postMessage({type: 'getToken', value})
      });
      break;

    case 'setToken':
      await figma.clientStorage.setAsync('access_token_test', action.value)
      break;

    case 'getUserID':
      figma.clientStorage.getAsync('user_id_test').then(value => {
        figma.ui.postMessage({type: 'getUserID', value})
      });
      break;

    case 'setUserID':
      await figma.clientStorage.setAsync('user_id_test', action.value)
      break;
  }
}

async function applyLayerTransformationFromField(layer, value?, field?) {
  if (field.includes('avatar')) {
    await setBackgroundFillFromImageUrl(layer, value);
  }

  if (field.includes('name')) {
    if (!isTextNode(layer)) return;
    await setTextCharactersFromValue(layer, value);
  }

  if (!isTextNode(layer)) return;
  await setTextCharactersFromValue(layer, value);
}

async function transformNodeWithData(node, data, method) {
  let walker = walkTree(node);
  let settableLayers = [];
  let res;
  let value;

  while (!(res = walker.next()).done) {
    let node = res.value;
    if (node.name.startsWith(config)) {
      settableLayers.push(node);
    }
  }

  if (!settableLayers) figma.notify('No layers are prefixed with __ in order to set data');

  for (let layer of settableLayers) {
      const field = layer.name.replace(config, '');
      if (field === 'name') {
        if (method === 'friends') value = data['first_name'] + ' ' + data['last_name']
        if (method === 'groups') value = data['name']
      } else if (field === 'avatar') value = data['photo_200']
      await applyLayerTransformationFromField(layer, value, field);
  }

  return;
}

function updateTextLayer(layer, update) {
  layer = Object.assign(layer, update);
}

async function setTextCharactersFromValue(layer, value) {
  if (typeof value === 'number') {
    value = String(value.toLocaleString());
  }

  await figma.loadFontAsync(layer.fontName);
  if (!value || value.length === 0) {
    updateTextLayer(layer, { visible: false });
  } else {
    updateTextLayer(layer, { characters: value, visible: true });
  }
}

function getImageBytesFromUrl(url) {
  figma.ui.postMessage({ type: 'getImageBytes', url });
  return new Promise(res => {
    figma.ui.once('message', value => {
      let data = value as Uint8Array;
      let imageHash = figma.createImage(new Uint8Array(data)).hash;

      const newFill = {
        type: 'IMAGE',
        filters: {
          contrast: 0,
          exposure: 0,
          highlights: 0,
          saturation: 0,
          shadows: 0,
          temperature: 0,
          tint: 0,
        },
        imageHash,
        imageTransform: [[1, 0, 0], [0, 1, 0]],
        opacity: 1,
        scaleMode: 'FILL',
        scalingFactor: 0.5,
        visible: true,
      };

      res([newFill]);
    });
  });
}

async function setBackgroundFillFromImageUrl(layer, url) {
  layer.fills = await getImageBytesFromUrl(url);
}