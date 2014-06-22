var Options = function() {
"use strict";

var Options = function(target) {
  this.keyCodeMap = $.extend({}, Key.keyCodeMap);
  this.keyElementMap = {};
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
  // Create the keys tag-input element.
  var tagInput = $('<div>').addClass('col-sm-6 ntris-options-keys');
  var button = $('<a>').addClass('btn btn-primary btn-sm').text('+')
  button.click(function(e) { that.waitForKey(e, button); });
  tagInput.append(button);
  // Get a sorted list of keys assigned to this action and add tags for them.
  var keys = [];
  for (var key in this.keyCodeMap) {
    if (Key.keyToAction(key) == action) {
      keys.push(key);
    }
  }
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    tagInput.append(this.buildKey(keys[i]));
  }
  // Return the final action input.
  result.append(label, tagInput);
  return result;
}

Options.prototype.buildKey = function(key) {
  if (this.keyElementMap.hasOwnProperty(key)) {
    this.keyElementMap[key].remove();
  }
  var result = $('<a>').addClass('btn btn-default btn-sm')
    .data('key', key)
    .click(function() { this.remove(); })
    .text(Key.keyNames[key] || 'Keycode ' + key)
    .append($('<span>').addClass('ntris-options-close').html('&times;'));
  this.keyElementMap[key] = result;
  return result;
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
    var existingKey = parseInt($(children[i]).data('key'), 10);
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
