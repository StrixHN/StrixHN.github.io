
class SpiralAudio {

  constructor(spiral) {
    this.spiral = spiral;
    this.source = new AudioBufferSourceNode(SpiralAudio.ac, {
      loop: true,
      buffer: SpiralAudio.noiseBuffer,
      playbackRate: 1/8
    });
    this.filter = new BiquadFilterNode(SpiralAudio.ac, {
      type: 'bandpass',
      frequency: 55,
      channelCount: 1,
      Q: 100
    });
    this.gain = new GainNode(SpiralAudio.ac, {
      channelCount: 1,
      gain: .1
    });
    this.panner = new StereoPannerNode(SpiralAudio.ac, {
      pan: 0
    });
    this.source.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(SpiralAudio.ac.destination);
    this.source.start();
    SpiralAudio.allSynths.push(this);
  }

  update() {
    if (this.dyingCount) {
      this.gain.gain.value = this.gain.gain.value * .95;
      this.dyingCount--;
      if (this.dyingCount == 0) {
	this.source.stop();
	this.source.disconnect();
	this.filter.disconnect();
	this.gain.disconnect();
	this.panner.disconnect();
	SpiralAudio.removeSynth(this);
      }
      return;
    }
    let ratio = this.spiral.step/this.spiral.total;
    this.source.playbackRate.value = 2-6*ratio;
    this.filter.frequency.value = 110*Math.pow(2, 6*ratio);
    // this.filter.Q.value = 100+Math.pow(1000, 1-ratio);
    this.gain.gain.value = 10*(Math.pow(80000, (1-ratio)*(1-ratio))/2000 + Math.pow(1, ratio*ratio)/10);
    this.panner.pan.value = .6 * (2*this.spiral.x/window.innerWidth - 1);    
  }

  kill () {
    this.dyingCount = 30;
  }
  
}

SpiralAudio.ac = null;

SpiralAudio.allSynths = [];

SpiralAudio.start = () => {
  SpiralAudio.ac = new AudioContext();
  SpiralAudio.noiseBuffer = new AudioBuffer({
    length: 100000,
    numberOfChannels: 1,
    sampleRate: SpiralAudio.ac.sampleRate
  });
  let data = SpiralAudio.noiseBuffer.getChannelData(0);
  let nextPos = Math.round(100+100*Math.random());
  for (let i in data) {
    if (i==nextPos) {
      data[i] = .5+.5*Math.random();
    } else if (i==nextPos+1) {
      data[i] = -.5-.5*Math.random();
      nextPos += Math.round(SpiralAudio.ac.sampleRate*(1+Math.random())/10);
    } else {
      data[i] = 0;
    }
  }
};

SpiralAudio.updateAll = () => {
  for (let s of SpiralAudio.allSynths) s.update();
};

SpiralAudio.removeSynth = (synth) => {
  SpiralAudio.allSynths = SpiralAudio.allSynths.filter(s => s != synth);
};
