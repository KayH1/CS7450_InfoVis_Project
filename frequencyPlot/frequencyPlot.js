// function to create frequencyPlot variables - to export

function frequencyPlot(selection, transition_time, useYAxis, dotRadius, dotColor, dotOpacity, dotColorSelected, dotOpacitySelected, mode) {
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

    this.mode = 'd'; // either bnw (box&whisker) or d (density) - default
    this.labelOpacity = 0;

    // specifies all the bins in which to place the datapoints
    this.bins = [];
    // specifies the max x value for each country bin, given the current attribute selected
    this.binsMaxX = {
        "flavor": this.bins.slice(0),
        "aroma": this.bins.slice(0),
        "aftertaste": this.bins.slice(0),
        "acidity": this.bins.slice(0),
        "body": this.bins.slice(0),
        "balance": this.bins.slice(0),
        "uniformity": this.bins.slice(0),
        "sweetness": this.bins.slice(0),
        "cleanCup": this.bins.slice(0),
        "cupperPoints": this.bins.slice(0),
        "totalCupPoints": this.bins.slice(0)
    };
    // store information necessary to create a box-and-whisker plot
    this.binsMedianX = {
        "flavor": this.bins.slice(0),
        "aroma": this.bins.slice(0),
        "aftertaste": this.bins.slice(0),
        "acidity": this.bins.slice(0),
        "body": this.bins.slice(0),
        "balance": this.bins.slice(0),
        "uniformity": this.bins.slice(0),
        "sweetness": this.bins.slice(0),
        "cleanCup": this.bins.slice(0),
        "cupperPoints": this.bins.slice(0),
        "totalCupPoints": this.bins.slice(0)
    };
    this.bins75perc = {
        "flavor": this.bins.slice(0),
        "aroma": this.bins.slice(0),
        "aftertaste": this.bins.slice(0),
        "acidity": this.bins.slice(0),
        "body": this.bins.slice(0),
        "balance": this.bins.slice(0),
        "uniformity": this.bins.slice(0),
        "sweetness": this.bins.slice(0),
        "cleanCup": this.bins.slice(0),
        "cupperPoints": this.bins.slice(0),
        "totalCupPoints": this.bins.slice(0)
    };
    this.bins25perc = {
        "flavor": this.bins.slice(0),
        "aroma": this.bins.slice(0),
        "aftertaste": this.bins.slice(0),
        "acidity": this.bins.slice(0),
        "body": this.bins.slice(0),
        "balance": this.bins.slice(0),
        "uniformity": this.bins.slice(0),
        "sweetness": this.bins.slice(0),
        "cleanCup": this.bins.slice(0),
        "cupperPoints": this.bins.slice(0),
        "totalCupPoints": this.bins.slice(0)
    };
    this.binsMinX = {
        "flavor": this.bins.slice(0),
        "aroma": this.bins.slice(0),
        "aftertaste": this.bins.slice(0),
        "acidity": this.bins.slice(0),
        "body": this.bins.slice(0),
        "balance": this.bins.slice(0),
        "uniformity": this.bins.slice(0),
        "sweetness": this.bins.slice(0),
        "cleanCup": this.bins.slice(0),
        "cupperPoints": this.bins.slice(0),
        "totalCupPoints": this.bins.slice(0)
    };
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

    //console.log(dataset);
    return dataset;
}

frequencyPlot.prototype.updateChart = function(coffee_dataset) {
    //console.log("updating chart");

    /**********************
     Store a reference to the visualization
    **********************/
    var freqPlot = this;

    /**********************
     Store the version of the dataset to visualize
    **********************/
    // Update the scales based on new data attributes
    //console.log(d3.extent(chartScales.y));
    var coffee = freqPlot.updateY(coffee_dataset);
    var freq_rank = d3.extent(coffee, function(d) { return d.rank; });

    //console.log("rank ",freq_rank);

    /**********************
     Update the y and x scales
    **********************/
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
    
    /**********************
     Update the chart's x-axis
    **********************/
    // create/update the x--axis of the chart
    freqPlot.xAxisG.transition()
        .duration(freqPlot.transition_time)
        .call(d3.axisBottom(freqPlot.xScale));


    /**********************
     Calculate important statistics
    **********************/
    // determine the largest x value for each bin (to determine where to place country label)
    freqPlot.binned.forEach(function(subdataset, idx) {
        freqPlot.binsMaxX[freqPlot.selection][idx] = d3.max(subdataset, function(d) { return d[freqPlot.chartScales.x]; })
        freqPlot.binsMinX[freqPlot.selection][idx] = d3.min(subdataset, function(d) { return d[freqPlot.chartScales.x]; });
    
        // the following box-and-whisker-relevant calculations were inpsired by https://www.d3-graph-gallery.com/graph/boxplot_basic.html
        // sort the data in this bin
        var sortedSubdataset = subdataset.sort((a,b) => d3.ascending(a[freqPlot.chartScales.x], b[freqPlot.chartScales.x]));
        // extract the appropriate values for calculation
        var sortedSubdatasetValues = sortedSubdataset.map(function(d) { return d[freqPlot.chartScales.x]; });
        
        // calculate important statistics for box-and-whisker plot
        freqPlot.bins25perc[freqPlot.selection][idx] = d3.quantile(sortedSubdatasetValues, 0.25);
        freqPlot.binsMedianX[freqPlot.selection][idx] = d3.quantile(sortedSubdatasetValues, 0.5);
        freqPlot.bins75perc[freqPlot.selection][idx] = d3.quantile(sortedSubdatasetValues, 0.75);
        /*if (subdataset[0].countryOfOrigin === "Myanmar") {
            console.log("SUBDATASET: ",subdataset);
            console.log("... ",freqPlot.chartScales.x);
            console.log("HERE ",subdataset[0][freqPlot.chartScales.x]);
        } 
        

        if (subdataset[0].countryOfOrigin === "Mexico") {
            console.log("25 perc: ",freqPlot.bins25perc[freqPlot.selection][idx], " Median: ",freqPlot.binsMedianX[freqPlot.selection][idx], " 75 perc: ",freqPlot.bins75perc[freqPlot.selection][idx], " Max: ",freqPlot.binsMaxX[freqPlot.selection][idx]," Min: ",freqPlot.binsMinX[freqPlot.selection][idx]);
        }*/
    });
    
    //console.log("BINS MAX X: ",freqPlot.binsMaxX);
    

    /**********************
     Create country labels
    **********************/
    // add country label to the right of the highest rated datacase for that country
    var countriesEnter = freqPlot.chartG.selectAll('.countries')
        .data(freqPlot.bins, function(d) { return d; })
        .enter()
        .append('g')
        .attr('class', 'countries y label')

    countriesEnter.append('text')
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d, i) {
            return freqPlot.xScale(freqPlot.binsMaxX[freqPlot.selection][i])+20;
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
            return freqPlot.xScale(freqPlot.binsMaxX[freqPlot.selection][i])+freqPlot.padding.x_countries_r;
        })
        .attr('y', function(d, i) {
            return freqPlot.yLabelScale(i)-freqPlot.padding.y_countries_b;
        })
        .attr('opacity', freqPlot.labelOpacity);

    /**********************
     Disable the country label toggle button is dots are moving
    **********************/
    document.getElementById("countryLabelsToggle").disabled = true;
    setTimeout(function() {document.getElementById("countryLabelsToggle").disabled = false;}, freqPlot.transition_time);




    /*******************************
     Prepare for mode: bnw
    ********************************/

    /**********************
     Set up percentile boxes
    **********************/
    var percentiles = freqPlot.chartG.selectAll('.percentiles')
        .data(freqPlot.bins25perc[freqPlot.selection])

    var percentilesEnter = percentiles.enter()
        .append('g')
        .attr('class', 'percentiles bnw')
    percentilesEnter.append('rect') // append a circle to the g elements
        .attr('height', freqPlot.dotRadius*2)
        .attr('fill-opacity', 0);

    /**********************
     Specify where percentile boxes should go
    **********************/
    // specify where percentiles should go
    freqPlot.chartG.selectAll('.percentiles rect')
        .data(freqPlot.bins25perc[freqPlot.selection])
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d,i) {
            return freqPlot.xScale(freqPlot.binsMedianX[freqPlot.selection][i]) - (freqPlot.xScale(freqPlot.binsMedianX[freqPlot.selection][i])-freqPlot.xScale(d));
        })
        .attr('y', function(d,i) {
            return freqPlot.yScale(i)-freqPlot.dotRadius;
        })
        .attr('width', function(d, i) {
            var diff = freqPlot.xScale(freqPlot.bins75perc[freqPlot.selection][i])-freqPlot.xScale(d);
            if (diff > 0) { return diff; }
            else { return 1; }
        })
        .attr('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });

    /**********************
     Create left whiskers
    **********************/
    var lWhiskers = freqPlot.chartG.selectAll('.lWhiskers')
        .data(freqPlot.binsMinX[freqPlot.selection])

    var lWhiskersEnter = lWhiskers.enter()
        .append('g')
        .attr('class', 'lWhiskers bnw')
    lWhiskersEnter.append('rect') // append a circle to the g elements
        .attr('height', 1);

    /**********************
     Specify where left whisker lines should go
    **********************/
    // specify where left whiskers should go
    freqPlot.chartG.selectAll('.lWhiskers rect')
        .data(freqPlot.binsMinX[freqPlot.selection])
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d,i) {
            return freqPlot.xScale(freqPlot.bins25perc[freqPlot.selection][i]) - (freqPlot.xScale(freqPlot.bins25perc[freqPlot.selection][i])-freqPlot.xScale(d));
        })
        .attr('y', function(d,i) {
            return freqPlot.yScale(i);;
        })
        .attr('width', function(d, i) {
            return freqPlot.xScale(freqPlot.bins25perc[freqPlot.selection][i])-freqPlot.xScale(d);
        })
        .attr('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });

    /**********************
     Create right whiskers
    **********************/
    var rWhiskers = freqPlot.chartG.selectAll('.rWhiskers')
        .data(freqPlot.binsMaxX[freqPlot.selection])

    var rWhiskersEnter = rWhiskers.enter()
        .append('g')
        .attr('class', 'rWhiskers bnw')
    rWhiskersEnter.append('rect') // append a circle to the g elements
        .attr('height', 1);
        

    /**********************
     Specify where right whisker lines should go
    **********************/
    // specify where right whiskers should go
    freqPlot.chartG.selectAll('.rWhiskers rect')
        .data(freqPlot.binsMaxX[freqPlot.selection])
        .transition()
        .duration(freqPlot.transition_time)
        .attr('x', function(d,i) {
            return freqPlot.xScale(d) - (freqPlot.xScale(d) - freqPlot.xScale(freqPlot.bins75perc[freqPlot.selection][i]));
        })
        .attr('y', function(d,i) {
            return freqPlot.yScale(i);
        })
        .attr('width', function(d, i) {
            return freqPlot.xScale(d)-freqPlot.xScale(freqPlot.bins75perc[freqPlot.selection][i]);
        })
        .attr('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });

    /**********************
     Set up median lines
    **********************/
    var medians = freqPlot.chartG.selectAll('.medians')
        .data(freqPlot.binsMedianX[freqPlot.selection])

    var mediansEnter = medians.enter()
        .append('g')
        .attr('class', 'medians bnw')
    mediansEnter.append('rect') // append a rectangle to the g elements
        .attr('width', 2)
        .attr('height', freqPlot.dotRadius*2);

    /**********************
     Specify where median lines should go
    **********************/
    // specify where dots should go
    medians.merge(mediansEnter) // combine enter and update selections
        .data(freqPlot.binsMedianX[freqPlot.selection])
        .transition()
        .duration(freqPlot.transition_time)
        .attr('transform', function(d, i) {
            var tx = freqPlot.xScale(d)-1;
            var ty = freqPlot.yScale(i)-freqPlot.dotRadius;
            return 'translate('+[tx,ty]+')';
        })
        .attr('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });

   



    /*******************************
     Prepare for mode: d
    ********************************/
    
    /**********************
     Set up dots
    **********************/
    // create d3 selection on the class dot & create a data-join with coffee
    var dots = freqPlot.chartG.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnter = dots.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnter.append('circle') // append a circle to the g elements
        .attr('r', freqPlot.dotRadius)
        .attr('opacity', freqPlot.dotOpacity);

    var xAxisLabel = freqPlot.chartG.selectAll('.x.axisLabel')
        .text(freqPlot.selection+" rating");


    /**********************
     Specify where dots should go
    **********************/
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

    /**********************
     Update the look of dots if they are clicked/(de)selected
    **********************/
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
            if (!d.selected){ 
                if (freqPlot.mode === "bnw") { return 0; }
                return freqPlot.dotOpacity; }
            return freqPlot.dotOpacitySelected;
          })
          .style('r', function(){
            if (!d.selected){ return freqPlot.dotRadius; }
            return freqPlot.dotRadiusSelected;
          });
      })

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


   



    

    /**********************
     Handle button clicks
    **********************/
    // toggle whether country labels are on or off
    d3.selectAll('button#countryLabelsToggle').on('click', function(d) { toggleCountryLabels(freqPlot, coffee); });
    // reset (i.e., deselect all selected data points)
    d3.selectAll('button#reset').on('click', function(d) { resetSelections(freqPlot, coffee); });
    d3.selectAll('button#switchMode').on('click', function(d) {
        switchMode(freqPlot, coffee); });
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
      .style('opacity', function(d) { 
            if (freqPlot.mode === "d") { return freqPlot.dotOpacity; }
            else { return 0; }
        })
      .style('r', freqPlot.dotRadius);
    freqPlot.selected = [];

}

function switchMode(freqPlot, dataset) {
    //console.log("GOT HERE... switching");
    if (freqPlot.mode === "d") { freqPlot.mode = 'bnw'; }
    else { freqPlot.mode = 'd'; }

    console.log("Current mode: ",freqPlot.mode);

    if (freqPlot.mode == 'bnw') {
        // make the dots invisible
        var dots = d3.selectAll('.dot circle');
        dots.style('opacity', function(d) {
            if (!d.selected) { return 0; }
            else { return 1; }
        });

        // make the box and whiskers visible
        var bnwMedians = d3.selectAll('.medians');
        bnwMedians.style('opacity', 1);
        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 1);
    }
    else {
        // make the dots visible
        var dots = d3.selectAll('.dot circle');
        dots.style('fill', function(d) { 
                if (!d.selected) { return freqPlot.dotColor; }
                return freqPlot.dotColorSelected;})
            .style('opacity', function(d) {
                if (!d.selected) { return freqPlot.dotOpacity; }
                return freqPlot.dotOpacitySelected;
            })
            .style('r', freqPlot.dotRadius);

        //make the box and whiskers invisible
        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 0);
    }

}

export { frequencyPlot };