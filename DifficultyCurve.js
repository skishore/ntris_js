var DifficultyCurve = (function() {
"use strict";

var fixCodeMirrorHeights = function() {
  $('.CodeMirror-gutters').height($('.CodeMirror-lines').height());
  $('.CodeMirror').height($('.CodeMirror-lines').height() + 8);
}

var DifficultyCurve = function(rng) {
  this.rng = rng || Math;
}

DifficultyCurve.prototype.generateBlockType = function(index) {
  var level = DifficultyCurve.getLevel(index);
  var last = level && Block.TYPES[level - 1];
  return Math.floor((Block.TYPES[level] - last)*this.rng.random()) + last;
}

DifficultyCurve.cachedLevels = [];
DifficultyCurve.derandomizer = [];
for (var i = 0; i < Block.LEVELS; i++) {
  DifficultyCurve.derandomizer.push(0);
}

DifficultyCurve.getLevel = function(index) {
  if (index >= this.cachedLevels.length) {
    for (var i = 0; i < index + 1; i++) {
      var level = this.sample(this.distribution(this.cachedLevels.length));
      this.cachedLevels.push(level);
    }
  }
  return this.cachedLevels[index];
}

DifficultyCurve.sample = function(distribution) {
  var sum = this.sum(distribution);
  var max = -Infinity;
  var result = -1;
  for (var i = 0; i < distribution.length; i++) {
    this.derandomizer[i] += distribution[i]/sum;
    if (this.derandomizer[i] > max) {
      max = this.derandomizer[i];
      result = i;
    }
  }
  this.derandomizer[result] -= 1;
  return result;
}

DifficultyCurve.sum = function(array) {
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    result += array[i];
  }
  return result;
}

DifficultyCurve.distribution = function(index) {
  var LEVEL_INTERVAL = 100;
  var FINAL_DISTRIBUTION = [11, 13, 12, 6, 2, 1, 1];
  var FINAL_SCORE = 20*LEVEL_INTERVAL;

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

DifficultyCurve.flatten = function(x) {
  return (x < 0 ? 0 : x/(1 + x));
}

return DifficultyCurve;
})();
