
function ampToDb (a) {
  return 20 * Math.log10(a);
}


function dbToAmp (g) {
  return Math.pow(10, g/20);
}


function makeElem (tag, cls, content, extra) {
  let res = document.createElement(tag);
  if (cls) {
    if (Array.isArray(cls)) {
      for (let c of cls) res.classList.add(c);
    } else {
      res.classList.add(cls);
    }
  }
  if (content) {
    if (Array.isArray(content)) {
      for (let e of content) {
	res.appendChild(e);
      }
    } else if (typeof(content) == 'string' || typeof(content) == 'number') {
      if (tag == 'input')
	res.value = content;
      else
	res.innerHTML = content;
    } else if (content) {
      res.appendChild(content);
    }
  }
  if (extra) {
    extra(res);
  }
  return res;
}


function makeManyElems (tag, cls, content, extra) {
  if (extra)
    return content.map((c,i) => makeElem(tag, cls, c, (e) => extra(e,i)));
  else
    return content.map((c,i) => makeElem(tag, cls, c));
}


function makeDiv (cls, content, extra) {
  return makeElem('div', cls, content, extra);
}


function makeLink (cls, content, href, extra) {
  let res = makeElem('a', cls, content, extra);
  if (href) res.href = href;
  return res;
}


if (!HTMLElement.prototype.addElem) {
  HTMLElement.prototype.addElem = function (tag, cls, content, extra) {
    this.appendChild(makeElem(tag, cls, content, extra));
  };
}


if (!HTMLElement.prototype.addDiv) {
  HTMLElement.prototype.addDiv = function (cls, content, extra) {
    this.appendChild(makeElem('div', cls, content, extra));
  };
}


if (!HTMLElement.prototype.appendChildren) {
  HTMLElement.prototype.appendChildren = function (elems) {
    for (let e of elems)
      this.appendChild(e);
  };
}
