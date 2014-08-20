var LocalOptions = function() {
"use strict";

var LocalOptions = function(board, target) {
  this.board = board;
  this.elements = this.build(target);
}

LocalOptions.prototype.build = function(target) {
  var that = this;
  var result = {target: target};

  target.attr('tabindex', 2);

  // Construct a modal structure within the target.
  target.addClass('modal fade');
  var dialog = $('<div>').addClass('modal-dialog');
  var content = $('<div>').addClass('modal-content');
  var header = $('<div>').addClass('modal-header')
    .append($('<h4>').text('Edit key bindings'));
  var body = $('<div>').addClass('modal-body');
  var footer = $('<div>').addClass('modal-footer');

  // Create the key-bindings form with a tag input for each action.
  result.form = $('<form>').addClass('form-horizontal');
  body.append(result.form);

  // Create buttons required to hide the modal.
  footer.append(
    $('<a>').addClass('btn btn-danger btn-sm restore-defaults-button')
        .text('Restore defaults')
        .click(function(e) { that.show(true); }),
    $('<a>').addClass('btn btn-primary btn-sm').text('Apply')
        .click(function(e) { that.hide(true); }),
    $('<a>').addClass('btn btn-default btn-sm').text('Cancel')
        .click(function(e) { that.hide(false); })
  );
  target.append(dialog.append(content.append(header, body, footer)));

  // Add in the button required to show the form.
  target.after(
    $('<a>').addClass('btn btn-primary btn-sm').text('Edit key bindings')
        .click(function(e) { that.show(false); })
  );

  target.on('hidden.bs.modal', function () { that.board.target.focus(); });
  return result;
}

LocalOptions.prototype.show = function(restore) {
  if (this.board.state === Constants.PLAYING) {
    this.board.state = Constants.PAUSED;
    this.board.pauseReason = 'focus';
  }

  if (restore) {
    this.keyBindings = $.extend({}, Key.defaultKeyBindings);
  } else {
    this.keyBindings = $.extend({}, this.board.repeater.keyBindings);
  }
  this.keyElements = {};

  this.elements.form.empty();
  for (var i = 0; i < Action.NUMACTIONS; i++) {
    this.elements.form.append(this.buildAction(i));
  }

  if (!restore) {
    this.elements.target.modal('show');
  }
}

LocalOptions.prototype.hide = function(save) {
  if (save) {
    Key.saveKeyBindings(this.keyBindings);
    this.board.repeater.setKeyBindings(this.keyBindings);
  }
  this.elements.target.modal('hide');
}

LocalOptions.prototype.buildAction = function(action) {
  var that = this;

  var result = $('<div>').addClass('form-group');
  var label = $('<label>')
    .addClass('col-sm-4 control-label')
    .text(Action.labels[action] + ':');
  // Create the keys tag input element.
  var tagInput = $('<div>').addClass('col-sm-8 keys-list');
  var button = $('<a>')
    .addClass('btn btn-primary btn-sm')
    .data('action', action)
    .text('+');
  button.click(function(e) { that.waitForKey(e, button); });
  tagInput.append(button);
  // Build a tag box for each key assigned to this action.
  var keys = [];
  for (var key in this.keyBindings) {
    if (this.keyBindings[key] === action) {
      keys.push(key);
    }
  }
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    tagInput.append(this.buildKey(action, keys[i]));
  }
  // Return the final action input.
  result.append(label, tagInput);
  return result;
}

LocalOptions.prototype.buildKey = function(action, key) {
  if (this.keyElements.hasOwnProperty(key)) {
    this.keyElements[key].remove();
  }
  var that = this;
  var result = $('<a>')
    .addClass('btn btn-default btn-sm')
    .data('key', key)
    .click(function() {
      delete that.keyBindings[key];
      this.remove();
    })
    .text(Key.keyNames[key] || 'Keycode ' + key)
    .append($('<span>').addClass('close-button').html('&times;'));
  this.keyBindings[key] = action;
  this.keyElements[key] = result;
  return result;
}

LocalOptions.prototype.signalReady = function(button) {
  button.removeClass('btn-info').addClass('btn-default').text('+');
  this.waitingButton = undefined;
  this.elements.target.unbind('keydown');
}

LocalOptions.prototype.signalWait = function(button) {
  var that = this;
  button.removeClass('btn-default').addClass('btn-info').text('Press a key...');
  this.waitingButton = button;
  this.elements.target.keydown(function(e) { that.getKey(e, button); });
}

LocalOptions.prototype.waitForKey = function(e, button) {
  var repeat = button === this.waitingButton;
  if (this.waitingButton) {
    this.signalReady(this.waitingButton);
  }
  if (!repeat) {
    this.signalWait(button);
  }
}

LocalOptions.prototype.getKey = function(e, button) {
  this.signalReady(button);
  var key = this.keyCode(e);
  if (key !== 27) {
    // We don't allow the user to assign escape to a button.
    this.addKey(button, key);
  }
  e.preventDefault();
}

LocalOptions.prototype.keyCode = function(e) {
  e = e || window.event;
  e.bubbles = false;
  return e.keyCode;
}

LocalOptions.prototype.addKey = function(button, key) {
  var children = button.parent().children();
  for (var i = 1; i < children.length; i++) {
    var existingKey = parseInt($(children[i]).data('key'), 10);
    if (existingKey === key) {
      // TODO(skishore): Flash this element.
      return;
    } else if (existingKey > key) {
      break;
    }
  }
  var action = parseInt(button.data('action'), 10);
  $(children[i - 1]).after(this.buildKey(action, key));
}

return LocalOptions;
}();
