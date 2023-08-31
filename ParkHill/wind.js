
const f = 1760;
const a = 2; // ms
const s = 1; // ms
const r = 100; // ms
const maxAmp = .9;

let ac, ding;

class SineGenerator {

  constructor (sr, f) {
    const sampleAngle = 2*Math.PI*f/sr;
    this.dc = Math.cos(sampleAngle);
    this.ds = Math.sin(sampleAngle);
    this.cos = 1;
    this.value = 0;
  }

  step() {
    let c = this.cos*this.dc - this.value*this.ds;
    this.value = this.cos*this.ds + this.value*this.dc;
    this.cos = c;
  }
  
}

class TriangleGenerator {

  constructor (sr, f) {
    const period = sr/f;
    this.increment = 4/period;
    this.sign = 1;
    this.value = 0;
  }

  step() {
    this.value += this.sign*this.increment;
    if (this.value > 1) {
      this.sign = -1;
      this.value = 2-this.value;
    }
    if (this.value < -1) {
      this.sign = 1;
      this.value = -2-this.value;
    }
  }

}

const makeDing = (sr, generator) => {
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
  for (i=0; i<attackSamples; i++, p++) {
    data[p] = amp * generator.value;
    generator.step();
    amp += ampInc;
  }
  for (i=0; i<sustainSamples; i++, p++) {
    data[p] = maxAmp * generator.value;
    generator.step();
  }
  amp = maxAmp;
  for (i=0; i<releaseSamples; i++, p++) {
    data[p] = amp * generator.value;
    generator.step();
    amp *= relMul;
  }
};

let startTime = 0;

const beat = 60/71.5;

const timeline = [
  {t:4*beat, p:.05},
  {t:8*beat, p:.005},
  {t:10*beat, p:.03},
  {t:12*beat, p:.004}
];

const prob = (t) => {
  let lastP = 0;
  let lastT = 0;
  for (let cp of timeline) {
    if (t < cp.t) {
      let ratio = (t-lastT)/(cp.t-lastT);
      if (cp.p > lastP) {
	ratio = ratio*ratio;
      } else {
	ratio = 1-(1-ratio)*(1-ratio);
      }
      return lastP + (cp.p-lastP)*ratio;
    } else {
      lastT = cp.t;
      lastP = cp.p;
    }
  }
  return lastP;
};


const chords = [
  
];

const chord = (t) => {

};

const stereoWidth = .7;


const randSign = () => {
  return (Math.random() < .5) ? -1 : 1;
};


const randBm = (stretch) => {
  stretch = stretch ?? 1;
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = stretch*num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randBm(); // resample between 0 and 1
  return num;
};

const playDing = (time, amp, speed, speedRand) => {
  if (Math.random() > .7) speed *= 7/6;
  let n = new AudioBufferSourceNode(ac, {
    buffer: ding,
    playbackRate: speed*(1-speedRand+2*speedRand*Math.random())
  });
  let g = new GainNode(ac, {
    gain: amp
  });
  let p = new StereoPannerNode(ac, {
    pan: randSign() * stereoWidth * randBm()
  });
  n.connect(p);
  p.connect(g);
  g.connect(ac.destination);
  n.addEventListener('ended', () => {
    n.disconnect();
    p.disconnect();
    g.disconnect();
  });
  n.start(time);
};


const init = () => {
  ac = new AudioContext();
  makeDing(ac.sampleRate, new TriangleGenerator(ac.sampleRate, f));
  startTime = Date.now();
};


const run = () => {
  let t = (Date.now()-startTime)/1000;
  let p = prob(t);
  for (let i=0; i<1000; i++) {
    if (Math.random() < p) {
      playDing(ac.currentTime+.1+.1*Math.random(), .005, 1, .03);
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
