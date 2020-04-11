figma.showUI(__html__, { width: 400, height: 400 });

let indexGlobal = 0;
figma.ui.onmessage = async action => {
  const selection = figma.currentPage.selection
  console.log('selection: ' + selection)
  selection.forEach((item, index) => {
    const current = item as FrameNode | InstanceNode | ComponentNode
    const nodes = current.children;

    //console.log(' ')
    //console.log('nodeIndex: ' + index)
    //console.log('curr: ' + current)
    //console.log('nodes: ' + nodes)
 
    nodes.forEach(node => {
      transformNodeWithData(node, action.data[index])
    })
  })
  console.log('indexGlobal: ' + indexGlobal++);
}

function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child);
    }
  }
}

function layerConsumesNestedData(layer) {
  let config = '__'
  const parts = layer.name.split(' ');
  return parts.some(part => part.includes(config) && part.includes('.'));
}

function isFrameNode(node) {
  return node.type === 'FRAME';
}

function isComponentOrInstance(node) {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

function isFramelikeNode(node) {
  return isFrameNode(node) || isComponentOrInstance(node)
}

async function applyLayerTransformationFromField(layer, field, value?, data?) {
  if (field.includes('photo_200')) {
    //if (!isShapeNode(layer)) return;
    await setBackgroundFillFromImageUrl(layer, value);
  }
}

async function transformNodeWithData(node, data) {
  let config = '__'
  let walker = walkTree(node);
  let settableLayers = [];
  let res;

  while (!(res = walker.next()).done) {
    let node = res.value;
    if (node.name.startsWith(config)) {
      settableLayers.push(node);
    }
  }

  if (!settableLayers) figma.notify('No layers are prefixed with __ in order to set data');
  for (let layer of settableLayers) {
    const field = layer.name.replace(config, '');
    if (data.hasOwnProperty(field)) {
      const value = data[field];
      await applyLayerTransformationFromField(layer, field, value, data);
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