var Options = function() {
"use strict";

var Options = function(target, options) {
  this.target = target;

  options = options || {};
  options.key_bindings = options.key_bindings || Key.defaultKeyBindings;
  this.key_bindings = $.extend({}, options.key_bindings);
  this.key_elements = {};

  var form = $('<form>').addClass('form-horizontal');
  for (var i = 0; i < Action.NUMACTIONS; i++) {
    form.append(this.build_action(i));
  }
  form.append($('<div>').addClass('divider'));

  var animation_group = $('<div>').addClass('form-group');
  animation_group.append(this.build_bool_option(
      'Animate preview:', 'animate_preview', options.animate_preview));
  animation_group.append(this.build_bool_option(
      'Animate scores:', 'animate_scores', options.animate_scores));
  form.append(animation_group);

  target.addClass('combinos-options').attr('tabindex', 2).append(form);
}

Options.validate_options = function(options) {
  for (var key in options.key_bindings) {
    assert(key in Key.keyNames, 'Unexpected key: ' + key);
    var action = options.key_bindings[key];
    assert(parseInt(action) === action &&
           0 <= action && action < Action.NUMACTIONS,
           'Unexpected action: ' + action);
  }
  assert(options.animate_preview === !!options.animate_preview);
  assert(options.animate_scores === !!options.animate_scores);
}

Options.prototype.get_current_options = function() {
  return {
    'key_bindings': this.key_bindings,
    'animate_preview': this.get_bool_option('animate_preview'),
    'animate_scores': this.get_bool_option('animate_scores'),
  };
}

Options.prototype.get_bool_option = function(option) {
  var selector = '.bool-option.' + option + '>.active>input';
  return !!(parseInt(this.target.find(selector).val()));
}

Options.prototype.build_bool_option = function(label, option, value) {
  var cls = 'btn btn-default btn-white';
  return $('<div>').addClass('bool-option-group').append(
    $('<label>').addClass('col-sm-4 control-label').text(label),
    $('<div>').addClass('bool-option ' + option + ' btn-group btn-group-sm')
        .attr('data-toggle', 'buttons').append(
      $('<label>').addClass(cls + (value ? ' active' : '')).text('On')
          .append($('<input type="radio" value="1">')),
      $('<label>').addClass(cls + (value ? '' : ' active')).text('Off')
          .append($('<input type="radio" value="0">'))
    )
  )
}

Options.prototype.build_action = function(action) {
  var result = $('<div>').addClass('form-group');
  var label = $('<label>')
    .addClass('col-sm-4 control-label')
    .text(Action.labels[action] + ':');

  // Create the keys tag input element.
  var tag_input = $('<div>').addClass('col-sm-8 keys-list');
  var button = $('<a>')
    .addClass('btn btn-primary btn-sm')
    .data('action', action)
    .text('+');
  button.click(this.wait_for_key.bind(this, button));
  tag_input.append(button);

  // Build a tag box for each key assigned to this action.
  var keys = [];
  for (var key in this.key_bindings) {
    if (this.key_bindings[key] === action) {
      keys.push(key);
    }
  }
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    tag_input.append(this.build_key(action, keys[i]));
  }

  // Return the final action input.
  result.append(label, tag_input);
  return result;
}

Options.prototype.build_key = function(action, key) {
  var that = this;

  if (this.key_elements.hasOwnProperty(key)) {
    this.key_elements[key].remove();
  }
  var result = $('<a>')
    .addClass('btn btn-default btn-sm')
    .data('key', key)
    .click(function() {
      delete that.key_bindings[key];
      this.remove();
    })
    .text(Key.keyNames[key] || 'Keycode ' + key)
    .append($('<span>').addClass('close-button').html('&times;'));
  this.key_bindings[key] = action;
  this.key_elements[key] = result;
  return result;
}

Options.prototype.signal_ready = function(button) {
  button.removeClass('btn-info').addClass('btn-default').text('+');
  this.waiting_button = undefined;
  this.target.unbind('keydown');
}

Options.prototype.signal_wait = function(button) {
  button.removeClass('btn-default').addClass('btn-info').text('Press a key...');
  this.waitingButton = button;
  this.target.keydown(this.get_key.bind(this, button));
}

Options.prototype.wait_for_key = function(button, e) {
  var repeat = button === this.waiting_button;
  if (this.waiting_button) {
    this.signal_ready(this.waiting_button);
  }
  if (!repeat) {
    this.signal_wait(button);
  }
}

Options.prototype.get_key = function(button, e) {
  this.signal_ready(button);

  // Extract the key code from the event. Note that this behavior is slighlty
  // browser-dependent, so we have to check a few cases.
  e = e || window.event;
  e.bubbles = false;
  var key = e.keyCode;

  // We don't allow the user to assign escape to a button.
  if (key !== 27) {
    this.add_key(button, key);
  }
  e.preventDefault();
}

Options.prototype.add_key = function(button, key) {
  var children = button.parent().children();
  // Insert the new key into the tag input in the correct place.
  for (var i = 1; i < children.length; i++) {
    var existing_key = parseInt($(children[i]).data('key'), 10);
    if (existing_key === key) {
      // TODO(skishore): Flash this tag to show that it's already assigned.
      return;
    } else if (existing_key > key) {
      break;
    }
  }
  var action = parseInt(button.data('action'), 10);
  $(children[i - 1]).after(this.build_key(action, key));
}

return Options;
}();
