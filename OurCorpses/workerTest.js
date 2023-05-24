
const worker = new Worker("worker.js");

let nbSpots = 0;
let spots = [];

let timeStart = 0;

let onWorkerSendsSpot = (spot) => {
  nbSpots++;
  if (nbSpots == 1) {
    console.log(`${(Date.now()-timeStart).toFixed(1)} ms to get first spot.`);
    timeStart = Date.now();
  } else if (nbSpots == 11) {
    console.log(`${(Date.now()-timeStart).toFixed(1)} ms to get 10 spots.`);
  } else if (nbSpots == 101) {
    console.log(`${(Date.now()-timeStart).toFixed(1)} ms to get 100 spots.`);
  } else if (nbSpots == 1001) {
    console.log(`${(Date.now()-timeStart).toFixed(1)} ms to get 1000 spots.`);
  } else if (nbSpots == 2001) {
    console.log(`${(Date.now()-timeStart).toFixed(1)} ms to get 2000 spots.`);
    nbSpots = 0;
    timeStart = Date.now();
    worker.postMessage({action: 'next', nbSpots: 2001});
  }
  spots.push(spot);
};

let onWorkerReady = () => {
  worker.onmessage = onWorkerSendsSpot;
  timeStart = Date.now();
  worker.postMessage({action: 'next', nbSpots: 2001});
};


worker.onmessage = onWorkerReady;

worker.postMessage({action: 'prepare', size: 900});
