( function() {

  const dotSteps = 10;

  const attraction = 100;

  const maxNbDots = 200;

  const sizeScale  = 3;

  const wallBounceFactor = 1;

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

  const breakDotMaybe = (i) => {
    let od = dots[i];
    if (od.weight*Math.random() < 30) return false;
    let weights = [];
    let w = od.weight;
    while (w > 2 && w > od.weight / 10) {
      let nw = w*(1+Math.random())/4;
      weights.push(nw);
      w -= nw;
    }
    weights.push(w);
    weights.sort((a,b) => b-a);
    let nd = weights.map((w) => {
      return {
	x: 0,
	y: 0,
	sx: 0,
	sy: 0,
	age: od.age,
	weight: w,
	size: sizeScale*Math.sqrt(w),
	color: od.color
      };
    });
    let a = 2*Math.PI*Math.random();
    nd[1].x = (nd[0].size + nd[1].size)*Math.cos(a);
    nd[1].y = (nd[0].size + nd[1].size)*Math.sin(a);
    let fitOptions = [
      {	c1: nd[0], c2: nd[1] },
      { c1: nd[1], c2: nd[0] }
    ];
    const dc = Math.cos(Math.PI / 100);
    const ds = Math.sin(Math.PI / 100);
    for (let i=2; i<nd.length; i++) {
      let ad = nd[i];
      let option = fitOptions.shift();
      let dx = option.c2.x-option.c1.x;
      let dy = option.c2.y-option.c1.y;
      let dist = Math.sqrt(dx*dx+dy*dy);
      let cos = dx/dist;
      let sin = dy/dist;
      let d1 = ad.size + option.c1.size;
      let d2 = ad.size + option.c2.size;
      let x, y;
      do {
	let c = cos*dc - sin*ds;
	sin = cos*ds + sin*dc;
	cos = c;
	x = option.c1.x + d1 * cos;
	y = option.c1.y + d1 * sin;
	dx = x-option.c2.x;
	dy = y-option.c2.y;
	dist = Math.sqrt(dx*dx + dy*dy);
      } while (dist < d2)
      ad.x = x;
      ad.y = y;
      fitOptions.push({c1: option.c1, c2: ad});
      fitOptions.push({c1: ad, c2: option.c2});
    }
    let cx = nd.reduce((a,dot) => a + dot.x*dot.weight, 0) / od.weight;
    let cy = nd.reduce((a,dot) => a + dot.y*dot.weight, 0) / od.weight;
    for (let d of nd) {
      d.x -= cx;
      d.y -= cy;
      d.sx = 20*d.x;
      d.sy = 20*d.y;
      d.x += od.x;
      d.y += od.y;
      dots.push(d);
    }
    console.log(nd);
    dots[i] = null;
    return true;
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
    context2.globalAlpha = 2/dotSteps;

    for (let l=0; l<dotSteps; l++) {

      let nbDots = dots.length;
      
      let distances = [];
      for (let i=0; i<nbDots; i++) {
	distances.push([]);
	const d1 = dots[i];
	for (let j=0; j<i; j++) {
	  const d2 = dots[j];
	  const dx = d1.x-d2.x;
	  const dy = d1.y-d2.y;
	  distances[i][j] = Math.sqrt(dx*dx + dy*dy);
	}
      }

      let maxWeight = 0;
      let maxDot = null;
      for (let id1=0; id1<nbDots; id1++) {
	let d1 = dots[id1];
	if (!d1) continue;
	d1.age++;
	if (d1.age <= growthTime) {
	  d1.weight = d1.age / growthTime;
	  d1.size = sizeScale*d1.weight;
	} else {
	  if (d1.weight > maxWeight) {
	    maxWeight = d1.weight;
	    maxDot = d1;
	  }
	  let f = [0, 0];
	  for (let id2=0; id2<nbDots; id2++) {
	    let d2 = dots[id2];
	    if (id1 == id2 || !d2) continue;
	    let dist = id1 > id2 ? distances[id1][id2] : distances[id2][id1];
	    if (dist < Math.max(d1.size, d2.size)) {
	      d1.x = (d1.weight*d1.x + d2.weight*d2.x)/(d1.weight+d2.weight);
	      d1.y = (d1.weight*d1.y + d2.weight*d2.y)/(d1.weight+d2.weight);
	      d1.sx = (d1.weight*d1.sx + d2.weight*d2.sx)/(d1.weight+d2.weight);
	      d1.sy = (d1.weight*d1.sy + d2.weight*d2.sy)/(d1.weight+d2.weight);
	      d1.color = d1.weight > d2.weight ? d1.color : d2.color;
	      d1.weight = d1.weight + d2.weight;
	      d1.size = sizeScale*Math.sqrt(d1.weight);
	      dots[id2] = null;
	      if (breakDotMaybe(id1)) break;
	    } else {
	      let vx = (d1.x-d2.x)/dist;
	      let vy = (d1.y-d2.y)/dist;
	      let factor = d2.weight*attraction/(dist*dist);
	      f[0] += factor*vx;
	      f[1] += factor*vy;
	    }
	  }
	  d1.sx -= f[0]/d1.weight;
	  d1.sy -= f[1]/d1.weight;
	}
      }
      dots = dots.filter(d => (d != null));
      if (maxDot) {
	maxDot.sx += (w/2 - maxDot.x)/10000;
	maxDot.sy += (h/2 - maxDot.y)/10000;
      }
      for (let d of dots) {
	if (d.age >= growthTime) {
	  d.x += .01*d.sx/dotSteps;
	  d.y += .01*d.sy/dotSteps;
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
	context2.arc(d.x, d.y, d.size, 0, 2 * Math.PI, false);
	context2.fill();
      }
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
