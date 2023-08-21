
const f = 7040;
const a = 3; // ms
const s = 3; // ms
const r = 20; // ms
const maxAmp = .9;

let ac, ding;

const makeDing = (sr) => {
  let sampleAngle = 2*Math.PI*f/sr;
  let dc = Math.cos(sampleAngle);
  let ds = Math.sin(sampleAngle);
  let cos = 1;
  let sin = 0;
  let amp = 0;
  let attackSamples = Math.round(a * sr / 1000);
  let ampInc = maxAmp/attackSamples;
  let sustainSamples = Math.round(s * sr / 1000);
  let releaseSamples = Math.round(r *sr / 1000);
  let relMul = Math.pow(.001, 1/releaseSamples);
  ding = new AudioBuffer({
    length: attackSamples + sustainSamples + releaseSamples,
    numberOfChannels: 1,
    sampleRate: sr
  });
  let data = ding.getChannelData(0);
  let i, p = 0;
  const updateSin = () => {
    let c = cos*dc - sin*ds;
    sin = cos*ds + sin*dc;
    cos = c;
  };
  for (i=0; i<attackSamples; i++, p++) {
    data[p] = amp * sin;
    updateSin();
    amp += ampInc;
  }
  for (i=0; i<sustainSamples; i++, p++) {
    data[p] = maxAmp * sin;
    updateSin();
  }
  amp = maxAmp;
  for (i=0; i<releaseSamples; i++, p++) {
    data[p] = amp * sin;
    updateSin();
    amp *= relMul;
  }
};

const playDing = (time, amp, speed, speedRand) => {
  let n = new AudioBufferSourceNode(ac, {
    buffer: ding,
    playbackRate: speed*(1-speedRand+2*speedRand*Math.random())
  });
  let g = new GainNode(ac, {
    gain: amp
  });
  n.connect(g);
  g.connect(ac.destination);
  n.addEventListener('ended', () => {
    n.disconnect();
    g.disconnect();
  });
  n.start(time);
};

let startTime = 0;

const init = () => {
  ac = new AudioContext();
  makeDing(ac.sampleRate);
  startTime = Date.now();
};



const run = () => {
  let t = Date.now()-startTime;
  let p = t / 1000000;
  for (let i=0; i<1000; i++) {
    if (Math.random() < p) {
      playDing(ac.currentTime+.1+.1*Math.random(), .001, 1, .1);
    }
  }
  requestAnimationFrame(run);
};


window.addEventListener('DOMContentLoaded', () => {
  let button = document.createElement('button');
  button.innerHTML = 'Play';
  document.body.appendChild(button);
  button.addEventListener('click', () => {
    document.body.removeChild(button);
    init();
    run();
  });
});
