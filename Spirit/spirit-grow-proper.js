( function() {

  const attraction = 100;

  const maxNbDots = 500;

  const wallBounceFactor = 0.8;

  const growthTime = 30;
  const activeAge = 100;
  
  let segmentsPercircle = 100;
  let angleIncrement = 2*Math.PI/segmentsPercircle;
  let sizeMultiplier = .99;

  let busy = [];
  const busySquareSize = 8;

  let dots = [];
  
  let spiralsPerSecond = 4;
  
  let startTime;

  let startPoints = [];
  let growingSpirals = [];

  let canvas, context;
  let canvas2, context2;
  let w, h, maxSize;

  let init = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    canvas2 = document.createElement('canvas');
    context2 = canvas2.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    canvas2.width = w;
    canvas2.height = h;
    let maxR = Math.min(w, h)/4;
    maxSize = 2*Math.PI*maxR/segmentsPercircle;
    let busyW = Math.ceil(w/busySquareSize);
    let busyH = Math.ceil(h/busySquareSize);
    for (let i=0; i<busyW; i++) {
      busy[i] = new Array(busyH);
      busy[i].fill(0);
    }
    // context.globalAlpha = .6;
    context.fillStyle = '#000';
    context.fillRect(0, 0, w, h);
    document.body.appendChild(canvas);
    document.body.appendChild(canvas2);
    startTime = Date.now();
    startPoints = [{
      x: w / 2,
      y: h / 2,
      direction: Math.random() < .5 ? -1 : 1,
      angle: 2*Math.PI*Math.random()
    }];
  };

  let nbSpirals = 0;
  
  let addSpiral = () => {
    if (!startPoints.length) return;
    let candidateSpirals = [];
    for (let i=0; i<Math.min(1000, startPoints.length); i++) {
      let sp = startPoints[i];
      let spiral = {
	index: i,
	busy: 0,
	step: 0,
	x: sp.x,
	y: sp.y,
	angle: sp.angle,
	angleInc: sp.direction*(.95+.1*Math.random())*angleIncrement,
	size: (.4 + .6*Math.random())*maxSize,
	sizeMult: (.97+.03*Math.random())*sizeMultiplier,
	branch1: Math.round(.1+.3*Math.random()*segmentsPercircle),
	branch2: Math.round(.5+.3*Math.random()*segmentsPercircle)
      };
      let size = spiral.size,
	  x = spiral.x,
	  y = spiral.y;
      for (let i=0; i < 4*segmentsPercircle && size > .1; i++, size *= spiral.sizeMult) {
	if (x > 0 && y > 0 && x < w && y < h) {
	  spiral.busy += busy[Math.floor(x/busySquareSize), Math.floor(y/busySquareSize)];
	} else {
	  spiral.busy += 10000;
	}
	x += spiral.size*Math.cos(spiral.angle);
	y += spiral.size*Math.sin(spiral.angle);
      }
      candidateSpirals.push(spiral);
    }
    let selected = candidateSpirals.reduce((a,b) => a.busy < b.busy ? a : b, candidateSpirals[0]);
    startPoints.splice(selected.index, 1);
    growingSpirals.push(selected);
    nbSpirals++;
  };

  const twoDigitHex = a => (a < 16) ? '0'+a.toString(16) : a.toString(16);
  
  const addDot = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    let rgb = [1,2,3].map(x => Math.floor(32+96*Math.random()));
    rgb[Math.floor(1+2*Math.random())] += 100;
    let color = '#'+rgb.map(twoDigitHex).join('');
    dots.push({
      id: dots.length,
      x: x,
      y: y,
      sx: 0,
      sy: 0,
      age: 0,
      size: 0,
      weight: 0,
      color: color
    });
  };
  

  let step = 0;
  
  let run = () => {
    let time = (Date.now() - startTime) / 1000;
    
    if (dots.length < maxNbDots && time * spiralsPerSecond > nbSpirals) addSpiral();

    let newGS = [];
    for (let s of growingSpirals) {
      if (s.x > 0
	  && s.y > 0
	  && s.x < w
	  && s.y < h) {
	if (s.step == s.branch1 || s.step == s.branch2) {
	  startPoints.push({
	    x: s.x,
	    y: s.y,
	    angle: s.angle % (2*Math.PI),
	    direction: s.angleInc > 0 ? -1 : 1,
	  });
	}
	busy[Math.floor(s.x/busySquareSize), Math.floor(s.y/busySquareSize)]++;
      }
      let a = s.angle - .5 + Math.random();
      let newX = s.x + s.size*Math.cos(a);
      let newY = s.y + s.size*Math.sin(a);
      context.lineWidth = 3; //s.size/2;
      context.globalAlpha = .7;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(s.x, s.y);
      context.lineTo(newX, newY);
      context.stroke();
      
      context.lineWidth = 1.2; //s.size/2;
      context.globalAlpha = .5+.5*Math.random();
      context.strokeStyle = '#ccf';
      context.beginPath();
      context.moveTo(s.x, s.y);
      context.lineTo(newX, newY);
      context.stroke();

      s.step++;
      s.x = newX;
      s.y = newY;
      s.angle = s.angle + s.angleInc;
      s.size *= s.sizeMult;
      if (s.step < 4*segmentsPercircle && s.size > .1) {
	newGS.push(s);
      } else {
	addDot(s.x, s.y);
      }
    }
    growingSpirals = newGS;


    // Process dots

    context2.clearRect(0, 0, w, h);

    let distances = [];
    for (let i=0, l=dots.length; i<l; i++) {
      distances.push([]);
      const d1 = dots[i];
      for (let j=0; j<i; j++) {
	const d2 = dots[j];
	const dx = d1.x-d2.x;
	const dy = d1.y-d2.y;
	distances[i][j] = Math.sqrt(dx*dx + dy*dy);
      }
    }
    
    for (let d of dots) {
      d.age++;
      if (d.age <= growthTime) {
	d.weight = d.size = d.age / growthTime;
      }
      if (d.age >= growthTime) {
	let f = [0, 0];
	for (let d2 of dots) {
	  if (d2 == d) continue;
	  let dist = d.id > d2.id ? distances[d.id][d2.id] : distances[d2.id][d.id];
	  let vx = (d.x-d2.x)/dist;
	  let vy = (d.y-d2.y)/dist;
	  let factor = attraction/(dist*dist);
	  f[0] += factor*vx;
	  f[1] += factor*vy;
	}
	d.sx -= f[0]/d.weight;
	d.sy -= f[1]/d.weight;
      }
    }
    for (let d of dots) {
      if (d.age >= growthTime) {
	d.x += .01*d.sx;
	d.y += .01*d.sy;
      }
      if (d.x < 0) {
	d.x = -d.x;
	d.sx *= -wallBounceFactor;
	d.sy *= wallBounceFactor;
      }
      if (d.y < 0) {
	d.y = -d.y;
	d.sx *= wallBounceFactor;
	d.sy *= -wallBounceFactor;
      }
      if (d.x >= w) {
	d.x -= 2*(d.x-w);
	d.sx *= -wallBounceFactor;
	d.sy *= wallBounceFactor;
      }
      if (d.y >= h) {
	d.y -= 2*(d.y-h);
	d.sx *= wallBounceFactor;
	d.sy *= -wallBounceFactor;
      }
      context2.beginPath();
      context2.fillStyle = d.color;
      context2.arc(d.x, d.y, 3*d.size, 0, 2 * Math.PI, false);
      context2.fill();
    }
    
    step++;
    if (step % 40 == 0) {
      context.globalAlpha = .1;
      context.fillStyle = '#000000';
      context.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(run);

  };


  window.addEventListener('DOMContentLoaded', () => {
    let button = document.createElement('button');
    button.innerHTML = 'Play';
    document.body.appendChild(button);
    button.addEventListener('click', () => {
      document.body.removeChild(button);
      init();
      run();
    });
  });
  
} ) ();
