var OpponentBoard = (function() {
"use strict";

var OpponentBoard = function(target, view) {
  this.graphics = new Graphics(target);
  this.deserialize(view);
}

OpponentBoard.prototype.deserialize = function(view) {
  $.extend(this, view);
  // HACK: Set blockIndex to 0 to prevent preview scrolling on opponent boards.
  this.blockIndex = 0;
  // Delete the blockType property and construct a block of that type instead.
  delete this.blockType;
  this.block = new Block(view.blockType);
  this.block.rowsFree = Physics.calculateRowsFree(this.block, this.data);
  this.graphics.reset(this);
}

return OpponentBoard;
})();
