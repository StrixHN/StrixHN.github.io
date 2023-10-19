let ac, reverbNode;

const reverbPaths = [
  'Brutalism/BiomedicalSciences',
  'Brutalism/CarpenterCenter',
  'Brutalism/GalbraithHall',
  'Brutalism/GeiselLibrary',
  'Brutalism/GraffitiHallway',
  'Brutalism/HumanitiesSocialSciencesCourtyard',
  'Brutalism/LoveLibrary',
  'Brutalism/NaturalSciences',
  'Brutalism/PacificHall',
  'Brutalism/PepperCanyonHall',
  'Brutalism/SanDiegoSupercomputerCenter',
  'Miscellaneous/AcademicQuadrangle',
  'Miscellaneous/Amaranth',
  'Miscellaneous/BarMonsieurRicard',
  'Miscellaneous/CastilloDeLosTresReyesDelMorroArch',
  'Miscellaneous/CastilloDeLosTresReyesDelMorroCourtyard',
  'Miscellaneous/CastilloDeLosTresReyesDelMorroSalasDeExposicion',
  'Miscellaneous/CastilloDeLosTresReyesDelMorro',
  'Miscellaneous/CedarCreekWinery',
  'Miscellaneous/ConvocationMall',
  'Miscellaneous/CPMC264',
  'Miscellaneous/FortalezaDeSanCarlosDeLaCabana ',
  'Miscellaneous/FourPointsRoom270',
  'Miscellaneous/HartwellTavern',
  'Miscellaneous/Hawxhurst',
  'Miscellaneous/HepnerHall',
  'Miscellaneous/LittlefieldLobby',
  'Miscellaneous/MillsArtMuseum',
  'Miscellaneous/PabellonCulturalDeLaRepublica',
  'Miscellaneous/PabstBrewery',
  'Miscellaneous/QuadracciPavilion',
  'Miscellaneous/RedBridge',
  'Miscellaneous/SteinmanFoundationRecordingSuite',
  'Miscellaneous/StorageTankNo7',
  'Miscellaneous/TijuanaMall',
  'Miscellaneous/WangenheimRareBooksRoom',
  'Miscellaneous/WarrenLectureHall2005',
  'Nature/ByronGlacier',
  'Nature/CliffOfTheDawn',
  'Nature/DevilsPunchbowl',
  'Nature/DivorceBeach',
  'Nature/FatMansMisery',
  'Nature/FatMansSqueeze',
  'Nature/IslaMujeresCave',
  'Nature/PurgatoryChasm',
  'Nature/StanleyParkCliffs',
  'Nature/TheSlot',
  'Nature/WoodruffLane',
  'Recreation/Cranbrook Art Museum',
  'Recreation/HaleHolisticYogaStudio',
  'Recreation/Natatorium',
  'Recreation/OutbackClimbingCenter',
  'Recreation/RacquetballCourt',
  'Recreation/SewardWaterfrontPark',
  'Recreation/Sleeping Giant Tower',
  'Stairwells/3000CStreetGarageStairwell',
  'Stairwells/CCRMAStairwell',
  'Stairwells/ConventionCenterSteps',
  'Stairwells/CPMCNorthStairwell',
  'Stairwells/ExerciseAndNutritionSciences',
  'Stairwells/StrathconaStairwellMcGill',
  'Stairwells/TransitCenter',
  'Underground/Batcave',
  'Underground/BatteryBenson',
  'Underground/BatteryBrannan',
  'Underground/BatteryPowell',
  'Underground/BatteryQuarles',
  'Underground/BatteryRandol',
  'Underground/BatteryTolles',
  'Underground/CathedralRoom',
  'Underground/DiscoveryRoom',
  'Underground/DrainageTunnel',
  'Underground/FortWordenPillbox',
  'Underground/FortWordenTunnel',
  'Underground/HarborEntranceControlPost',
  'Underground/LakeMerrittBART',
  'Underground/LawrenceWelkCave',
  'Underground/NancyLakeTunnel',
  'Underground/PortageCreekTunnel',
  'Underground/PortTownsendSkatepark',
  'Underground/Qasgiq',
  'Underground/SaltonSeaDrainagePipe',
  'Underground/SquareVictoriaDome',
  'Underground/TijuanaAqueductTunnel',
  'Underground/TonyKnowlesCoastalTrailTunnel',
  'Underground/TunnelToHeaven',
  'Underground/TunnelToHell',
  'Underpasses/5UnderpassValencia',
  'Underpasses/ArroyoEnsenada',
  'Underpasses/Avenue52UnderpassLARiver',
  'Underpasses/Avenue60UnderpassLARiver',
  'Underpasses/BoulevardRosemontUnderpass',
  'Underpasses/CaribooRdUnderGaglardiWay',
  'Underpasses/CleftRidgeArch',
  'Underpasses/Commerical&5Underpass',
  'Underpasses/DipwayArch',
  'Underpasses/EchoBridge',
  'Underpasses/FishCreekTrestleBridge',
  'Underpasses/FremontTroll',
  'Underpasses/HopkinsDriveUnderpass',
  'Underpasses/JFKUnderpass',
  'Underpasses/LionsGateBridge',
  'Underpasses/OldSouthBridge',
  'Underpasses/RiverMountainsLoopTrailAqueduct',
  'Underpasses/StanleyParkCauseway',
  'Underpasses/StanleyParkDriveUnderpass',
  'Underpasses/SwitzerStUnderEHarborDr',
  'Underpasses/TelephoneWash',
  'Underpasses/WalkwayUnderECampusDr',
  'Underpasses/WaterplacePark',
  'Venues/ConradPrebysConcertHallSeatF111',
  'Venues/MillsGreekTheater',
  'Venues/NaumburgBandshell',
  'Venues/Space4ArtGallery',
  'Venues/SteinmanHall'
];


const reverbs = {};

for (let p of reverbPaths) {
  reverbs[p.replace('/', ' - ').replace(/([^ ])([A-Z])/g, '$1 $2')] = 'EchoThiefImpulseResponseLibrary/' + p + '.wav';
}


const samplePaths = [
  'crackle/crackle_1',
  'crackle/crackle_2',
  'crackle/crackle_3',
  'crackle/crackle_4',
  'crackle/crackle_5'
];


const samples = [];

for (let p of samplePaths) {
  samples.push('samples/' + p + '.wav');
}


var sounds;

const loadSamples = () => new Promise((resolve, reject) => {
  loadAudio(samples).then((audioBuffers) => {
    sounds = audioBuffers;
    resolve();
  });
});


var loadedReverb = null;

const loadReverb = (name) => new Promise((resolve, reject) => {
  const applyReverb = (buffer) => {
    reverbs[name] = buffer;
    loadedReverb = name;
    if (reverbNode) reverbNode.buffer = buffer;
    resolve(buffer);
  };
  if (typeof(reverbs[name]) === 'string') {
    loadAudio(reverbs[name]).then((audioBuffer) => {
      applyReverb(audioBuffer);
    });
  } else {
    applyReverb(reverbs[name]);
  }
});


const makeReverbSelector = () => {
  let s = document.createElement('select');
  let names = Object.keys(reverbs).sort();
  for (let n of names) {
    let o = document.createElement('option');
    o.innerText = n;
    o.value = n;
    s.appendChild(o);
  }
  return s;
};


const minDist = 2;

let holdingDiv, bgDrawing, markerDrawing, x, y, isOver = false;

const makeDrawing = () => {
  let maxHeight = window.innerHeight-100;
  let maxWidth = window.innerWidth-40;
  let w = maxWidth > 2 * maxHeight ? 2*maxHeight : maxWidth;
  let h = Math.floor(w/2);
  w = 2*h;
  let c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.style.width = w+'px';
  c.style.height = h+'px';
  let ctxt = c.getContext('2d');
  ctxt.beginPath();
  ctxt.fillStyle = '#88a';
  ctxt.arc(h, h, h, 0, Math.PI, true);
  ctxt.fill();
  let one = h/10;
  ctxt.beginPath();
  ctxt.fillStyle = '#fff';
  ctxt.arc(h, h, minDist*one, 0, Math.PI, true);
  ctxt.fill();
  ctxt.strokeStyle='#fff';
  ctxt.lineWidth = 1;
  for (let c=minDist+1; c<10; c++) {
    ctxt.beginPath();
    ctxt.arc(h, h, c*one, 0, Math.PI, true);
    ctxt.stroke();
  }
  for (let dest of [[h,0], [0,0], [w,0]]) {
    ctxt.beginPath();
    ctxt.moveTo(h, h);
    ctxt.lineTo(dest[0], dest[1]);
    ctxt.stroke();
  }
  ctxt.beginPath();
  ctxt.fillStyle = '#f00';
  ctxt.arc(h, h, .1*one, 0, Math.PI, true);
  ctxt.fill();
  return c;
};

const makeMarkerDrawing = () => {
  if (!markerDrawing) {
    markerDrawing = document.createElement('canvas');
    markerDrawing.width = bgDrawing.width;
    markerDrawing.height = bgDrawing.height;
    markerDrawing.style.width = bgDrawing.width+'px';
    markerDrawing.style.height = bgDrawing.height+'px';
  }
  let ctxt = markerDrawing.getContext('2d');
  ctxt.clearRect(0, 0, markerDrawing.width, markerDrawing.height);
  if (isOver) {
    let realX = x - holdingDiv.offsetLeft;
    let realY = y - holdingDiv.offsetTop;
    ctxt.strokeStyle = '#808';
    ctxt.lineWidth = 0.5;
    ctxt.beginPath();
    ctxt.moveTo(markerDrawing.height, markerDrawing.height);
    ctxt.lineTo(realX, realY);
    ctxt.stroke();
    ctxt.lineWidth = 1.5;
    ctxt.beginPath();
    ctxt.moveTo(realX-8, realY);
    ctxt.lineTo(realX+8, realY);
    ctxt.stroke();
    ctxt.beginPath();
    ctxt.moveTo(realX, realY-8);
    ctxt.lineTo(realX, realY+8);
    ctxt.stroke();
  }
};

const play = (audioBuffer) => {
  console.log(isOver);
  if (!isOver) return;
  let w = bgDrawing.width;
  let h = bgDrawing.height;
  let unit = h/10;
  let realX = (h - (x - holdingDiv.offsetLeft))/unit;
  let realY = (h - (y - holdingDiv.offsetTop))/unit;
  let r = 0.1;
  let d = Math.sqrt(realX*realX + realY*realY);
  if (d<minDist) return;
  let dL = Math.sqrt((-r-realX)*(-r-realX) + realY*realY);
  let dR = Math.sqrt((r-realX)*(r-realX) + realY*realY);
  let leftDelay = dL/330;
  let rightDelay = dR/330;
  let baseAmp = (minDist*minDist)/(d*d);
  let reverbAmp = minDist/d;
  let cos = realX/d;
  let a = Math.acos(cos);
  console.log(a);
  let rightAmp = Math.sin(.5*a);
  let leftAmp = Math.cos(.5*a);
  console.log(realX, d, cos, rightAmp, leftAmp);
  let source = new AudioBufferSourceNode(ac, {buffer: audioBuffer});
  let splitter = new ChannelSplitterNode(ac);
  let lDelay = new DelayNode(ac, {delayTime: leftDelay});
  let rDelay = new DelayNode(ac, {delayTime: rightDelay});
  let lGain = new GainNode(ac, {gain: leftAmp});
  let rGain = new GainNode(ac, {gain: rightAmp});
  let merger = new ChannelMergerNode(ac);
  source.connect(splitter);
  splitter.connect(lDelay, 0);
  splitter.connect(rDelay, 0);
  lDelay.connect(lGain);
  rDelay.connect(rGain);
  lGain.connect(merger, 0, 0);
  rGain.connect(merger, 0, 1);
  let dryGain = new GainNode(ac, {gain:baseAmp});
  let wetGain = new GainNode(ac, {gain:reverbAmp});
  merger.connect(dryGain);
  merger.connect(wetGain);
  wetGain.connect(reverbNode);
  dryGain.connect(ac.destination);
  source.start();
};

window.addEventListener('DOMContentLoaded', () => {
  ac = new AudioContext();
  reverbNode = new ConvolverNode(ac);
  reverbNode.connect(ac.destination);
  loadSamples()
    .then(loadReverb(Object.keys(reverbs)[0]))
    .then(() => {
      let s = makeReverbSelector();
      s.addEventListener('change', (e) => {
	loadReverb(e.target.value);
      });
      document.body.appendChild(s);
      // samplePaths.forEach((p, i) => {
      // 	document.body.addElem('p', '', makeLink('', p, null, (e) => {
      // 	  e.addEventListener('click', () => {
      // 	    let absn = new AudioBufferSourceNode(ac, {buffer: sounds[i]});
      // 	    absn.connect(reverbNode);
      // 	    absn.start();
      // 	  });
      // 	}));
      // });
      holdingDiv = makeDiv('', '');
      holdingDiv.style.position = 'relative';
      document.body.appendChild(holdingDiv);
      bgDrawing = makeDrawing();
      bgDrawing.style.position = 'absolute';
      bgDrawing.style.top = '0px';
      bgDrawing.style.left = '0px';
      holdingDiv.appendChild(bgDrawing);
      makeMarkerDrawing();
      markerDrawing.style.position = 'absolute';
      markerDrawing.style.top = '0px';
      markerDrawing.style.left = '0px';
      holdingDiv.appendChild(markerDrawing);
      markerDrawing.addEventListener('mouseenter', (e) => {
	isOver = true;
	makeMarkerDrawing();
      });
      markerDrawing.addEventListener('mouseleave', (e) => {
	isOver = false;
	makeMarkerDrawing();
      });
      markerDrawing.addEventListener('mousemove', (e) => {
	isOver = true;
	x = e.clientX;
	y = e.clientY;
	makeMarkerDrawing();
      });
      document.body.addEventListener('keydown', (e) => {
	let id = e.keyCode-49;
	console.log(id);
	if (id >= 0 && id < sounds.length) play (sounds[id]);
      });
    });
  // let button = document.createElement('button');
  // button.innerHTML = 'Play';
  // document.body.appendChild(button);
  // button.addEventListener('click', () => {
  //   document.body.removeChild(button);
  //   init();
  //   run();
  // });
});


// function exportAudio () {
//   const totalDuration = 32*barDuration;
//   const sr = 48000;
//   let oac = new OfflineAudioContext({
//     nbChannels: 2,
//     sampleRate: sr,
//     length: sr*totalDuration
//   });
//   patterns.forEach((pattern, pNum) => {
//     let t0 = pNum*barDuration;
//     pattern.forEach((sampleLine, sNum) => {
//       sampleLine.forEach((cell, cNum) => {
// 	if (cell.active) {
// 	  let t = t0 + cNum*subBeatDuration;
// 	  let n = new AudioBufferSourceNode(oac, {
// 	    buffer: allSamples[sNum].buffer,
// 	    playbackRate: Math.pow(2, cell.semitoneShift/12)
// 	  });
// 	  let g = new GainNode(oac, {
// 	    gain: dbToAmp(cell.dbGain)
// 	  });
// 	  let p = new StereoPannerNode(oac, {
// 	    pan: cell.pan
// 	  });
// 	  n.connect(g);
// 	  g.connect(p);
// 	  p.connect(oac.destination);
// 	  n.start(t);
// 	}
//       });
//     });
//   });
//   oac.startRendering().then((buffer) => {
//     let max = 0;
//     for (let c=0; c<buffer.numberOfChannels; c++) {
//       let data = buffer.getChannelData(c);
//       for (let v of data) {
// 	if (Math.abs(v) > max) max = Math.abs(v);
//       }
//     }
//     console.log(max);
//     let amp = .95/max;
//     for (let c=0; c<buffer.numberOfChannels; c++) {
//       let data = buffer.getChannelData(c);
//       for (let i=0; i<buffer.length; i++) {
// 	data[i] *= amp;
//       }
//     }
//     new WaveWriter(buffer).saveWaveFile('rendered.wav');
//   });
// }

