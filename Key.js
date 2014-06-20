var Key = (function() {
"use strict";

var Key = {
  NUMKEYS: 11,

  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  SPACE: 4,
  LSHIFT: 5,
  ENTER: 6,
  P: 7,
  Z: 8,
  X: 9,
  C: 10,
}

Key.keyCodeMap = {
  38: Key.UP,
  39: Key.RIGHT,
  40: Key.DOWN,
  37: Key.LEFT,
  32: Key.SPACE,
  16: Key.LSHIFT,
  13: Key.ENTER,
  80: Key.P,
  90: Key.Z,
  88: Key.X,
  67: Key.C,
}

Key.keyMap = [
  Action.ROTATE_CW, Action.RIGHT, Action.DOWN, Action.LEFT,
  Action.DROP, Action.HOLD, Action.PAUSE, Action.PAUSE,
  Action.ROTATE_CCW, Action.ROTATE_CW, Action.HOLD];

Key.keyCodeToKey = function(keyCode) {
  if (Key.keyCodeMap.hasOwnProperty(keyCode)) {
    return Key.keyCodeMap[keyCode];
  }
  return -1;
}

Key.keyToAction = function(key) {
  assert(0 <= key && key < Key.NUMKEYS, "Invalid key: " + key);
  return Key.keyMap[key];
}

return Key;
})();
