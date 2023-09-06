
function WaveWriter (abuffer) {
  var numOfChan = abuffer.numberOfChannels;
  var nbSamples = abuffer.getChannelData(0).length;
  var length = nbSamples * numOfChan * 2 + 44;
  var buffer = new ArrayBuffer(length);
  var view = new DataView(buffer);
  var channels = [], sample, pos = 0;

  function setInt16(data) {
    view.setInt16(pos, data, true);
    pos += 2;
  }

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  this.getWaveAsBuffer = function (normalized) {
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    var i, offset;
    
    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    if (!normalized) {
      for (offset=0; offset<nbSamples; offset++) {
	for (i = 0; i < numOfChan; i++) {             // interleave channels
	  sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
	  sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
	  setInt16(sample);
	}
      }
    } else {
      var max = 0;
      channels.forEach(function(data) {
	data.forEach(function(v) {
	  if (Math.abs(v) > max) max = Math.abs(v);
	});
      });
      var amp = .99 / max;
      console.log(max, amp);
      for (offset=0; offset<nbSamples; offset++) {
	for (i = 0; i < numOfChan; i++) {             // interleave channels
	  sample = amp * channels[i][offset]; // no need to clamp. we're normalizing
	  sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
	  setInt16(sample);
	}
      }
    }

    return buffer;
  };

  this.getWaveAsBlob = function (normalized) {
    var buffer = this.getWaveAsBuffer(normalized);
    console.log(buffer);
    return new Blob([buffer], {type:'audio/wav'});
  };

  this.getWaveAsDataURL = function (normalized) {
    var blob = this.getWaveAsBlob(normalized);
    return window.URL.createObjectURL(blob);
  };

  this.saveWaveFile = function (fileName) {
    if (!fileName) fileName = '';
    var dataURL = this.getWaveAsDataURL();
    const elem = window.document.createElement('a');
    elem.href = dataURL;
    elem.download = fileName;
    elem.style.visibility = 'hidden';
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
  };
  
}
