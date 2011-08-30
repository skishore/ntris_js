var LAMBDA = 0.32;

function colorCode(index) {
  return mixedColor('black',
                    mixedColor('white', rainbowCode(index), 1.6*LAMBDA),
                    0.4*LAMBDA);
}

function rainbowCode(index) {
  switch(index) {
    case 0: return 'white';
    case 1: return '#DDDDDD';
    case 2: return '#CCCCCC';
    case 3: return '#FFFF00';
    case 4: return '#BBBBBB';
    case 5: return '#87CEEB';
    case 6: return '#FA8072';
    case 7: return '#DDA0DD';
    case 8: return '#FFD700';
    case 9: return '#DA70D6';
    case 10: return '#98FB98';
    case 11: return '#AAAAAA';
    case 12: return '#4169E1';
    case 13: return '#FF0000';
    case 14: return '#0000FF';
    case 15: return '#B21111';
    case 16: return '#8B0011';
    case 17: return '#00008B';
    case 18: return '#FF00FF';
    case 19: return '#800080';
    case 20: return '#D284BC';
    case 21: return '#FF8C00';
    case 22: return '#20B2AA';
    case 23: return '#B8860B';
    case 24: return '#FF4500'; 
    case 25: return '#48D1CC';
    case 26: return '#9966CC';
    case 27: return '#FFA500';
    case 28: return '#00FF00';
    default: return '#FF0000';
  }
}
