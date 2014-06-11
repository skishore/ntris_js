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
  for (var i = 0; i < Constants.VISIBLEROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      var square = $('<div>').addClass('ntris-square').css({
        "background-color": Color.BLACK,
        "border-color": Color.lighten(Color.BLACK),
        "height": this.squareWidth - 2,
        "width": this.squareWidth - 2,
      })
      row.push(square);
      board.append(square);
    }
    result.board.push(row);
  }

  result.sideboard = $('<div>').addClass('ntris-sideboard').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    "width": this.sideboard,
  });
  border.append(result.sideboard);
  return result;
};

Graphics.prototype.drawBorder = function() {
  return;
  this.lineColor(Color.BORDER);
  this.drawRect(this.border/2 - 1, this.border/2 - 1,
      this.width - this.border + 2, this.height - this.border + 2);
  this.drawRect(this.border/2, this.border/2,
      this.width - this.border, this.height - this.border);
};

Graphics.prototype.drawGrid = function() {
  return;
  var min_row = Constants.ROWS - Constants.VISIBLEROWS;
  for (var i = min_row; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.drawBoardSquare(i, j, Color.BLACK);
    }
  }
};

//////////////////////////////////////////////////////////////////////////////
// Public interface begins here!
//////////////////////////////////////////////////////////////////////////////

Graphics.prototype.drawBoardSquare = function(i, j, color) {
  assert(i >= 0 && i < Constants.ROWS && j >= 0 && j < Constants.COLS,
      'Invalid board square: (' + i + ', ' + j + ')');
  i -= (Constants.ROWS - Constants.VISIBLEROWS);
  if (i >= 0) {
    this.elements.board[i][j].css({
      'background-color': color,
      'border-color': Color.lighten(color),
    });
  }
};

Graphics.prototype.drawBlock = function(block) {
  var offsets = block.getOffsets();
  for (var i = 0; i < offsets.length; i++) {
    this.drawBoardSquare(offsets[i].y, offsets[i].x, block.color);
  }
}

Graphics.prototype.eraseBlock = function(block) {
  var offsets = block.getOffsets();
  for (var i = 0; i < offsets.length; i++) {
    this.drawBoardSquare(offsets[i].y, offsets[i].x, Color.BLACK);
  }
}

return Graphics;
})();
