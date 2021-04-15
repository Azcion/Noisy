const alea = new Alea();
let seed;
let simplex;
let worley;

window.onload = function() {
	f();
};

function f() {
	seed = alea();
	console.log(seed);
	simplex = new SimplexNoise(seed);
	worley = new WorleyNoise({numPoints: 10, seed: seed});
	let w = window.innerWidth - 50;
	let h = window.innerHeight - 35;
	let buffer = new Uint8ClampedArray(w * h * 4);
	let scale = 0.005;

	for (let y = 0; y < h; ++y) {
		for (let x = 0; x < w; ++x) {
			let xr = x / w;
			let yr = y / h;
			let a = 1 - worley.getEuclidean({x: xr, y: yr}, 1);
			let b = sumOctaves(x, y, 6, .5, scale, 0, 1);
			let v = (a * 2) * b - .5;
			let d = 1.125;
			let f = (1 - xr * xr + xr - d) + (1 - yr * yr + yr - d);
			f *= 7.5;
			f = f < 0 ? 0 : f;
			v *= f;
			v *= 255;
			let p = (y * w + x) * 4;
			buffer[p] = v;
			buffer[p+1] = v;
			buffer[p+2] = v;
			buffer[p+3] = 255;
		}
	}

	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	canvas.width = w;
	canvas.height = h;

	let imgData = ctx.createImageData(w, h);
	imgData.data.set(buffer);
	ctx.putImageData(imgData, 0, 0);

	let dataUri = canvas.toDataURL();
	let body = document.getElementsByTagName('body')[0];
	body.setAttribute('style', `background-image: url(${dataUri});`);
}

function sumOctaves(x, y, iterations, persistence, scale, low, high) {
	let maxAmp = 0;
	let amp = 1;
	let freq = scale;
	let noise = 0;

	for (let i = 0; i < iterations; ++i) {
		noise += simplex.noise2D(x * freq, y * freq) * amp;
		maxAmp += amp;
		amp *= persistence;
		freq *= 2.5;
	}

	noise /= maxAmp;
	noise = noise * (high - low) / 2 + (high + low) / 2;

	return noise;
}