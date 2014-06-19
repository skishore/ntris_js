var Graphics = (function() {
"use strict";

var Graphics = function(target) {
  this.squareWidth = Constants.SQUAREWIDTH;
  this.smallWidth = Math.ceil(this.squareWidth/2);
  this.border = this.squareWidth;
  this.sideboard = 7*this.smallWidth;
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
    'width': this.sideboard,
  });
  border.append(sideboard);

  var padding = this.squareWidth/4;
  result.preview = $('<div>').addClass('ntris-preview').css({
    'height': 5*this.squareWidth/2*(Constants.PREVIEW + 2) - padding,
    'padding-top': padding,
  });
  sideboard.append(result.preview);

  result.hold = $('<div>').addClass('ntris-hold').css({
    'height': 4*this.squareWidth,
    'margin-left': 3*this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  });
  sideboard.append(result.hold);

  result.hold_overlay = $('<div>').addClass('ntris-hold-overlay');
  result.hold.append(result.hold_overlay);

  result.score = $('<div>').addClass('ntris-score').css({
    'font-size': this.squareWidth,
    'right': this.squareWidth/4,
  }).text(this.state.score);
  sideboard.append(result.score);
  // Hack around the fact that CSS font-sizes don't set the height equal.
  result.score.css('bottom', (this.squareWidth - result.score.height())/2);

  return result;
}

Graphics.prototype.resetState = function() {
  this.state = {
    board: [],
    blockIndex: 0,
    preview: [],
    held: false,
    heldBlockType: -1,
    score: 0,
  };
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
    var block = Block.prototypes[type];
    var light = Color.body_colors[block.color + Color.MAX];
    var dark = Color.mix(light, Color.BLACK, 0.4*Color.LAMBDA);

    var offsets = block.getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      target.append($('<div>').addClass('ntris-free-square').css({
        'background-color': (offset.x + offset.y % 2 ? dark : light),
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
  this.delta.blockIndex = board.blockIndex;
  this.delta.preview = board.preview;
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
  // TODO(skishore): Refactor this blob of logic into functions for each
  // drawing subroutine and one function that copies delta -> state.
  if (this.state.blockIndex != this.delta.blockIndex) {
    while (this.state.blockIndex < this.delta.blockIndex) {
      this.state.blockIndex += 1;
      this.state.preview.shift();
      this.elements.preview.children().eq('0').remove();
    }
    while (this.state.preview.length < this.delta.preview.length) {
      var type = this.delta.preview[this.state.preview.length];
      this.state.preview.push(type);
      var block = $('<div>').addClass('ntris-preview-block').css({
        'height': this.smallWidth*Block.prototypes[type].height,
        'margin-bottom': this.squareWidth,
      });
      var xOffset = 2*this.smallWidth + 3*this.squareWidth/4;
      this.drawFreeBlock(block, type, xOffset, 0, this.smallWidth);
      this.elements.preview.append(block);
    }
    this.state.blockIndex = this.delta.blockIndex;
    assert(
        this.state.preview.equals(this.delta.preview),
        "Previews mismatched!");
  }
  if (this.state.held != this.delta.held) {
    this.state.held = this.delta.held;
    var opacity = (this.state.held ? 0.2*Color.LAMBDA : 0);
    this.elements.hold.css('opacity', 1 - 8*opacity);
    this.elements.hold_overlay.css('opacity', opacity);
  }
  if (this.state.heldBlockType != this.delta.heldBlockType) {
    this.state.heldBlockType = this.delta.heldBlockType;
    this.elements.hold.find('.ntris-free-square').remove();
    this.drawFreeBlock(
        this.elements.hold, this.state.heldBlockType,
        2*this.smallWidth - 1, 3*this.smallWidth/4, this.smallWidth);
  }
  if (this.state.score != this.delta.score) {
    this.state.score = this.delta.score;
    this.elements.score.text(this.delta.score);
  }
  this.resetDelta();
}

return Graphics;
})();
