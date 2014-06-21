var Key = (function() {
"use strict";

var Key = {
  keyCodeMap: {
    38: Action.ROTATE_CW,
    39: Action.RIGHT,
    40: Action.DOWN,
    37: Action.LEFT,
    32: Action.DROP,
    16: Action.HOLD,
    13: Action.START,
    80: Action.START,
    90: Action.ROTATE_CCW,
    88: Action.ROTATE_CW,
    67: Action.HOLD,
  },

  keyToAction: function(key) {
    if (Key.keyCodeMap.hasOwnProperty(key)) {
      return Key.keyCodeMap[key];
    }
    return -1;
  },
};

return Key;
})();
