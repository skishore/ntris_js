var ServerBoard = (function() {
"use strict";

var ServerBoard = function(seed) {
  this.gameIndex = -1;
  ServerBoard.__super__.constructor.bind(this)(seed);
}

extend(ServerBoard, Board);

ServerBoard.prototype.reset = function(seed) {
  ServerBoard.__super__.reset.bind(this)(new MersenneTwister(seed));
  this.forceClientUpdate();
}

ServerBoard.prototype.nextBlock = function(swap) {
  this.syncIndex += 1;
  return ServerBoard.__super__.nextBlock.bind(this)(swap);
}

ServerBoard.prototype.forceClientUpdate = function() {
  this.gameIndex += 1;
  this.syncIndex = 0;
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
