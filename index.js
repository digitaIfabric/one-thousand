import OfflineRenderer from '@elemaudio/offline-renderer';
import { el } from '@elemaudio/core';
import pkg from 'wavefile';
import fs from 'fs';
import * as url from 'url';
import * as path from 'path';

Object.defineProperty(global, '__dirname', {
	__proto__: null,
	get: () => url.fileURLToPath(new URL('.', import.meta.url)),
});

const { WaveFile } = pkg;

let core = new OfflineRenderer();
let inputFilename = 'clouds.wav';

let gateLoop = el.train(0);
let VFS = {};
let inputWav = new WaveFile(fs.readFileSync(__dirname + 'Input/' + inputFilename));
VFS[`/virtual/path/L-${inputFilename}`] = inputWav.getSamples(false, Float32Array)[0];
VFS[`/virtual/path/R-${inputFilename}`] = inputWav.getSamples(false, Float32Array)[1];

// let audioL = el.sample({key: 'sl', path: `/virtual/path/L-${inputFilename}`, mode: 'loop', channel: 0, data: null, startOffset: 0, stopOffset: 0}, gateLoop, 1);
// let audioR = el.sample({key: 'sr', path: `/virtual/path/R-${inputFilename}`, mode: 'loop', channel: 1, data: null, startOffset: 0, stopOffset: 0}, gateLoop, 1);

const directoryPath = path.join(__dirname, 'IRs/');
let audioL = el.cycle(440);
let audioR = el.cycle(441);
let data = {};
let reverbs = [];
fs.readdir(directoryPath, async (err, filenames) => {
  filenames.forEach((filename) => {
    data[filename] = new WaveFile(fs.readFileSync(directoryPath + filename));
    VFS[`/virtual/path/L-${filename}`] = data[filename].getSamples(false, Float32Array)[0]; 
    VFS[`/virtual/path/R-${filename}`] = data[filename].getSamples(false, Float32Array)[1];
    reverbs.push([
        el.convolve({key: `L-${filename}`, path: `/virtual/path/L-${filename}`}, audioL),
        el.convolve({key: `R-${filename}`, path: `/virtual/path/L-${filename}`}, audioR)
    ])
  });
  await core.initialize({
    numInputChannels: 2,
    numOutputChannels: 2,
    sampleRate: 44100,
    virtualFileSystem: VFS
  });
  for (let ii = 0; ii < filenames.length; ii++){
    let inps = [
      new Float32Array(512 * 10),
      new Float32Array(512 * 10)
    ];
    let outs = [
      new Float32Array(512 * 10),
      new Float32Array(512 * 10)
    ];
    core.render(reverbs[ii][0], reverbs[ii][1]);
    core.process(inps, outs);
    let wav = new WaveFile();
    wav.fromScratch(2, 44100, '32f', outs);
    fs.writeFileSync(`Output/${ii}LR.wav`, wav.toBuffer());
  }
});