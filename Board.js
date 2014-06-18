var Board = (function() {
"use strict";

var Board = function(graphics, target) {
  this.graphics = graphics;
  this.repeater = new KeyRepeater(Constants.PAUSE, Constants.REPEAT, target);

  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }

  this.reset();

  this.afterTime = (new Date).getTime();
  this.sleepTime = Constants.FRAMEDELAY;
  setTimeout(this.gameLoop.bind(this), this.sleepTime);
}

Board.prototype.reset = function() {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.block = null;
  this.frame = 0;
  this.preview = [];
  this.previewFrame = 0;
  this.previewOffset = 0;
  this.held = false;
  this.heldBlockType = -1;
  this.score = 0;
  this.state = Constants.PLAYING;
}

Board.prototype.gameLoop = function() {
  this.beforeTime = (new Date).getTime();
  var extraTime = (this.beforeTime - this.afterTime) - this.sleepTime;

  var frames = Math.floor(extraTime/Constants.FRAMEDELAY) + 1;
  for (var i = 0; i < frames; i++) {
    this.update();
  }
  this.graphics.flip();

  this.afterTime = (new Date).getTime();
  var sleepTime =
      Constants.FRAMEDELAY - (this.afterTime - this.beforeTime) - extraTime;
  setTimeout(this.gameLoop.bind(this), sleepTime);
}

Board.prototype.update = function(keys) {
  var keys = this.repeater.query();

  if (this.state == Constants.PLAYING) {
    this.frame = (this.frame + 1) % Constants.MAXFRAME;

    this.graphics.eraseBlock(this.block);
    if (!this.held && keys.indexOf(Key.HOLD) >= 0) {
      this.block = this.nextBlock(this.block);
    } else if (this.block == null) {
      this.block = this.nextBlock();
    } else {
      var result = Physics.moveBlock(this.block, this.data, this.frame, keys);
      if (result.place) {
        this.score += result.score;
        this.redraw(this.graphics);
        this.block = this.nextBlock();
      }
    }
    this.graphics.drawBlock(this.block);
  } else {
    assert(false, "Unexpected state: " + this.state);
  }
}

Board.prototype.redraw = function(graphics) {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      graphics.drawBoardSquare(i, j, this.data[i][j]);
    }
  }
}

Board.prototype.nextBlock = function(swap) {
  var type = -1;
  if (swap) {
    type = this.heldBlockType;
    this.heldBlockType = swap.type;
  }
  if (type < 0) {
    var blocksNeeded = Constants.PREVIEW - this.preview.length + 1;
    for (var i = 0; i < blocksNeeded; i++) {
      this.preview.push(this.playTetrisGod(this.score));
    }
    this.previewFrame = Constants.PREVIEWFRAMES;
    type = this.preview.shift();
  }

  this.held = (swap ? true : false);
  var result = new Block(type);
  result.rowsFree = Physics.calculateRowsFree(result, this.data);
  return result;
}

Board.prototype.playTetrisGod = function(score) {
  return Math.floor(Block.TYPES[0]*Math.random());
}

return Board;
})();
