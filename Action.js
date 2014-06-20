var Action = function() {
"use strict";

var Action = {
  NUMACTIONS: 8,

  LEFT: 0,
  RIGHT: 1,
  DOWN: 2,
  ROTATE_CW: 3,
  ROTATE_CCW: 4,
  DROP: 5,
  HOLD: 6,
  PAUSE: 7,
}

Action.repeats = [true, true, true, false, false, false, false, false];

Action.doesActionRepeat = function(action) {
  assert(
      0 <= action && action < Action.NUMACTIONS,
      "Invalid action: " + action);
  return this.repeats[action];
}

return Action;
}();
