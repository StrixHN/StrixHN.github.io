(function() {

  function permutation(size) {
    let permut = [];
    for (let i=0; i<size; i++) {
      permut[i] = i;
    }
    for (let i=0; i<size-2; i++) {
      let j = i + 1 + Math.floor((size-i-1)*Math.random());
      let tmp = permut[i];
      permut[i] = permut[j];
      permut[j] = tmp;
    }
    return permut;
  }

  function reverse_permutation(permut) {
    let rev_permut = [];
    for (let i=0, l=permut.length; i<l; i++) {
      rev_permut.push(0);
    }
    for (let i=0, l=permut.length; i<l; i++) {
      rev_permut[permut[i]] = i;
    }
    return rev_permut;
  }
  
})();
