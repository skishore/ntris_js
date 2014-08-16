var DifficultyUI = (function() {
"use strict";

DifficultyUI = function(target) {
  target.attr('id', this.generateId());
  this.target = target;
  this.width = 1000;

  this.offset = Constants.PREVIEW + 1;
  this.interval = this.width/target.width();
  this.render(this.offset);
}

DifficultyUI.prototype.render = function(start) {
  this.target.empty().css('display', 'block');
  this.start = start;

  var end = start + this.width;
  var data = this.getData(start, end, this.interval);
  var xAxis = pv.Scale.linear(start, end).range(0, this.target.height());
  var yAxis = pv.Scale.linear(0, 1).range(0, this.target.width());

  var vis = new pv.Panel()
      .canvas(this.target.attr('id'))
      .width(this.target.width())
      .height(this.target.height());
  vis.add(pv.Layout.Stack)
      .orient('left-top')
      .layers(data)
      .x(function(point) {return xAxis(point.x);})
      .y(function(point) {return yAxis(point.y);})
      .layer.add(pv.Area);
  vis.render();

  this.mark = $('<div>').addClass('mark');
  this.target.append(this.mark);
  // State variables used to move the mark.
  this.height = this.target.height();
  this.mark_top = null;
}

DifficultyUI.counter = 0;

DifficultyUI.prototype.generateId = function() {
  DifficultyUI.counter += 1;
  return 'unique-difficulty-graph-id-' + (DifficultyUI.counter - 1);
}

DifficultyUI.prototype.getData = function(start, end, interval) {
  var distributions = pv.range(start, end, interval).map(function(index) {
    return DifficultyCurve.distribution(index);
  });
  distributions.push(DifficultyCurve.distribution(end));
  var indices = pv.range(distributions.length);
  var sums = indices.map(function(i) {
    return DifficultyCurve.sum(distributions[i]);
  });
  return pv.range(Block.LEVELS).map(function(level) {
    return indices.map(function(i) {
      return {x: start + i*interval, y: distributions[i][level]/sums[i]};
    });
  });
}

DifficultyUI.prototype.setBlockIndex = function(index) {
  var best_start = index - ((index - this.offset) % this.width);
  if (best_start !== this.start) {
    this.render(best_start);
  }
  var fraction = (index - this.start)/this.width;
  var mark_top = Math.floor(fraction*this.height - 1);
  if (mark_top !== this.mark_top) {
    this.mark.css('top', mark_top);
    this.mark_top = mark_top;
  }
}

return DifficultyUI;
})();
