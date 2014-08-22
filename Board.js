var Board = (function() {
"use strict";

var Board = function(rng) {
  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }
  this.reset(rng);
}

Board.prototype.reset = function(rng) {
  this.curve = new DifficultyCurve(rng);

  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.frame = 0;
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
}

Board.prototype.update = function(keys) {
  if (!this.held && keys.indexOf(Action.HOLD) >= 0) {
    this.block = this.nextBlock(this.block);
  } else if (keys.indexOf(Action.DROP) >= 0) {
    this.block.y += this.block.rowsFree;
    this.updateScore(Physics.placeBlock(this.block, this.data));
    this.maybeRedraw();
    this.block = this.nextBlock();
  } else {
    Physics.moveBlock(this.block, this.data, keys);
  }
  if (this.block.rowsFree < 0) {
    this.state = Constants.GAMEOVER;
  }
}

Board.prototype.updateScore = function(rows) {
  if (rows > 0) {
    this.combo += 1;
    this.score += rows*rows + (this.combo - 1);
  } else {
    this.combo = 0;
  }
}

Board.prototype.maybeRedraw = function() {
  // The base Board class doesn't need to be drawn.
}

Board.prototype.nextBlock = function(swap) {
  var type = -1;
  if (swap) {
    type = this.heldBlockType;
    this.heldBlockType = swap.type;
  }
  if (type < 0) {
    this.maybeAddToPreview();
    type = this.preview.shift();
  }

  this.held = (swap ? true : false);
  var result = new Block(type);
  result.rowsFree = Physics.calculateRowsFree(result, this.data);
  if (this.settings && this.settings.game_type === 'battle') {
    result.color = result.battle_color;
  }
  return result;
}

Board.prototype.maybeAddToPreview = function() {
  this.blockIndex += 1;
  var level = DifficultyCurve.getLevel(this.blockIndex);
  this.preview.push(this.curve.generateBlockType(level));
}

return Board;
})();
