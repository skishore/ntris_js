var Key = (function() {
"use strict";

var Key = {};

Key.NUMKEYS = 7;

Key.UP = 0;
Key.RIGHT = 1;
Key.DOWN = 2;
Key.LEFT = 3;
Key.DROP = 4;
Key.HOLD = 5;
Key.PAUSE = 6;

Key.doesKeyRepeat = [false, true, true, true, false, false, false];

Key.translateKeyCode = function(keyCode) {
  switch (keyCode) {
    case 38: return Key.UP;
    case 39: return Key.RIGHT;
    case 40: return Key.DOWN;
    case 37: return Key.LEFT;
    case 32: return Key.DROP;
    case 16: return Key.HOLD;
    case 13: return Key.PAUSE;
    case 80: return Key.PAUSE;
    default: return -1;
  }
}

return Key;
})();
