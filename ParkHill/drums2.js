let ac;

const categories = [
  {
    name: 'Kick',
    samples: [
      {name: 'Long', sample: 'kick.wav'},
      {name: 'Short', sample: 'dry_kick.wav'}
    ]
  },
  {
    name: 'Pop',
    samples: [
      { name: 'Low 1', sample: 'pop_low_1.wav'},
      { name: 'Low 2', sample: 'pop_low_2.wav'},
      { name: 'Low 3', sample: 'pop_low_3.wav'},
      { name: 'High 1', sample: 'pop_high_1.wav'},
      { name: 'High 2', sample: 'pop_high_2.wav'},
      { name: 'High 3', sample: 'pop_high_3.wav'}
    ]
  },
  {
    name: 'Crackle',
    samples: [
      { name: '1', sample: 'crackle_1.wav'},
      { name: '2', sample: 'crackle_2.wav'},
      { name: '3', sample: 'crackle_3.wav'},
      { name: '4', sample: 'crackle_4.wav'},
      { name: '5', sample: 'crackle_5.wav'},
      { name: '6', sample: 'crackle_6.wav'}
    ]
  },
  {
    name: 'Noise',
    samples: [
      { name: 'Beat', sample: 'noise_beat.wav'},
      { name: '1/2', sample: 'noise_half.wav'},
      { name: '1/4', sample: 'noise_quarter.wav'},
      { name: '1/8', sample: 'noise_eighth.wav'},
      { name: '1/16', sample: 'noise_sixteenth.wav'}
    ]
  }
];

let allSamples = [];
for (let c of categories) {
  for (let s of c.samples) {
    allSamples.push(s);
  }
}


let patterns = [];

if (localStorage.getItem('drumPatterns')) {
  patterns = JSON.parse(localStorage.getItem('drumPatterns'));
} else {
  for (let i=0; i<32; i++) {
    let pat = [];
    for (let cat of categories) {
      for (let samp of cat.samples) {
	let dat = [];
	for (let s=0; s<32; s++) {
	  dat.push({
	    active: false,
	    dbGain: -6,
	    semitoneShift: 0,
	    pan: 0
	  });
	}
	pat.push(dat);
      }
    }
    patterns.push(pat);
  }
}

let saveTimer = null;

function throttledSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    localStorage.setItem(
      'drumPatterns',
      JSON.stringify(
	patterns.map(p =>
	  p.map(s =>
	    s.map(d => {
	      return {
		active: d.active,
		dbGain: d.dbGain,
		semitoneShift: d.semitoneShift,
		pan: d.pan
	      };
	    })
	  )
	)
      )
    );
  }, 200);
}



let activePattern = 0;
let copyTo = -1;

let beatDivs = [];
let subBeatDivs = [];

function makePage () {
  let sNum = 0;
  beatDivs = [...Array(4).keys()].map(b => makeDiv('beatDiv', b+1));
  subBeatDivs = [...Array(32).keys()].map(b => makeDiv('subBeatDiv', (b%8)+1));
  
  document.body.replaceChildren(
    makeDiv('drumPage', [
      makeDiv('patternList',
	      patterns.map((p,i) => makeDiv('patternButton', i+5, (el) => {
		if (i == activePattern) {
		  el.classList.add('selected');
		} else {
		  el.addEventListener('click', (e) => {
		    e.preventDefault();
		    selectPattern(i);
		  });
		}
	      }))),
      makeDiv('beatMarks', beatDivs),
      makeDiv('subBeatMarks', subBeatDivs),
      makeDiv('drumGrid',
	      categories.map((cat) => makeDiv('drumGridCategory', [
		makeDiv('categoryTitle', cat.name),
		makeDiv('sampleTitles', cat.samples.map( s => makeDiv('sTitle', s.name) )),
		makeDiv('sampleTracks', cat.samples.map( s =>
		  makeDiv('sTrack', patterns[activePattern][sNum++].map( d => {
		    let c = new Cell(d, throttledSave);
		    return c.build();
		  }))
		))
	      ], (el) => {
		el.height = ((Cell.size+2)*cat.samples.length)+'px';
	      }))),
      makeDiv('bottomButtons', [
	makeDiv('patternButton', 'Export', (el) => {
	  el.addEventListener('click', exportAudio);
	})
      ])
    ])
  );
  document.querySelector('div.patternList').appendChild(makeDiv('patternButton', 'Copy from...', (el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      copyTo = activePattern;
    });
  }));
  document.querySelector('div.patternList').appendChild(makeDiv('patternButton', 'Clear', (el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      clearPattern(activePattern);
    });
  }));
}


function clearPattern(num) {
  let p = patterns[num];
  for (let s of p) {
    for (let d of s) {
      d.active = false;
      d.dbGain = -6;
      d.semitoneShift = 0;
      d.pan = 0;
      d.cell.update();
    }
  }
  throttledSave();
}


function selectPattern (num) {
  if (copyTo >= 0) {
    let dst = patterns[copyTo];
    let src = patterns[num];
    src.forEach((s, i) => {
      s.forEach((srcD, j) => {
	let dstD = dst[i][j];
	dstD.active = srcD.active;
	dstD.dbGain = srcD.dbGain;
	dstD.semitoneShift = srcD.semitoneShift;
	dstD.pan = srcD.pan;
	dstD.cell.update();
      });
    });
    throttledSave();
    copyTo = -1;
  } else {
    activePattern = num;
    makePage();
  }
}

const beatDuration = 60/71.5;
const barDuration = 4*beatDuration;
const subBeatDuration = beatDuration/8;

const bassBuffers = [];

function splitBassBuffer (buf) {
  const barSamples = Math.round(barDuration * buf.sampleRate);
  for (let pos = 0; pos < buf.length-barSamples; pos += barSamples) {
    let bb = new AudioBuffer({
      sampleRate: buf.sampleRate,
      numberOfChannels: buf.numberOfChannels,
      length: barSamples
    });
    for (let c=0; c<buf.numberOfChannels; c++) {
      let src = buf.getChannelData(c);
      let dst = bb.getChannelData(c);
      for (let i=0; i<barSamples; i++) {
	dst[i] = src[pos+i];
      }
    }
    bassBuffers.push(bb);
  }
}



function load() {
  ac = new AudioContext({sampleRate: 48000});
  return Promise.all([
    ...allSamples.map(
      s => new Promise(
	(resolve, reject) =>
	fetch(`samples/${s.sample}`)
	  .then(response => response.arrayBuffer())
	  .then(buf => ac.decodeAudioData(buf))
	  .then((audioBuf) => {
	    s.buffer = audioBuf;
	    resolve();
	  })
      )
    ),
    new Promise((resolve, reject) =>
      fetch('samples/bass.mp3')
	.then(response => response.arrayBuffer())
	.then(buf => ac.decodeAudioData(buf))
	.then((audioBuf) => {
	  splitBassBuffer(audioBuf);
	  resolve();
	})
    )
  ]);
}


let beat, subBeat;
let nextTime = 0;

function init() {
  selectPattern(0);
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

