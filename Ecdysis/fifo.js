class SimpleFifo {
  
  head = {};

  constructor () {
    this.head.next = this.head.prev = this.head;
    this._length = 0;
    Object.defineProperty(this, 'length', {
      get: () => this._length
    });
  }

  
  // put at the end of the list
  put (value) {
    let holder = {
      v: value,
      next: this.head,
      prev: this.head.prev
    };
    this.head.prev.next = holder;
    this.head.prev = holder;
    this._length++;
  }

  
  // take from the start of the list
  take () {
    let res;
    let h = this.head;
    if (h.next != h) {
      res = h.next.v;
      h.next = h.next.next;
      h.next.previous = h;
      this._length--;
    }
    return res;
  }

  
  clear () {
    this.head.next = this.head.prev = this.head;
    this._length = 0;
  }


  forEach (fun) {
    let current = this.head.next;
    while (current != this.head) {
      fun(current.v);
      current = current.next;
    }
  }

  
  reduce (fun, initVal) {
    let acc = initVal ?? 0;
    let current = this.head.next;
    while (current != this.head) {
      acc = fun(acc, current.v);
      current = current.next;
    }
    return acc;
  }

}
