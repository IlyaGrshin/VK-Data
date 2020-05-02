var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const config = '__';
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
    return selection.some(node => node.name.startsWith(config));
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
export function getToken() {
    return new Promise((resolve, reject) => {
        parent.postMessage({
            pluginMessage: { type: 'getToken' },
        }, '*');
        window.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
            if (event.data.pluginMessage && event.data.pluginMessage.type === 'getToken') {
                resolve(event.data.pluginMessage.value);
            }
        }));
    });
}
export function setToken(token) {
    parent.postMessage({
        pluginMessage: { type: 'setToken', value: token }
    }, '*');
}
export function getUserID() {
    return new Promise((resolve, reject) => {
        parent.postMessage({
            pluginMessage: { type: 'getUserID' },
        }, '*');
        window.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
            if (event.data.pluginMessage && event.data.pluginMessage.type === 'getUserID') {
                resolve(event.data.pluginMessage.value);
            }
        }));
    });
}
export function setUserID(id) {
    parent.postMessage({
        pluginMessage: { type: 'setUserID', value: id }
    }, '*');
}
