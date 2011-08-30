var SCOREINTERVAL = 60;
var MINR = 0.1;
var MAXR = 0.9;
var HALFRSCORE = 480;

var MAXBLOCKSIZE = 10;
var NUMROWS = (24 + MAXBLOCKSIZE - 1);
var NUMCOLS = 12;

// board states
var RESET = 0;
var PLAYING = 1;
var PAUSED = 2;
var GAMEOVER = 4;
var COUNTDOWN = 6;
var QUIT = -1;

// Block physics engine constants
var FRAMERATE = 60;
var MAXFRAMENUM = 840;
var MAXSHOVEAWAYS = 2;
var MAXLOCALSTICKFRAMES = 24;
var MAXGLOBALSTICKFRAMES = 120;
var GRAVITY = 48;

// illegal block flags - these record why a block is illegal
// given in order of priority, so first a block is tested against
// the edges of the board, then it is tested for overlap
var OK = 0;
var TOPEDGE = 1;
var RIGHTEDGE = 2;
var BOTTOMEDGE = 3;
var LEFTEDGE = 4;
var OVERLAP = 5;

// event types
var PLACEBLOCK = 0;
var GETNEXTBLOCK = 1;
var QUEUEBLOCK = 2;
var SENDATTACK = 3;
var RECEIVEATTACK = 4;
var VICTORY = 5;
var RESETBOARD = 6;
var MAXEVENTS = 32;

// Key type constants
var MOVEUP = 0;
var MOVEBACK = 1;
var MOVERIGHT = 2;
var MOVEDOWN = 3;
var MOVELEFT = 4;
var MOVEDROP = 5;
var MOVEHOLD = 6;
var ENTER = 7;
var PAUSE = 8;
var ESCAPEKEY = 9;
var NUMKEYS = 10;

var PREVIEW = 5;
var PREVIEWANIMFRAMES = 3;

var SQUAREWIDTH = 21;
var SIDEBOARD = 7*SQUAREWIDTH/2;
var BOARDWIDTH = SQUAREWIDTH*NUMCOLS + SIDEBOARD;
var BOARDHEIGHT = SQUAREWIDTH*(NUMROWS - MAXBLOCKSIZE + 1);
var BORDER = SQUAREWIDTH;
