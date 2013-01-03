var Constants = {};

// Board size constants.
Constants.VISIBLEROWS = 24;
// (VISIBLEROWS + Block.MAXBLOCKSIZE - 1)
Constants.ROWS = (Constants.VISIBLEROWS + 10 - 1);
Constants.COLS = 12;

// Screen size constants.
Constants.SQUAREWIDTH = 21;
Constants.BORDER = Constants.SQUAREWIDTH;
Constants.SIDEBOARD = Math.floor(7*Constants.SQUAREWIDTH/2);
Constants.WIDTH = Constants.SQUAREWIDTH*Constants.COLS + Constants.SIDEBOARD + 2*Constants.BORDER;
Constants.HEIGHT = Constants.SQUAREWIDTH*Constants.VISIBLEROWS + 2*Constants.BORDER;

// Game states.
Constants.PLAYING = 0;
Constants.PAUSED = 1;
Constants.GAMEOVER = 2;

// Game engine constants.
Constants.FRAMERATE = 60;
Constants.FRAMEDELAY = Math.floor(1000/Constants.FRAMERATE);
Constants.MAXFRAME = 3628800;
Constants.PAUSE = 120;
Constants.REPEAT = 30;

// Block movement constants, some of which are imported by Block.
Constants.GRAVITY = 60;
Constants.SHOVEAWAYS = 2;
Constants.LOCALSTICKFRAMES = 24;
Constants.GLOBALSTICKFRAMES = 120;

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
Constants.RINTERVAL = 480;

// Points given for each number of rows cleared.
Constants.POINTS = [0, 1, 3, 7, 15, 31, 63, 79, 87, 91, 93];
