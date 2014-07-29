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
  this.gameIndex = -1;
  this.reset(seed);
}

extend(ServerBoard, Board);

ServerBoard.prototype.reset = function(seed) {
  this.curve = new DifficultyCurve(new MersenneTwister(seed));

  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.held = false;
  this.heldBlockType = -1;
  this.combo = 0;
  this.score = 0;
  this.state = Constants.PLAYING;

  this.blockIndex = 0;
  this.preview = [];
  for (var i = 0; i < Constants.PREVIEW; i++) {
    this.maybeAddToPreview();
  }
  this.block = this.nextBlock();

  // Update state used to stay in sync with the client.
  this.gameIndex += 1;
  this.syncIndex = 0;
}

ServerBoard.prototype.redraw = function() {
  // The server board doesn't need to be drawn.
}

ServerBoard.prototype.nextBlock = function(swap) {
  this.syncIndex += 1;
  return this.__super__.nextBlock.bind(this)(swap);
}

ServerBoard.prototype.serialize = function() {
  return {
    data: this.data,
    blockType: this.block.type,
    gameIndex: this.gameIndex,
    syncIndex: this.syncIndex,
    // The rest of the fields here are the precisely fields that are read
    // by a call to Graphics.drawUI.
    blockIndex: this.blockIndex,
    preview: this.preview,
    held: this.held,
    heldBlockType: this.heldBlockType,
    combo: this.combo,
    score: this.score,
    state: this.state,
    pauseReason: this.pauseReason,
  }
}

return ServerBoard;
})();
