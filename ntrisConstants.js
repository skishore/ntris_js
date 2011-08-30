// Difficulty curve constants
var SCOREINTERVAL = 60;
var MINR = 0.1;
var MAXR = 0.9;
var HALFRSCORE = 480;

// Game loop constants
var MAXFRAMENUM = 840;
var frame = 0;

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

// the amount of time each "second" takes during a countdown
var SECOND = 54;
var NUMSECONDS = 3;

// game modes
var SINGLEPLAYER = 0;
var MULTIPLAYER = 1;

// event types
var PLACEBLOCK = 0;
var GETNEXTBLOCK = 1;
var QUEUEBLOCK = 2;
var SENDATTACK = 3;
var RECEIVEATTACK = 4;
var VICTORY = 5;
var RESETBOARD = 6;
var MAXEVENTS = 32;

// illegal block flags - these record why a block is illegal
// given in order of priority, so first a block is tested against
// the edges of the board, then it is tested for overlap
var OK = 0;
var TOPEDGE = 1;
var RIGHTEDGE = 2;
var BOTTOMEDGE = 3;
var LEFTEDGE = 4;
var OVERLAP = 5;

// the number of times a block can be shoved away from an obstacle
var MAXSHOVEAWAYS = 2;
// the number of frames before a block sticks locally or globally
var MAXLOCALSTICKFRAMES = 24;
var MAXGLOBALSTICKFRAMES = 120;
// constants holding movement direction data
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

var FRAMERATE = 60;
// this variable records how many frames go by before gravity is applied
var GRAVITY = 48;

// the number of blocks we preview
var PREVIEW = 5;
// the number of frames used to animate the preview list
var PREVIEWANIMFRAMES = 3;

var squareWidth = 21;
var sideBoard = 7*squareWidth/2;
var boardWidth = squareWidth*NUMCOLS + sideBoard;
var boardHeight = squareWidth*(NUMROWS-MAXBLOCKSIZE+1);
var BORDER = squareWidth;
