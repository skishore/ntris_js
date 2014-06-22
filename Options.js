var Options = function() {
"use strict";

var Options = function(target) {
  this.keyCodeMap = $.extend({}, Key.keyCodeMap);
  this.elements = this.build(target);
}

Options.prototype.build = function(target) {
  var result = {target: target};

  target.append($('<h4>').text('Key bindings'));
  target.attr('tabindex', 2);

  var form = $('<form>').addClass('form-horizontal');
  result.actions = [];
  for (var i = 0; i < Action.NUMACTIONS; i++) {
    var element = this.buildAction(i);
    form.append(element);
    result.actions.push(element);
  }
  target.append(form);

  return result;
}

Options.prototype.buildAction = function(action) {
  var that = this;

  var result = $('<div>').addClass('form-group');
  var label = $('<label>')
    .addClass('col-sm-6 control-label')
    .text(Action.labels[action] + ':');
  var keys = $('<div>').addClass('col-sm-6 ntris-options-keys');
  var button = $('<a>').addClass('btn btn-primary btn-sm').text('+')
  button.click(function(e) { that.waitForKey(e, button); });
  keys.append(button);
  for (var key in this.keyCodeMap) {
    if (Key.keyToAction(key) == action) {
      keys.append(this.buildKey(key));
    }
  }
  result.append(label, keys);
  return result;
}

Options.prototype.buildKey = function(key) {
  return $('<a>').addClass('btn btn-default btn-sm')
    .text(Key.keyNames[key] || 'Keycode ' + key)
    .data('key', key)
    .append($('<span>').addClass('ntris-options-close').html('&times;'));
}

Options.prototype.signalReady = function(button) {
  button.removeClass('btn-info').addClass('btn-default').text('+');
  this.waitingButton = undefined;
  this.elements.target.unbind('keydown');
}

Options.prototype.signalWait = function(button) {
  var that = this;
  button.removeClass('btn-default').addClass('btn-info').text('Press a key...');
  this.waitingButton = button;
  this.elements.target.keydown(function(e) { that.getKey(e, button); });
}

Options.prototype.waitForKey = function(e, button) {
  var repeat = button == this.waitingButton;
  if (this.waitingButton) {
    this.signalReady(this.waitingButton);
  }
  if (!repeat) {
    this.signalWait(button);
  }
}

Options.prototype.getKey = function(e, button) {
  this.signalReady(button);
  this.addKey(button.parent(), this.keyCode(e));
}

Options.prototype.keyCode = function(e) {
  e = e || window.event;
  e.bubbles = false;
  return e.keyCode;
}

Options.prototype.addKey = function(element, key) {
  var children = element.children();
  for (var i = 1; i < children.length; i++) {
    var existingKey = $(children[i]).data('key');
    if (existingKey == key) {
      // TODO(skishore): Flash this element.
      return;
    } else if (existingKey > key) {
      break;
    }
  }
  $(children[i - 1]).after(this.buildKey(key));
}

return Options;
}();
