(function(){

  let noise = null;
  const dotSize = 2;

  let onScreen, onScreenContext;
  
  const makeZones = (w, h) => {
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
    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    let context = canvas.getContext('2d', {alpha: false});
    context.fillStyle = '#000';
    context.fillRect(0, 0, w, h);
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = 0.8;
    for (let x=0; x<w; x+=dotSize) {
      for (let y=0; y<h; y+=dotSize) {
	if (Math.random() < .5) {
	  let rx = x+.1*dotSize*Math.random();
	  let ry = y+.1*dotSize*Math.random();
	  for (let dot of colDots) {
	    context.drawImage(dot, rx+.5*dotSize*(Math.random()-.5), ry+.5*dotSize*(Math.random()-.5));
	  }
	}
      }
    }
    noise = canvas;
  };

  
  const nbPoints = 59;
  const weight = 3;
  const centerForceFactor = .2;
  const pullProb = 1 / 1000;
  const pullForce = 20;
  const pullDecay = .9;

  const forceLimit = 50;

  const timeScale = .1;

  let points = [], baseDist, baseRadius;
  
  let width, height, context;

  
  function createBlob (cx, cy, radius) {
    baseRadius = radius;
    let angle = 2*Math.PI / nbPoints;
    for (let i=0; i<nbPoints; i++) {
      let r = .05*(1+Math.random());
      points.push({
	x: cx + r*radius*Math.cos(i*angle),
	y: cy + r*radius*Math.sin(i*angle),
	dx: 0,
	dy: 0,
	fx: 0,
	fy: 0
      });
    }
    baseDist = radius * angle;
  }

  
  function pullRandomPoint () {
    let cx = points.reduce((acc, p) => acc + p.x, 0) / nbPoints;
    let cy = points.reduce((acc, p) => acc + p.y, 0) / nbPoints;
    let p = points[Math.floor(nbPoints * Math.random())];
    let v = {x: p.x - cx, y: p.y - cy};
    let norm = Math.sqrt(v.x*v.x + v.y*v.y);
    if (norm < 1) {
      pullRandomPoint();
      return;
    }
    p.fx += pullForce * v.x / norm;
    p.fy += pullForce * v.y / norm;
  }

  
  function totalForce (pId, cx, cy) {
    let p1 = points[pId];
    let f = {x: p1.fx, y: p1.fy};
    let neighbours;
    if (pId == 0)
      neighbours = [points[nbPoints-1], points[1]];
    else if (pId == nbPoints-1)
      neighbours = [points[nbPoints-2], points[0]];
    else
      neighbours = [points[pId-1], points[pId+1]];
    neighbours.unshift({x: cx, y: cy});
    let first = true;
    for (let p2 of neighbours) {
      let bd = baseDist;
      let factor = 1;
      if (first) {
	bd = baseRadius;
	factor = centerForceFactor;
	first = false;
      }
      let vx = p2.x - p1.x, vy = p2.y - p1.y;
      let norm = Math.sqrt(vx*vx + vy*vy);
      let force = Math.min(forceLimit, norm / bd);
      if (norm < bd) {
	force = (norm == 0) ? -forceLimit : -Math.min(forceLimit, bd/norm);
      }
      f.x += factor * force * vx / norm;
      f.y += factor * force * vy / norm;
    }
    return f;
  }

  
  function moveStep () {
    // if (step == 0 || Math.random() < pullProb) {
    //   pullRandomPoint();
    // }
    // step += 1;
    let cx = points.reduce((acc, p) => acc + p.x, 0) / nbPoints;
    let cy = points.reduce((acc, p) => acc + p.y, 0) / nbPoints;
    let dx = 2 * cx / width - 1;
    let dy = 2 * cy / height - 1;
    if (Math.abs(dx) > 0.8) {
      if (dx > 0)
	cx -= .5*width*Math.random();
      else
	cx += .5*width*Math.random();
    }
    if (Math.abs(dy) > 0.8) {
      if (dy > 0)
	cy -= .5*height*Math.random();
      else
	cy += .5*height*Math.random();
    }
    for (let i in points) {
      let f = totalForce(1*i, cx, cy);
      points[i].dx += f.x / weight;
      points[i].dy += f.y / weight;
    }
    for (let p of points) {
      p.x += timeScale * p.dx;
      p.y += timeScale * p.dy;
      p.fx *= pullDecay;
      p.fy *= pullDecay;
    }
  }


  function draw () {
    // TRY: no delete and context.fillStyle = 'rgba(20, 40, 160, .7)';
    let minX = points.reduce((acc, p) => Math.min(acc, p.x), 10000);
    let minY = points.reduce((acc, p) => Math.min(acc, p.y), 10000);
    let maxX = points.reduce((acc, p) => Math.max(acc, p.x), 0);
    let maxY = points.reduce((acc, p) => Math.max(acc, p.y), 0);
    // context.filter = 'none';
    context.globalCompositeOperation = 'source-over';
    // context.fillStyle = 'rgba(0, 0, 0, .1)';
    // context.fillRect(minX-30, minY-30, maxX-minX+60, maxY-minY+60);
    context.fillStyle = 'rgba(255, 255, 255, .3)';
    context.filter = "blur(6px)";
    context.beginPath();
    context.moveTo(points[nbPoints-1].x, points[nbPoints-1].y);
    for (let p  of points) {
      context.lineTo(p.x, p.y);
    }
    context.fill();
    context.filter = 'none';
    context.globalCompositeOperation = 'darken';
    let tx = dotSize*Math.round((minX-20)/dotSize);
    let ty = dotSize*Math.round((minY-20)/dotSize);
    let w = dotSize*Math.round((maxX-minX+40)/dotSize);
    let h = dotSize*Math.round((maxY-minY+40)/dotSize);
    let sx = dotSize*Math.floor(Math.random()*(width-w)/dotSize);
    let sy = dotSize*Math.floor(Math.random()*(height-h)/dotSize);
    context.drawImage(noise, sx, sy, w, h, tx, ty, w, h);
  }


  let act = true;
  function animate () {
    if (act) {
      moveStep();
      draw();
    }
    act = !act;
    requestAnimationFrame(animate);
  }

  
  window.addEventListener('DOMContentLoaded', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    let onScreen = document.createElement('canvas');
    onScreen.style.position = 'absolute';
    onScreen.style.top = '0px';
    onScreen.style.left = '0px';
    onScreen.style.width = width+'px';
    onScreen.style.height = height+'px';
    onScreen.width = width;
    onScreen.height = height;
    document.body.appendChild(onScreen);
    context = onScreen.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    makeZones(width, height);
    createBlob(width/2, height/2, Math.min(width, height)/8);
    pullRandomPoint();
    // pullRandomPoint();
    // for (let i=0; i<1000; i++)
    //   moveStep();
    animate();
  });

  
})();
