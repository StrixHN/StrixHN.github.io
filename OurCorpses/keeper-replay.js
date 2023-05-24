(function () {

  const audio = new Audio('audio/keeper_strix.mp3');
  
  
  //////////////////////////////
  // CONFIGURATION PARAMETERS //
  //////////////////////////////


  const nbSavedPlays = 10;
  
  const textDivHeight = 32;
  const marginPercent = 3;
  const maxMargin = 16;
  
  const spotFadeInTime = 1000;
  
  const imageDuration = 30;
  const spotsPerImage = [1200, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900];
  const totalNeededSpots = spotsPerImage.reduce((a,x) => a+x, 0);

  // t in seconds
  const spotsDensityEvolution = [
    {t: 0, sps: 0},
    {t: 1, sps: 0},
    {t: 10, sps: 1},
    {t: 25, sps: 1},
    {t: imageDuration, sps: 0}
  ];

  // t as fraction of total time
  const spotsColorEvolution = [
    {t: 0, color: [70, 40, 20]},
    {t: .5, color: [24, 24, 40]},
    {t: .85, color: [10, 7, 25]}
  ];

  const textAnimationTiming = {
    startAppearing: 10,
    fullyVisible: 25,
    startDisappearing: 31,
    fullyGone: 35
  };
  
  /////////////
  // OBJECTS //
  /////////////
  
  const spots = [
    {name: '01.png', dimensions: [455, 491], center: [238, 233], radius: 110},
    {name: '02.png', dimensions: [544, 743], center: [265, 350], radius: 150},
    {name: '03.png', dimensions: [486, 685], center: [260, 300], radius: 130},
    {name: '04.png', dimensions: [681, 699], center: [350, 300], radius: 160},
    {name: '05.png', dimensions: [555, 678], center: [297, 232], radius: 130},
    {name: '06.png', dimensions: [552, 734], center: [302, 329], radius: 140},
    {name: '07.png', dimensions: [456, 581], center: [257, 262], radius: 120},
    {name: '08.png', dimensions: [427, 415], center: [193, 179], radius: 70},
    {name: '09.png', dimensions: [380, 537], center: [186, 254], radius: 60},
    {name: '10.png', dimensions: [320, 388], center: [148, 168], radius: 60},
    {name: '11.png', dimensions: [403, 460], center: [203, 220], radius: 82},
    {name: '12.png', dimensions: [434, 531], center: [213, 238], radius: 60},
    {name: '13.png', dimensions: [389, 442], center: [151, 203], radius: 82}
  ];


  const portraits = [
    {name: 'female3.jpg', focus: {cx: 516/1024, cy: 600/1024, rx: 495/2048, ry: 500/2048}, text:'“Her mind was capable of empathy.”'},
    {name: 'male1.jpg', focus: {cx: 500/1024, cy: 610/1024, rx: 520/2048, ry: 480/2048}, text:'“He had answers.”'},
    {name: 'male11.jpg', focus: {cx: 515/1024, cy: 603/1024, rx: 587/2048, ry: 524/2048}, text:'“He believed he could be happy in a job.”'},
    {name: 'female2.jpg', focus: {cx: 510/1024, cy: 590/1024, rx: 500/2048, ry: 500/2048}, text:'“She was absorbed in seeking connections.”'},
    {name: 'female6.jpg', focus: {cx: 510/1024, cy: 605/1024, rx: 510/2048, ry: 510/2048}, text:'“She thought she could trust him.”'},
    {name: 'male5.jpg', focus: {cx: 508/1024, cy: 604/1024, rx: 512/2048, ry: 470/2048}, text:'“He imagined he was something special.”'},
    {name: 'female7.jpg', focus: {cx: 545/1024, cy: 605/1024, rx: 530/2048, ry: 500/2048}, text:'“She wanted to be cured.”'},
    {name: 'male6.jpg', focus: {cx: 516/1024, cy: 597/1024, rx: 533/2048, ry: 505/2048}, text:'“He thought there was still time to talk to his father.”'},
    {name: 'male3.jpg', focus: {cx: 512/1024, cy: 618/1024, rx: 530/2048, ry: 530/2048}, text:'“He was trying to be normal.”'},
    {name: 'female1.jpg', focus: {cx: 482/1024, cy: 590/1024, rx: 460/2048, ry: 560/2048}, text:'“She didn’t believe in love.”'},
    {name: 'male9.jpg', focus: {cx: 515/1024, cy: 590/1024, rx: 492/2048, ry: 493/2048}, text:'“He thought his story was over.”'},
    {name: 'female4.jpg', focus: {cx: 500/1024, cy: 620/1024, rx: 486/2048, ry: 545/2048}, text:'“She was convinced music could save her.”'},
  ];

  // “She thought she could trust him”
  // “She didn’t believe in love”
  // "She wanted to be cured"
  // "She was convinced music could save her"
  // "Her mind was capable of empathy"
  // "She was absorbed in seeking connections"
  
  // “He thought there was still time to talk to his father”
  // “He believed he could find fulfillment in a job”
  // “He imagined he was something special”
  // “He assumed being normal was the answer”
  // He thought his story was over
  // 
  
  const nbImages = portraits.length + 1;
  
  //////////
  // CODE //
  //////////

  let size = 0;
  let textDiv;
  
  let app, app2, stableSpotsTexture, stableSpotsSprite;

  let globalStartTime, imageStartTime;
  let totalTime, imageTime;

  let currentImage = 0;

  // Preprocess evolution of number of spots
  let shouldHave;

  let preprocessImageNbSpots = (spi) => {
    shouldHave  = [0];
    let last = 0;
    for (let t=.1; t<=imageDuration; t += .1) {
      let pos = spotsDensityEvolution.findIndex(v => v.t >=t);
      let ratio = (t-spotsDensityEvolution[pos-1].t)/(spotsDensityEvolution[pos].t-spotsDensityEvolution[pos-1].t);
      let sps = (1-ratio)*spotsDensityEvolution[pos-1].sps + ratio*spotsDensityEvolution[pos].sps;
      let v = last + .1*sps;
      shouldHave.push(v);
      last = v;
    }
    let multiplier = spi / last;
    shouldHave = shouldHave.map(c => c*multiplier);
  };

  let neededNbSpotsImage = () => {
    let i = Math.ceil(10*imageTime);
    if (i == 0) return 0;
    if (i >= shouldHave.length) return spotsPerImage;
    let f = i-10*imageTime;
    return f*shouldHave[i] + (1-f)*shouldHave[i-1];
  };

  // Preprocess color evolution
  const spotColors = [];
  
  let colorNum = (col) => {
    let res = 0;
    for (let c of col)
      res = 256*res+Math.floor(c);
    return res;
  };

  let colorHash = (col) => {
    let res = '#';
    for (let c of col)
      res += (c < 16 ? '0' : '')+Math.floor(c).toString(16);
    return res;
  };
  
  for (let p of spotsColorEvolution) p.t *= nbImages*imageDuration;
  for (let t=0; t <= nbImages*imageDuration; t++) {
    let p = spotsColorEvolution.findIndex(v => v.t >= t);
    if (p ==  0) {
      spotColors.push(colorNum(spotsColorEvolution[0].color));
      portraits[0].textColor = colorHash(spotsColorEvolution[0].color);
    } else if (p == -1) {
      spotColors.push(colorNum(spotsColorEvolution[spotsColorEvolution.length-1].color));
    } else {
      let c = [];
      let ratio = (t-spotsColorEvolution[p-1].t)/(spotsColorEvolution[p].t-spotsColorEvolution[p-1].t);
      let pCol = spotsColorEvolution[p-1].color, nCol = spotsColorEvolution[p].color;
      for (let i of [0, 1, 2]) {
	c.push(ratio*nCol[i] + (1-ratio)*pCol[i]);
      }
      spotColors.push(colorNum(c));
      if (t % imageDuration == 0) {
	console.log(colorHash(c));
	portraits[t/imageDuration].textColor = colorHash(c);
      }
    }
  }

  let spotColor = () => {
    if (totalTime >= spotColors.length)
      return spotColors[spotColors.length-1];
    return spotColors[Math.floor(totalTime)];
  };

  
  // let stableSprites = [];
  let appearingSprites = [];
  let appearedSprites = [];

  let stepNum = 0;
  let startTime = 0;
  let createdSpots = 0;

  let transferStabilizedSprites = () => {
    let start = Date.now();
    app2.stage.removeChildren();
    for (let s of appearedSprites) {
      app2.stage.addChild(s.sprite);
      app.stage.removeChild(s.sprite);
    }
    appearedSprites = [];    
    app2.renderer.render(app2.stage, {clear: false});
    stableSpotsTexture.update();
  };

  let done = false;

  let availableSpots;

  let scheduleText = () => {
    setTimeout(() => {
      textDiv.innerHTML = portraits[currentImage].text;
      textDiv.style.opacity = 0;
      textDiv.style.filter = 'blur(3px)';
      setTimeout(() => {
	console.log(portraits[currentImage].textColor);
	textDiv.style.color = portraits[currentImage].textColor;
	textDiv.style.transition = `all ${textAnimationTiming.fullyVisible-textAnimationTiming.startAppearing}s`;
	textDiv.style.filter = '';
	textDiv.style.opacity = .7;
      });
    }, 1000*textAnimationTiming.startAppearing);
    setTimeout(() => {
      textDiv.style.transition = `all ${textAnimationTiming.fullyGone-textAnimationTiming.startDisappearing}s`;
      textDiv.style.opacity = 0;
      textDiv.style.filter = 'blur(15px)';
    }, 1000*textAnimationTiming.startDisappearing);
  };

  let imageDrawnSpots = 0;
  let totalSpots = 0;
  
  let step = () => {
    let now = Date.now();
    imageTime = (now-imageStartTime)/1000;
    totalTime = (now-globalStartTime)/1000;

    if (imageTime >= imageDuration) {
      if (currentImage == nbImages) {
	done = true;
      } else {
	console.log('Finishing image. Spots in queue: '+availableSpots.length);
	imageStartTime = now;
	imageDrawnSpots = 0;
	// availableSpots.clear();
	currentImage++;
	preprocessImageNbSpots(spotsPerImage[currentImage]);
	// worker.postMessage({action: 'next', nbSpots: spotsPerImage[currentImage]});
	if (currentImage < nbImages-1) scheduleText();
      }
      return;
    }
    
    if (!done) {
      let neededSpots = neededNbSpotsImage();
      for (; imageDrawnSpots < neededSpots; imageDrawnSpots++, totalSpots++) {
	let spotData = availableSpots.take();
	if (!spotData) {
	  // console.log('#');
	  break;
	}
	spotData.scale*= size;
	spotData.position[0] *= size;
	spotData.position[1] *= size;
	let spot = spots[spotData.spot];
	let newObj = {
	  startTime: now,
	  alpha: spotData.alpha,
	  sprite: new PIXI.Sprite(spot.texture)
	};
	newObj.sprite.alpha = 0;
	newObj.sprite.anchor.set(spot.center[0]/spot.dimensions[0], spot.center[1]/spot.dimensions[1]);
	if (!spotData.white) {
	  newObj.sprite.tint = spotColor();
	}
	newObj.sprite.rotation = spotData.angle;
	newObj.sprite.scale.set(spotData.scale);
	newObj.sprite.x = spotData.position[0];
	newObj.sprite.y = spotData.position[1];
	newObj.sprite.zIndex = totalSpots;
	appearingSprites.push(newObj);
	app.stage.addChild(newObj.sprite);
      }
    }
    
    let newAppearingSprites = [];
    for (let s of appearingSprites) {
      if (now - s.startTime > spotFadeInTime) {
	s.sprite.alpha = s.alpha;
	appearedSprites.push(s);
      } else {
	let ratio = (now-s.startTime)/spotFadeInTime;
	let smoothRatio = .5*(1+Math.cos(Math.PI*(1-ratio)));
	s.sprite.alpha = smoothRatio*s.alpha;
	newAppearingSprites.push(s);
      }
    }
    if (appearedSprites.length > 100) {
      transferStabilizedSprites();
    }
    appearingSprites = newAppearingSprites;
    if (done && appearingSprites.length == 0) {
      app.stop();
    }
    stepNum++;
  };

  let makePage = (canvas) => {
    document.body.innerHTML = '';
    let size = canvas.width;
    let holderDiv = document.createElement('div');
    holderDiv.classList.add('holder');
    holderDiv.style.width = size+'px';
    holderDiv.style.height = (size+textDivHeight)+'px';
    textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.style.opacity = 0;
    holderDiv.appendChild(textDiv);
    holderDiv.appendChild(canvas);
    document.body.appendChild(holderDiv);
  };

  let startPlaying = () => {
    let availableHeight = window.innerHeight-textDivHeight;
    let margin = Math.min(marginPercent*availableHeight, maxMargin);
    size = Math.min(window.innerWidth, availableHeight) - 2*margin;
    
    app = new PIXI.Application({ background: '#fff', antialias: false, width: size, height: size, transparent: false, autoStart: false});
    app2 = new PIXI.Application({ background: '#fff', antialias: false, width: size, height: size, autoStart: false, backgroundAlpha: 0,
				  clearBeforeRender: false, preserveDrawingBuffer: true});
    app.render();
    let canvas = app.view;
    makePage(canvas);
    
    preprocessImageNbSpots(spotsPerImage[0]);
    
    stableSpotsTexture = PIXI.Texture.from(app2.view);
    app2.render();
    setTimeout(() => {
      stableSpotsTexture.update();
      stableSpotsSprite = new PIXI.Sprite(stableSpotsTexture);
      stableSpotsSprite.zIndex = 1;
      app.stage.addChild(stableSpotsSprite);
      app.ticker.add(step);
      globalStartTime = imageStartTime = Date.now();
      app.start();
      scheduleText();
      audio.play();
    });
  };

  let makeWaitPage = () => {
    document.body.innerHTML = '<div class="waitDiv">One moment please,<br/>preloading images...</div>';
  };
  
  let makeReadyPage = () => {
    document.body.innerHTML = '<div class="readyDiv"><p>Ready.</p><p>We recommend you maximize your browser window before pressing “play” below to start.</p><p>Please note that these visuals are computed on the fly, which makes each viewing unique, but may be too heavy for some devices (phones in particular). If you encounter any issue, please <a href="todo">watch&nbsp;the&nbsp;video&nbsp;version</a>.</p><p><button id="playButton">Play</button></p></div>';
    document.querySelector('button#playButton').addEventListener('click', startPlaying);
  };

  let checkTextureLoad = () => {
    if (audio.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA && spots.reduce((acc, x) => acc && x.texture.valid, true))
      makeReadyPage();
    else
      setTimeout(checkTextureLoad, 200);
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    makeWaitPage();
    fetch(`saved-plays/spots-${Math.floor(nbSavedPlays*Math.random())}.dat`, {mode: 'cors'})
      .then(res => res.arrayBuffer())
      .then((buffer) => {
	let store = new SpotStore();
	store.loadArrayBuffer(buffer);
	availableSpots = store.storage;
	checkTextureLoad();
      });
    
    for (let s of spots) {
      s.texture = PIXI.Texture.from(`whiteSpots/${s.name}`);
    }

  });
  
})();
