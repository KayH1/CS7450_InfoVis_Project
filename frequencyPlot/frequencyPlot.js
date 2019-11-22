// function to create frequencyPlot variables - to export

function frequencyPlot(selection, transition_time, useYAxis, dotRadius, dotColor, dotOpacity, dotColorSelected, dotOpacitySelected) {
    console.log("Creating frequency plot");
    // specify logistical variables
    this.selection = selection;
    this.transition_time = transition_time;
    this.useYAxis = useYAxis;
    
    this.dotRadius = dotRadius;
    this.dotColor = dotColor;
    this.dotOpacity = dotOpacity;

    this.dotRadiusSelected = this.dotRadius*1.1
    this.dotColorSelected = dotColorSelected;
    this.dotOpacitySelected = dotOpacitySelected;

    this.labelOpacity = 0;

    // specifies all the bins in which to place the datapoints
    this.bins = [];
    // specifies the max x value for each country bin, given the current attribute selected
    this.binsMaxX = this.bins.slice(0);
    // data split into bins
    this.binned = [];

    // species the coffee IDs of those coffees that are currently selected
    this.selected = [];

    // create svg element
    this.svg = d3.select('svg.freq-plot');

    var svgWidth = +this.svg.attr('width');
    var svgHeight = +this.svg.attr('height');

    this.padding = {t: 40, r: 40, b: 50, l: 60, 
                    x_r: 145, 
                    y_countries_b: 17, x_countries_r: 20, 
                    x_axis_b: 20};

    // compute chart dimensions
    this.chartWidth = svgWidth - this.padding.l - this.padding.r;
    this.chartHeight = svgHeight - this.padding.t - this.padding.b;

    // create the x and y scales
    this.xScale = d3.scaleLinear().range([0, this.chartWidth-this.padding.x_r]);
    this.yScale = d3.scaleLinear().range([this.chartHeight-this.padding.x_axis_b, 0]);
    this.yLabelScale = d3.scaleLinear().range([this.chartHeight,0]);
    this.chartScales = {x: this.selection, y: {}};
    
    // create a group element for appending chart elements
    this.chartG = this.svg.append('g')
        .attr('transform', 'translate('+[this.padding.l, this.padding.t]+')');

    // Create groups for the x- and y-axes
    this.xAxisG = this.chartG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[0, this.chartHeight-10]+')');
    this.xAxisLabel = this.chartG.append('text')
        .attr('class', 'x axisLabel')
        .attr('transform', 'translate('+((this.chartWidth-this.padding.x_r)/2)+','+(svgHeight-this.padding.b)+')')
        .text(this.selection+" rating");
    this.yAxisLabel = this.chartG.append('text')
        .attr('class', 'y axisLabel')
        .attr('transform', 'translate('+(-2*this.padding.l/3)+','+(this.chartHeight/2)+') rotate(-90)')
        .text('countries of origin');
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
        d.rank = freqPlot.bins.indexOf(d.countryOfOrigin);
    });


    console.log(dataset);
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
    freqPlot.yLabelScale.domain([0,freqPlot.bins.length]);

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

    // create d3 selection on the class dot & create a data-join with coffee
    var dots = freqPlot.chartG.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnter = dots.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnter.append('circle') // append a circle to the g elements
        .attr('r', freqPlot.dotRadius);

    var xAxisLabel = freqPlot.chartG.selectAll('.x.label')
        .text(freqPlot.selection+" rating");

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


    // determine the largest x value for each bin (to determine where to place country label)
    var idx = 0;
    freqPlot.binned.forEach(function(subdataset) {
        freqPlot.binsMaxX[idx] = d3.max(subdataset, function(d) { return d[freqPlot.chartScales.x]; })
        idx += 1;
    });
    

    //console.log("BINS MAX X: ",freqPlot.binsMaxX);

    /*
this.chartG.append('text')
        .attr('class', 'y label')
        .attr('transform', 'translate('+(-2*this.padding.l/3)+','+(this.chartHeight/2)+') rotate(-90)')
        .text('countries of origin');
    */
    
    var countriesEnter = freqPlot.chartG.selectAll('.countries')
        .data(freqPlot.bins, function(d) { return d; })
        .enter()
        .append('g')
        .attr('class', 'countries y label')

    countriesEnter.append('text')
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d, i) {
            return freqPlot.xScale(freqPlot.binsMaxX[i])+20;
        })
        .attr('y', function(d, i) {
            return freqPlot.yLabelScale(i)-12;
        })
        .text(function(d){
            return d;
        });

    var countries = freqPlot.chartG.selectAll('.countries.y.label text')
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d, i) {
            //console.log(freqPlot.xScale(freqPlot.binsMaxX[i])+20);
            return freqPlot.xScale(freqPlot.binsMaxX[i])+freqPlot.padding.x_countries_r;
        })
        .attr('y', function(d, i) {
            return freqPlot.yLabelScale(i)-freqPlot.padding.y_countries_b;
        })
        .attr('opacity', freqPlot.labelOpacity);


    // specify where dots should go
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

    document.getElementById("countryLabelsToggle").disabled = true;
    setTimeout(function() {document.getElementById("countryLabelsToggle").disabled = false;}, freqPlot.transition_time);

    d3.selectAll('.dot circle')
      .on('click', function(d) {
        // update whether or not the point is selected
        d.selected = !d.selected;
        
        // keep track of which datacases are selected in the frequency plot
        if (d.selected && !freqPlot.selected.includes(d.id)) { freqPlot.selected.push(d.id); }
        else if (!d.selected) { freqPlot.selected.pop(d.id); }
        //console.log(freqPlot.selected);
        
        //console.log("is active? ",isActive);
        d3.select(this)
          .style('fill', function() {
            if (!d.selected){ return freqPlot.dotColor; }
            return freqPlot.dotColorSelected;
          })
          .style('opacity', function(){
            if (!d.selected){ return freqPlot.dotOpacity; }
            return freqPlot.dotOpacitySelected;
          })
          .style('r', function(){
            if (!d.selected){ return freqPlot.dotRadius; }
            return freqPlot.dotRadiusSelected;
          });
      })

    // toggle whether country labels are on or off

    d3.selectAll('button#countryLabelsToggle').on('click', function(d) { toggleCountryLabels(freqPlot, coffee); });
    d3.selectAll('button#reset').on('click', function(d) { resetSelections(freqPlot, coffee); });

}
function toggleCountryLabels(freqPlot, dataset) {
    // Change the opacity of the country labels
    freqPlot.labelOpacity = Math.abs(freqPlot.labelOpacity-1);
    
    var countries = freqPlot.chartG.selectAll('.countries.y.label text')
        .transition()
        .duration(0)
        .attr('opacity', freqPlot.labelOpacity);
}

function resetSelections(freqPlot, dataset) {
    // go through each data point, ensure it is deselcted, and set it's fill, opacity, and radius to their default values
    var dots = d3.selectAll('.dot circle')
    dots.style('fill', function(d) {
        d.selected = false;
        return freqPlot.dotColor;
      })
      .style('opacity', function(d){
        return freqPlot.dotOpacity;
      })
      .style('r', function(d){
        return freqPlot.dotRadius;
      });
    freqPlot.selected = [];
}
 
export { frequencyPlot };