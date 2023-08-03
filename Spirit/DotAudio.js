
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
    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(DotAudio.ac.destination);
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
      // Frequency
      let f = 27.5*Math.pow(2, (88-Math.round(this.dot.weight))/12);
      this.oscillator.frequency.value = f;
      // Timbre
      this.filter.frequency.value = f*(1+Math.sqrt(this.dot.f[0]*this.dot.f[0] + this.dot.f[1]*this.dot.f[1])/1000);
      // Amplitude
      this.gain.gain.value = .0001*Math.sqrt(this.dot.sx*this.dot.sx + this.dot.sy*this.dot.sy)*this.dot.weight/10;
      // console.log(this.oscillator.frequency.value, this.filter.frequency.value, this.gain.gain.value);
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
