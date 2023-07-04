( function() {

  let nodesPerSecond = 1;
  let linksPerSecond = 1;
  let minDist = 50;

  let linkTransferWeight = .09;
  let stimulationFollowFactor = .01;
  let stimulationDecreaseFactor = .2;

  let startTime, baseD;

  let nodes = [];

  let distances = [];

  let links = [];

  let ac = new AudioContext();
  let canvas, context;
  let w, h;

  let colors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];


  let init = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    ac.resume();
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    minDist = Math.min(w, h)/16;
    context = canvas.getContext('2d');
    document.body.appendChild(canvas);
    startTime = Date.now();
    nodes = [{
      first: true,
      nbOutgoing: 0,
      x: w / 2,
      y: h / 2,
      stimulation: 1,
      level: 0,
      color: '#ff0000'
    }];
    distances = [[0]];
  };

  
  let noMoreNodes = false;
  let noMoreLinks = false;
  
  let addNode = () => {
    let num = nodes.length;
    let found = false;
    let x, y;
    distances.push([]);
    let count = 0;
    while (!found) {
      x = w*Math.random();
      y = h*Math.random();
      found = true;
      for (let i=0, l=nodes.length; i<l && found; i++) {
	let n = nodes[i];
	let dx = x-n.x;
	let dy = y-n.y;
	let d = Math.sqrt(dx*dx + dy*dy);
	if (d < minDist)
	  found = false;
	else
	  distances[num][i] = distances[i][num] = d;
      }
      if (!found) {
	count++;
	if (count >= 1000) {
	  noMoreNodes = true;
	  distances.pop();
	  return;
	}
      }
    }
    nodes.push({
      first: false,
      x: x,
      y: y,
      nbOutgoing: 0,
      stimulation: 0,
      level: 0,
      color: colors[Math.floor(colors.length*Math.random())]
    });
  };


  let addLink = () => {
    let found = false;
    let a, b;
    let count = 0;
    while (!found) {
      a = Math.floor(nodes.length*Math.random());
      b = Math.floor(nodes.length*Math.random());
      found = b != 0 && a != b && links.every(n => (n.a != a) || (n.b != b));
      if (!found) {
	count++;
	if (count >= 1000) {
	  noMoreLinks = true;
	  return;
	}
      }
    }
    links.push({
      a: a,
      b: b
    });
    nodes[a].nbOutgoing++;
  };


  let step = 0;
  
  let run = () => {
    let time = (Date.now() - startTime) / 1000;
    
    if (!noMoreNodes && time / nodesPerSecond > nodes.length) addNode();

    if (!noMoreLinks && time / linksPerSecond > links.length+1) addLink();

    for (let l of links) {
      nodes[l.b].stimulation += linkTransferWeight*nodes[l.a].level / Math.sqrt(nodes[l.a].nbOutgoing);
    }

    let maxLevel = 0, maxStimulation = 0;
    for (let n of nodes) {
      n.level += (n.stimulation - n.level)*stimulationFollowFactor;
      if (!n.first) {
	n.stimulation -= n.level * stimulationDecreaseFactor;
      }
      if (Math.abs(n.level) > maxLevel)
	maxLevel = Math.abs(n.level);
      if (Math.abs(n.stimulation) > maxStimulation)
	maxStimulation = Math.abs(n.stimulation);
    }
    
    for (let n of nodes) {
      n.level /= maxLevel;
    }

    let x = step % w;

    context.lineWidth = 1;
    context.globalAlpha = 1;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, w, h);
    context.fillStyle = '#0000ff';
    context.strokeStyle = '#8800aa';

    for (let l of links) {
      let a = nodes[l.a];
      let b = nodes[l.b];
      context.globalAlpha = Math.abs(a.level);
      context.strokeStyle = a.color;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    for (let n of nodes) {
      if (n.first) continue;
      context.globalAlpha = Math.abs(n.level);
      context.fillStyle = n.color;
      context.fillRect(n.x-5, n.y-5, 10, 10);
    }

    step++;
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
