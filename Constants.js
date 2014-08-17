var Constants = (function() {
"use strict";

var Constants = {};

// Board size constants.
// HIDDENROWS = Block.MAXBLOCKSIZE - 1;
Constants.HIDDENROWS = 10 - 1;
Constants.VISIBLEROWS = 24;
Constants.ROWS = Constants.HIDDENROWS + Constants.VISIBLEROWS;
Constants.COLS = 12;

// Screen size constants.
Constants.SQUAREWIDTH = 12;

// Game states.
Constants.PLAYING = 0;
Constants.PAUSED = 1;
Constants.GAMEOVER = 2;
// The user is waiting for the next multiplayer round to begin.
Constants.WAITING = 3;

// Game engine constants.
Constants.FRAMERATE = 48;
Constants.FRAMEDELAY = Math.floor(1000/Constants.FRAMERATE);
Constants.MAXFRAME = 3628800;
Constants.PAUSE = 3;
Constants.REPEAT = 0;

// Block movement constants, some of which are imported by Block.
Constants.GRAVITY = 2*Constants.FRAMERATE/3;
Constants.SHOVEAWAYS = 4;
Constants.LOCALSTICKFRAMES = Constants.FRAMERATE/2;
Constants.GLOBALSTICKFRAMES = 2*Constants.FRAMERATE;

// Block overlap codes, in order of priority.
Constants.LEFTEDGE = 0;
Constants.RIGHTEDGE = 1;
Constants.TOPEDGE = 2;
Constants.BOTTOMEDGE = 3;
Constants.OVERLAP = 4;
Constants.OK = 5;

// Preview size and animation speed.
Constants.PREVIEW = 5;
Constants.PREVIEWFRAMES = 3;

// Difficulty curve constants.
Constants.LEVELINTERVAL = 60;
Constants.MINR = 0.1;
Constants.MAXR = 0.9;
Constants.HALFRSCORE = 480;

// Points given for each number of rows cleared.
Constants.POINTS = [0, 1, 3, 7, 15, 31, 63, 79, 87, 91, 93];

// The maximum attack size in battle mode.
Constants.ATTACKS = 6;

return Constants;
})();
