var Graphics = (function() {
"use strict";

var Graphics = function(squareWidth, target, settings) {
  this.squareWidth = squareWidth;
  this.target = target;
  this.settings = settings;
  this.multiplayer = !settings.singleplayer;
  this.color_attribute = (
      settings.game_type === 'battle' ? 'battle_color' : 'color');

  this.smallWidth = Math.ceil(this.squareWidth/2);
  this.border = this.smallWidth;
  this.sideboard = 6*this.smallWidth;
  var boardWidth = Constants.COLS*this.squareWidth;
  this.width = boardWidth + 2*this.sideboard + 4*this.border;
  this.height = Constants.VISIBLEROWS*this.squareWidth + 2*this.border;

  this.elements = this.build(target);
  assert(this.width === target.outerWidth(), 'Error: width mismatch');
  assert(this.height === target.outerHeight(), 'Error: height mismatch');
}

// Returns a dictionary of jQuery elements that comprise the graphics.
Graphics.prototype.build = function(target) {
  var result = {};
  target.css('padding', this.border);

  var overlay_wrapper = $('<div>').addClass('overlay-wrapper');
  result.overlay = $('<div>').addClass('overlay');
  if (this.multiplayer) {
    result.line = $('<div>').addClass('text-box');
  } else {
    result.line = $('<div>').addClass('text-box small-text-box').css({
      'font-size': this.squareWidth,
      'line-height': '' + Math.round(4*this.squareWidth/3) + 'px',
      'padding': '' + Math.round(this.squareWidth/6) + 'px 0',
    });
  }
  target.append(overlay_wrapper.append(result.overlay, result.line));

  var scoreboard = $('<div>').addClass('scoreboard').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    'width': this.sideboard,
  });
  target.append(scoreboard);

  var level_section = this.scoreSection(scoreboard, 'Level');
  var difficulty_ui = $('<div>').addClass('difficulty-ui').css({
    'height': Math.floor(this.height/3),
    'margin-left': this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  });
  level_section.append(difficulty_ui);
  result.difficulty_ui = new DifficultyUI(difficulty_ui);

  var score_section = this.scoreSection(scoreboard, 'Score');
  result.score = $('<div>').addClass('score').css({
    'font-size': this.squareWidth,
    'margin-left': this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  }).text(0);
  score_section.append(result.score);

  var combo_section = this.scoreSection(scoreboard, 'Combo');
  result.combo = $('<div>')
      .addClass('combo')
      .css('font-size', 1.5*this.squareWidth)
      .text(0);
  combo_section.append(result.combo);
  result.combo.parent().addClass('dim');

  this.fixSectionHeights(scoreboard, '.score-section');

  var board = $('<div>').addClass('board').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    'width': this.squareWidth*Constants.COLS,
  });
  target.append(this.verticalSpacer(), board, this.verticalSpacer());

  result.board = [];
  var hiddenRows = Constants.ROWS - Constants.VISIBLEROWS;
  for (var i = 0; i < Constants.VISIBLEROWS*Constants.COLS; i++) {
    var square = $('<div>').addClass('square square-0').css({
      "height": this.squareWidth,
      "width": this.squareWidth,
    })
    board.append(square);
    result.board.push(square);
  }

  var sideboard = $('<div>').addClass('sideboard').css({
    'height': this.squareWidth*Constants.VISIBLEROWS,
    'width': this.sideboard,
  });
  target.append(sideboard);

  var padding = this.squareWidth/4;
  var preview_wrapper =
      $('<div>').addClass('preview-wrapper')
                .height(3*this.squareWidth*(Constants.PREVIEW + 1));
  result.preview = $('<div>').addClass('preview');
  result.attacks = $('<div>').addClass('attacks');
  sideboard.append(preview_wrapper.append(result.preview, result.attacks));

  result.hold = $('<div>').addClass('hold').css({
    'height': 4*this.squareWidth,
    'margin-left': this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  });
  sideboard.append(result.hold);

  result.hold_overlay = $('<div>').addClass('hold-overlay');
  result.hold.append(result.hold_overlay);

  preview_wrapper.css('padding-top',
      (sideboard.height() - preview_wrapper.height() - result.hold.height())/2);

  result.floating_score =
      $('<div>').addClass('floating-score')
                .css('font-size', 7*this.squareWidth/6);
  target.append(result.floating_score);

  return result;
}

Graphics.prototype.fixSectionHeights = function(container, selector) {
  var height = 0;
  var sections = container.find(selector);
  for (var i = 0; i < sections.length; i++) {
    height += $(sections[i]).height();
  }
  var margin = (container.height() - height)/(2*sections.length);
  sections.css('padding', '' + margin + 'px 0');
}

Graphics.prototype.scoreSection = function(scoreboard, title) {
  var section = $('<div>').addClass('score-section');
  section.append($('<div>').addClass('score-label').text(title).css({
    'font-size': this.squareWidth,
    'margin-bottom': this.squareWidth/4,
  }));
  scoreboard.append(section);
  return section;
}

Graphics.prototype.verticalSpacer = function() {
  return $('<div>')
      .addClass('vertical-spacer')
      .height(this.squareWidth*Constants.VISIBLEROWS)
      .width(this.border);
}

Graphics.prototype.getSquareIndex = function(i, j) {
  assert(i >= 0 && i < Constants.ROWS && j >= 0 && j < Constants.COLS,
      'Invalid board square: (' + i + ', ' + j + ')');
  return Constants.COLS*(i - Constants.HIDDENROWS) + j;
}

Graphics.prototype.drawFreeBlock = function(target, type, x, y, w) {
  if (type >= 0) {
    var block = Block.prototypes[type];
    var offsets = block.getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      var color = block[this.color_attribute]
      color += ((offset.x + offset.y) % 2 ? 0 : Color.MAX);
      var cls = 'free-square free-square-' + color;
      target.append($('<div>').addClass(cls).css({
        'left': x + w*offset.x,
        'top': y + w*offset.y,
        'height': w,
        'width': w,
      }));
    }
  }
}

Graphics.prototype.updatePreview = function() {
  // We should never be ahead of the board in the index of the current block.
  assert(this.state.blockIndex <= this.delta.blockIndex, "Invalid blockIndex!");
  // Pop blocks that were pulled from the preview queue from state and the UI.
  while (this.state.blockIndex < this.delta.blockIndex) {
    this.state.blockIndex += 1;
    var type = this.state.preview.shift();
    this.elements.preview.children().eq('0').remove();
    if (type !== undefined) {
      // Animate the preview, accounting for both the block's height and the
      // margin that comes after it.
      var height = Block.prototypes[type].height*this.smallWidth;
      this.animatePreview(height + this.squareWidth);
    }
  }
  // Push new blocks in the preview queue to state and to the UI.
  while (this.state.preview.length < this.delta.preview.length) {
    var type = this.delta.preview[this.state.preview.length];
    this.state.preview.push(type);
    var block = $('<div>').addClass('preview-block').css({
      'height': Block.prototypes[type].height*this.smallWidth,
      'margin-bottom': this.squareWidth,
    });
    var xOffset = 2*this.smallWidth + this.squareWidth/4;
    this.drawFreeBlock(block, type, xOffset, 0, this.smallWidth);
    this.elements.preview.append(block);
  }
  assert(
      arraysEqual(this.state.preview, this.delta.preview),
      "Previews mismatched!");
}

Graphics.prototype.animatePreview = function(height) {
  if (!this.settings.options.animate_preview) {
    return;
  }
  var duration = 1000*Constants.PREVIEWFRAMES/Constants.FRAMERATE;
  var preview = this.elements.preview.get(0);
  move(preview).y(height).duration(0).end(
      move(preview).y(0).duration(duration).ease('linear').end());
}

Graphics.prototype.updateHeld = function() {
  var opacity = (this.delta.held ? 0.2*Color.LAMBDA : 0);
  this.elements.hold.css('opacity', 1 - 8*opacity);
  this.elements.hold_overlay.css('opacity', opacity);
  this.state.held = this.delta.held;
}

Graphics.prototype.updateHeldBlockType = function() {
  this.elements.hold.find('.free-square').remove();
  this.drawFreeBlock(
      this.elements.hold, this.delta.heldBlockType,
      2*this.smallWidth - 1, 3*this.smallWidth/4, this.smallWidth);
  this.state.heldBlockType = this.delta.heldBlockType;
}

Graphics.prototype.updateCombo = function() {
  this.elements.combo.text(this.delta.combo);
  if (this.delta.combo > 0) {
    this.elements.combo.parent().removeClass('dim');
  } else {
    this.elements.combo.parent().addClass('dim');
  }
  this.state.combo = this.delta.combo;
}

Graphics.prototype.updateOverlay = function() {
  if (this.multiplayer) {
    this.updateMultiplayerOverlay();
  } else if (this.delta.state === Constants.PLAYING) {
    this.elements.overlay.css('background-color', 'transparent');
    this.drawText();
  } else if (this.delta.state === Constants.PAUSED) {
    this.elements.overlay.css('background-color', 'black');
    this.elements.overlay.css('opacity', 1);
    var resume = (this.delta.pauseReason === 'focus' ? 'Click' : 'Press START');
    this.drawText('-- PAUSED --\n' + resume + ' to resume');
  } else if (this.delta.state === Constants.GAMEOVER) {
    this.elements.overlay.css('background-color', 'red');
    this.elements.overlay.css('opacity', 1.2*Color.LAMBDA);
    this.drawText('-- You FAILED --\nPress START to try again');
  }
  this.state.state = this.delta.state;
  this.state.pauseReason = this.delta.pauseReason;
}

Graphics.prototype.updateMultiplayerOverlay = function() {
  if (this.delta.state === Constants.PLAYING) {
    this.elements.overlay.css('background-color', 'transparent');
    this.drawText();
  } else {
    var pauseReason = this.delta.pauseReason;
    var last_state = (pauseReason ? pauseReason.last_state : '');
    var text = (pauseReason ? '' + pauseReason.text : '');
    if (this.delta.state === Constants.GAMEOVER ||
        last_state === Constants.GAMEOVER) {
      this.elements.overlay.css('background-color', '#800');
      this.elements.overlay.css('opacity', 1.8*Color.LAMBDA);
    } else if (last_state === Constants.PLAYING) {
      this.elements.overlay.css('background-color', '#444');
      this.elements.overlay.css('opacity', 1.8*Color.LAMBDA);
    } else {
      this.elements.overlay.css('background-color', 'black');
      this.elements.overlay.css('opacity', 1);
    }
    var factor = (text.length === 1 ? 24 : 1.5);
    this.elements.line.css('font-size', factor*this.squareWidth);
    this.drawText(text);
    if (this.settings.me && pauseReason && pauseReason.start_game_text) {
      this.elements.line.append(
        $('<a>').addClass('btn btn-default btn-sm')
                .click(this.startGame.bind(this))
                .text(pauseReason.start_game_text));
    }
  }
}

Graphics.prototype.drawText = function(text) {
  if (text) {
    this.elements.line.html(text.replace('\n', '<br>')).show();
  } else {
    this.elements.line.empty().hide();
  }
}

Graphics.prototype.startGame = function() {
  this.settings.send({type: 'start_late'});
}

Graphics.prototype.updateAttacks = function() {
  assert(this.delta.attacks, 'Updating attacks when attacks is undefined');
  this.state.attacks = this.state.attacks || [];
  while (!this.isPrefix(this.state.attacks, this.delta.attacks)) {
    this.state.attacks.shift();
    this.elements.attacks.children().eq('0').remove();
  }
  while (this.state.attacks.length < this.delta.attacks.length) {
    var type = this.delta.attacks[this.state.attacks.length];
    this.state.attacks.push(type);
    var symbol = '&#' + (9843 + type);
    var cls = 'preview-block attack-' + type;
    var block = $('<div>').addClass(cls).html(symbol).css(
      'margin-bottom', this.squareWidth);
    this.elements.attacks.append(block);
  }
  assert(
      arraysEqual(this.state.preview, this.delta.preview),
      "Previews mismatched!");
}

Graphics.prototype.isPrefix = function(list1, list2) {
  for (var i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]) {
      return false;
    }
  }
  return true;
}

//////////////////////////////////////////////////////////////////////////////
// Public interface begins here!
//////////////////////////////////////////////////////////////////////////////

Graphics.prototype.reset = function(board) {
  this.state = {
    board: [],
    blockIndex: 0,
    preview: [],
  };
  this.delta = {board: {}};

  // We set each cell in the board to -1 so that they will all be marked dirty
  // and redrawn during the call to flip(). Additionally, we have to clear any
  // square class on the board already, since cell colors are changed by
  // removing the old class and adding the new one.
  for (var i = 0; i < Constants.VISIBLEROWS*Constants.COLS; i++) {
    this.state.board.push(-1);
    this.elements.board[i].attr('class', 'square');
    var x = Math.floor(i/Constants.COLS) + Constants.HIDDENROWS;
    var y = i % Constants.COLS;
    this.delta.board[i] = board.data[x][y];
  }

  // Empty the preview and the attacks.
  this.elements.preview.empty();
  this.elements.attacks.empty();

  this.drawBlock(board.block);
  this.drawUI(board);
  this.flip();
}

Graphics.prototype.drawBoardSquare = function(i, j, color) {
  var k = this.getSquareIndex(i, j);
  if (k >= 0) {
    this.delta.board[k] = color;
  }
}

Graphics.prototype.drawBlock = function(block) {
  var offsets = block.getOffsets();
  var color = block.color + Color.MAX;
  var shadow = color + Color.MAX;
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    this.drawBoardSquare(offset.y + block.rowsFree, offset.x, shadow);
  }
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    this.drawBoardSquare(offset.y, offset.x, color);
  }
}

Graphics.prototype.eraseBlock = function(block) {
  var offsets = block.getOffsets();
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    this.drawBoardSquare(offset.y + block.rowsFree, offset.x, 0);
  }
  for (var i = 0; i < offsets.length; i++) {
    var offset = offsets[i];
    this.drawBoardSquare(offset.y, offset.x, 0);
  }
}

Graphics.prototype.drawFloatingScore = function(block, score) {
  if (!this.settings.options.animate_scores) {
    return;
  }
  var index = this.getSquareIndex(block.y, block.x);
  if (index >= 0) {
    var offset = this.target.offset();
    var position = this.elements.board[index].offset();
    var padding = this.squareWidth/3;

    var x = position.left - offset.left - padding;
    var y = position.top - offset.top - padding;
    var rise = 36;

    this.elements.floating_score.text('+' + score);
    var floating_score = this.elements.floating_score.get(0);
    move(floating_score)
      .x(x).y(y).set('opacity', 1).duration(0)
      .end(
        move(floating_score)
          .x(x).y(y - rise).duration(400).ease('linear')
          .end(
            move(floating_score)
              .set('opacity', 0).duration(20*score).ease('linear')
              .end()));
  }
}

Graphics.prototype.drawUI = function(board) {
  this.delta.blockIndex = board.blockIndex;
  this.delta.preview = board.preview;
  this.delta.held = board.held;
  this.delta.heldBlockType = board.heldBlockType;
  this.delta.combo = board.combo;
  this.delta.score = board.score;
  this.delta.state = board.state;
  this.delta.pauseReason = board.pauseReason;
  // Multiplayer-only values that are set to defaults for singleplayer games,
  // plus the level, which is affected by the multiplayer attackIndex.
  this.delta.attacks = board.attacks;
  this.delta.attackIndex = board.attackIndex || 0;
  this.delta.level = this.delta.attackIndex + this.delta.blockIndex;
}

Graphics.prototype.flip = function() {
  for (var k in this.delta.board) {
    var color = this.delta.board[k];
    var last = this.state.board[k];
    if (last !== color) {
      var square = this.elements.board[k];
      square.removeClass('square-' + last).addClass('square-' + color);
      this.state.board[k] = color;
    }
  }
  if (this.state.blockIndex !== this.delta.blockIndex ||
      this.state.preview.length !== this.delta.preview.length) {
    this.updatePreview();
  }
  if (this.state.held !== this.delta.held) {
    this.updateHeld();
  }
  if (this.state.heldBlockType !== this.delta.heldBlockType) {
    this.updateHeldBlockType();
  }
  if (this.state.score !== this.delta.score) {
    this.elements.score.text(this.delta.score);
    this.state.score = this.delta.score;
  }
  if (this.state.combo !== this.delta.combo) {
    this.updateCombo();
  }
  if (this.state.state !== this.delta.state) {
    this.updateOverlay();
  }
  if (this.state.level !== this.delta.level) {
    this.elements.difficulty_ui.setBlockIndex(this.delta.level);
    this.state.level = this.delta.level;
  }
  if (this.multiplayer) {
    if (!maybeArraysEqual(this.state.attacks, this.delta.attacks)) {
      this.updateAttacks();
    }
    if (this.state.attackIndex !== this.delta.attackIndex) {
      this.state.attackIndex = this.delta.attackIndex;
    }
  }
  // At this point, this.delta should equal this.state, except for board,
  // which is stored sparsely in this.delta but densely in this.state.
  this.delta.board = {};
}

return Graphics;
})();
