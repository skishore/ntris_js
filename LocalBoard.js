var LocalBoard = (function() {
"use strict";

var LocalBoard = function(target, settings) {
  this.target = target;
  this.settings = settings || {singleplayer: true, options: {}};
  var key_bindings = this.settings.options.key_bindings;

  this.graphics = new Graphics(Constants.SQUAREWIDTH, target, this.settings);
  this.repeater = new KeyRepeater(
      Constants.PAUSE, Constants.REPEAT, target, key_bindings);

  LocalBoard.__super__.constructor.bind(this)();

  this.afterTime = (new Date).getTime();
  this.sleepTime = Constants.FRAMEDELAY;
  setTimeout(this.gameLoop.bind(this), this.sleepTime);
}

extend(LocalBoard, Board);

LocalBoard.prototype.reset = function() {
  LocalBoard.__super__.reset.bind(this)();
  this.graphics.reset(this);
}

LocalBoard.prototype.gameLoop = function() {
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

LocalBoard.prototype.tick = function() {
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

LocalBoard.prototype.updateScore = function(rows) {
  var old_score = this.score;
  LocalBoard.__super__.updateScore.bind(this)(rows);
  if (this.score > old_score) {
    this.graphics.drawFloatingScore(this.block, this.score - old_score);
  }
}

LocalBoard.prototype.getKeys = function() {
  var keys = this.repeater.query();
  if (this.block.localStickFrames <= 0 || this.block.globalStickFrames <= 0) {
    keys.push(Action.DROP);
  } else if (this.frame % Constants.GRAVITY === 0) {
    keys.push(Action.DOWN);
  }
  return keys;
}

LocalBoard.prototype.maybeRedraw = function() {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.graphics.drawBoardSquare(i, j, this.data[i][j]);
    }
  }
}

return LocalBoard;
})();
