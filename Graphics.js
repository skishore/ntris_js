var Graphics = (function() {
"use strict";

var Graphics = function(target) {
  this.squareWidth = Constants.SQUAREWIDTH;
  this.border = this.squareWidth;
  this.sideboard = Math.floor(7*this.squareWidth/2);
  this.width = Constants.COLS*this.squareWidth + this.sideboard + 2*this.border;
  this.height = Constants.VISIBLEROWS*this.squareWidth + 2*this.border;

  this.elements = this.build(target);
  assert(this.width == target.outerWidth(), 'Error: width mismatch');
  assert(this.height == target.outerHeight(), 'Error: height mismatch');
  this.delta = {};
};

Graphics.prototype.build = function(target) {
  var result = {target: target}
  result.target.css('padding', Math.floor(this.border/2) - 1);

  var border = $('<div>').addClass('ntris-border')
  border.css('padding', Math.ceil(this.border/2) - 1);
  result.target.append(border);

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
    square.data('color', 0);
    board.append(square);
    result.board.push(square);
  }

  result.sideboard = $('<div>').addClass('ntris-sideboard').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    "width": this.sideboard,
  });
  border.append(result.sideboard);
  return result;
};

Graphics.prototype.getSquareIndex = function(i, j) {
  assert(i >= 0 && i < Constants.ROWS && j >= 0 && j < Constants.COLS,
      'Invalid board square: (' + i + ', ' + j + ')');
  return Constants.COLS*(i - Constants.ROWS + Constants.VISIBLEROWS) + j;
};

//////////////////////////////////////////////////////////////////////////////
// Public interface begins here!
//////////////////////////////////////////////////////////////////////////////

Graphics.prototype.drawBoardSquare = function(i, j, color) {
  var k = this.getSquareIndex(i, j);
  if (k >= 0) {
    this.delta[k] = color;
  }
};

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

Graphics.prototype.flip = function() {
  for (var k in this.delta) {
    var color = this.delta[k];
    var square = this.elements.board[k];
    if (square.data('color') != color) {
      square.data('color', color);
      square.css('background-color', Color.body_colors[color]);
      square.css('border-color', Color.edge_colors[color]);
    }
  }
  this.delta = {};
}

return Graphics;
})();
