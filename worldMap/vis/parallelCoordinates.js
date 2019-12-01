function parallelCoordinates (divId) {
	this.divId = divId;
	var svgParallelCoords = d3.select("#" + this.divId).append("center")
		.append("svg").attr("class", "parallel-coords")
		.attr("width", 1450)
		.attr("height", 360);

	var svgWidthParallelCoords = +svgParallelCoords.attr('width');
	var svgHeightParallelCoords = +svgParallelCoords.attr('height');

	var paddingParallelCoords = {t: 30, r: 40, b: 40, l: 60};

	var axes = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']
	var chartWidthParallelCoords = svgWidthParallelCoords - paddingParallelCoords.l - paddingParallelCoords.r;
	var chartHeightParallelCoords = svgHeightParallelCoords - paddingParallelCoords.t - paddingParallelCoords.b;

	var axesSpacing = chartWidthParallelCoords / (axes.length-0.5);

	// create the y scale
	var yScaleParallelCoords = d3.scaleLinear().range([chartHeightParallelCoords, 0]).domain([0,10]);

	// Create a group element for appending chart elements
	var chartGParallelCoords = svgParallelCoords.append('g')
		.attr('transform', 'translate('+[paddingParallelCoords.l, paddingParallelCoords.t]+')');

	// Create groups for the y-axes
	var enterAxesParallelCoords = chartGParallelCoords.selectAll('g')
		.data(axes)
		.enter()
		.append('g')
		.attr('class', function(d,i) {
			return 'y axis '+d;
		})
		.attr('transform', function(d,i){
		   	return 'translate('+(i*axesSpacing)+','+(paddingParallelCoords.t)+')';
		});
	var enterTextParallelCoords = chartGParallelCoords.selectAll('text')
	    .data(axes)
	    .enter()
	    .append('text')
	    .attr('class', function(d,i) {
	      	return 'y label '+d;
	    })
	    .attr('transform', function(d,i) {
	      	return 'translate('+(i*axesSpacing+10)+',10) rotate(-20)';
	    })
	    .text(function(d) { return d; });
}

/* not finish follow */

function updateParallelCoordinates() {
    // display the y axes
    enterAxesParallelCoords.call(d3.axisLeft(yScaleParallelCoords).ticks(5));

    // display the data as polylines
    chartGParallelCoords.selectAll('g')
      .data(coffee, function(d) { return d['id']; })
      .enter()


    /**********************
     Draw lines
    **********************/
    var polylineParallelCoords = chartGParallelCoords.selectAll('.polyline')
        .data(coffee);

    // create .dot elements
    var polylineEnterParallelCoords = polylineParallelCoords.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'polyline'); // assign a class ID of dot to the element
    polylineEnterParallelCoords.append('path') // append a circle to the g elements
        .attr('d', function(d){
      var lineGenerator = d3.line();
      return lineGenerator(d['flavorProfileLine']);
    })
    .style('stroke-width', 1);


    /**********************
     Create tooltip
    **********************/
    var toolTipParallelCoords = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"</h5>";
    });

    // solution for getting the tooltip to follow the mouse cursor from:
    // https://github.com/Caged/d3-tip/issues/53
    svgParallelCoords.append('circle').attr('id', 'tipfollowscursor')
    svgParallelCoords.call(toolTipParallelCoords);

    polylineEnterParallelCoords.on('mouseover', function(d) {
        var target = d3.select('#tipfollowscursor')
                .attr('cx', d3.event.offsetX)
                .attr('cy', d3.event.offsetY - 0) // 0 pixels above the cursor
                .node();

        toolTipParallelCoords.show(d, target)
    })
    .on('mouseout', toolTipParallelCoords.hide);


    /**********************
     Enable selecting and deselecting polyline
    **********************/
    d3.selectAll('.polyline path')
      .on('click', function() {
        var isActive = d3.select(this).attr('class')==='active';
        //console.log("is active? ",isActive);
        d3.select(this)
          .classed('active', function(d) {
            isActive = !isActive;
            return isActive;
          })
          .style('stroke', function() {
            if (!isActive){ return '#663300'; }
            return 'red';
          })
          .style('opacity', function(){
            if (!isActive){ return 0.3; }
            return 1;
          })
          .style('stroke-width', function(){
            if (!isActive){ return 1; }
            return 5;
          });
      })
}

export { parallelCoordinates };