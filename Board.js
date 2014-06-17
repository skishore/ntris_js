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
               this.moveBlock(this.block, this.data, this.frame, keys)) {
      this.redraw(this.graphics);
      this.block = this.nextBlock();
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
  result.rowsFree = this.calculateRowsFree(result, this.data);
  return result;
}

Board.prototype.playTetrisGod = function(score) {
  return Math.floor(Block.TYPES[0]*Math.random());
}

// Move the block and possibly update data. Note that this function can also
// update score non-statically, if the block is placed and it scores.
Board.prototype.moveBlock = function(block, data, frame, keys) {
  var shift = 0;
  var drop = frame % Constants.GRAVITY == 0;
  var turn = 0;
  var moved = false;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key == Key.RIGHT) {
      shift++;
    } else if (key == Key.LEFT) {
      shift--;
    } else if (key == Key.DOWN) {
      drop = true;
    } else if (key == Key.UP && block.rotates) {
      turn = 1;
    } else if (key == Key.DROP) {
      block.y += block.rowsFree;
      this.score += this.placeBlock(block, data);
      return true;
    }
  }

  if (shift != 0) {
    block.x += shift;
    if (this.checkBlock(block, data) == Constants.OK) {
      moved = true;
    } else {
      block.x -= shift;
    }
  }

  if (turn != 0) {
    block.angle = (block.angle + turn + 4) % 4;
    var trans = new Point(0, 0);
    while (this.checkBlock(block, data) == Constants.LEFTEDGE) {
      block.x++;
      trans.x++;
    }
    while (this.checkBlock(block, data) == Constants.RIGHTEDGE) {
      block.x--;
      trans.x--;
    }
    while (this.checkBlock(block, data) == Constants.TOPEDGE) {
      block.y++;
      trans.y++;
    }
    if (this.checkBlock(block, data) == Constants.OK) {
      moved = true;
    } else if (block.shoveaways > 0 && this.shoveaway(block, data, shift)) {
      block.shoveaways--;
      moved = true;
    } else {
      block.x -= trans.x;
      block.y -= trans.y;
      block.angle = (block.angle - turn + 4) % 4;
    }
  }

  if (moved) {
    block.rowsFree = this.calculateRowsFree(block, data);
    block.localStickFrames = Constants.LOCALSTICKFRAMES;
  }

  if (block.rowsFree > 0) {
    block.localStickFrames = Constants.LOCALSTICKFRAMES;
    block.globalStickFrames = Constants.GLOBALSTICKFRAMES;
    if (drop) {
      block.y++;
      block.rowsFree--;
    }
  } else {
    block.globalStickFrames--;
    if (!moved) {
      block.localStickFrames--;
    }
    if (block.localStickFrames <= 0 || block.globalStickFrames <= 0) {
      this.score += this.placeBlock(block, data);
      return true;
    }
  }

  return false;
}

// Tries to shove the block away from obstructing squares and the bottom edge.
// Returns true and leaves the block in its new position on success.
// Leaves the block's position unmodified on failure.
Board.prototype.shoveaway = function(block, data, hint) {
  // In the absence of a hint, prefer to shove left over shoving right.
  hint = (hint > 0 ? 1 : -1);

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      if (this.checkBlock(block, data) == Constants.OK) {
        return true;
      }
      block.x += (j == 1 ? -2*hint : hint);
    }
    if (i == 0) {
      block.y++;
    } else if (i == 1) {
      block.y -= 2;
    } else {
      block.y--;
    }
  }

  block.y += 3;
  return false;
}

// Places the block onto the board and removes rows from the board.
// Returns the number of points scored by the placement.
Board.prototype.placeBlock = function(block, data) {
  var offsets = block.getOffsets();
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    data[offset.y][offset.x] = block.color;
  }
  return Constants.POINTS[this.removeRows(data)];
}

// Modifies data and returns the number of rows cleared from it.
Board.prototype.removeRows = function(data) {
  var numRowsCleared = 0;

  for (var i = Constants.ROWS - 1; i >= 0; i--) {
    var isRowFull = true;
    for (var j = 0; j < Constants.COLS; j++) {
      if (data[i][j] == 0) {
        isRowFull = false;
      }
    }

    if (isRowFull) {
      for (j = 0; j < Constants.COLS; j++) {
        data[i][j] = 0;
      }
      numRowsCleared++;
    } else if (numRowsCleared > 0) {
      for (j = 0; j < Constants.COLS; j++) {
        data[i + numRowsCleared][j] = data[i][j];
        data[i][j] = 0;
      }
    }
  }

  return numRowsCleared;
}

// Returns the number of rows that the given block could drop on this board.
// Mutates block in the middle of the function but restores it by the end.
Board.prototype.calculateRowsFree = function(block, data) {
  var result = 0;
  while (this.checkBlock(block, data) == Constants.OK) {
    result++;
    block.y++;
  }
  block.y -= result;
  return result - 1;
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
