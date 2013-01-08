Block = function(type) {
  if (type === undefined) {
    return;
  }

  // These properties are mutable.
  this.x = Block.prototypes[type].x;
  this.y = Block.prototypes[type].y;
  this.angle = 0;
  this.shoveaways = Constants.SHOVEAWAYS;
  this.localStickFrames = Constants.MAXLOCALSTICKFRAMES;
  this.globalStickFrames = Constants.MAXGLOBALSTICKFRAMES;
  this.rowsFree = 0;

  // These properties should be immutable.
  this.squares = Block.prototypes[type].squares;
  this.color = Block.prototypes[type].color;
  this.rotates = Block.prototypes[type].rotates;
  this.height = Block.prototypes[type].height;
  this.type = type;
}

Block.MAXBLOCKSIZE = 10;
Block.LEVELS = RawBlockData.LEVELS;
Block.TYPES = RawBlockData.TYPES;
assert(Block.LEVELS == Block.TYPES.length, 'Unexpected number of block types');

Block.prototype.calculateHeight = function() {
  var lowest = this.squares[0].y;
  var highest = this.squares[0].y;

  for (var i = 1; i < this.squares.length; i++) {
    if (this.squares[i].y < lowest) {
      lowest = this.squares[i].y;
    } else if (this.squares[i].y > highest) {
      highest = this.squares[i].y;
    }
  }

  return highest - lowest + 1;
};

Block.prototype.checkIfRotates = function() {
  var lowest = new Point(this.squares[0].x, this.squares[0].y);
  var highest = new Point(this.squares[0].x, this.squares[0].y);

  for (var i = 1; i < this.squares.length; i++) {
    if (this.squares[i].x < lowest.x) {
      lowest.x = this.squares[i].x;
    } else if (this.squares[i].x > highest.x) {
      highest.x = this.squares[i].x;
    }
    if (this.squares[i].y < lowest.y) {
      lowest.y = this.squares[i].y;
    } else if (this.squares[i].y > highest.y) {
      highest.y = this.squares[i].y;
    }
  }

  if (highest.x - lowest.x != highest.y - lowest.y) {
    return true;
  }

  var rotated = new Point(0, 0);
  for (i = 0; i < this.squares.length; i++) {
    rotated.x = lowest.x + highest.y - this.squares[i].y;
    rotated.y = lowest.y + this.squares[i].x - lowest.x;
    var found = false;
    for (var j = 0; j < this.squares.length; j++) {
      found = found ||
              (rotated.x == this.squares[j].x &&
               rotated.y == this.squares[j].y);
    }
    if (!found) {
      return true;
    }
  }

  return false;
}

Block.prototype.draw = function() {
  var lowest = new Point(this.squares[0].x, this.squares[0].y);
  var highest = new Point(this.squares[0].x, this.squares[0].y);

  for (var i = 1; i < this.squares.length; i++) {
    if (this.squares[i].x < lowest.x) {
      lowest.x = this.squares[i].x;
    } else if (this.squares[i].x > highest.x) {
      highest.x = this.squares[i].x;
    }
    if (this.squares[i].y < lowest.y) {
      lowest.y = this.squares[i].y;
    } else if (this.squares[i].y > highest.y) {
      highest.y = this.squares[i].y;
    }
  }

  var str = '';
  for (var i = lowest.y; i <= highest.y; i++) {
    for (var j = lowest.x; j <= highest.x; j++) {
      var found = false;
      for (var k = 0; k < this.squares.length; k++) {
        found = found || (this.squares[k].x == j && this.squares[k].y == i);
      }
      str += (found ? '*' : '_');
    }
    str += '\n';
  }
  console.debug(str);
}

Block.loaded = function() {
  Block.prototypes = [];

  for (var i = 0; i < Block.TYPES[Block.LEVELS - 1]; i++) {
    var data = RawBlockData.DATA[i];
    var block = new Block();
    block.x = data[0];
    block.y = data[1];
    var numSquares = data[2];
    assert(data.length == 2*numSquares + 4,
        'Unexpected block (index ' + i + '): ' + data);
    block.squares = [];
    for (var j = 0; j < numSquares; j++) {
      block.squares.push(new Point(data[2*j + 3], data[2*j + 4]));
    }
    block.color = Color.colorCode(data[2*numSquares + 3]);
    block.height = block.calculateHeight();
    block.rotates = block.checkIfRotates();
    Block.prototypes.push(block);
  }

  assert(Block.prototypes.length == Block.TYPES[Block.LEVELS - 1],
      'Unexpected number of blocks');
  return true;
}();
