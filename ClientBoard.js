var ClientBoard = (function() {
"use strict";

var ClientBoard = function(target, view, settings) {
  ClientBoard.__super__.constructor.bind(this)(target, settings);
  this.resetForView(view);
  this.settings = settings;
}

extend(ClientBoard, LocalBoard);

ClientBoard.prototype.reset = function() {
  this.frame = 0;
}

ClientBoard.prototype.resetForView = function(view) {
  OpponentBoard.prototype.deserialize.bind(this)(view);
  this.preview = this.preview.slice();

  // Set up the state needed to stay in sync with the server.
  this.serverSyncIndex = this.syncIndex;
  this.move = [];
  this.moveQueue = [];
}

ClientBoard.prototype.tick = function() {
  var keys = this.getKeys();

  if (keys.indexOf(Action.START) >= 0 && this.settings.singleplayer) {
    if (this.state === Constants.PLAYING) {
      this.state = Constants.PAUSED;
      this.pauseReason = 'manual';
    } else if (this.state === Constants.PAUSED) {
      this.state = Constants.PLAYING;
    } else if (this.state === Constants.GAMEOVER) {
      this.settings.send({type: 'start', game_index: this.gameIndex});
    }
  }

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
      this.settings.send({
        type: 'move',
        game_index: this.gameIndex,
        move_queue: this.moveQueue,
      });
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
  return ClientBoard.__super__.nextBlock.bind(this)(swap);
}

ClientBoard.prototype.maybeAddToPreview = function() {
  // A client board never adds pieces to the preview based on local state.
  // Instead, the server sends a state update with a new preview that replaces
  // the old one.
  this.blockIndex += 1;
}

ClientBoard.prototype.updateSettings = function(settings) {
  this.settings = this.graphics.settings = settings;
  this.repeater.setKeyBindings(settings.options.key_bindings);
}

ClientBoard.prototype.deserialize = function(view) {
  if (this.gameIndex !== view.gameIndex || this.syncIndex < view.syncIndex) {
    this.resetForView(view);
  } else {
    // Pull preview data out of the view and update the current state. Note
    // that we could have pulled blocks from the preview since the server sent
    // it, so we have to shift this blocks first.
    this.preview = view.preview.slice();
    for (var i = view.blockIndex; i < this.blockIndex; i++) {
      this.preview.shift();
    }
    while (this.serverSyncIndex < view.syncIndex) {
      this.serverSyncIndex += 1;
      this.moveQueue.pop();
    }
    // Pull attack data out of the view and update the current state.
    this.attacks = view.attacks;
    this.attackIndex = view.attackIndex;
  }
}

return ClientBoard;
})();
