import { config, walkTree, isFramelikeNode, selectionContainsSettableLayers } from './scripts/utils'

figma.showUI(__html__, { width: 300, height: 290 });

figma.ui.onmessage = async action => {
  switch (action.type) {
    case 'data':
      let selection = figma.currentPage.selection

      if (!selection || selection.length === 0) figma.notify('No selection');
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
      figma.clientStorage.getAsync('access_token')
        .then(value => {
          figma.ui.postMessage({ type: 'getToken', value })
        });
      break;

    case 'setToken':
      await figma.clientStorage.setAsync('access_token', action.value)
      break;

    case 'getUserID':
      figma.clientStorage.getAsync('user_id').then(value => {
        figma.ui.postMessage({ type: 'getUserID', value })
      });
      break;

    case 'setUserID':
      await figma.clientStorage.setAsync('user_id', action.value)
      break;

    case 'snackbar':
      figma.notify(action.text)
  }
}

async function applyLayerTransformationFromField(layer, value?, field?) {
  if (field.includes('Image')) {
    if (value.includes('camera_200.png') || value.includes('deactivated_200.png') || value.includes('community_200.png')) {
      value = require('./img/camera_200.png').default
    }
    await setBackgroundFillFromImageUrl(layer, value);
  }

  if (field.includes('Title')) {
    await setTextCharactersFromValue(layer, value);
  }

  if (field.includes('Subtitle') && !field.includes('Second Subtitle')) {
    await setTextCharactersFromValue(layer, value);
  }
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

  if (!settableLayers) figma.notify('No layers are prefixed with ' + config + ' in order to set data');

  for (let layer of settableLayers) {
    const field = layer.name.replace(config, '');

    if (field !== undefined) {
      // friends 
      if (field === 'Title' && method === 'friends') value = data['first_name'] + ' ' + data['last_name']
      if (field === 'Image' && method === 'friends') value = data['photo_200']
      if (field === 'Subtitle' && method === 'friends') {
        try {
          value = ' '
          if (data['city']['title']) value = data['city']['title']
          if (data['occupation']['name']) value = data['occupation']['name']
        } catch (e) {
          // console.log(e)
        }
      }

      // groups
      if (field === 'Title' && method === 'groups') value = data['name']
      if (field === 'Image' && method === 'groups') value = data['photo_200']
      if (field === 'Subtitle' && method === 'groups') value = data['activity']

      // user
      if (field === 'Title' && method === 'me') value = data['first_name'] + ' ' + data['last_name']
      if (field === 'Image' && method === 'me') value = data['photo_200']
      if (field === 'Subtitle' && method === 'friends') {
        try {
          value = ' '
          if (data['city']['title']) value = data['city']['title']
          if (data['occupation']['name']) value = data['occupation']['name']
        } catch (e) {
          // console.log(e)
        }
      }

      await applyLayerTransformationFromField(layer, value, field);
    }
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