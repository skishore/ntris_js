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
    } else if (this.block == null ||
               this.moveBlock(this.block, this.data, keys)) {
      this.block = this.nextBlock();
    }
    this.graphics.drawBlock(this.block);
  } else {
    assert(false, "Unexpected state: " + this.state);
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
  return new Block(type);
}

Board.prototype.playTetrisGod = function(score) {
  return Math.floor(29*Math.random());
}

Board.prototype.moveBlock = function(block, data, keys) {
  var shift = new Point(0, 0);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == Key.RIGHT) {
      shift.x += 1;
    } else if (keys[i] == Key.LEFT) {
      shift.x -= 1;
    } else if (keys[i] == Key.UP) {
      shift.y -= 1;
    } else if (keys[i] == Key.DOWN) {
      shift.y += 1;
    }
  }

  block.x += shift.x;
  block.y += shift.y;

  if (this.checkBlock(block, data) != Constants.OK) {
    block.x -= shift.x;
    block.y -= shift.y;
  }
}

Board.prototype.checkBlock = function(block, data) {
  var offsets = block.getOffsets();
  var status = Constants.OK;

  for (var i = 0; i < offsets.length; i++) {
    if (offsets[i].x < 0) {
      status = Math.min(Constants.LEFTEDGE, status);
    } else if (offsets[i].x >= Constants.COLS) {
      status = Math.min(Constants.RIGHTEDGE, status);
    } else if (offsets[i].y < 0) {
      status = Math.min(Constants.TOPEDGE, status);
    } else if (offsets[i].y >= Constants.ROWS) {
      status = Math.min(Constants.BOTTOMEDGE, status);
    } else if (data[offsets[i].y][offsets[i].x] != 0) {
      status = Math.min(Constants.OVERLAP, status);
    }
  }

  return status;
}

return Board;
})();
