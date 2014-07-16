(function() {
"use strict";

var fixCodeMirrorHeights = function() {
  $('.CodeMirror-gutters').height($('.CodeMirror-lines').height());
  $('.CodeMirror').height($('.CodeMirror-lines').height() + 8);
}

var oldGenerateBlockType = DifficultyCurve.prototype.generateBlockType;

DifficultyCurve.prototype.generateBlockType = function(index) {
  var graph = DifficultyCurve.Graph.instance;
  if (graph) {
    index = graph.adjustIndex(index);
  }
  return oldGenerateBlockType.bind(this)(index);
}

DifficultyCurve.Graph = function(board, target) {
  target.attr('id', this.generateId());
  this.board = board;
  this.target = target;

  this.chart = AmCharts.makeChart(target.attr('id'), {
    type: 'serial',
    titles: [{text: 'Combinos difficulty curve'}],
    dataProvider: this.getData(2000, 10),
    graphs: this.getSeries(),
    chartCursor: {zoomable: false},
    categoryField: 'index',
    categoryAxis: {startOnAxis: false, gridAlpha: 0.07},
    valueAxes: [{stackType: '100%', gridAlpha: 0.07}],
    guides: [{
      category: '0',
      above: true,
      inside: true,
      lineAlpha: 1,
      dashLength: 2,
      labelRotation: 90,
      label: 'Current index',
    }],
  });
  this.target.on('click', function(e) {
    var category = this.chart.chartCursor.categoryBalloon.text;
    var index = category.length && parseInt(category, 10);
    this.setHandicap(index);
    this.board.reset();
  }.bind(this));

  this.setHandicap(0);
  DifficultyCurve.Graph.instance = this;
}

DifficultyCurve.Graph.prototype.generateId = function() {
  return 'unique-difficulty-graph-id';
}

DifficultyCurve.Graph.prototype.getData = function(end, interval) {
  this.interval = interval;
  var result = [];
  for (var i = 0; i < end/interval/20; i++) {
    result.push({'index': ''});
  }
  for (var i = 0; i <= end; i += interval) {
    var data = {'index': i};
    var distribution = DifficultyCurve.prototype.distribution(i);
    for (var j = 0; j < distribution.length; j++) {
      data[j] = distribution[j];
    }
    result.push(data);
  }
  return result;
}

DifficultyCurve.Graph.prototype.getSeries = function() {
  var result = [];
  for (var i = 0; i < Block.LEVELS; i++) {
    result.push({
      balloonText: '',
      fillAlphas: 0.5,
      lineAlpha: 0.5,
      valueField: '' + i,
    });
  }
  return result;
}

DifficultyCurve.Graph.prototype.setHandicap = function(handicap) {
  this.handicap = handicap;
  this.adjustIndex(0);
}

DifficultyCurve.Graph.prototype.adjustIndex = function(index) {
  var result = index + this.handicap;
  var displayIndex = Math.max(result - 1, 0);
  var category = '' + this.interval*Math.floor(displayIndex / this.interval);
  this.chart.categoryAxis.guides[0].category = category;
  this.chart.categoryAxis.guides[0].label = 'Current index: ' + displayIndex;
  this.chart.validateNow();
  return result;
}

DifficultyCurve.SourceEditor = function(board, target) {
  this.board = board;
  this.defaultValue = 'DifficultyCurve.prototype.distribution = ' +
      DifficultyCurve.prototype.distribution.toString();
  this.elements = this.build(target);
}

DifficultyCurve.SourceEditor.prototype.build = function(target) {
  var that = this;
  var result = {target: target};

  target.append($('<h4>').text('Edit the difficulty curve'));

  result.editor = CodeMirror(target[0], {
    mode: 'javascript',
    lineNumbers: true,
    value: this.defaultValue,
    viewportMargin: Infinity,
  });
  result.editor.on('change', fixCodeMirrorHeights);
  fixCodeMirrorHeights();

  result.eval_error_message = $('<div>').addClass('eval-error-message');

  target.append(
    $('<a>').addClass('btn btn-danger btn-sm restore-defaults-button')
        .text('Restore default').click(this.reset.bind(this)),
    $('<a>').addClass('btn btn-primary btn-sm')
        .text('Apply').click(this.save.bind(this)),
    result.eval_error_message,
    $('<div class="spacer">')
  );

  return result;
}

DifficultyCurve.SourceEditor.prototype.reset = function() {
  this.elements.editor.setValue(this.defaultValue);
  this.elements.eval_error_message.text('');
}

DifficultyCurve.SourceEditor.prototype.save = function(save) {
  var value = this.elements.editor.getValue();
  try {
    eval(value);
    DifficultyCurve.prototype.distribution(0);
  } catch(e) {
    this.elements.eval_error_message.text(e.toString());
    return;
  }
  this.elements.eval_error_message.text('');
  var graph = DifficultyCurve.Graph.instance;
  if (graph) {
    graph.chart.dataProvider = graph.getData(2000, 10);
    graph.chart.validateData();
    this.board.reset();
  }
  this.postValue(value);
}

DifficultyCurve.SourceEditor.prototype.postValue = function(value) {
  $.post('/', value);
}
})();
