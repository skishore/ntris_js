var ServerBoard = (function() {
"use strict";

var ServerBoard = function(seed) {
  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }
  this.reset(seed);
}

extend(ServerBoard, Board);

ServerBoard.prototype.reset = function(seed) {
  this.rng = new MersenneTwister(seed);

  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.frame = 0;
  this.held = false;
  this.heldBlockType = -1;
  this.score = 0;
  this.state = Constants.PLAYING;

  this.preview = [];
  for (var i = 0; i < Constants.PREVIEW; i++) {
    this.maybeAddToPreview();
  }
  this.blockIndex = 0;
  this.block = this.nextBlock();
}

ServerBoard.prototype.redraw = function() {
  // The server board doesn't need to be drawn.
}

ServerBoard.prototype.serialize = function() {
  return {
    data: this.data,
    blockType: this.block.type,
    // The rest of the fields here are the precisely fields that are read
    // by a call to Graphics.drawUI.
    blockIndex: this.blockIndex,
    preview: this.preview,
    held: this.held,
    heldBlockType: this.heldBlockType,
    score: this.score,
    state: this.state,
    pauseReason: this.pauseReason,
  }
}

ServerBoard.prototype.random = function() {
  return this.rng.random();
}

return ServerBoard;
})();
