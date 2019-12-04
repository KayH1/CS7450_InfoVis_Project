function parallelCoordinates (divId, parentVis=null) {
	this.divId = divId;
	this.parentVis = parentVis;
	this.svgParallelCoords = d3.select("#" + this.divId).append("center")
		.append("svg").attr("class", "parallel-coords")
		.attr("width", 1450)
		.attr("height", 350);

	this.outsideRequest = 0;  // if the update is called from outside, set as 1

	var svgWidthParallelCoords = +this.svgParallelCoords.attr('width');
	var svgHeightParallelCoords = +this.svgParallelCoords.attr('height');

	this.paddingParallelCoords = {t: 30, r: 40, b: 40, l: 60};

	this.axes = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']
	var chartWidthParallelCoords = svgWidthParallelCoords - this.paddingParallelCoords.l - this.paddingParallelCoords.r;
	var chartHeightParallelCoords = svgHeightParallelCoords - this.paddingParallelCoords.t - this.paddingParallelCoords.b;
	this.axesSpacing = chartWidthParallelCoords / (this.axes.length-0.5);
	
	let assoParallel = this;

	/* add brush */
	this.brush = d3.brush().extent([
			[this.paddingParallelCoords.l - 10, 2 * this.paddingParallelCoords.t - 30], 
			[this.paddingParallelCoords.l + 10 + 8 * this.axesSpacing, 2 * this.paddingParallelCoords.t - 10 + chartHeightParallelCoords]
		])
		.on("start brush", null)
		.on("end", selectCoffeeWithinSelection)
	this.svgParallelCoords.append("g").attr("class", "brush").call(this.brush);
	d3.select("#" + this.divId).select(".brush").each(function() {
		this.assoParallel = assoParallel;
	})
	/* add brush */

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
	ignoreColor: "#d9d9d9",
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
	                                ];
	      d['flavorProfilePosition'] = [[assoParallel.paddingParallelCoords.l, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[0]])],
	                                [assoParallel.paddingParallelCoords.l + assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[1]])],
	                                [assoParallel.paddingParallelCoords.l + 2*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[2]])],
	                                [assoParallel.paddingParallelCoords.l + 3*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[3]])],
	                                [assoParallel.paddingParallelCoords.l + 4*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t -20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[4]])],
	                                [assoParallel.paddingParallelCoords.l + 5*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[5]])],
	                                [assoParallel.paddingParallelCoords.l + 6*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[6]])],
	                                [assoParallel.paddingParallelCoords.l + 7*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[7]])],
	                                [assoParallel.paddingParallelCoords.l + 8*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[8]])]
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
    })
    .style("opacity", 0.2); // default opacity

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
    this.polylineEnterParallelCoords.on('mouseenter', function(d) {
    	
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
        this.previousOpacity = d3.select(this).style("opacity");
        this.previousStrokeWidth = d3.select(this).style("stroke-width");
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
            return this.previousOpacity;
          })
          .style('stroke-width', function(){
            return this.previousStrokeWidth;
          });
          toolTipParallelCoords.hide();
	});
	/* not work 
	.on('mousedown', function() {
		let assoParallel = this.assoParallel;
		let brush_extent = assoParallel.svgParallelCoords.select('.brush .overlay');
        let new_click_event = new Event('mousedown');
        new_click_event.pageX = d3.event.pageX;
        new_click_event.clientX = d3.event.clientX;
        new_click_event.pageY = d3.event.pageY;
        new_click_event.clientY = d3.event.clientY;
        //brush_extent.dispatchEvent(new_click_event);
		brush_extent.dispatch("mousedown");
	});
	*/
}

parallelCoordinates.prototype.setColorMap = function(color) {
	let assoParallel = this;
	this.data.forEach(function(d) {
    	assoParallel.coffeeColorMap.set(d["id"], color);
    })
}

parallelCoordinates.prototype.setSelectedCoffeeLineColor = function(coffeeSelectSet) {
	let assoParallel = this;
	if (d3.event.selection != null) {
		assoParallel.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
		this.data.forEach(function(coffee) {
			if (coffeeSelectSet.has(coffee["id"])) {
				assoParallel.coffeeColorMap.set(coffee["id"], assoParallel.coffeeLineStyle.defaultColor);
				d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.defaultColor).style("opacity", 0.3).style("stroke-width", 3);
			} else {
				d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.ignoreColor).style('stroke-width', 1).style("opacity", 0.1).style("stroke-width", 1);
			}
		})
	} else {
		assoParallel.setColorMap(assoParallel.coffeeLineStyle.defaultColor);
		this.data.forEach(function(coffee) {
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.defaultColor).style("stroke-width", 1).style("opacity", 0.2);
		})
	}
}

/* called from parent vis initial by map */
parallelCoordinates.prototype.updateLineColorSelectedCountry = function(countryColorMap) {
	let assoParallel = this;
	/* remove brush */
	this.outsideRequest = 1
	d3.select("#" + assoParallel.divId).select(".brush").call(assoParallel.brush.clear);

	/* set color */
	if (countryColorMap.size() > 0) {
		this.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
	} else {
		this.setColorMap(assoParallel.coffeeLineStyle.defaultColor);
	}
	this.data.forEach(function(coffee) {
		if (countryColorMap.has(coffee["ISOofOrigin"])) {
			assoParallel.coffeeColorMap.set(coffee["id"], countryColorMap.get(coffee["ISOofOrigin"]));
			d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", countryColorMap.get(coffee["ISOofOrigin"]))
				.style("stroke-width", 8).style("opacity", 0.5);
		} else {
			if (countryColorMap.size() == 0) {
				d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeColorMap.get(coffee["id"]))
					.style('stroke-width', 1).style("opacity", 0.2);
			} else {
				d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeColorMap.get(coffee["id"]))
					.style('stroke-width', 1).style("opacity", 0.1);
			}
		}
	})
}

/* called from parent vis initial by embedding */ 
parallelCoordinates.prototype.updateLineColorSelectedCoffee = function(coffeeSelectSet) {
	let assoParallel = this;
	/* remove brush */
	this.outsideRequest = 1;
	d3.select("#" + assoParallel.divId).select(".brush").call(assoParallel.brush.clear);
	assoParallel.setSelectedCoffeeLineColor(coffeeSet);
}

/* for brush event */
function selectCoffeeWithinSelection() {
	let assoParallel = this.assoParallel;
	let coffeeSet = d3.set();
	/* 
		if brush is show, then d3.event.selection != null 
 		if brush is disable from outside vis update call: assoParallel.outsideRequest == 1, not update parentVis
	*/
	if (d3.event.selection != null) {
		let [[x0, y0], [x1, y1]] = d3.event.selection;
		if (x1 > x0 && y1 > y0) {
			assoParallel.data.forEach(function(d) {
				for (let step = 0; step < d["flavorProfilePosition"].length; step++) {
					let position = d["flavorProfilePosition"][step];
					if ((position[0] >= x0 && position[0] <= x1) && (position[1] >= y0 && position[1] <= y1)) {
						coffeeSet.add(d["id"]);
						break;
					}
				} 
			});
		}
		/* call parentVis to update based on selected coffee */
		if (assoParallel.parentVis != null) {
			assoParallel.parentVis.updateSelectedCoffeeParallel(coffeeSet, true);
		}
	} else {
		if (assoParallel.outsideRequest == 0) {
			/* there is no brush current, for other vis, show all datapoint, also call parentVis */
			if (assoParallel.parentVis != null)
				assoParallel.parentVis.updateSelectedCoffeeParallel(coffeeSet, false);
		}
		assoParallel.outsideRequest = 0;
	}
	assoParallel.setSelectedCoffeeLineColor(coffeeSet);
	/* call parent vis to update */
}

export { parallelCoordinates };