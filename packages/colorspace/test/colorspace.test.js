require('source-map-support').install();

const test = require('tape');

const { Container } = require('@gltf-transform/core');
const { colorspace } = require('../');

test('@gltf-transform/colorspace', t => {
	const input = [ 0.25882352941176473, 0.5215686274509804, 0.9568627450980393 ]; // sRGB
	const expected = [ 0.054480276435339814, 0.23455058215026167, 0.9046611743890203 ]; // linear

	const container = new Container();
	const mesh = container.createMesh('test-mesh');

	const primitive1 = container.createPrimitive();
	const primitive2 = container.createPrimitive();
	mesh.addPrimitive(primitive1);
	mesh.addPrimitive(primitive2);

	const accessor1 = container.createAccessor('#1');
	const accessor2 = container.createAccessor('#2');
	accessor1.setType('VEC3').setArray(new Float32Array([...input, ...input]))
	accessor2.setType('VEC4').setArray(new Float32Array([...input, 0.5]));

	primitive1
		.setAttribute('COLOR_0', accessor1)
		.setAttribute('COLOR_1', accessor2);
	primitive2
		.setAttribute('COLOR_0', accessor1)

	colorspace({inputEncoding: 'sRGB'})(container);

	let actual;

	actual = primitive1.getAttribute('COLOR_0').getArray();
	t.equals(actual[0].toFixed(3), expected[0].toFixed(3), 'prim1.color1[0].r');
	t.equals(actual[1].toFixed(3), expected[1].toFixed(3), 'prim1.color1[0].g');
	t.equals(actual[2].toFixed(3), expected[2].toFixed(3), 'prim1.color1[0].b');
	t.equals(actual[3].toFixed(3), expected[0].toFixed(3), 'prim1.color1[1].r');
	t.equals(actual[4].toFixed(3), expected[1].toFixed(3), 'prim1.color1[1].g');
	t.equals(actual[5].toFixed(3), expected[2].toFixed(3), 'prim1.color1[1].b');

	actual = primitive1.getAttribute('COLOR_1').getArray();
	t.equals(actual[0].toFixed(3), expected[0].toFixed(3), 'prim1.color2[0].r');
	t.equals(actual[1].toFixed(3), expected[1].toFixed(3), 'prim1.color2[0].g');
	t.equals(actual[2].toFixed(3), expected[2].toFixed(3), 'prim1.color2[0].b');
	t.equals(actual[3].toFixed(3), '0.500', 'prim1.color2[0].a');

	t.deepEquals(
		primitive1.getAttribute('COLOR_0'),
		primitive2.getAttribute('COLOR_0'),
		'shared COLOR_0 accessor'
	);

	t.end();
});
