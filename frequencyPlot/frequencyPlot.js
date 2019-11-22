// function to create frequencyPlot variables - to export

function frequencyPlot(selection, transition_time, useYAxis) {
    console.log("Creating frequency plot");
    // specify logistical variables
    this.selection = selection;
    this.transition_time = transition_time;
    this.useYAxis = useYAxis;

    // create svg element
    this.svg = d3.select('svg.freq-plot');

    var svgWidth = +this.svg.attr('width');
    var svgHeight = +this.svg.attr('height');

    this.padding = {t: 40, r: 40, b: 50, l: 60};

    // compute chart dimensions
    this.chartWidth = svgWidth - this.padding.l - this.padding.r;
    this.chartHeight = svgHeight - this.padding.t - this.padding.b;

    // create the x and y scales
    this.xScale = d3.scaleLinear().range([0, this.chartWidth]);
    this.yScale = d3.scaleLinear().range([this.chartHeight, 0]);
    this.chartScales = {x: this.selection, y: {}};
    
    // create a group element for appending chart elements
    this.chartG = this.svg.append('g')
        .attr('transform', 'translate('+[this.padding.l, this.padding.t]+')');

    // Create groups for the x- and y-axes
    this.xAxisG = this.chartG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[0, this.chartHeight]+')');
    this.xAxisLabel = this.chartG.append('text')
        .attr('class', 'x label')
        .attr('transform', 'translate('+(this.chartWidth/2)+','+(svgHeight-this.padding.b)+')')
        .text(this.selection);
    if (this.useYAxis) {
      this.yAxisG = this.chartG.append('g')
        .attr('class', 'y axis');
      this.yAxisLabel = this.chartG.append('text')
          .attr('class', 'y label')
          .attr('transform', 'translate('+(-2*this.padding.l/3)+','+(this.chartHeight/2)+') rotate(-90)')
          .text('frequency');
    }
}

// called when selected elements changed
frequencyPlot.prototype.onXScaleChanged = function(dataset) {
    //console.log("changing X scale");
    d3.select(".sidenav a.active").classed('active', false);
    d3.select(".sidenav a."+this.selection)
        .classed('active', true);
    
    // Save current selection to global chartScales
    this.chartScales.x = this.selection;
    
    // Update chart
    if (dataset !== null) { this.updateChart(dataset); }
}

frequencyPlot.prototype.updateY = function(dataset) {
    //console.log("updating y");
    this.chartScales.y = {};

    var freqPlot = this;
    dataset.forEach(function(d) {
      if (freqPlot.chartScales.y !== {} && freqPlot.chartScales.y[d[freqPlot.selection]]) {
        freqPlot.chartScales.y[d[freqPlot.selection]] = freqPlot.chartScales.y[d[freqPlot.selection]] + 1;
      }
      else { freqPlot.chartScales.y[d[freqPlot.selection]] = 1; };
      d.rank = freqPlot.chartScales.y[d[freqPlot.selection]];
  });

  return dataset;
}

frequencyPlot.prototype.updateChart = function(coffee_dataset) {
    //console.log("updating chart");
    
    var freqPlot = this;

    // Update the scales based on new data attributes
    //console.log(d3.extent(chartScales.y));
    var coffee = freqPlot.updateY(coffee_dataset);
    var freq_rank = d3.extent(coffee, function(d) { return d.rank; });

    //console.log("rank ",freq_rank);

    freqPlot.yScale.domain(freq_rank);

    // change the x scale domain depending on freq plot being shown
    // 0-10 if any of the 10 attributes
    // 0-100 if showing total cup points
    if (freqPlot.chartScales.x !== "totalCupPoints") {
        freqPlot.xScale.domain([0,10]).nice();
    }
    else {
        freqPlot.xScale.domain([50,100]).nice();
    }
    
    // create/update the x- and y-axes of the chart
    freqPlot.xAxisG.transition()
        .duration(freqPlot.transition_time)
        .call(d3.axisBottom(freqPlot.xScale));
    if (freqPlot.useYAxis) {
      freqPlot.yAxisG.transition()
        .duration(freqPlot.transition_time)
        .call(d3.axisLeft(freqPlot.yScale));
    }

    // create d3 selection on the class dot & create a data-join with coffee
    var dots = freqPlot.chartG.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnter = dots.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnter.append('circle') // append a circle to the g elements
        .attr('r', 2);

    var xAxisLabel = freqPlot.chartG.selectAll('.x.label')
        .text(freqPlot.selection);

    /**********************
     Create tooltip
    **********************/
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"<br>"+d[freqPlot.selection]+"</h5>";
    });

    freqPlot.svg.call(toolTip);

    dotsEnter.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    dots.merge(dotsEnter) // combine enter and update selections
        .transition()
        .duration(freqPlot.transition_time)
        .attr('transform', function(d) {
            var tx = freqPlot.xScale(d[freqPlot.chartScales.x]);
            //console.log(d.rank);
            var ty = freqPlot.yScale(d.rank);
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });

    d3.selectAll('.dot circle')
      .on('click', function() {
        var isActive = d3.select(this).attr('class')==='active';
        //console.log("is active? ",isActive);
        d3.select(this)
          .classed('active', function() {
            isActive = !isActive;
            return isActive;
          })
          .style('fill', function() {
            if (!isActive){ return '#663300'; }
            return 'red';
          })
          .style('opacity', function(){
            if (!isActive){ return 0.3; }
            return 1;
          })
          .style('r', function(){
            if (!isActive){ return 2; }
            return 3;
          });
      })
}


 
export { frequencyPlot };