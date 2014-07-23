var DifficultyUI = (function() {
"use strict";

DifficultyUI = function(target) {
  this.target = target;
  this.end = 2000;
  this.interval = 10;

  target.attr('id', this.generateId());

  var data = this.getData(this.end, this.interval);
  var xAxis = pv.Scale.linear(0, this.end).range(0, target.height());
  var yAxis = pv.Scale.linear(0, 1).range(0, target.width());

  var vis = new pv.Panel()
      .canvas(target.attr('id'))
      .width(target.width())
      .height(target.height());
  
  vis.add(pv.Layout.Stack)
      .orient('left-top')
      .layers(data)
      .x(function(point) {return xAxis(point.x);})
      .y(function(point) {return yAxis(point.y);})
      .layer.add(pv.Area);

  vis.render();
}

DifficultyUI.prototype.generateId = function() {
  return 'unique-difficulty-graph-id';
}

DifficultyUI.prototype.getData2 = function(end, interval) {
  return pv.range(4).map(function() {
    return pv.range(0, 10, .1).map(function(x) {
      return {x: x, y: (Math.sin(x) + Math.random() * .5 + 2)/14};
    });
  });
}

DifficultyUI.prototype.getData = function(end, interval) {
  var distributions = pv.range(0, end, interval).map(function(index) {
    return DifficultyCurve.distribution(index);
  });
  var indices = pv.range(distributions.length);
  var sums = indices.map(function(i) {
    return DifficultyCurve.sum(distributions[i]);
  });
  return pv.range(Block.LEVELS).map(function(level) {
    return indices.map(function(i) {
      return {x: i*interval, y: distributions[i][level]/sums[i]};
    });
  });
}

return DifficultyUI;
})();
