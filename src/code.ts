import { config, isFramelikeNode, selectionContainsSettableLayers, walkTree } from './scripts/utils';

figma.showUI(__html__, { width: 300, height: 340 });

figma.ui.onmessage = async (action) => {
  switch (action.type) {
    case 'data':
      let selection = figma.currentPage.selection;
      if (!selection || selection.length === 0) figma.notify('No selection');

      if (selection.length === 1) {
        const current = selection[0] as FrameNode | InstanceNode | ComponentNode;

        if (isFramelikeNode(current)) {
          if (current.children.every(isFramelikeNode)) {
            const child = current.children;
            for (let i = 0; i < child.length; i++) {
              if (child[i].name === 'Layout') {
                const grandson = child[0] as FrameNode | InstanceNode | ComponentNode;

                for (let j = 0; j < grandson.children.length; j++) {
                  await transformNodeWithData(grandson.children[j], action.data[j], action.method);
                }
              } else {
                await transformNodeWithData(child[i], action.data[i], action.method);
              }
            }
          }
        }
      } else if (selection.every(isFramelikeNode)) {
        for (let i = 0; i < selection.length; i++) {
          await transformNodeWithData(selection[i], action.data[i], action.method);
        }
      } else if (selectionContainsSettableLayers(selection)) {
        for (let i = 0; i < selection.length; i++) {
          await transformNodeWithData(selection[i], action.data[i], action.method);
        }
      } else {
        console.log(selection);
      }
      break;

    case 'getToken':
      figma.clientStorage.getAsync('access_token').then((value) => {
        figma.ui.postMessage({ type: 'getToken', value });
      });
      break;

    case 'setToken':
      await figma.clientStorage.setAsync('access_token', action.value);
      break;

    case 'getUserID':
      figma.clientStorage.getAsync('user_id').then((value) => {
        figma.ui.postMessage({ type: 'getUserID', value });
      });
      break;

    case 'setUserID':
      await figma.clientStorage.setAsync('user_id', action.value);
      break;

    case 'snackbar':
      figma.notify(action.text);
  }
};

async function applyLayerTransformationFromField(layer, value?, field?) {
  if (field.includes('Image')) {
    if (
      value.includes('camera_200.png') ||
      value.includes('deactivated_200.png') ||
      value.includes('community_200.png')
    ) {
      value = require('./img/camera_200.png').default;
    }
    await setBackgroundFillFromImageUrl(layer, value);
  }

  if (field.includes('Title') && !field.includes('Hide')) {
    await setTextCharactersFromValue(layer, value);
  }

  if (field.includes('Subtitle') && !field.includes('Second Subtitle') && !field.includes('Hide')) {
    await setTextCharactersFromValue(layer, value);
  }

  if (field.includes('Hide Badge')) {
    layer.visible = value;
  }

  if (field.includes('Online')) {
    layer.visible = value;
  }
}

async function transformNodeWithData(node, data, method) {
  let walker = walkTree(node);
  let settableLayers = [];
  let res;
  let value;

  while (!(res = walker.next()).done) {
    let node = res.value;
    if (
      node.name.startsWith(config.main) ||
      node.name.startsWith(config.show) ||
      node.name.startsWith(config.onlineBadge)
    ) {
      settableLayers.push(node);
    }
  }

  if (!settableLayers)
    figma.notify('No layers are prefixed with ' + config.main + 'or' + config.show + ' in order to set data');

  for (let layer of settableLayers) {
    if (layer.name.includes(config.main)) {
      const field = layer.name.replace(config.main, '');

      // friends
      if (field === 'Title' && method === 'person') value = data['first_name'] + ' ' + data['last_name'];
      if (field === 'Image' && method === 'person') value = data['photo_200'];
      if (field === 'Subtitle' && method === 'person') {
        try {
          value = ' ';
          if (data['city']['title']) value = data['city']['title'];
          if (data['occupation']['name']) value = data['occupation']['name'];
        } catch (e) {
          // console.log(e)
        }
      }

      // groups
      if (field === 'Title' && method === 'groups') value = data['name'];
      if (field === 'Image' && method === 'groups') value = data['photo_200'];
      if (field === 'Subtitle' && method === 'groups') value = data['activity'];

      // search
      if (field === 'Title' && method === 'search')
        value = data['profile']['first_name'] + ' ' + data['profile']['last_name'];
      if (field === 'Image' && method === 'search') value = data['profile']['photo_200'];
      if (field === 'Subtitle' && method === 'search') {
        try {
          value = ' ';
          if (data['profile']['city']['title']) value = data['profile']['city']['title'];
          if (data['profile']['occupation']['name']) value = data['profile']['occupation']['name'];
        } catch (e) {
          // console.log(e)
        }
      }

      await applyLayerTransformationFromField(layer, value, field);
    }

    if (layer.name.includes(config.show)) {
      const field = layer.name.replace(config.show, '');

      if (method === 'search') value = field === 'Hide Badge' && data['profile']['verified'] == 1 ? true : false;
      else value = field === 'Hide Badge' && data['verified'] == 1 ? true : false;

      await applyLayerTransformationFromField(layer, value, field);
    }

    if (layer.name.includes(config.onlineBadge)) {
      const field = layer.name.replace(config.onlineBadge, '');
      if (method === 'person') value = field.includes('Online') && data['online'] == 1 ? true : false;
      if (method === 'search') value = field.includes('Online') && data['profile']['online'] == 1 ? true : false;

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
  return new Promise((res) => {
    figma.ui.once('message', (value) => {
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
        imageTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
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
