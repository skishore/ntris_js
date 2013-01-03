if (!Block) {
  console.debug('here');
  var Block = {};
  Block.MAXBLOCKSIZE = 10;
  Block.LEVELS = RawBlockData[0][0];

  Block.TYPES = RawBlockData[0].slice(1);
  assert(Block.TYPES.length == Block.LEVELS, 'Unexpected number of block types');
}

var difficultyLevels = RawBlockData[0][0];
var numBlockTypes = RawBlockData[0].slice(1);
if (numBlockTypes.length != difficultyLevels) {
  console.debug("Read an incorrect number of difficulty levels");
}

var blockData = new Array();

function openBlockData() {
  var numBlocks = numBlockTypes[difficultyLevels - 1];

  var data;
  for (var i = 1; i < numBlocks + 1; i++) {
    data = RawBlockData[i];

    var block = new Block();
    block.numSquares = data[2];
    if (data.length != 2*block.numSquares + 4) {
      console.debug("Block " + i + " is incorrectly formatted");
    }

    block.x = NUMCOLS/2 + data[0];
    block.y = data[1];

    for (var j = 0; j < data[2]; j++) {
      block.squares[j].x = data[2*j + 3];
      block.squares[j].y = data[2*j + 4];
    }

    block.color = colorCode(data[2*data[2] + 3]);
    block.height = blockHeight(block);
    block.rotates = doesBlockRotate(block);
    blockData.push(block);
  }
}

function blockHeight(block) {
  var highest = 0;
  var lowest = 0;

  for (var i = 0; i < block.numSquares; i++) {
    if (block.squares[i].y < lowest) {
      lowest = block.squares[i].y;
    } else if (block.squares[i].y > highest) {
      highest = block.squares[i].y;
    }
  }

  return highest - lowest + 1;
}

function doesBlockRotate(block) {
  var lowest = new Point(0, 0);
  var highest = new Point(0, 0);

  for (var i = 0; i < block.numSquares; i++) {
    if (block.squares[i].x < lowest.x) {
      lowest.x = block.squares[i].x;
    } else if (block.squares[i].x > highest.x) {
      highest.x = block.squares[i].x;
    }

    if (block.squares[i].y < lowest.y) {
      lowest.y = block.squares[i].y;
    } else if (block.squares[i].y > highest.y) {
      highest.y = block.squares[i].y;
    }
  }

  if (highest.x - lowest.x != highest.y - lowest.y) {
    return true;
  }

  var rotated = new Point(0, 0);
  for (var i = 0; i < block.numSquares; i++) {
    rotated.x = lowest.x + highest.y - block.squares[i].y;  
    rotated.y = lowest.y + block.squares[i].x - lowest.x;
    var found = false;
    for (var j = 0; j < block.numSquares; j++) {
      found = found ||
          (rotated.x == block.squares[j].x && rotated.y == block.squares[j].y);
    }
    if (!found) {
      return true;
    }
  }

  return false;
}
