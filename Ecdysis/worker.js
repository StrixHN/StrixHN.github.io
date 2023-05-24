
let canvasSize = 200;
let margin = 0.5;
let minRadius = 1, maxRadius = 6;
let minAlpha = .1, maxAlpha = .3;
let focusAreaWeight = 20;

let reference;
let currentState;
let focusFactor;
let lastImage = false;


let spots, portraits;



let loadImageBitmap = url =>
  fetch(url, {mode: 'cors'})
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));


let loadImageData = (url, size) => new Promise((resolve, reject) => {
  loadImageBitmap(url).then((bitmap) => {
    let w, h;
    if (size) {
      w = h = size;
    } else {
      w = bitmap.width;
      h = bitmap.height;
    }
    let ctx = new OffscreenCanvas(w, h).getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);
    resolve(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
  });
});


let loadPortraits = () => new Promise((resolve, reject) => {
  let current = 0;
  let load = () => {
    let p = portraits[current];
    loadImageData('portraits/'+p.name, canvasSize).then((imgData) => {
      let brightness = [];
      for (let i=0; i<canvasSize; i++)
	brightness.push(new Float32Array(canvasSize));
      let min = 1, max = 0;
      for (let x = 0; x < canvasSize; x++) {
	let pos = 4*x;
	for (let y = 0; y < canvasSize; y++) {
	  let r = imgData.data[pos]/255.;
	  let g = imgData.data[pos+1]/255.;
	  let b = imgData.data[pos+2]/255.;
	  let val = Math.sqrt(r*r+g*g+b*b);
	  brightness[x][y] = Math.sqrt(r*r+g*g+b*b);
	  if (val > max) max = val;
	  if (val < min) min = val;
	  pos += 4*canvasSize;
	}
      }
      let scale = 1./(max-min);
      for (let x = 0; x < canvasSize; x++) {
	for (let y = 0; y < canvasSize; y++) {
	  brightness[x][y] = scale*(brightness[x][y] - min);
	}
      }
      p.brightness = brightness;
      current++;
      if (current < portraits.length) load();
      else resolve();
    });
  };
  load();
});


let loadSpots = () => new Promise((resolve, reject) => {
  let current = 0;
  let load = () => {
    let s = spots[current];
    loadImageBitmap('spots/'+s.name).then((bitmap) => {
      s.img = bitmap;
      current++;
      if (current < spots.length) load();
      else resolve();
    });
  };
  load();
});


let currentPortrait = -1;
let nextPortrait = () => {
  if (lastImage) return false;
  currentPortrait++;
  console.log('Loading portrait '+currentPortrait);
  if (currentPortrait < portraits.length) {
    let p = portraits[currentPortrait];
    reference = p.brightness;
    let w = p.brightness.length;
    let h = p.brightness[0].length;
    let cx = w*p.focus.cx;
    let cy = w*p.focus.cy;
    let hScale = 1/(p.focus.rx*w);
    let vScale = 1/(p.focus.ry*h);
    let maxDist = 0;
    for (let c of [[0, 0], [w, 0], [0, h], [w, h]]) {
      let dx = hScale*(c[0]-cx);
      let dy = vScale*(c[1]-cy);
      let dist = dx*dx+dy*dy;
      if (dist > maxDist) maxDist = dist;
    }
    maxDist = Math.sqrt(maxDist);
    focusFactor = (x,y) => {
      let dx = hScale*(x-cx);
      let dy = vScale*(y-cy);
      let d = Math.sqrt(dx*dx+dy*dy);
      return d < 1 ? focusAreaWeight : 1+(focusAreaWeight-1)*(1-(d-1)/(maxDist-1));
    };
  } else {
    lastImage = true;
    for (let c of reference) c.fill(1);
  }
  return true;
};


let getImageDataAlpha = (imgData) => {
  let w = imgData.width, h = imgData.height;
  let alpha = [];
  for (let i=0; i<w; i++)
    alpha.push(new Float32Array(h));
  for (let x = 0; x < w; x++) {
    let pos = 4*x;
    for (let y = 0; y < h; y++) {
      alpha[x][y] = imgData.data[pos+3]/255.;
      pos += 4*w;
    }
  }
  return alpha;
};


let getSpotAlpha = (spot, scale, angle) => {
  let s = Math.max(spot.dimensions[0], spot.dimensions[1]);
  s = Math.ceil(s*scale);
  let ocv = new OffscreenCanvas(2*s, 2*s);
  let ctx = ocv.getContext('2d');
  ctx.translate(s, s);
  ctx.scale(scale, scale);
  ctx.rotate(angle);
  ctx.translate(-spot.center[0], -spot.center[1]);
  ctx.drawImage(spot.img, 0, 0);
  let imgData = ctx.getImageData(0, 0, 2*s, 2*s);
  let alpha = getImageDataAlpha(imgData);
  let threshold = .05;
  let minX = s, minY = s, maxX = s+1, maxY = s+1;

  let a=0, b=minX, m;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (alpha[m].some(x => x>threshold)) {
      b = m;
    } else {
      a = m+1;
    }
    m = Math.floor((a+b)/2);
  }
  minX = a;

  a = maxX; b = 2*s-1;
  while (b>a) {
    m = Math.ceil((a+b)/2);
    if (alpha[m].some(x => x>threshold)) {
      a = m;
    } else {
      b = m-1;
    }
    m = Math.floor((a+b)/2);
  }
  maxX = b;

  let lineHasVisible = (y) => {
    for (let x = minX; x <= maxX; x++)
      if (alpha[x][y] > threshold) return true;
    return false;
  };

  a=0, b=minY;
  while (b>a) {
    m = Math.floor((a+b)/2);
    if (lineHasVisible(m)) {
      b = m;
    } else {
      a = m+1;
    }
    m = Math.floor((a+b)/2);
  }
  minY = a;
  
  a = maxY; b = 2*s-1;
  while (b>a) {
    m = Math.ceil((a+b)/2);
    if (lineHasVisible(m)) {
      a = m;
    } else {
      b = m-1;
    }
    m = Math.floor((a+b)/2);
  }
  maxY = b;
  
  let res = [];
  for (let x=minX; x<=maxX; x++) {
    res.push(alpha[x].slice(minY, maxY+1));
  }
  return {shape: res, cx: s-minX, cy: s-minY};
};


let squareDifferenceImprovement =  (left, top, w, h, shape, alpha) => {
  let squareSumC = 0, squareSumB = 0, squareSumW = 0, best = 0;
  let white;
  for (let sx=0, x=left; sx<w; sx++, x++) {
    for (let sy=0, y=top; sy<h; sy++, y++) {
      let vB = (1-alpha*shape[sx][sy])*currentState[x][y];
      let vW = currentState[x][y] + alpha*shape[sx][sy]*(1-currentState[x][y]);
      let dC = reference[x][y]-currentState[x][y];
      let dB = reference[x][y]-vB;
      let dW = reference[x][y]-vW;
      squareSumC += dC*dC;
      squareSumB += dB*dB;
      squareSumW += dW*dW;
    }
  }
  let deltaW = squareSumC-squareSumW;
  let deltaB = squareSumC-squareSumB;
  if (deltaW > deltaB)
    return {d: deltaW, wh: true};
  else
    return {d: deltaB, wh: false};
};


let addSpot = () => {
  let spotNum = Math.floor(spots.length*Math.random());
  let spot = spots[spotNum];
  let alpha = minAlpha+(maxAlpha-minAlpha)*Math.random();
  let radius = minRadius + (maxRadius-minRadius)*Math.random();
  let scale = radius / spot.radius;
  let white;
  let angle = 2*Math.PI*Math.random();
  let {shape, cx, cy} = getSpotAlpha(spot, scale, angle);
  let w = shape.length;
  let h = shape[0].length;
  // usable width / height
  let uw = canvasSize-w-2*margin;
  let uh = canvasSize-h-2*margin;
  let best = 0, bestPos = [0, 0];
  let nbBoxes = Math.min(25, Math.floor(canvasSize/Math.max(w, h)));
  //while (best == 0) {
    for (let i=0; i<nbBoxes; i++) {
      for (let j=0; j<nbBoxes; j++) {
	let pos = [
	  margin+Math.floor(uw*(i+Math.random())/nbBoxes),
	  margin+Math.floor(uh*(j+Math.random())/nbBoxes)
	];
	let {d, wh} = squareDifferenceImprovement(pos[0], pos[1], w, h, shape, alpha);
	d *= focusFactor(pos[0]+cx, pos[1]+cy);
	if (d > best) {
	  white = wh;
	  best = d;
	  bestPos = pos;
	}
      }
    }
  //}
  if (best > 0) {
    if (white) {
      for (let sx=0, x=bestPos[0]; sx<w; sx++, x++)
	for (let sy=0, y=bestPos[1]; sy<h; sy++, y++)
	  currentState[x][y] += alpha*shape[sx][sy]*(1-currentState[x][y]);
    } else {
      for (let sx=0, x=bestPos[0]; sx<w; sx++, x++)
	for (let sy=0, y=bestPos[1]; sy<h; sy++, y++)
	  currentState[x][y] -= alpha*shape[sx][sy]*currentState[x][y];
    }
    let pos = [
      (bestPos[0]+cx)/canvasSize,
      (bestPos[1]+cy)/canvasSize
    ];
    scale /= canvasSize;
    postMessage({
      white: white,
      spot: spotNum,
      scale: scale,
      angle: angle,
      alpha: alpha,
      position: pos
    });
  }
  return best > 0;
};

onmessage = (e) => {
  switch (e.data.action) {
  case 'prepare':
    spots = e.data.spots;
    portraits = e.data.portraits;
    canvasSize = e.data.canvasSize ?? canvasSize;
    minRadius = e.data.minRadius ?? minRadius;
    maxRadius = e.data.maxRadius ?? maxRadius;
    margin = e.data.margin ?? margin;
    minAlpha = e.data.minAlpha ?? minAlpha;
    maxAlpha = e.data.maxAlpha ?? maxAlpha;
    focusAreaWeight = e.data.focusAreaWeight ?? focusAreaWeight;
    // minRadius, maxRadius and margin are expressed in percentage of image size
    minRadius *= canvasSize/100;
    maxRadius *= canvasSize/100;
    margin = Math.round(margin*canvasSize/100);
    
    loadSpots().then(loadPortraits).then(() => {
      currentState = [];
      for (let i=0; i<canvasSize; i++) {
	let col = new Float32Array(canvasSize);
	col.fill(1);
	currentState.push(col);
      }
      postMessage('workerReady');
    });
    break;
  case 'next':
    let t0 = Date.now();
    nextPortrait();
    let nb = 0;
    while (nb < e.data.nbSpots) {
      if (addSpot()) nb++;
    }
    console.log(`Got ${nb} spots in ${Date.now()-t0} ms`);
    break;
  case 'all':
    let pos = 0;
    while (nextPortrait()) {
      let t0 = Date.now();
      let nb = 0;
      while (nb < e.data.nbSpots[pos]) {
	if (addSpot()) nb++;
      }
      console.log(`Got ${nb} spots in ${Date.now()-t0} ms`);
      pos++;
    }
    break;
  }
};
