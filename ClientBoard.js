var ClientBoard = (function() {
"use strict";

var ClientBoard = function(target, view, send) {
  this.__super__.constructor.bind(this)(target);

  $.extend(this, view);
  this.preview = [view.blockType];
  this.preview.push.apply(this.preview, view.preview);
  this.blockIndex = 0;
  this.block = this.nextBlock();
  this.graphics.reset(this);

  this.send = send;
}

extend(ClientBoard, Board);

ClientBoard.prototype.loseFocus = function(e) {
  // A client board doesn't auto-pause on losing focus.
}

ClientBoard.prototype.gainFocus = function(e) {
  // A client board doesn't unpause on gaining focus.
}

ClientBoard.prototype.reset = function() {
  // The only variable that's not reset from the server view is the
  // frame number.
  this.frame = 0;
  this.moves = [];
}

ClientBoard.prototype.tick = function() {
  var keys = this.repeater.query();
  if (this.frame % Constants.GRAVITY === 0) {
    keys.push(Action.DOWN);
  }

  if (this.state === Constants.PLAYING &&
      this.block !== null &&
      this.preview.length > 0) {
    this.maybeSaveMoves(keys);
    var blockIndex = this.blockIndex;

    this.frame = (this.frame + 1) % Constants.MAXFRAME;
    this.graphics.eraseBlock(this.block);
    this.update(keys);
    this.graphics.drawBlock(this.block);

    if (this.blockIndex > blockIndex) {
      this.send({type: 'move', moves: this.moves});
      this.moves.length = 0;
    }
  }
}

ClientBoard.prototype.maybeSaveMoves = function(keys) {
  var move = [];
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== Action.START) {
      move.push(keys[i]);
    }
  }
  if (move.length > 0) {
    this.moves.push(move);
  }
}

ClientBoard.prototype.nextBlock = function(swap) {
  if (this.preview.length > 0) {
    return this.__super__.nextBlock.bind(this)(swap);
  }
  return null;
}

ClientBoard.prototype.maybeAddToPreview = function() {
  // A client board never adds pieces to the preview based on local state.
  // Instead, the server sends a state update with a new preview that replaces
  // the old one.
}

ClientBoard.prototype.deserialize = function(view) {
  // Pull preview data out of the view and update the current state. Note
  // that we could have pulled blocks from the preview since the server sent
  // it, so we have to shift this blocks first.
  this.preview = view.preview.slice();
  for (var i = view.blockIndex; i < this.blockIndex; i++) {
    this.preview.shift();
  }
}

return ClientBoard;
})();
