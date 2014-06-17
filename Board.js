var Board = (function() {
"use strict";

var Board = function(graphics, target) {
  this.graphics = graphics;

  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }

  this.repeater = new KeyRepeater(Constants.PAUSE, Constants.REPEAT, target);

  this.curBlock = new Block(7);

  setInterval(this.gameLoop.bind(this), Constants.FRAMEDELAY);
}

Board.prototype.gameLoop = function() {
  this.graphics.eraseBlock(this.curBlock);
  this.moveBlock(this.curBlock, this.data, this.repeater.query());
  this.graphics.drawBlock(this.curBlock);
  this.graphics.flip();
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
