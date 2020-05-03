var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config, walkTree, isFramelikeNode, selectionContainsSettableLayers } from './scripts/utils';
figma.showUI(__html__, { width: 300, height: 400 });
figma.ui.onmessage = (action) => __awaiter(void 0, void 0, void 0, function* () {
    switch (action.type) {
        case 'data':
            let selection = figma.currentPage.selection;
            if (!selection || selection.length === 0)
                figma.notify('No selection');
            if (selection.length === 1) {
                for (let i = 0; i < selection.length; i++) {
                    yield transformNodeWithData(selection[i], action.data[i], action.method);
                }
            }
            else if (selection.every(isFramelikeNode)) {
                for (let i = 0; i < selection.length; i++) {
                    yield transformNodeWithData(selection[i], action.data[i], action.method);
                }
            }
            else if (selectionContainsSettableLayers(selection)) {
                for (let i = 0; i < selection.length; i++) {
                    yield transformNodeWithData(selection[i], action.data[i], action.method);
                }
            }
            else {
                console.log(selection);
            }
            break;
        case 'getToken':
            figma.clientStorage.getAsync('access_token')
                .then(value => {
                figma.ui.postMessage({ type: 'getToken', value });
            });
            break;
        case 'setToken':
            yield figma.clientStorage.setAsync('access_token', action.value);
            break;
        case 'getUserID':
            figma.clientStorage.getAsync('user_id').then(value => {
                figma.ui.postMessage({ type: 'getUserID', value });
            });
            break;
        case 'setUserID':
            yield figma.clientStorage.setAsync('user_id', action.value);
            break;
    }
});
function applyLayerTransformationFromField(layer, value, field) {
    return __awaiter(this, void 0, void 0, function* () {
        if (field.includes('Image')) {
            if (value.includes('camera_200.png') || value.includes('deactivated_200.png') || value.includes('community_200.png')) {
                value = require('./img/camera_200.png').default;
            }
            yield setBackgroundFillFromImageUrl(layer, value);
        }
        if (field.includes('Title')) {
            yield setTextCharactersFromValue(layer, value);
        }
    });
}
function transformNodeWithData(node, data, method) {
    return __awaiter(this, void 0, void 0, function* () {
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
        if (!settableLayers)
            figma.notify('No layers are prefixed with ' + config + ' in order to set data');
        for (let layer of settableLayers) {
            const field = layer.name.replace(config, '');
            if (field !== undefined) {
                if (field === 'Title' && method === 'friends')
                    value = data['first_name'] + ' ' + data['last_name'];
                if (field === 'Title' && method === 'groups')
                    value = data['name'];
                if (field === 'Image')
                    value = data['photo_200'];
                yield applyLayerTransformationFromField(layer, value, field);
            }
        }
        return;
    });
}
function updateTextLayer(layer, update) {
    layer = Object.assign(layer, update);
}
function setTextCharactersFromValue(layer, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof value === 'number') {
            value = String(value.toLocaleString());
        }
        yield figma.loadFontAsync(layer.fontName);
        if (!value || value.length === 0) {
            updateTextLayer(layer, { visible: false });
        }
        else {
            updateTextLayer(layer, { characters: value, visible: true });
        }
    });
}
function getImageBytesFromUrl(url) {
    figma.ui.postMessage({ type: 'getImageBytes', url });
    return new Promise(res => {
        figma.ui.once('message', value => {
            let data = value;
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
function setBackgroundFillFromImageUrl(layer, url) {
    return __awaiter(this, void 0, void 0, function* () {
        layer.fills = yield getImageBytesFromUrl(url);
    });
}
