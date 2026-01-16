var Color = (function() {
"use strict";

var Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  BORDER: '#44FF44',
  LAMBDA: 0.36,
  MAX_PER_LEVEL: 29,
  MAX: (6 + 2)*29,

  HEXREGEX: /\#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i,

  initialize: function(colorCode) {
    // Add colors that encode attacks for battle mode.
    this.attack_colors = [];
    for (var i = 0; i <= Constants.ATTACKS; i++) {
      var lambda = (i + (i ? 1 : 0))/(Constants.ATTACKS + 1);
      this.attack_colors.push(this.mix('#8888ff', '#ff4444', lambda));
    }

    // Initialize the body and edge colors lists. There will 29 body and edge
    // colors to start with, plus a version of these at each of the attack
    // levels for multiplayer.
    this.body_colors = [];
    this.edge_colors = [];
    this.pushColor(this.BLACK);
    for (var i = 0; i < this.MAX_PER_LEVEL; i++) {
      this.pushColor(colorCode(i));
    }
    for (var j = 0; j <= Constants.ATTACKS; j++) {
      var lambda = 0.8 - 0.4*j/Constants.ATTACKS;
      for (var i = 0; i < this.MAX_PER_LEVEL; i++) {
        this.pushColor(Color.mix(
            this.attack_colors[j], this.body_colors[i + 1], lambda));
      }
    }
    // We now add a lighter version of each of these colors for active blocks.
    assert(this.body_colors.length === this.MAX + 1);
    for (var i = 0; i < this.MAX; i++) {
      var color = this.body_colors[i + 1];
      this.pushColor(this.mix(color, this.WHITE, Color.LAMBDA));
    }

    // Create a CSS stylesheet with rules for the following classes:
    //    .combinos .attack-i, 0 <= i < ATTACKS
    //    .combinos .square-i, 0 <= i <= 3*Color.MAX
    //    .combinos .free-square-i, 0 <= i <= 2*Color.MAX
    // Here, Color.MAX is always the maximum color that could appear as the
    // color of a block.
    var rules = [];
    for (var i = 0; i < Constants.ATTACKS; i++) {
      rules.push(
        '.combinos .attack-' + i + ' {\n' +
        '  color: ' + this.attack_colors[i + 1] + ';\n' +
        '}');
    }
    for (var i = 0; i <= 2*this.MAX; i++) {
      rules.push(
        '.combinos .square-' + i + ' {\n' +
        '  background-color: ' + this.body_colors[i] + ';\n' +
        '  border-color: ' + this.edge_colors[i] + ';\n' +
        '}');
      var free_color = this.body_colors[i + this.MAX];
      if (i > this.MAX) {
        free_color = this.mix(this.body_colors[i], this.BLACK, 0.4*this.LAMBDA);
      }
      rules.push(
        '.combinos .free-square-' + i + ' {\n' +
        '  background-color: ' + free_color + ';\n' +
        '}');
    }
    for (var i = 2*this.MAX + 1; i <= 3*this.MAX; i++) {
      var color = this.body_colors[i - Color.MAX];
      color = this.mix(color, this.BLACK, Color.LAMBDA/4);
      rules.push(
        '.combinos .square-' + i + ' {\n' +
        '  background: repeating-linear-gradient(45deg, black, black 2.8px, ' +
        color + ' 2.8px, ' + color + ' 5.6px, black 5.6px, black 8.4px);\n' +
        '  border-color: ' + this.edge_colors[0] + ';\n' +
        '}');
    }
    this.addStyle(rules.join('\n'));
  },

  pushColor: function(color) {
    this.body_colors.push(color);
    this.edge_colors.push(this.lighten(color));
  },

  addStyle: function(rules) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = rules;
    document.getElementsByTagName('head')[0].appendChild(style);
  },

  mix: function(color1, color2, l) {
    var rgb1 = this.fromString(color1);
    var rgb2 = this.fromString(color2);

    var new_rgb = new Array(3);
    for (var i = 0; i < 3; i++) {
      new_rgb[i] = (1 - l)*rgb1[i] + l*rgb2[i];
      new_rgb[i] = Math.floor(Math.max(Math.min(new_rgb[i], 255), 0));
    }
    return this.toString(new_rgb);
  },

  fromString: function(hex6) {
    var m = this.HEXREGEX.exec(hex6);
    if (m === null) {
      throw new Error("Invalid hex6 color string: " + hex6);
    }
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  },

  toString: function(rgb) {
    var result = '#';
    for (var i = 0; i < 3; i++) {
      result += ('00' + rgb[i].toString(16)).substr(-2);
    }
    return result;
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

return Color;
})();
