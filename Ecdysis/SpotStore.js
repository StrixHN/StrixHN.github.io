class SpotStore {

  storage = null;


  constructor () {
    this.storage = new SimpleFifo();
    Object.defineProperty(this, 'size', {
      get: () => this.storage.length
    });
  }
  
  
  put (value) {
    this.storage.put(value);
  }

  take () {
    return this.storage.take();
  }

  // Header:
  //    nbSpots: UInt32
  //    maxScale: Float32
  //    maxAlpha: Float32
  //    [spots]
  //
  // Spot:
  //    white: bool - UInt8
  //    spot: num - UInt8
  //    scale: num - UInt16 ( 655535 * scale/maxScale )
  //    angle: angle - UInt16 (65535 * angle / 2*Math.PI)
  //    alpha: alpha - UInt16 ( 655535 * alpha/maxAlpha )
  //    position: pos - 2 x UInt16 ( 65535*x, 65535*y )
  
  toArrayBuffer () {
    const spotSize = 1 + 1 + 2 + 2 + 2 + 2*2;
    const maxScale = this.storage.reduce((acc, x) => Math.max(acc, x.scale), 0);
    const maxAlpha = this.storage.reduce((acc, x) => Math.max(acc, x.alpha), 0);
    const size = 3*4 + this.storage.length*spotSize;
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    view.setUint32(0, this.storage.length);
    view.setFloat32(4, maxScale);
    view.setFloat32(8, maxAlpha);
    let pos = 12;
    this.storage.forEach((spot) => {
      view.setUint8 (pos   , spot.white ? 1 : 0);
      view.setUint8 (pos+1 , spot.spot);
      view.setUint16(pos+2 , Math.round(65535 * (spot.scale / maxScale)));
      view.setUint16(pos+4 , Math.round(65535 * (.5 * spot.angle / Math.PI)));
      view.setUint16(pos+6 , Math.round(65535 * (spot.alpha / maxAlpha)));
      view.setUint16(pos+8 , Math.round(65535 * spot.position[0]));
      view.setUint16(pos+10, Math.round(65535 * spot.position[1]));
      pos += spotSize;
    });
    return buffer;
  }

  loadArrayBuffer (buffer) {
    console.log(buffer);
    const spotSize = 1 + 1 + 2 + 2 + 2 + 2*2;
    const view = new DataView(buffer);
    console.log(view);
    let nbSpots = view.getUint32(0);
    let maxScale = view.getFloat32(4);
    let maxAlpha = view.getFloat32(8);
    console.log(`Nb spots: ${nbSpots}, maxScale: ${maxScale}, maxAlpha: ${maxAlpha}`);
    let pos = 12;
    for  (let i=0; i<nbSpots; i++) {
      this.storage.put({
	white: view.getUint8(pos) > 0,
	spot: view.getUint8(pos+1),
	scale: maxScale*view.getUint16(pos+2) / 65535,
	angle: 2*Math.PI*view.getUint16(pos+4) / 65535,
	alpha: maxAlpha*view.getUint16(pos+6) / 65535,
	position: [
	  view.getUint16(pos+8)  / 65535,
	  view.getUint16(pos+10) / 65535
	]
      });
      pos += spotSize;
    }
  }

  
  saveFile () {
    let fileName = 'spots.dat';
    let buffer = this.toArrayBuffer();
    let blob = new Blob([buffer]);
    let dataURL = window.URL.createObjectURL(blob);
    const elem = window.document.createElement('a');
    elem.href = dataURL;
    elem.download = fileName;
    elem.style.visibility = 'hidden';
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
  }

  
}
