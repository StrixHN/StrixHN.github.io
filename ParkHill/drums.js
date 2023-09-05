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

if (false && localStorage.getItem('drumPatterns')) {
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
	    semitoneShift: 0
	  });
	}
	pat.push(dat);
      }
    }
    patterns.push(pat);
  }
}

let activePattern = 0;

let beatDivs = [];
let subBeatDivs = [];

function makePage () {
  let sNum = 0;
  beatDivs = [...Array(4).keys()].map(b => makeDiv('beatDiv', b+1));
  subBeatDivs = [...Array(32).keys()].map(b => makeDiv('subBeatDiv', (b%8)+1));
  
  document.body.replaceChildren(
    makeDiv('drumPage', [
      makeDiv('patternList',
	      patterns.map((p,i) => makeDiv('patternButton', i+1, (el) => {
		if (i == activePattern) {
		  el.classList.add('selected');
		} else {
		  el.addEventListener('click', () => selectPattern(i));
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
		    let c = new Cell(d);
		    return c.build();
		  }))
		))
	      ], (el) => {
		el.height = ((Cell.size+2)*cat.samples.length)+'px';
	      })))
    ])
  );
}

function selectPattern (num) {
  activePattern = num;
  makePage();
}


function load() {
  ac = new AudioContext();
  return Promise.all(
    allSamples.map(
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
    )
  );
}

let beat, subBeat;
let subBeatDuration = (60/71.5)/8;
let nextTime = 0;

function init() {
  selectPattern(0);
  ac.resume();
  nextTime = ac.currentTime+.05;
  beat = subBeat = 0;
}

function run() {
  let index = 8*beat + subBeat;
  patterns[activePattern].forEach((c,i) => {
    if (c[index].active) {
      let n = new AudioBufferSourceNode(ac, {
	buffer: allSamples[i].buffer,
	playbackSpeed: Math.pow(2, c[index].semitoneShift/12)
      });
      let g = new GainNode(ac, {
	gain: dbToAmp(c[index].dbGain)
      });
      n.connect(g);
      g.connect(ac.destination);
      n.addEventListener('ended', () => {
	n.disconnect();
	g.disconnect();
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
