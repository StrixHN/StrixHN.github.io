(function() {

  const zones = [];
  const zoneSize = 64;
  const dotSize = 2;
  const halfTileSize = zoneSize*dotSize / 2;

  let onScreen, onScreenContext;
  
  const makeZones = () => {
    let colDots = [];
    for (let color of ['#d00', '#0d0', '#00d']) {
      let scanvas = document.createElement('canvas');
      scanvas.width = 3;
      scanvas.height = 3;
      let scontext = scanvas.getContext('2d', {alpha: false});
      scontext.fillStyle = color;
      scontext.fillRect(1, 1, 1, 1);
      let canvas = document.createElement('canvas');
      canvas.width = dotSize+2;
      canvas.height = dotSize+2;
      let context = canvas.getContext('2d', {alpha: false});
      context.drawImage(scanvas, -(dotSize-1), -(dotSize-1), 3*dotSize, 3*dotSize);
      colDots.push(canvas);
    }
    for (let i=0; i<200; i++) {
      let canvas = document.createElement('canvas');
      canvas.width = dotSize*zoneSize+2;
      canvas.height = dotSize*zoneSize+2;
      let context = canvas.getContext('2d', {alpha: false});
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'lighter';
      context.globalAlpha = 0.8;
      for (let x=0; x<zoneSize; x++) {
	for (let y=0; y<zoneSize; y++) {
	  if (Math.random() < .5) {
	    let rx = dotSize*(x+.1*Math.random());
	    let ry = dotSize*(y+.1*Math.random());
	    for (let dot of colDots) {
	      context.drawImage(dot, rx+.5*dotSize*(Math.random()-.5), ry+.5*dotSize*(Math.random()-.5));
	    }
	  }
	}
      }
      zones.push(canvas);
    }
  };

  const permut = [];
  const makePermutation = () => {
    let oldPermut = permut.concat();
    for (let i=0; i<zones.length; i++) {
      permut[i] = i;
    }
    for (let i=0; i<zones.length-1; i++) {
      let nbLeft = zones.length-i-1;
      let pick = i+1+Math.floor(nbLeft*Math.random());
      while (i<zones.length-3 && oldPermut[i] == permut[pick])
	pick = i+1+Math.floor(nbLeft*Math.random());
      let tmp = permut[i];
      permut[i] = permut[pick];
      permut[pick] = tmp;
    }
  };
  
  let count = 0;
  let period = 2;
  
  const fillCanvas = () => {
    let mustDraw = (count % period == 0);
    if (onScreen.width != window.innerWidth || onScreen.height != window.innerHeight) {
      onScreen.width = window.innerWidth;
      onScreen.height = window.innerHeight;
      onScreen.style.width = window.innerWidth+'px';
      onScreen.style.height = window.innerHeight+'px';
      onScreenContext = onScreen.getContext('2d', {alpha:false});
      mustDraw = true;
    }
    if (mustDraw) {
      makePermutation();
      onScreenContext.globalCompositeOperation = 'source-over';
      onScreenContext.fillStyle = '#222';
      onScreenContext.fillRect(0, 0, onScreen.width, onScreen.height);
      onScreenContext.globalCompositeOperation = 'lighter';
      let patch = 0;
      for (let x=-halfTileSize*Math.random(); x<onScreen.width; x+=dotSize*zoneSize) {
	for (let y=-halfTileSize*Math.random(); y<onScreen.height; y+=dotSize*zoneSize) {
	  onScreenContext.drawImage(zones[permut[patch % permut.length]], x, y);
	  patch++;
	}
      }
      if (count > 600) {
	period++;
	count = period*Math.ceil(count/period);
      }
    }
    count++;
    if (count < 1500) {
      requestAnimationFrame(fillCanvas);
    }
    if (count == 400) {
      onScreen.style.transition = 'all 5s';
      onScreen.style.filter = 'brightness(0.5) contrast(1.8) saturate(2)';
      setTimeout(() => {
	onScreen.style.filter = 'brightness(0.45) contrast(8) saturate(0.7) blur(2px) brightness(40)';
      }, 5000);
    }
  };


  window.addEventListener('DOMContentLoaded', () => {
    makeZones();
    onScreen = document.createElement('canvas');
    onScreen.style.position = 'absolute';
    onScreen.style.top = '0px';
    onScreen.style.left = '0px';
    onScreen.width = onScreen.height = 0;
    document.body.appendChild(onScreen);
    fillCanvas();
  });

  
})();
