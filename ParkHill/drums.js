
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
      { name: 'Low 1', sample: 'crackle_low_1.wav'},
      { name: 'Low 2', sample: 'crackle_low_2.wav'},
      { name: 'Low 3', sample: 'crackle_low_3.wav'},
      { name: 'High 1', sample: 'crackle_high_1.wav'},
      { name: 'High 2', sample: 'crackle_high_2.wav'},
      { name: 'High 3', sample: 'crackle_high_3.wav'}
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
      { name: '1/8', sample: 'noise_eigth.wav'},
      { name: '1/16', sample: 'noise_sixteenth.wav'}
    ]
  }
];

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


window.addEventListener('DOMContentLoaded', () => {
  selectPattern(0);
});
