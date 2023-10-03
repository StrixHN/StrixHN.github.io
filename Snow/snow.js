(function() {

  const zones = [];
  const zoneSize = 64;
  const dotSize = 2;

  let onScreen, offScreen, onScreenContext, offScreenContext;
  
  const makeZones = () => {
    let colDots = [];
    for (let color of ['#ff0000', '#00ff00', '#0000ff']) {
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
    for (let i=0; i<100; i++) {
      let canvas = document.createElement('canvas');
      canvas.width = dotSize*zoneSize+2;
      canvas.height = dotSize*zoneSize+2;
      let context = canvas.getContext('2d', {alpha: false});
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'lighter';
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

  let lastSeed = 0;
  
  const fillCanvas = () => {
    offScreenContext.globalCompositeOperation = 'source-over';
    offScreenContext.fillStyle = '#222';
    offScreenContext.fillRect(0, 0, offScreen.width, offScreen.height);
    offScreenContext.globalCompositeOperation = 'lighter';
    let seed = Math.floor(zones.length*Math.random());
    while (seed == lastSeed)
      seed = Math.floor(zones.length*Math.random());
    lastSeed = seed;
    for (let x=0; x<offScreen.width; x+=dotSize*zoneSize) {
      for (let y=0; y<offScreen.height; y+=dotSize*zoneSize) {
	offScreenContext.drawImage(zones[seed], x, y);
	seed++;
	if (seed == zones.length) seed = 0;
      }
    }
    createImageBitmap(offScreen).then((bitmap) => {
      onScreenContext.transferFromImageBitmap(bitmap);
    });
  };


  window.addEventListener('DOMContentLoaded', () => {
    makeZones();
    onScreen = document.body.querySelector('canvas');
    onScreen.style.position = 'absolute';
    onScreen.style.top = '0px';
    onScreen.style.left = '0px';
    onScreen.width = window.innerWidth;
    onScreen.height = window.innerHeight;
    onScreen.style.width = window.innerWidth+'px';
    onScreen.style.height = window.innerHeight+'px';
    onScreenContext = onScreen.getContext('bitmaprenderer');
    offScreen = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    offScreenContext = offScreen.getContext('2d', {alpha:false});
    setInterval(fillCanvas, 1000/20);
  });

  
})();
