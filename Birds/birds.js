let ac;

const samples = [
  'samples/reverb/',
  'samples/crackle_1.wav',
  'samples/crackle_2.wav',
  'samples/crackle_3.wav',
  'samples/crackle_4.wav',
  'samples/crackle_5.wav'
];

let reverbSample, sounds;

const load = () => new Promise((resolve, reject) => {
  loadAudio(samples).then((audioBuffers) => {
    reverbSample = audioBuffers[0];
    sounds = [];
    for (let i=1; i<audioBuffers.length; i++)
      sounds.push(audioBuffers[i]);
    resolve();
  });
});

function init() {
  ac.resume();
  nextTime = ac.currentTime+.05;
  beat = subBeat = 0;
}

function run() {
  let index = 8*beat + subBeat;

  if (index==0 && bassBuffers[activePattern]) {
    let n = new AudioBufferSourceNode(ac, { buffer: bassBuffers[activePattern] });
    let g = new GainNode(ac, { gain: dbToAmp(-12) });
    n.connect(g);
    g.connect(ac.destination);
    n.addEventListener('ended', () => {
	n.disconnect();
      g.disconnect();
    });
    n.start(nextTime);
  }
  
  patterns[activePattern].forEach((c,i) => {
    if (c[index].active) {
      let n = new AudioBufferSourceNode(ac, {
	buffer: allSamples[i].buffer,
	playbackRate: Math.pow(2, c[index].semitoneShift/12)
      });
      let g = new GainNode(ac, {
	gain: dbToAmp(c[index].dbGain)
      });
      let p = new StereoPannerNode(ac, {
	pan: c[index].pan
      });
      n.connect(g);
      g.connect(p);
      p.connect(ac.destination);
      n.addEventListener('ended', () => {
	n.disconnect();
	g.disconnect();
	p.disconnect();
      });
      n.start(nextTime);
    }
  });
  for (let d of beatDivs) {
    d.classList.remove('active');
  }
  beatDivs[beat].classList.add('active');
  for (let d of subBeatDivs) {
    d.classList.remove('active');
  }
  subBeatDivs[8*beat + subBeat].classList.add('active');
  nextTime += subBeatDuration;
  subBeat++;
  if (subBeat == 8) {
    subBeat = 0;
    beat++;
  }
  if (beat == 4) {
    beat = 0;
  }
  setTimeout(run, 1000*(nextTime-ac.currentTime-.05));
}


window.addEventListener('DOMContentLoaded', () => {
  load().then(() => {
    let button = document.createElement('button');
    button.innerHTML = 'Play';
    document.body.appendChild(button);
    button.addEventListener('click', () => {
      document.body.removeChild(button);
      init();
      run();
    });
  });
});


function exportAudio () {
  const totalDuration = 32*barDuration;
  const sr = 48000;
  let oac = new OfflineAudioContext({
    nbChannels: 2,
    sampleRate: sr,
    length: sr*totalDuration
  });
  patterns.forEach((pattern, pNum) => {
    let t0 = pNum*barDuration;
    pattern.forEach((sampleLine, sNum) => {
      sampleLine.forEach((cell, cNum) => {
	if (cell.active) {
	  let t = t0 + cNum*subBeatDuration;
	  let n = new AudioBufferSourceNode(oac, {
	    buffer: allSamples[sNum].buffer,
	    playbackRate: Math.pow(2, cell.semitoneShift/12)
	  });
	  let g = new GainNode(oac, {
	    gain: dbToAmp(cell.dbGain)
	  });
	  let p = new StereoPannerNode(oac, {
	    pan: cell.pan
	  });
	  n.connect(g);
	  g.connect(p);
	  p.connect(oac.destination);
	  n.start(t);
	}
      });
    });
  });
  oac.startRendering().then((buffer) => {
    let max = 0;
    for (let c=0; c<buffer.numberOfChannels; c++) {
      let data = buffer.getChannelData(c);
      for (let v of data) {
	if (Math.abs(v) > max) max = Math.abs(v);
      }
    }
    console.log(max);
    let amp = .95/max;
    for (let c=0; c<buffer.numberOfChannels; c++) {
      let data = buffer.getChannelData(c);
      for (let i=0; i<buffer.length; i++) {
	data[i] *= amp;
      }
    }
    new WaveWriter(buffer).saveWaveFile('rendered.wav');
  });
}

