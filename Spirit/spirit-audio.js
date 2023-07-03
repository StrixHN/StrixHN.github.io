( function() {

  let nodesPerSecond = 1;
  let linksPerSecond = 1;
  let minDist = 100;

  let linkTransferWeight = .1;
  let stimulationFollowFactor = .01;
  let stimulationDecreaseFactor = .2;

  let startTime, baseD;

  let nodes = [];

  let distances = [];

  let links = [];

  let ac = new AudioContext();


  let init = () => {
    startTime = Date.now();
    nodes = [{
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      stimulation: 1,
      level: 0,
      color: '#ff0000'
    }];
    distances = [[0]];
  };


  let addNode = () => {
    let num = nodes.length;
    let found = false;
    let x, y;
    distances.push([]);
    while (!found) {
      x = window.innerWidth*Math.random();
      y = window.innerHeight*Math.random();
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
    }
    let col = '#';
    for (let i=0; i<6; i++) col += Math.floor(16*Math.random()).toString(16);
    nodes.push({
      x: x,
      y: y,
      stimulation: 0,
      level: 0,
      color: col
    });
  };


  let addLink = () => {
    let found = false;
    let a, b;
    while (!found) {
      a = Math.floor(nodes.length*Math.random());
      b = Math.floor(nodes.length*Math.random());
      found = links.every(n => (n.a != a) || (n.b != b));
    }
    links.push({
      a: a,
      b: a
    });
  };


  let run = () => {
    let time = (Date.now() - startTime) / 1000;
    
    if (time / nodesPerSecond > nodes.length) addNode();

    if (time/linksPerSecond > links.length+1) addLink();

    for (let l of links) {
      nodes[l.b].stimulation += linkTransferWeight*nodes[l.a].level;
    }

    for (let n of nodes) {
      
    }

  };


  window.addEventListener('DOMContentLoaded', () => {
    let button = document.createElement('button');
    button.innerHTML = 'Play';
    document.body.appendChild(button);
    button.addEventListener('click', () => {
      ac.resume();
      init();
      run();
    });
  });
  
} ) ();
