var DifficultyCurve = (function() {
"use strict";

var fixCodeMirrorHeights = function() {
  $('.CodeMirror-gutters').height($('.CodeMirror-lines').height());
  $('.CodeMirror').height($('.CodeMirror-lines').height() + 8);
}

var DifficultyCurve = function(rng) {
  this.rng = rng || Math;
  this.derandomizer = [];
  for (var i = 0; i < Block.LEVELS; i++) {
    this.derandomizer.push(0);
  }
}

DifficultyCurve.prototype.generateBlockType = function(index) {
  var level = this.sample(this.distribution(index));
  var last = level && Block.TYPES[level - 1];
  return Math.floor((Block.TYPES[level] - last)*this.rng.random()) + last;
}

DifficultyCurve.prototype.sample = function(distribution) {
  var sum = this.sum(distribution);
  var max = -Infinity;
  var samples = [];
  for (var i = 0; i < distribution.length; i++) {
    this.derandomizer[i] += distribution[i]/sum;
    if (this.derandomizer[i] > max) {
      max = this.derandomizer[i];
      samples = [i];
    } else if (this.derandomizer[i] == max) {
      samples.push(i);
    }
  }
  var result = samples[0];
  if (samples.length > 1) {
    result = samples[Math.floor(samples.length*this.rng.random())];
  }
  this.derandomizer[result] -= 1;
  return result;
}

DifficultyCurve.prototype.sum = function(array) {
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    result += array[i];
  }
  return result;
}

DifficultyCurve.prototype.distribution = function(index) {
  var FINAL_DISTRIBUTION = [12, 12, 12, 6, 2, 1, 1];
  var FINAL_SCORE = 2400;
  var LEVEL_INTERVAL = 120;

  var result = [];
  for (var i = 0; i < Block.LEVELS; i++) {
    if (i < 2) {
      result.push(FINAL_DISTRIBUTION[i]);
    } else {
      var start = (i - 2)*LEVEL_INTERVAL;
      var x = 2.0*(index - start)/(FINAL_SCORE - start);
      result.push(FINAL_DISTRIBUTION[i]*this.flatten(x));
    }
  }
  return result;
}

DifficultyCurve.prototype.flatten = function(x) {
  return (x < 0 ? 0 : x/(1 + x));
}

return DifficultyCurve;
})();
