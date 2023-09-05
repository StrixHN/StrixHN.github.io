
class Cell {

  
  constructor (data) {
    this.element = null;
    this.active = false;
    this.data = data;
  }

  
  build () {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = makeDiv('cell', [
      makeDiv('vline', null, (e) => {
	this.vLine = e;
      }),
      makeDiv('hline', null, (e) => {
	this.hLine = e;
      })
    ]);
    
    this.element.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.data.active = !this.data.active;
      this.update();
    });
    
    this.element.addEventListener('wheel', (ev) => {
      if (!this.data.active) return;
      ev.preventDefault();
      let delta = ev.deltaX + ev.deltaY;
      if (ev.ctrlKey) {
	this.data.semitoneShift +=  delta > 0 ? -1 : 1;
      } else {
	this.data.dbGain +=  delta > 0 ? -1 : 1;
	if (this.data.dbGain > 0) this.data.dbGain = 0;
	if (this.data.dbGain < -60) this.data.dbGain = -60;
      }
      this.update();
    });
    this.update();
    return this.element;
  }

  
  update () {
    if (!this.element) return;
    if (this.data.active) {
      this.element.style['background-color'] = '#585858';
      this.vLine.style.display = 'block';
      this.hLine.style.display = 'block';
    } else {
      this.element.style['background-color'] = '#383838';
      this.vLine.style.display = 'none';
      this.hLine.style.display = 'none';
    }
    let height = (this.data.dbGain-Cell.minGain)/(-Cell.minGain) * (Cell.size-2);
    this.vLine.style.height = height+'px';
    this.vLine.style.top = (Cell.size - height)+'px';
    this.hLine.style.top = (Cell.size - height - 2)+'px';
    this.hLine.style.left = (Cell.size/2 - 5 + this.data.semitoneShift)+'px';
    this.hLine.classList.remove('up');
    this.hLine.classList.remove('down');
    if (this.data.semitoneShift < 0) this.hLine.classList.add('down');
    if (this.data.semitoneShift > 0) this.hLine.classList.add('up');
  }
  
  
}


Cell.size = 32;
Cell.minGain = -60;
