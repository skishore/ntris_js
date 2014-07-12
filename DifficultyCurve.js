var DifficultyCurve = (function() {
"use strict";

var DifficultyCurve = function(rng) {
  this.rng = rng || Math;
}

DifficultyCurve.prototype.generateBlockType = function(index) {
  var level = this.difficultyLevel(index);
  return Math.floor(Block.TYPES[level]*this.rng.random());
}

DifficultyCurve.prototype.difficultyLevel = function(index) {
  if (Block.LEVELS === 1) {
    return 0;
  }
  // Calculate the ratio r between the probability of different levels.
  var p = this.rng.random();
  var x = 2.0*(index - Constants.HALFRSCORE)/Constants.HALFRSCORE;
  var r = (Constants.MAXR - Constants.MINR)*this.sigmoid(x) + Constants.MINR;
  // Run through difficulty levels and compare p to a sigmoid for each level.
  for (var i = 1; i < Block.LEVELS ; i++) {
    var x = 2.0*(index - i*Constants.LEVELINTERVAL)/Constants.LEVELINTERVAL;
    if (p > Math.pow(r, i)*this.sigmoid(x)) {
      return i - 1;
    }
  }
}

DifficultyCurve.prototype.sigmoid = function(x) {
  return (x/Math.sqrt(1 + x*x) + 1)/2;
}

return DifficultyCurve;
})();
