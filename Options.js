var Options = function() {
"use strict";

var Options = function(target) {
  this.element = this.build(target);
}

Options.prototype.build = function(target) {
  var result = {}

  target.append($('<h4>').text('Key bindings'));

  var form = $('<form>').addClass('form-horizontal');
  result.actions = [];
  for (var i = 0; i < Action.NUMACTIONS; i++) {
    var element = this.buildActionElement(i);
    form.append(element);
    result.actions.push(element);
  }
  target.append(form);
}

Options.prototype.buildActionElement = function(action) {
  var result = $('<div>').addClass('form-group');
  var label = $('<label>')
    .addClass('col-sm-4 control-label')
    .text(Action.labels[action] + ':');
  var keys = $('<div>').addClass('col-sm-8 ntris-options-keys');
  for (var key in Key.keyCodeMap) {
    if (Key.keyToAction(key) == action) {
      keys.append($('<a>').addClass('btn btn-default btn-sm')
        .text(Key.keyNames[key] || 'Keycode ' + key)
        .data('key', key)
        .append($('<span>').addClass('ntris-options-close').html('&times;')));
    }
  }
  var button = $('<a>').addClass('btn btn-primary btn-sm').text('+');
  result.append(label, keys.append(button));
  return result;
}

return Options;
}();
