var OpponentBoard = (function() {
"use strict";

var OpponentBoard = function(target, view, scale) {
  this.target = target;
  var squareWidth = Math.round(scale*Constants.SQUAREWIDTH);
  this.graphics = new Graphics(squareWidth, target);
  this.deserialize(view);
}

OpponentBoard.prototype.deserialize = function(view) {
  if (this.gameIndex == view.gameIndex && this.syncIndex == view.syncIndex) {
    return;
  }
  $.extend(this, view);
  // Delete the blockType property and construct a block of that type instead.
  delete this.blockType;
  this.block = new Block(view.blockType);
  this.block.rowsFree = Physics.calculateRowsFree(this.block, this.data);
  this.graphics.reset(this);
}

OpponentBoard.prototype.set_scale = function(scale) {
  this.target.empty();
  var squareWidth = Math.round(scale*Constants.SQUAREWIDTH);
  this.graphics = new Graphics(squareWidth, this.target);
  this.graphics.reset(this);
}

return OpponentBoard;
})();
