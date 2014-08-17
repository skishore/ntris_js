var ServerBoard = (function() {
"use strict";

var ServerBoard = function(game_type, seed) {
  this.game_type = game_type;
  this.gameIndex = -1;
  ServerBoard.__super__.constructor.bind(this)(seed);
}

extend(ServerBoard, Board);

ServerBoard.prototype.reset = function(seed) {
  ServerBoard.__super__.reset.bind(this)(new MersenneTwister(seed));
  this.pauseReason = null;
  if (this.game_type === 'battle') {
    this.attacks = [];
    this.attackIndex = 0;
  }
  this.forceClientUpdate();
}

ServerBoard.prototype.nextBlock = function(swap) {
  this.syncIndex += 1;
  return ServerBoard.__super__.nextBlock.bind(this)(swap);
}

ServerBoard.prototype.forceClientUpdate = function() {
  this.gameIndex += 1;
  this.syncIndex = 0;
}

ServerBoard.prototype.serialize = function() {
  return {
    data: this.data,
    blockType: this.block.type,
    gameIndex: this.gameIndex,
    syncIndex: this.syncIndex,
    // The rest of the fields here are the precisely fields that are read
    // by a call to Graphics.drawUI.
    blockIndex: this.blockIndex,
    preview: this.preview,
    held: this.held,
    heldBlockType: this.heldBlockType,
    combo: this.combo,
    score: this.score,
    state: this.state,
    pauseReason: this.pauseReason,
    // State that is only present in battle-mode games.
    attacks: this.attacks,
    attackIndex: this.attackIndex,
  }
}

ServerBoard.prototype.maybeAddToPreview = function() {
  this.blockIndex += 1;
  var attackIndex = this.attackIndex || 0;
  var level = DifficultyCurve.getLevel(attackIndex + this.blockIndex);
  if (this.attacks && this.attacks.length > 0) {
    // Pop from the attack queue if it is available.
    level = Math.min(level + this.attacks.shift() + 1, Block.LEVELS - 1);
  }
  this.preview.push(this.curve.generateBlockType(level));
}

ServerBoard.prototype.handleRawAttack = function(score, combo) {
  // Hack: Reverse-engineer the scoring function to recover the number
  // of rows that were just cleared.
  var row_score = score - combo + 1;
  var rows = Math.min(Math.round(Math.sqrt(row_score)), 1);
  this.handleAttack(rows, combo);
}

ServerBoard.prototype.handleAttack = function(rows, combo) {
  this.attacks.push(rows - 1);
  var poison_damage = 40*combo - 1;
  this.attackIndex += poison_damage;
  for (var i = 0; i < poison_damage; i++) {
    // Use up randomness so we stay in sync with the opponent's board.
    // However, one unit of randomness will be used to generate the new
    // attack block, which is why we subtract one.
    this.curve.rng.random();
  }
}

return ServerBoard;
})();
