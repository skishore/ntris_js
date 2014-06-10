var Graphics = function(target) {
  this.squareWidth = Constants.SQUAREWIDTH;
  this.border = this.squareWidth;
  this.sideboard = Math.floor(7*this.squareWidth/2);
  this.width = Constants.COLS*this.squareWidth + this.sideboard + 2*this.border;
  this.height = Constants.VISIBLEROWS*this.squareWidth + 2*this.border;

  assert(this.width == target.width(), 'Error: width mismatch');
  assert(this.height == target.height(), 'Error: height mismatch');
  this.g = target[0].getContext('2d');
  this.g.lineWidth = 0.5;
};

Graphics.prototype.fillColor = function(color) {
  this.g.setFillColor(color);
}

Graphics.prototype.lineColor = function(color) {
  this.g.setStrokeColor(color);
}

Graphics.prototype.drawLine = function(x1, y1, x2, y2) {
  assert(x1 == x2 || y1 == y2 || Math.abs(x2 - x1) == Math.abs(y2 - y1),
      'This function only supports axis-aligned and 45-degree lines');
  x1 += (x1 > x2);
  x2 += (x1 < x2);
  y1 += (y1 > y2);
  y2 += (y1 < y2);
  this.g.beginPath();
  this.g.moveTo(x1 + 0.5, y1 + 0.5);
  this.g.lineTo(x2 + 0.5, y2 + 0.5);
  this.g.closePath();
  this.g.stroke();
};

Graphics.prototype.drawRect = function(x, y, w, h) {
  this.g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
};

Graphics.prototype.fillRect = function(x, y, w, h) {
  this.g.fillRect(x, y, w, h)
};

Graphics.prototype.drawLineOffset = function(x1, y1, x2, y2) {
  this.drawLine(x1 + this.border, y1 + this.border, x2 + this.border, y2 + this.border);
};

Graphics.prototype.drawRectOffset = function(x, y, w, h) {
  this.drawRect(x + this.border, y + this.border, w, h);
};

Graphics.prototype.fillRectOffset = function(x, y, w, h) {
  this.fillRect(x + this.border, y + this.border, w, h);
};

Graphics.prototype.clear = function() {
  this.fillColor(Color.BLACK);
  this.fillRect(0, 0, this.width, this.height);
};

Graphics.prototype.drawBorder = function() {
  this.lineColor(Color.BORDER);
  this.drawRect(this.border/2 - 1, this.border/2 - 1,
      this.width - this.border + 2, this.height - this.border + 2);
  this.drawRect(this.border/2, this.border/2,
      this.width - this.border, this.height - this.border);
};

Graphics.prototype.drawGrid = function() {
  for (var i = Constants.ROWS - Constants.VISIBLEROWS; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.drawBoardSquare(i, j, Color.BLACK);
    }
  }
};

Graphics.prototype.drawBoardSquare = function(i, j, color) {
  i -= (Constants.ROWS - Constants.VISIBLEROWS);
  if (i < 0 || i >= Constants.VISIBLEROWS ||
      j < 0 || j > Constants.COLS) {
    return;
  }

  this.lineColor(Color.lighten(color));
  this.fillColor(color);
  this.drawRectOffset(j*this.squareWidth, i*this.squareWidth,
      this.squareWidth, this.squareWidth);
  this.fillRectOffset(j*this.squareWidth + 1, i*this.squareWidth + 1,
      this.squareWidth - 2, this.squareWidth - 2);
};

Graphics.prototype.test = function() {
  this.clear();
  this.drawBorder();
  this.drawGrid();
};
