
class AudioRenderer {

  // Render by slices of 'renderInterval' seconds
  renderInterval = 1;

  // Run this many renderings in parallel
  nbParallel = 2;

  // 0 to use default system sample rate
  sampleRate = 0;

  // Number of channels
  nbChannels = 2;

  // How much extra audio to render past each time "slice"
  // Typically the maximum duration of a sound past its onset
  extraRenderTime = 0;

  renderedAudioBuffer = null;
  
  constructor (options) {
    if (options.hasOwnProperty('sampleRate')) {
      this.sampleRate = options.sampleRate;
    } else {
      this.sampleRate = new AudioContext().sampleRate;
    }
    if (options.hasOwnProperty('maxEventDuration')) {
      this.extraRenderTime = options.maxEventDuration;
    } else {
      throw(new Error('You must specify "maxEventDuration" in the options'));
    }
    for (let k of ['nbParallel', 'renderInterval', 'nbChannels']) {
      if (options.hasOwnProperty(k)) {
	this[k] = options[k];
	console.log(k, options[k], this[k]);
      }
    }
    if (this.renderInterval <= 0 || this.renderInterval != Math.floor(this.renderInterval)) {
      throw(new Error('Render interval must be a whole, strictly positive number of seconds'));
    }
    console.log(this);
  }

  render (duration, buildFunction, progressFunction) {
    var renderStartTime = Date.now();
    this.renderedAudioBuffer = new AudioBuffer({
      numberOfChannels: this.nbChannels,
      sampleRate: this.sampleRate,
      length: Math.round(this.sampleRate*(duration+this.extraRenderTime+.01))
    });
    console.log(this.renderedAudioBuffer);
    let normalize = () => {
      let max = 0;
      for (let c=0; c<this.renderedAudioBuffer.numberOfChannels; c++) {
	let data = this.renderedAudioBuffer.getChannelData(c);
	for (let v of data) if (Math.abs(v) > max) max = Math.abs(v);
      }
      for (let c=0; c<this.renderedAudioBuffer.numberOfChannels; c++) {
	let data = this.renderedAudioBuffer.getChannelData(c);
	data.forEach((v,i) => {data[i] = v/max;});
      }
    };
    return new Promise ((resolve, reject) => {
      let nbChunks = Math.ceil(duration/this.renderInterval);
      let nbRenderedChunks = 0;
      for (let thread=0; thread < this.nbParallel; thread++) {
	let step = 0;
	let renderStep = () => {
	  let chunkNum = step*this.nbParallel + thread;
	  let ac = new OfflineAudioContext(this.nbChannels, Math.round(this.sampleRate*(this.renderInterval+this.extraRenderTime+.01)), this.sampleRate);
	  let startTime = this.renderInterval*chunkNum;
	  if (startTime > duration) return;
	  buildFunction(ac, startTime, startTime + this.renderInterval);
	  ac.startRendering().then((buffer) => {
	    for (let c=0; c<this.nbChannels; c++) {
	      let sData = buffer.getChannelData(c);
	      let tData = this.renderedAudioBuffer.getChannelData(c);
	      let start = Math.floor(this.sampleRate*startTime);
	      let end = Math.min(start+buffer.length, this.renderedAudioBuffer.length);
	      for (let i=0, j=start; j<end; i++, j++) {
		tData[j] += sData[i];
	      }
	    }
	    nbRenderedChunks++;
	    step++;
	    progressFunction(nbRenderedChunks / nbChunks);
	    if (nbRenderedChunks == nbChunks) {
	      normalize();
	      console.log(`Completed in ${Math.round((Date.now() - renderStartTime)/1000)} seconds`);
	      resolve();
	    } else {
	      renderStep();
	    }
	  });
	};
	renderStep();
      }
    });
  }

  save (fileName) {
    new WaveWriter(this.renderedAudioBuffer).saveWaveFile(fileName);
  }

  play() {
    let audioCtx = new AudioContext();
    const song = audioCtx.createBufferSource();
    song.buffer = this.renderedAudioBuffer;
    song.connect(audioCtx.destination);
    song.start();
  }
}
