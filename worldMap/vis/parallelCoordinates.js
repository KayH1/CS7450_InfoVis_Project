function parallelCoordinates (divId) {
	this.divId = divId;
	var svgParallelCoords = d3.select("#" + this.divId).append("center")
		.append("svg").attr("class", "parallel-coords")
		.style("width", 1450)
		.style("height", 360);

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

export { parallelCoordinates };