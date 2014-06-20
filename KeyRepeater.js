var KeyRepeater = (function() {
"use strict";

var KeyRepeater = function(pause, repeat, target) {
  this.pause = pause;
  this.repeat = repeat;

  this.isKeyDown = [];
  this.keyFireFrames = [];
  for (var i = 0; i < Key.NUMKEYS; i++) {
    this.isKeyDown.push(false);
    this.keyFireFrames.push(-1);
  }

  // keys is accessed from outside this class.
  this.keys = [];

  target.attr('tabIndex', 1);
  target.focus();
  target.keydown(this.keydown_handler());
  target.keyup(this.keyup_handler());
}

KeyRepeater.prototype.keyCode = function(e) {
  e = e || window.event;
  e.bubbles = false;
  return e.keyCode;
}

KeyRepeater.prototype.keydown_handler = function() {
  var repeater = this;
  return function(e) {
    var key = Key.translateKeyCode(repeater.keyCode(e));
    if (key >= 0) {
      repeater.isKeyDown[key] = true;
      e.preventDefault();
    }
  };
}

KeyRepeater.prototype.keyup_handler = function() {
  var repeater = this;
  return function(e) {
    var key = Key.translateKeyCode(repeater.keyCode(e));
    if (key >= 0) {
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
  for (var key = 0; key < Key.NUMKEYS; key++) {
    if (this.isKeyDown[key]) {
      if (this.keyFireFrames[key] < 0) {
        this.keys.push(key);
        this.keyFireFrames[key] = this.pause;
      } else if (this.keyFireFrames[key] == 0) {
        if (Key.doesKeyRepeat[key]) {
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
    var action = Key.keyToAction[keys[i]];
    if (!actionsSet.hasOwnProperty(action)) {
      actions.push(action);
      actionsSet[action] = 1;
    }
  }
  return actions;
}

return KeyRepeater;
})();
