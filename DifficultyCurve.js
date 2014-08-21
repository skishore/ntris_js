var DifficultyCurve = (function() {
"use strict";

var DifficultyCurve = function(rng) {
  this.rng = rng || Math;
}

DifficultyCurve.prototype.generateBlockType = function(level) {
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
  var LEVEL_INTERVAL = 50;
  var MID_DISTRIBUTION = [11, 18, 12, 6, 2, 1, 1];
  var MID_SCORE = 20*LEVEL_INTERVAL;

  var result = [];
  var exponent = 0.8*(3*index/MID_SCORE - 1);
  for (var i = 0; i < Block.LEVELS; i++) {
    var r = (exponent > 0 ? Math.pow(i - 1, exponent) : 1);
    if (i < 2) {
      result.push(MID_DISTRIBUTION[i]);
    } else {
      var start = (i - 2)*LEVEL_INTERVAL;
      var x = (index - start)/(MID_SCORE - start);
      result.push(MID_DISTRIBUTION[i]*r*2*this.flatten(x));
    }
  }
  return result;
}

DifficultyCurve.flatten = function(x) {
  return (x < 0 ? 0 : x/(1 + x));
}

return DifficultyCurve;
})();
