var Board = (function() {
"use strict";

var Board = function(target) {
  this.target = target;
  this.graphics = new Graphics(target);
  this.repeater = new KeyRepeater(Constants.PAUSE, Constants.REPEAT, target);
  this.setFocusHandlers(target);

  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }
  this.reset();

  this.afterTime = (new Date).getTime();
  this.sleepTime = Constants.FRAMEDELAY;
  setTimeout(this.gameLoop.bind(this), this.sleepTime);
}

Board.prototype.setFocusHandlers = function(target) {
  target.focus(this.gainFocus.bind(this));
  target.focusout(this.loseFocus.bind(this));
  $(window).blur(this.loseFocus.bind(this));
  target.focus();
}

Board.prototype.loseFocus = function(e) {
  if (this.state === Constants.PLAYING) {
    this.state = Constants.PAUSED;
    this.pauseReason = 'focus';
  }
}

Board.prototype.gainFocus = function(e) {
  if (this.state === Constants.PAUSED && this.pauseReason === 'focus') {
    this.state = Constants.PLAYING;
  }
}

Board.prototype.reset = function() {
  this.curve = new DifficultyCurve();

  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.frame = 0;
  this.held = false;
  this.heldBlockType = -1;
  this.score = 0;
  this.state = Constants.PLAYING;

  this.blockIndex = 0;
  this.preview = [];
  for (var i = 0; i < Constants.PREVIEW; i++) {
    this.maybeAddToPreview();
  }
  this.block = this.nextBlock();

  this.graphics.reset(this);
}

Board.prototype.gameLoop = function() {
  if (!$.contains(window.document, this.target[0])) {
    return;
  }

  this.beforeTime = (new Date).getTime();
  var extraTime = (this.beforeTime - this.afterTime) - this.sleepTime;

  var frames = Math.floor(extraTime/Constants.FRAMEDELAY) + 1;
  for (var i = 0; i < frames; i++) {
    this.tick();
  }
  this.graphics.drawUI(this);
  this.graphics.flip();

  this.afterTime = (new Date).getTime();
  var sleepTime =
      Constants.FRAMEDELAY - (this.afterTime - this.beforeTime) - extraTime;
  setTimeout(this.gameLoop.bind(this), sleepTime);
}

Board.prototype.tick = function() {
  var keys = this.getKeys();

  if (keys.indexOf(Action.START) >= 0) {
    if (this.state === Constants.PLAYING) {
      this.state = Constants.PAUSED;
      this.pauseReason = 'manual';
    } else if (this.state === Constants.PAUSED) {
      this.state = Constants.PLAYING;
    } else {
      this.reset();
    }
    return;
  }

  if (this.state === Constants.PLAYING) {
    this.frame = (this.frame + 1) % Constants.MAXFRAME;
    this.graphics.eraseBlock(this.block);
    this.update(keys);
    this.graphics.drawBlock(this.block);
  }
}

Board.prototype.getKeys = function() {
  var keys = this.repeater.query();
  if (this.block.localStickFrames <= 0 || this.block.globalStickFrames <= 0) {
    keys.push(Action.DROP);
  } else if (this.frame % Constants.GRAVITY === 0) {
    keys.push(Action.DOWN);
  }
  return keys;
}

Board.prototype.update = function(keys) {
  if (!this.held && keys.indexOf(Action.HOLD) >= 0) {
    this.block = this.nextBlock(this.block);
  } else if (keys.indexOf(Action.DROP) >= 0) {
    this.block.y += this.block.rowsFree;
    this.score += Physics.placeBlock(this.block, this.data);
    this.redraw();
    this.block = this.nextBlock();
  } else {
    Physics.moveBlock(this.block, this.data, keys);
  }
  if (this.block.rowsFree < 0) {
    this.state = Constants.GAMEOVER;
  }
}

Board.prototype.redraw = function() {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.graphics.drawBoardSquare(i, j, this.data[i][j]);
    }
  }
}

Board.prototype.nextBlock = function(swap) {
  var type = -1;
  if (swap) {
    type = this.heldBlockType;
    this.heldBlockType = swap.type;
  }
  if (type < 0) {
    this.blockIndex += 1;
    this.maybeAddToPreview();
    type = this.preview.shift();
  }

  this.held = (swap ? true : false);
  var result = new Block(type);
  result.rowsFree = Physics.calculateRowsFree(result, this.data);
  return result;
}

Board.prototype.maybeAddToPreview = function() {
  this.preview.push(this.curve.generateBlockType(this.blockIndex));
}

return Board;
})();
