
class Cell {

  
  constructor (data, changeCB) {
    this.element = null;
    this.active = false;
    this.data = data;
    data.cell = this;
    this.changeCB = changeCB ? changeCB : () => {};
  }

  
  build () {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = makeDiv('cell', [
      makeDiv('vline', null, (e) => {
	this.vLine = e;
      }),
      makeDiv('pline', null, (e) => {
	this.pLine = e;
      }),
      makeDiv('tline', null, (e) => {
	this.tLine = e;
      })
    ]);
    
    this.element.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.data.active = !this.data.active;
      this.update();
      this.changeCB(this);
    });
    
    this.element.addEventListener('wheel', (ev) => {
      if (!this.data.active) return;
      ev.preventDefault();
      let delta = ev.deltaX + ev.deltaY;
      if (ev.ctrlKey) {
	this.data.semitoneShift +=  delta > 0 ? -1 : 1;
      } else if (ev.shiftKey) {
	this.data.pan +=  delta > 0 ? -.05 : .05;
	if (this.data.pan < -1) this.data.pan = -1;
	if (this.data.pan > 1) this.data.pan = 1;
      } else {
	this.data.dbGain +=  delta > 0 ? -1 : 1;
	if (this.data.dbGain > 0) this.data.dbGain = 0;
	if (this.data.dbGain < -60) this.data.dbGain = -60;
      }
      this.update();
      this.changeCB(this);
    });
    this.update();
    return this.element;
  }

  
  update () {
    if (!this.element) return;
    if (this.data.active) {
      this.element.style['background-color'] = '#585858';
      this.vLine.style.display = 'block';
      this.pLine.style.display = 'block';
      this.tLine.style.display = 'block';
    } else {
      this.element.style['background-color'] = '#383838';
      this.vLine.style.display = 'none';
      this.pLine.style.display = 'none';
      this.tLine.style.display = 'none';
    }
    let height = (this.data.dbGain-Cell.minGain)/(-Cell.minGain) * (Cell.size-2);
    this.vLine.style.height = height+'px';
    this.vLine.style.top = (Cell.size - height)+'px';
    this.pLine.style.top = (Cell.size - height)+'px';
    
    if (this.data.pan >= 0) {
      this.pLine.style.width = (2 + this.data.pan*(Cell.size/2-1))+'px';
      this.pLine.style.left = (Cell.size/2-1)+'px';
    } else {
      let w = - this.data.pan*(Cell.size/2-1);
      this.pLine.style.width = (w + 2)+'px';
      this.pLine.style.left = (Cell.size/2-1-w)+'px';
    }
    
    this.tLine.style.left = (Cell.size/2 - 3 + this.data.semitoneShift)+'px';
    this.tLine.classList.remove('up');
    this.tLine.classList.remove('down');
    if (this.data.semitoneShift < 0) this.tLine.classList.add('down');
    if (this.data.semitoneShift > 0) this.tLine.classList.add('up');
  }
  
  
}


Cell.size = 32;
Cell.minGain = -60;
