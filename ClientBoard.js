var ClientBoard = (function() {
"use strict";

var ClientBoard = function(target, view, send) {
  this.__super__.constructor.bind(this)(target);

  $.extend(this, view);
  this.preview = this.preview.slice();
  // Delete the blockType property and construct a block of that type instead.
  delete this.blockType;
  this.block = new Block(view.blockType);
  this.block.rowsFree = Physics.calculateRowsFree(this.block, this.data);
  this.graphics.reset(this);

  // Set up the state needed to stay in sync with the server.
  this.serverSyncIndex = this.syncIndex;
  this.move = [];
  this.moveQueue = [];
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
}

ClientBoard.prototype.tick = function() {
  var keys = this.getKeys();

  if (this.state === Constants.PLAYING &&
      this.block !== null &&
      this.preview.length > 0) {
    this.maybeSaveMove(keys);
    var syncIndex = this.syncIndex;

    this.frame = (this.frame + 1) % Constants.MAXFRAME;
    this.graphics.eraseBlock(this.block);
    this.update(keys);
    this.graphics.drawBlock(this.block);

    if (this.syncIndex > syncIndex) {
      assert(this.syncIndex === syncIndex + 1, 'Skipped a sync index!');
      this.moveQueue.push({syncIndex: this.syncIndex, move: this.move});
      this.send({type: 'move', move_queue: this.moveQueue});
      this.move = [];
    }
  }
}

ClientBoard.prototype.maybeSaveMove = function(keys) {
  var move = [];
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== Action.START) {
      move.push(keys[i]);
    }
  }
  if (move.length > 0) {
    this.move.push(move);
  }
}

ClientBoard.prototype.nextBlock = function(swap) {
  this.syncIndex += 1;
  return this.__super__.nextBlock.bind(this)(swap);
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
  assert(view.syncIndex <= this.syncIndex, 'Server is ahead of client!');
  while (this.serverSyncIndex < view.syncIndex) {
    this.serverSyncIndex += 1;
    this.moveQueue.pop();
  }
}

return ClientBoard;
})();
