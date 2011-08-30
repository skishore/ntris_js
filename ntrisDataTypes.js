function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Block() {
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.numSquares = 0;
  this.squares = new Array();
  for (var i = 0; i < MAXBLOCKSIZE; i++) {
    this.squares[i] = new Point();
  }
  this.color = 'red';
  this.shoveaways = 0;
  this.localStickFrames = MAXLOCALSTICKFRAMES;
  this.globalStickFrames = MAXGLOBALSTICKFRAMES;
  this.rotates = true;
  this.height = 0;
  this.rowsDropped = 0;
}
