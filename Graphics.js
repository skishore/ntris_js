var Graphics = (function() {
"use strict";

var Graphics = function(squareWidth, target) {
  this.squareWidth = squareWidth;
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

  var outer = this.squareWidth/4;
  var inner = this.squareWidth/8;
  var buffer = outer + inner - this.border;
  var overlay_wrapper = $('<div>').addClass('overlay-wrapper').css({
    'padding-top': this.squareWidth*(Constants.VISIBLEROWS/2 - 1) - buffer,
  });
  target.append(overlay_wrapper);

  result.overlay = $('<div>').addClass('overlay');
  overlay_wrapper.append(result.overlay);

  var css = {'font-size': this.squareWidth, 'width': 5*this.width/8};
  result.line1 = $('<div>').addClass('text-box').css(css)
      .css({'padding-top': outer, 'padding-bottom': inner}).text('line1');
  result.line2 = $('<div>').addClass('text-box').css(css)
      .css({'padding-top': inner, 'padding-bottom': outer}).text('line2');
  overlay_wrapper.append(result.line1, result.line2);

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
  result.preview = $('<div>')
      .addClass('preview')
      .height(5*this.squareWidth/2*(Constants.PREVIEW + 2));
  sideboard.append(result.preview);

  result.hold = $('<div>').addClass('hold').css({
    'height': 4*this.squareWidth,
    'margin-left': this.squareWidth/4,
    'margin-right': this.squareWidth/4,
  });
  sideboard.append(result.hold);

  result.hold_overlay = $('<div>').addClass('hold-overlay');
  result.hold.append(result.hold_overlay);

  result.preview.css('margin-top',
      (sideboard.height() - result.preview.height() - result.hold.height())/2);

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

Graphics.prototype.resetDelta = function() {
  this.drawUI(this.state);
  this.delta.board = {};
}

Graphics.prototype.getSquareIndex = function(i, j) {
  assert(i >= 0 && i < Constants.ROWS && j >= 0 && j < Constants.COLS,
      'Invalid board square: (' + i + ', ' + j + ')');
  return Constants.COLS*(i - Constants.HIDDENROWS) + j;
}

Graphics.prototype.drawFreeBlock = function(target, type, x, y, w) {
  if (type >= 0) {
    var block = Block.prototypes[type];
    var light = Color.body_colors[block.color + Color.MAX];
    var dark = Color.mix(light, Color.BLACK, 0.4*Color.LAMBDA);

    var offsets = block.getOffsets();
    for (var i = 0; i < offsets.length; i++) {
      var offset = offsets[i];
      target.append($('<div>').addClass('free-square').css({
        'background-color': ((offset.x + offset.y) % 2 ? dark : light),
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
      // Add the block's missing height to the preview offset and scroll it.
      this.state.previewFrame = Constants.PREVIEWFRAMES;
      this.state.previewOffset +=
          Block.prototypes[type].height*this.smallWidth + this.squareWidth;
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

Graphics.prototype.updatePreviewFrame = function() {
  this.state.previewOffset *=
      (this.state.previewFrame - 1)/this.state.previewFrame;
  this.elements.preview.children().eq('0').css(
      'margin-top', this.state.previewOffset);
  this.state.previewFrame -= 1;
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
  if (this.delta.state === Constants.PLAYING) {
    this.elements.overlay.css('background-color', 'transparent');
    this.drawText();
  } else if (this.delta.state === Constants.PAUSED) {
    this.elements.overlay.css('background-color', 'black');
    this.elements.overlay.css('opacity', 1);
    var resume = (this.delta.pauseReason === 'focus' ? 'Click' : 'Press START');
    this.drawText('-- PAUSED --', resume + ' to resume');
  } else if (this.delta.state === Constants.GAMEOVER) {
    this.elements.overlay.css('background-color', 'red');
    this.elements.overlay.css('opacity', 1.2*Color.LAMBDA);
    this.drawText('-- You FAILED --', 'Press START to try again');
  } else {
    this.elements.overlay.css('background-color', 'black');
    this.elements.overlay.css('opacity', 1);
    this.drawText('WAITING FOR THE', 'NEXT ROUND');
  }
  this.state.state = this.delta.state;
  this.state.pauseReason = this.delta.pauseReason;
}

Graphics.prototype.drawText = function(line1, line2) {
  if (!line1 && !line2) {
    this.elements.line1.hide();
    this.elements.line2.hide();
  } else {
    this.elements.line1.show().text(line1);
    this.elements.line2.show().text(line2);
  }
}

//////////////////////////////////////////////////////////////////////////////
// Public interface begins here!
//////////////////////////////////////////////////////////////////////////////

Graphics.prototype.reset = function(board) {
  // We set blockIndex to -Constants.PREVIEW so that we delete all blocks that
  // are currently queued up in the preview.
  this.state = {
    board: [],
    blockIndex: -Constants.PREVIEW,
    preview: [],
    previewFrame: 0,
    previewOffset: 0,
  };
  this.delta = {board: {}};

  // We set each cell in the board to -1 so that they will all be marked dirty
  // and redrawn during the call to flip().
  for (var i = 0; i < Constants.VISIBLEROWS*Constants.COLS; i++) {
    this.state.board.push(-1);
    var x = Math.floor(i/Constants.COLS) + Constants.HIDDENROWS;
    var y = i % Constants.COLS;
    this.delta.board[i] = board.data[x][y];
  }

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

Graphics.prototype.drawUI = function(board) {
  this.delta.blockIndex = board.blockIndex;
  this.delta.preview = board.preview;
  this.delta.held = board.held;
  this.delta.heldBlockType = board.heldBlockType;
  this.delta.combo = board.combo;
  this.delta.score = board.score;
  this.delta.state = board.state;
  this.delta.pauseReason = board.pauseReason;
}

Graphics.prototype.flip = function() {
  for (var k in this.delta.board) {
    var color = this.delta.board[k];
    if (this.state.board[k] !== color) {
      var square = this.elements.board[k];
      square.attr('class', 'square square-' + color);
      this.state.board[k] = color;
    }
  }
  if (this.state.blockIndex !== this.delta.blockIndex ||
      this.state.preview.length !== this.delta.preview.length) {
    this.updatePreview();
    this.elements.difficulty_ui.setBlockIndex(this.delta.blockIndex);
  }
  if (this.state.previewFrame > 0 && this.state.state === Constants.PLAYING) {
    // We only scroll the preview if the game is in motion.
    this.updatePreviewFrame();
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
  this.resetDelta();
}

return Graphics;
})();
