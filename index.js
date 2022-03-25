import OfflineRenderer from '@elemaudio/offline-renderer';
import { el } from '@elemaudio/core';

let core = new OfflineRenderer({
  numInputChannels: 1,
  numOutputChannels: 1,
  sampleRate: 44100,
});

// One channel in and out, full of zeros
let inps = [new Float32Array(512 * 10)];
let outs = [new Float32Array(512 * 10)];

// Render your graph
core.render(el.mul(2, 3));

// Process the audio. Afterwards, `outs` contains the raw
// audio data resulting in the offline process.
core.process(inps, outs);

// Now save `outs` to a wav file or whatver you like!