var Physics = (function() {
"use strict";

var Physics = {};

// Move the block on the board. This method never modifies data or keys.
Physics.moveBlock = function(block, data, keys) {
  var shift = 0;
  var drop = 0;
  var turn = 0;
  var moved = false;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === Action.RIGHT) {
      shift++;
    } else if (key === Action.LEFT) {
      shift--;
    } else if (key === Action.DOWN) {
      drop += 1;
    } else if (key === Action.ROTATE_CW && block.rotates) {
      turn = 1;
    } else if (key === Action.ROTATE_CCW && block.rotates) {
      turn = -1;
    }
  }

  if (shift !== 0) {
    block.x += shift;
    if (this.checkBlock(block, data) === Constants.OK) {
      moved = true;
    } else {
      block.x -= shift;
    }
  }

  if (turn !== 0) {
    block.angle = (block.angle + turn + 4) % 4;
    var trans = new Point(0, 0);
    while (this.checkBlock(block, data) === Constants.LEFTEDGE) {
      block.x++;
      trans.x++;
    }
    while (this.checkBlock(block, data) === Constants.RIGHTEDGE) {
      block.x--;
      trans.x--;
    }
    while (this.checkBlock(block, data) === Constants.TOPEDGE) {
      block.y++;
      trans.y++;
    }
    if (this.checkBlock(block, data) === Constants.OK) {
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
    // Drop the block if gravity is on or if a DOWN key were pressed.
    drop = Math.min(drop, block.rowsFree);
    block.y += drop;
    block.rowsFree -= drop;
  } else {
    block.globalStickFrames--;
    if (!moved) {
      block.localStickFrames--;
    }
  }
}

// Tries to shove the block away from obstructing squares and the bottom edge.
// Returns true and leaves the block in its new position on success.
// Leaves the block's position unmodified on failure.
Physics.shoveaway = function(block, data, hint) {
  // In the absence of a hint, prefer to shove left over shoving right.
  hint = (hint > 0 ? 1 : -1);

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      if (this.checkBlock(block, data) === Constants.OK) {
        return true;
      }
      block.x += (j === 1 ? -2*hint : hint);
    }
    if (i === 0) {
      block.y++;
    } else if (i === 1) {
      block.y -= 2;
    } else {
      block.y--;
    }
  }

  block.y += 3;
  return false;
}

// Places the block onto the board and removes full rows from the board.
// Returns the number of rows removed.
Physics.placeBlock = function(block, data) {
  var offsets = block.getOffsets();
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    data[offset.y][offset.x] = block.color;
  }
  return this.removeRows(data);
}

// Modifies data and returns the number of rows cleared from it.
Physics.removeRows = function(data) {
  var numRowsCleared = 0;

  for (var i = Constants.ROWS - 1; i >= 0; i--) {
    var isRowFull = true;
    for (var j = 0; j < Constants.COLS; j++) {
      if (data[i][j] === 0) {
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
Physics.calculateRowsFree = function(block, data) {
  var result = 0;
  while (this.checkBlock(block, data) === Constants.OK) {
    result++;
    block.y++;
  }
  block.y -= result;
  return result - 1;
}

// Returns OK if the block is in a valid position. Otherwise, returns the
// code for the highest-priority placement rule that the block breaks.
Physics.checkBlock = function(block, data) {
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
    } else if (data[offsets[i].y][offsets[i].x] !== 0) {
      status = Math.min(Constants.OVERLAP, status);
    }
  }

  return status;
}

return Physics;
})();
