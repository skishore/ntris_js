var OpponentBoard = (function() {
"use strict";

var OpponentBoard = function(target, view, settings, scale) {
  this.target = target;
  this.settings = settings;
  var squareWidth = Math.round(scale*Constants.SQUAREWIDTH);
  this.graphics = new Graphics(squareWidth, target, settings);
  this.deserialize(view);
}

OpponentBoard.prototype.deserialize = function(view) {
  if (this.gameIndex === view.gameIndex && this.syncIndex === view.syncIndex) {
    // Even if the opponent has made a move, if they've been attacked, we have
    // to update their UI. We check the two conditions that can occur:
    if (!maybeArraysEqual(this.attacks, view.attacks) ||
        this.attackIndex !== view.attackIndex) {
      $.extend(this, view);
      this.graphics.drawUI(this);
      this.graphics.flip();
    }
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
  this.graphics = new Graphics(squareWidth, this.target, this.settings);
  this.graphics.reset(this);
}

return OpponentBoard;
})();
