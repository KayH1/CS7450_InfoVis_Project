function parallelCoordinates (divId) {
	this.divId = divId;
	this.svgParallelCoords = d3.select("#" + this.divId).append("center")
		.append("svg").attr("class", "parallel-coords")
		.attr("width", 1450)
		.attr("height", 350);

	var svgWidthParallelCoords = +this.svgParallelCoords.attr('width');
	var svgHeightParallelCoords = +this.svgParallelCoords.attr('height');

	this.paddingParallelCoords = {t: 30, r: 40, b: 40, l: 60};

	this.axes = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']
	var chartWidthParallelCoords = svgWidthParallelCoords - this.paddingParallelCoords.l - this.paddingParallelCoords.r;
	var chartHeightParallelCoords = svgHeightParallelCoords - this.paddingParallelCoords.t - this.paddingParallelCoords.b;

	/* add brush */
	this.svgParallelCoords.append("g").attr("class", "brush").call(
		d3.brush()
		.on("brush", function(d) {
			console.log("test");
		})
		.on("start", function(d) {
			console.log("ggg");
		})
		.on("end", function(d) {
			console.log("tes");
		})
	);

	/*
	.extent(
		[this.paddingParallelCoords.l - 5, 2 * this.paddingParallelCoords.t - 25], 
		[this.paddingParallelCoords.l + 5 + chartWidthParallelCoords, 2 * this.paddingParallelCoords.t - 15 + chartHeightParallelCoords]
	)
	*/

	/* add brush */

	this.axesSpacing = chartWidthParallelCoords / (this.axes.length-0.5);

	let assoParallel = this;
	// create the y scale
	this.yScaleParallelCoords = d3.scaleLinear().range([chartHeightParallelCoords,0]).domain([0,10]);

	// Create a group element for appending chart elements
	this.chartGParallelCoords = this.svgParallelCoords.append('g')
		.attr('transform', 'translate('+[this.paddingParallelCoords.l, this.paddingParallelCoords.t]+')');

	// Create groups for the y-axes
	this.enterAxesParallelCoords = this.chartGParallelCoords.selectAll('g')
		.data(this.axes)
		.enter()
		.append('g')
		.attr('class', function(d,i) {
			return 'y axis '+d;
		})
		.attr('transform', function(d,i){
		   	return 'translate('+(i*assoParallel.axesSpacing)+','+(assoParallel.paddingParallelCoords.t-20)+')';
		});
	this.enterAxesParallelCoords.call(d3.axisLeft(this.yScaleParallelCoords).ticks(5))
		.selectAll("text").style("font-size", "12px").style("font-weight", 500);
	this.enterTextParallelCoords = this.chartGParallelCoords.selectAll('.axistitle')
	    .data(this.axes)
	    .enter()
	    .append('text')
	    .attr("class", "axistitle")
	    .attr('class', function(d,i) {
	      	return 'y label '+d;
	    })
	    .attr('transform', function(d,i) {
	      	return 'translate('+(i*assoParallel.axesSpacing-10)+',-10) rotate(-20)';
	    })
	    .text(function(d) { return d; })
	    .style("font-weight", "bold");
}

var toolTipParallelCoords = d3.tip()
  	.attr("class", "d3-tip")
  	.offset([-12, 0])
  	.html(function(d) {
    	return "<h5>Coffee id: " + d.id + "<h5>\
    	<p>Country: " + d.countryOfOrigin + "</p>";
 	});

/* for coffee color style */
parallelCoordinates.prototype.coffeeLineStyle = {
	defaultColor: "#654321",
	ignoreColor: "#bdbdbd",
	mouseHoverColor: "red"
}

parallelCoordinates.prototype.initialParallelCoordinates = function(coffeeData) {
    let assoParallel = this;
	coffeeData.forEach(function(d) {
	      d['flavorProfileLine'] = [[0, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[0]])],
	                                [assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[1]])],
	                                [2*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[2]])],
	                                [3*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[3]])],
	                                [4*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[4]])],
	                                [5*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[5]])],
	                                [6*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[6]])],
	                                [7*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[7]])],
	                                [8*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[8]])]
	                                ]
	});
	this.data = coffeeData;
    
    // display the data as polylines
    this.chartGParallelCoords.selectAll('g')
      .data(this.data, function(d) { return d['id']; })
      .enter()

    /**********************
     Draw lines
    **********************/
    this.polylineParallelCoords = this.chartGParallelCoords.selectAll('.polyline')
        .data(this.data);

    this.coffeeColorMap = d3.map();
    this.setColorMap(assoParallel.coffeeLineStyle.defaultColor);

    // create path elements
    this.coffeeLineMap = d3.map();
    this.polylineEnterParallelCoords = this.polylineParallelCoords.enter()
        .append('g') // create a g element
        .attr('class', 'polyline'); // assign a class ID of dot to the element
    this.polylineEnterParallelCoords.append('path') // append a circle to the g elements
        .attr('d', function(d){
        	assoParallel.coffeeLineMap.set(d["id"], this);
      		var lineGenerator = d3.line();
      		return lineGenerator(d['flavorProfileLine']);
    	})
    .style('stroke-width', 1)
    .style('stroke', function(d) {
    	return assoParallel.coffeeColorMap.get(d["id"]);
    });

    /**********************
     Create tooltip
    **********************/

    // solution for getting the tooltip to follow the mouse cursor from:
    // https://github.com/Caged/d3-tip/issues/53
    this.svgParallelCoords.append('circle').attr('id', 'tipfollowscursor')
    this.svgParallelCoords.call(toolTipParallelCoords);

    this.polylineEnterParallelCoords.each(function() {
    	this.assoParallel = assoParallel;
    })
    this.polylineEnterParallelCoords.on('mouseover', function(d) {
    	
    	let assoParallel = this.assoParallel;
    	if (assoParallel.coffeeColorMap.get(d["id"]) === assoParallel.coffeeLineStyle.ignoreColor)
    		return;

        var target = d3.select("#" + this.divId).select('#tipfollowscursor')
                .attr('cx', d3.event.offsetX)
                .attr('cy', d3.event.offsetY - 0) // 0 pixels above the cursor
                .node();
        toolTipParallelCoords.show(d, target)
        /*
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
        */
        d3.select(this)
          .select('path')
          .style('stroke', function(d) {
            return assoParallel.coffeeLineStyle.mouseHoverColor;
          })
          .style('opacity', function(){
            return 1;
          })
          .style('stroke-width', function(){
            return 5;
          });
    })
    .on('mouseout', function(d) {
    	let assoParallel = this.assoParallel;
    	d3.select(this)
          .select('path')
          .style('stroke', function(d) {
            return assoParallel.coffeeColorMap.get(d["id"]);
          })
          .style('opacity', function(){
            return 0.3;
          })
          .style('stroke-width', function(){
            return 1;
          });
          toolTipParallelCoords.hide();
	})
	.on('mousedown', function() {
		console.log("test");
		let assoParallel = this.assoParallel;
		let brush = assoParallel.svgParallelCoords.select(".brush");
		brush.dispatch("start");
	});
}

parallelCoordinates.prototype.setColorMap = function(color) {
	let assoParallel = this;
	this.data.forEach(function(d) {
    	assoParallel.coffeeColorMap.set(d["id"], color);
    })
}

parallelCoordinates.prototype.updateLineColorSelectedCountry = function(countryColorMap) {
	/* clear brush */
	let assoParallel = this;
	if (countryColorMap.size() > 0) {
		this.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
	} else {
		this.setColorMap(assoParallel.coffeeLineStyle.defaultColor);
	}
	this.data.forEach(function(coffee) {
		if (countryColorMap.has(coffee["ISOofOrigin"])) {
			assoParallel.coffeeColorMap.set(coffee["id"], countryColorMap.get(coffee["ISOofOrigin"]));
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", countryColorMap.get(coffee["ISOofOrigin"]))
				.style("stroke-width", 8);
		} else {
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeColorMap.get(coffee["id"]))
				.style('stroke-width', 1);
		}
	})
}

/* called by embedding and itself */
parallelCoordinates.prototype.updateLineColorSelectedCoffee = function(coffeeSelectSet) {
	let assoParallel = this;
	if (coffeeSelectSet.size() > 0) {
		assoParallel.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
	} else {
		assoParallel.setColorMap(assoParallel.coffeeLineStyle.defaultColor);
	}
	this.data.forEach(function(coffee) {
		if (coffeeSelectSet.has(coffee["id"])) {
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.defaultColor).style("stroke-width", 1);
		} else {
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeColorMap.get(coffee["id"])).style('stroke-width', 1);
		}
	})
}

/* for brush event */
function checkElementWithinSelection() {

}


export { parallelCoordinates };