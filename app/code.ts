import { config, isFramelikeNode, selectionContainsSettableLayers, walkTree, isEmpty } from './src/utils';

figma.showUI(__html__, {
	width: 300,
	height: 316,
	themeColors: true,
});

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
	}
};

async function applyLayerTransformationFromField(layer, value?, field?) {
	if (field.includes('Image') || field.includes('Avatar')) {
		if (
			value.includes('camera_200.png') ||
			value.includes('deactivated_200.png') ||
			value.includes('community_200.png') ||
			value.includes('deactivated_kis_200.png')
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

	if (!settableLayers) {
		figma.notify('No layers are prefixed with ' + config.main + 'or' + config.show + ' in order to set data');
	}

	for (let layer of settableLayers) {
		let methodPerson = method.includes('person');
		let methodGroups = method.includes('groups');
		let methodSearch = method.includes('search');

		if (layer.name.includes(config.main)) {
			const field = layer.name.replace(config.main, '');

			let fieldTitle = field.includes('Title');
			let fieldSubtitle = field.includes('Subtitle');
			let fieldAvatar = field.includes('Avatar');
			let fieldImage = field.includes('Image');

			// friends
			if (methodPerson) {
				if (fieldTitle) value = `${data.first_name} ${data.last_name}`;
				if (fieldImage || fieldAvatar) value = isEmpty(data.photo_200) ? data.photo_100 : data.photo_200;
				if (fieldSubtitle) {
					try {
						value = ` `;
						if (data.city.title) value = data.city.title;
						if (data.occupation.name) value = data.occupation.name;
					} catch (e) {
						// console.log(e)
					}
				}
			}

			// groups
			if (methodGroups) {
				if (fieldTitle) value = data.name;
				if (fieldImage || fieldAvatar) value = isEmpty(data.photo_200) ? data.photo_100 : data.photo_200;
				if (fieldSubtitle) value = data.activity;
			}

			// search
			if (methodSearch) {
				if (fieldTitle) value = `${data.profile.first_name} ${data.profile.last_name}`;
				if (fieldImage || fieldAvatar) value = isEmpty(data.profile.photo_200) ? data.profile.photo_100 : data.profile.photo_200;
				if (fieldSubtitle) {
					try {
						value = ` `;
						if (data.profile.city.title) value = data.profile.city.title;
						if (data.profile.occupation.name) value = data.profile.occupation.name;
					} catch (e) {
						// console.log(e)
					}
				}
			}

			await applyLayerTransformationFromField(layer, value, field);
		}

		// verified
		if (layer.name.includes(config.show)) {
			const field = layer.name.replace(config.show, '');

			if (methodSearch) value = field.includes('Hide Badge') && data.profile.verified == 1 ? true : false;
			else value = field.includes('Hide Badge') && data.verified == 1 ? true : false;

			await applyLayerTransformationFromField(layer, value, field);
		}

		// online
		if (layer.name.includes(config.onlineBadge)) {
			const field = layer.name.replace(config.onlineBadge, '');
			
			if (field.includes('Online')) {
				if (methodPerson) value = data.online == 1 ? true : false;
				if (methodSearch) value = data.profile.online == 1 ? true : false;
				if (methodGroups) value = false;
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
