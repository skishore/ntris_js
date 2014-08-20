var KeyRepeater = (function() {
"use strict";

var KeyRepeater = function(pause, repeat, target, keyBindings) {
  this.pause = pause;
  this.repeat = repeat;
  this.setKeyBindings(keyBindings);

  target.attr('tabIndex', 1);
  target.keydown(this.keydown_handler());
  target.keyup(this.keyup_handler());
}

KeyRepeater.prototype.setKeyBindings = function(keyBindings) {
  keyBindings = keyBindings || Key.loadKeyBindings();
  this.keyBindings = keyBindings;
  this.isKeyDown = {};
  this.keyFireFrames = {};
  for (var key in this.keyBindings) {
    this.isKeyDown[key] = false;
    this.keyFireFrames[key] = -1;
  }
  this.keys = [];
}

KeyRepeater.prototype.keyCode = function(e) {
  e = e || window.event;
  e.bubbles = false;
  return e.keyCode;
}

KeyRepeater.prototype.keydown_handler = function() {
  var repeater = this;
  return function(e) {
    var key = repeater.keyCode(e);
    if (repeater.keyBindings.hasOwnProperty(key)) {
      repeater.isKeyDown[key] = true;
      e.preventDefault();
    }
  };
}

KeyRepeater.prototype.keyup_handler = function() {
  var repeater = this;
  return function(e) {
    var key = repeater.keyCode(e);
    if (repeater.keyBindings.hasOwnProperty(key)) {
      repeater.isKeyDown[key] = false;
      if (repeater.keyFireFrames[key] < 0) {
        repeater.keys.push(key);
      }
      repeater.keyFireFrames[key] = -1;
      e.preventDefault();
    }
  };
}

// Returns a list of Actions that were issued this time step.
KeyRepeater.prototype.query = function(e) {
  for (var key in this.keyBindings) {
    if (this.isKeyDown[key]) {
      if (this.keyFireFrames[key] < 0) {
        this.keys.push(key);
        this.keyFireFrames[key] = this.pause;
      } else if (this.keyFireFrames[key] === 0) {
        if (Action.doesActionRepeat(this.keyBindings[key])) {
          this.keys.push(key);
        }
        this.keyFireFrames[key] = this.repeat;
      } else {
        this.keyFireFrames[key]--;
      }
    }
  }
  var result = this.getActionsForKeys(this.keys);
  this.keys.length = 0;
  return result;
}

// Converts a list of keys into a list of distinct actions.
KeyRepeater.prototype.getActionsForKeys = function(keys) {
  var actions = [];
  var actionsSet = {};
  for (var i = 0; i < keys.length; i++) {
    var action = this.keyBindings[keys[i]];
    if (!actionsSet.hasOwnProperty(action)) {
      actions.push(action);
      actionsSet[action] = 1;
    }
  }
  return actions;
}

return KeyRepeater;
})();
