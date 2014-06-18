var Graphics = (function() {
"use strict";

var Graphics = function(target) {
  this.squareWidth = Constants.SQUAREWIDTH;
  this.border = this.squareWidth;
  this.sideboard = Math.floor(7*this.squareWidth/2);
  this.width = Constants.COLS*this.squareWidth + this.sideboard + 2*this.border;
  this.height = Constants.VISIBLEROWS*this.squareWidth + 2*this.border;

  this.resetState();
  this.elements = this.build(target);

  assert(this.width == target.outerWidth(), 'Error: width mismatch');
  assert(this.height == target.outerHeight(), 'Error: height mismatch');
}

// Returns a dictionary of jQuery elements that comprise the graphics.
Graphics.prototype.build = function(target) {
  var result = {};
  target.css('padding', Math.floor(this.border/2) - 1);

  var border = $('<div>').addClass('ntris-border')
  border.css('padding', Math.ceil(this.border/2) - 1);
  target.append(border);

  var board = $('<div>').addClass('ntris-board').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    'width': this.squareWidth*Constants.COLS,
  });
  border.append(board);

  result.board = [];
  var hiddenRows = Constants.ROWS - Constants.VISIBLEROWS;
  for (var i = 0; i < Constants.VISIBLEROWS*Constants.COLS; i++) {
    var square = $('<div>').addClass('ntris-square').css({
      "background-color": Color.BLACK,
      "border-color": Color.lighten(Color.BLACK),
      "height": this.squareWidth - 2,
      "width": this.squareWidth - 2,
    })
    board.append(square);
    result.board.push(square);
    this.state.board.push(0);
  }

  var sideboard = $('<div>').addClass('ntris-sideboard').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    "width": this.sideboard,
  });
  border.append(sideboard);

  result.preview = $('<div>').addClass('ntris-preview').css({
    'height': 5*this.squareWidth/2*(Constants.PREVIEW + 2),
  });
  sideboard.append(result.preview);

  result.hold = $('<div>').addClass('ntris-hold').css({
    'height': 4*this.squareWidth,
    'margin-left': 3*this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  });
  sideboard.append(result.hold);

  result.score = $('<div>').addClass('ntris-score').css({
    'font-size': this.squareWidth,
    'margin-top': 5*this.squareWidth/4,
    'margin-right': this.squareWidth/2,
  }).text(this.state.score);
  sideboard.append(result.score);

  return result;
}

Graphics.prototype.resetState = function() {
  this.state = {board: [], score: 0, held: false, heldBlockType: -1};
  this.resetDelta();
}

Graphics.prototype.resetDelta = function() {
  this.delta = $.extend({}, this.state);
  this.delta.board = {};
}

Graphics.prototype.getSquareIndex = function(i, j) {
  assert(i >= 0 && i < Constants.ROWS && j >= 0 && j < Constants.COLS,
      'Invalid board square: (' + i + ', ' + j + ')');
  return Constants.COLS*(i - Constants.ROWS + Constants.VISIBLEROWS) + j;
}

Graphics.prototype.drawFreeBlock = function(target, type, x, y, w) {
  if (type >= 0) {
    var offsets = Block.prototypes[type].getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      target.append($('<div>').addClass('ntris-free-square').css({
        'left': x + w*offset.x,
        'top': y + w*offset.y,
        'height': w,
        'width': w,
      }));
    }
  }
}

//////////////////////////////////////////////////////////////////////////////
// Public interface begins here!
//////////////////////////////////////////////////////////////////////////////

Graphics.prototype.drawBoardSquare = function(i, j, color) {
  var k = this.getSquareIndex(i, j);
  if (k >= 0) {
    this.delta.board[k] = color;
  }
}

Graphics.prototype.drawBlock = function(block) {
  if (block != null) {
    var offsets = block.getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      this.drawBoardSquare(offset.y, offset.x, block.color + Color.MAX);
    }
  }
}

Graphics.prototype.eraseBlock = function(block) {
  if (block != null) {
    var offsets = block.getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      this.drawBoardSquare(offset.y, offset.x, 0);
    }
  }
}

Graphics.prototype.drawUI = function(board) {
  this.delta.held = board.held;
  this.delta.heldBlockType = board.heldBlockType;
  this.delta.score = board.score;
}

Graphics.prototype.flip = function() {
  for (var k in this.delta.board) {
    var color = this.delta.board[k];
    if (this.state.board[k] != color) {
      this.state.board[k] = color;
      var square = this.elements.board[k];
      square.css('background-color', Color.body_colors[color]);
      square.css('border-color', Color.edge_colors[color]);
    }
  }
  if (this.state.held != this.delta.held) {
    this.state.held = this.delta.held;
    var color = (this.state.held ? Color.edge_colors[0] : 'white');
    this.elements.hold.css('border-color', color);
  }
  if (this.state.heldBlockType != this.delta.heldBlockType) {
    this.state.heldBlockType = this.delta.heldBlockType;
    this.elements.hold.empty();
    this.drawFreeBlock(
        this.elements.hold, this.state.heldBlockType,
        this.squareWidth - 1, this.squareWidth/4, this.squareWidth/2);
  }
  if (this.state.score != this.delta.score) {
    this.state.score = this.delta.score;
    this.elements.score.text(this.delta.score);
  }
  this.resetDelta();
}

return Graphics;
})();
