var OpponentBoard = (function() {
"use strict";

var OpponentBoard = function(target, view) {
  this.graphics = new Graphics(target);
  this.deserialize(view);
}

OpponentBoard.prototype.deserialize = function(view) {
  $.extend(this, view);
  this.blockIndex = 0;
  this.block = new Block(view.blockType);
  this.block.rowsFree = Physics.calculateRowsFree(this.block, this.data);
  this.graphics.reset(this);
}

return OpponentBoard;
})();
