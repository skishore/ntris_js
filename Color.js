var Color = (function() {
"use strict";

var Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  BORDER: '#44FF44',
  LAMBDA: 0.36,
  MAX: 29,

  initialize: function(colorCode) {
    this.body_colors = [];
    this.edge_colors = [];
    // Push color 0, which is always black.
    this.push_color(this.BLACK);
    // Push colors for squares that are on the board.
    for (var i = 0; i < this.MAX; i++) {
      this.push_color(colorCode(i));
    }
    // Push lighter colors for squares in currently active blocks.
    for (var i = 0; i < this.MAX; i++) {
      this.push_color(this.mix(colorCode(i), this.WHITE, Color.LAMBDA));
    }
  },

  push_color: function(color) {
    this.body_colors.push(color);
    this.edge_colors.push(this.lighten(color));
  },

  mix: function(color1, color2, l) {
    var rgba1 = Colour.fromString(color1);
    var rgba2 = Colour.fromString(color2);

    var new_rgba = new Array(4);
    for (var i = 0; i < 4; i++) {
      new_rgba[i] = (1 - l)*rgba1.values[i] + l*rgba2.values[i];
      new_rgba[i] = Math.max(Math.min(new_rgba[i], 1), 0);
    }

    return new Colour(Colour.RGBA, new_rgba).toString();
  },

  lighten: function(color) {
    return Color.mix(color, Color.WHITE, Color.LAMBDA);
  },

  tint: function(color) {
    return Color.mix(Color.WHITE, color, Color.LAMBDA);
  },

  colorCode: function(index) {
    return Color.mix(Color.rainbowCode(index), Color.WHITE, 0.8*Color.LAMBDA);
  },

  rainbowCode: function(index) {
    switch(index) {
      case 0: return '#FFFFFF';
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
      default: return '#000000';
    }
  },
};

Color.initialize(Color.colorCode);

return Color;
})();
