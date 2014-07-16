// http://nvd3.org/livecode/index.html#codemirrorNav
// Using the stackedAreaChart demo.

nv.addGraph(function() {
  var chart = nv.models.stackedAreaChart()
                .x(function(d) { return d[0] })
                .y(function(d) { return d[1] })
                .tooltips(false)
                .showControls(false)
                .showLegend(false)
                .showXAxis(false)
                .showYAxis(false)
                ;

  chart.stacked.style('expand');

  d3.select('#chart svg')
    .datum(data)
      .transition().duration(0).call(chart);

  nv.utils.windowResize(chart.update);

  return chart;
});
