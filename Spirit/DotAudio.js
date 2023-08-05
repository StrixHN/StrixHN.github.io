
class DotAudio {

  dot = null;
  oscillator = null;
  filter = null;
  gain = null;

  baseF = 110;
  

  constructor(dot) {
    this.dot = dot;
    this.oscillator = new OscillatorNode(DotAudio.ac, {
      type: 'sawtooth',
      frequency: this.baseF,
      channelCount: 1,
    });
    this.filter = new BiquadFilterNode(DotAudio.ac, {
      type: 'lowpass',
      frequency: 4*this.baseF,
      channelCount: 1
    });
    this.gain = new GainNode(DotAudio.ac, {
      channelCount: 1,
      gain: 0
    });
    this.panner = new StereoPannerNode(DotAudio.ac, {
      pan: 0
    });
    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(DotAudio.ac.destination);
    this.oscillator.start();
    DotAudio.allSynths.push(this);
  }

  update() {
    if (this.dyingCount) {
      this.gain.value = this.gain.value * 0.9;
      this.dyingCount--;
      if (this.dyingCount == 0) {
	this.oscillator.stop();
	this.oscillator.disconnect();
	this.filter.disconnect();
	this.gain.disconnect();
	DotAudio.removeSynth(this);
      }
    } else {
      let f = 27.5*Math.pow(2, (76-Math.round(this.dot.weight/1.8))/12);
      if (f<27.5) f = 27.5;
      let ff = f*(1+1.4*Math.sqrt(this.dot.f[0]*this.dot.f[0] + this.dot.f[1]*this.dot.f[1]));
      if (ff<f) ff = f;
      if (ff > 20000) ff = 20000;
      let g = .00001*Math.sqrt(Math.pow(this.dot.weight, 1.5)*(this.dot.sx*this.dot.sx + this.dot.sy*this.dot.sy));
      if (g < .001) g = .001;
      if (g > .5) g = .5;
      this.oscillator.frequency.value = f;
      // Timbre
      this.filter.frequency.value = ff;
      // Amplitude
      this.gain.gain.value = g;
      // console.log(this.oscillator.frequency.value, this.filter.frequency.value, this.gain.gain.value);
      this.panner.pan.value = (this.dot.x-window.innerWidth/2)/(2*window.innerWidth);
    }
  }

  kill () {
    this.dyingCount = 50;
  }

  
}

DotAudio.ac = null;

DotAudio.allSynths = [];

DotAudio.start = () => {
  DotAudio.ac = new AudioContext();
};

DotAudio.updateAll = () => {
  for (let s of DotAudio.allSynths) s.update();
};

DotAudio.removeSynth = (synth) => {
  DotAudio.allSynths = DotAudio.allSynths.filter(s => s != synth);
};
