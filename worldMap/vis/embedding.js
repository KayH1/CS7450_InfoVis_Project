function embedding (divId, parentVis=null) {
	this.divId = divId;
	this.parentVis = parentVis;

	this.svgEmbeddings = d3.select("#" + this.divId).append("svg").attr("class", "embedding")
		.attr("width", 450)
		.attr("height", 520);
	// Get layout parameters
	var svgWidthEmbeddings = +this.svgEmbeddings.attr('width');
	var svgHeightEmbeddings = +this.svgEmbeddings.attr('height');

	this.svgEmbeddings.append("text").attr("class", "embeddingTitle").text("MDS 2D Project")
		.attr("transform", "translate(" + svgWidthEmbeddings/2 + ", 40)");

	this.paddingEmbeddings = {t: 40, r: 40, b: 50, l: 60};

	// Compute chart dimensions
	var chartWidthEmbeddings = svgWidthEmbeddings - this.paddingEmbeddings.l - this.paddingEmbeddings.r;
	var chartHeightEmbeddings = svgHeightEmbeddings - this.paddingEmbeddings.t - this.paddingEmbeddings.b;

	// create the x and y scales
	this.xScaleEmbeddings = d3.scaleLinear().range([0, chartWidthEmbeddings]);
	this.yScaleEmbeddings = d3.scaleLinear().range([chartHeightEmbeddings, 0]);

	/* add brush */
	let assoEmbedding = this;
    this.brush = d3.brush().extent([
            [this.paddingEmbeddings.l - 20, this.paddingEmbeddings.t - 15], 
            [this.paddingEmbeddings.l + chartWidthEmbeddings + 20, this.paddingEmbeddings.t + chartHeightEmbeddings + 15]
        ])
        .on("start brush", null)
        .on("end", selectCoffeeWithinSelection)
    this.svgEmbeddings.append("g").attr("class", "brush").call(this.brush);
    d3.select("#" + this.divId).select(".brush").each(function() {
        this.assoEmbedding = assoEmbedding;
    })
    /* add brush */

	// Create a group element for appending chart elements
	this.chartGEmbeddings = this.svgEmbeddings.append('g')
	    .attr('transform', 'translate('+[this.paddingEmbeddings.l, this.paddingEmbeddings.t]+')');
}

embedding.prototype.coffeeDotStyle = {
    defaultColor: "#654321",
    ignoreColor: "#d9d9d9",
    mouseHoverColor: "red"
}

var toolTipEmbeddings = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
        return "<h5>Coffee id: " + d.id + "<h5>\
        <p>Country: " + d.countryOfOrigin + "</p>";
    });

embedding.prototype.setColorMap = function(color) {
    let assoEmbedding = this;
    this.data.forEach(function(d) {
        assoEmbedding.coffeeColorMap.set(d["id"], color);
    })
}

embedding.prototype.initialEmbedding = function(coffeeData) {
	this.data = coffeeData;
	let assoEmbedding = this;

	// get the value ranges for the x and y embedding values
    let yEmbeddingsExtent = d3.extent(this.data, function(d) { return d.mdsY; });
    let xEmbeddingsExtent = d3.extent(this.data, function(d) { return d.mdsX; });

    // set the x & y axes domains
    this.yScaleEmbeddings.domain(yEmbeddingsExtent);
    this.xScaleEmbeddings.domain(xEmbeddingsExtent);

	coffeeData.forEach(function(d) {
        d['embeddingX'] = assoEmbedding.xScaleEmbeddings(d.mdsX) + assoEmbedding.paddingEmbeddings.l;
        d['embeddingY'] = assoEmbedding.yScaleEmbeddings(d.mdsY) + assoEmbedding.paddingEmbeddings.t;
    });

    this.coffeeColorMap = d3.map();
    this.setColorMap(assoEmbedding.coffeeDotStyle.defaultColor);
    this.countryColorMap = d3.map();
    this.coffeeAllSet = d3.set(this.data.map(d=>d["id"]));
    this.coffeeSelectSet = d3.set(this.data.map(d=>d["id"]));
    this.coffeeShowSet = this.coffeeSelectSet;

    // create d3 selection on the class dot & create a data-join with coffee
    var dotsEmbeddings = this.chartGEmbeddings.selectAll('.dot')
        .data(this.data);

    // create .dot elements
    this.coffeeDotMap = d3.map();
    var dotsEnterEmbeddings = dotsEmbeddings.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'embeddingdot'); // assign a class ID of dot to the element
    dotsEnterEmbeddings.selectAll("circle").data(function(d) { return [d]; }).enter().append('circle') // append a circle to the g elements
        .attr('r', 2)
        .attr('fill', function(d) {
        	return assoEmbedding.coffeeColorMap.get(d["id"]);
        })
        .style("opacity", 0.4)
        .each(function(d) {
        	assoEmbedding.coffeeDotMap.set(d["id"], this);
        });
    dotsEnterEmbeddings.each(function(d) {
        this.assoEmbedding = assoEmbedding;
    })

    this.svgEmbeddings.call(toolTipEmbeddings);

    dotsEnterEmbeddings.on('mouseenter', function(d) {
        let assoEmbedding = this.assoEmbedding;
        if (assoEmbedding.coffeeColorMap.get(d["id"]) === assoEmbedding.coffeeDotStyle.ignoreColor)
            return;
        toolTipEmbeddings.show(d, d3.select(this).node());

        /* following will also called when hovering on data point in other vis */
            this.previousOpacity = d3.select(this).select('circle').style('opacity');
            d3.select(this).select('circle')
                .style('opacity', 1)
                .attr('r', 6)
                .attr('fill', assoEmbedding.coffeeDotStyle.mouseHoverColor);
            
            if (assoEmbedding.parentVis != null) {
                if (assoEmbedding.parentVis.parallelCoords.visible) {

                    let assoParallel = assoEmbedding.parentVis.parallelCoords;
                    let linkedPath = d3.select(assoParallel.coffeeLineMap.get(d['id']));
                    this.hoverUpdateParallelOpacity = linkedPath.style('opacity');
                    this.hoverUpdateParallelStrokeWidth = linkedPath.style('stroke-width');
                    linkedPath.style('stroke', assoParallel.coffeeLineStyle.mouseHoverColor)
                        .style('opacity', 1)
                        .style('stroke-width', 5);

                } else if (assoEmbedding.parentVis.histograms.visible) {
                    
                    let assoHist = assoEmbedding.parentVis.histograms;
                    let linkedDot = d3.select(assoHist.coffeeDotMap[0].get(d['id']));
                    this.hoverUpdateHistOpacity = linkedDot.style("opacity");
                    assoHist.coffeeDotMap.forEach(function(dotMap) {
                        d3.select(dotMap.get(d["id"]))
                            .attr("fill", assoHist.coffeeDotStyle.mouseHoverColor)
                            .attr("r", 6)
                            .style("opacity", 1);
                    });

                }
            }
        /* following will also called when hovering on data point in other vis */
    })
    .on('mouseout', function(d) {
        let assoEmbedding = this.assoEmbedding;
        if (assoEmbedding.coffeeColorMap.get(d["id"]) === assoEmbedding.coffeeDotStyle.ignoreColor)
            return;
        toolTipEmbeddings.hide();
        
        /* following will also called when hovering on data point in other vis */
            d3.select(this).select('circle')
                .style('opacity', this.previousOpacity)
                .attr('r', 2)
                .attr('fill', assoEmbedding.coffeeColorMap.get(d['id']));

            if (assoEmbedding.parentVis != null) {
                if (assoEmbedding.parentVis.parallelCoords.visible) {

                    let assoParallel = assoEmbedding.parentVis.parallelCoords;
                    let linkedPath = d3.select(assoParallel.coffeeLineMap.get(d['id']));
                    linkedPath.style('stroke', assoParallel.coffeeColorMap.get(d['id']))
                        .style('opacity', this.hoverUpdateParallelOpacity)
                        .style('stroke-width', this.hoverUpdateParallelStrokeWidth);

                } else if (assoEmbedding.parentVis.histograms.visible) {
                    let currentHover = this;
                    let assoHist = assoEmbedding.parentVis.histograms;
                    assoHist.coffeeDotMap.forEach(function(dotMap) {
                        d3.select(dotMap.get(d["id"]))
                            .attr("fill", assoHist.coffeeColorMap.get(d["id"]))
                            .attr("r", 2)
                            .style("opacity", currentHover.hoverUpdateHistOpacity);
                    });
                
                }
            }
        /* following will also called when hovering on data point in other vis */
    });

    dotsEmbeddings.merge(dotsEnterEmbeddings) // combine enter and update selections
        .attr('transform', function(d) {
            return 'translate('+[d.embeddingX - assoEmbedding.paddingEmbeddings.l, d.embeddingY - assoEmbedding.paddingEmbeddings.t]+')';
        });
}

embedding.prototype.setShowCoffeeDotColor = function(coffeeShowSet=null) {
    let assoEmbedding = this;
    if (coffeeShowSet != null) {
        assoEmbedding.coffeeShowSet = coffeeShowSet;
    }
    
    if (assoEmbedding.countryColorMap.size() > 0) {
        this.setColorMap(assoEmbedding.coffeeDotStyle.ignoreColor);
        this.data.forEach(function(coffee) {
            if (assoEmbedding.countryColorMap.has(coffee["ISOofOrigin"]) && assoEmbedding.coffeeShowSet.has(coffee["id"])) {
                assoEmbedding.coffeeColorMap.set(coffee["id"], assoEmbedding.countryColorMap.get(coffee["ISOofOrigin"]));
                d3.select(assoEmbedding.coffeeDotMap.get(coffee["id"])).attr("fill", assoEmbedding.countryColorMap.get(coffee["ISOofOrigin"]))
                    .style("opacity", 1);
            } else {
                d3.select(assoEmbedding.coffeeDotMap.get(coffee["id"])).attr("fill", assoEmbedding.coffeeColorMap.get(coffee["id"]))
                    .style("opacity", 0.3);
            }
        })
    } else {
        if (assoEmbedding.coffeeShowSet.size() == assoEmbedding.coffeeAllSet.size()) {
            assoEmbedding.setColorMap(assoEmbedding.coffeeDotStyle.defaultColor);
            this.data.forEach(function(coffee) {
                d3.select(assoEmbedding.coffeeDotMap.get(coffee["id"])).attr("fill", assoEmbedding.coffeeDotStyle.defaultColor).style("opacity", 0.4);
            });
        } else {
            this.setColorMap(assoEmbedding.coffeeDotStyle.ignoreColor);
            this.data.forEach(function(coffee) {
                if (assoEmbedding.coffeeShowSet.has(coffee["id"])) {
                    assoEmbedding.coffeeColorMap.set(coffee["id"], assoEmbedding.coffeeDotStyle.defaultColor);
                    d3.select(assoEmbedding.coffeeDotMap.get(coffee["id"])).attr("fill", assoEmbedding.coffeeDotStyle.defaultColor).style("opacity", 0.4);
                } else {
                    d3.select(assoEmbedding.coffeeDotMap.get(coffee["id"])).attr("fill", assoEmbedding.coffeeDotStyle.ignoreColor).style("opacity", 0.3);
                }
            });
        }
    }
}

/* called from parent vis initial by map */
embedding.prototype.updateDotColorSelectedCountry = function(countryColorMap) {
    let assoEmbedding = this;
    assoEmbedding.countryColorMap = countryColorMap;
    assoEmbedding.setShowCoffeeDotColor();
}

/* for brush event */
function selectCoffeeWithinSelection() {
    let assoEmbedding = this.assoEmbedding;
    assoEmbedding.coffeeSelectSet.clear();
    /* 
        if brush is show, then d3.event.selection != null 
        if brush is disable from outside vis update call: assoParallel.outsideRequest == 1, not update parentVis
    */
    if (d3.event.selection != null) {
        let [[x0, y0], [x1, y1]] = d3.event.selection;
        if (x1 > x0 && y1 > y0) {
            assoEmbedding.data.forEach(function(d) {
                if ((d.embeddingX >= x0 && d.embeddingX <= x1) && (d.embeddingY >= y0 && d.embeddingY <= y1))
                    assoEmbedding.coffeeSelectSet.add(d["id"]);
            });
        }
        /* call parentVis to update based on selected coffee */
        if (assoEmbedding.parentVis != null) {
            assoEmbedding.parentVis.updateSelectedCoffeeEmbedding(assoEmbedding.coffeeSelectSet, true);
        } else {
            assoEmbedding.setShowCoffeeDotColor(assoEmbedding.coffeeSelectSet);
        }
    } else {
        /* there is no brush current, for other vis, show all datapoint, also call parentVis */
        assoEmbedding.coffeeAllSet.each(function(d) {
        	assoEmbedding.coffeeSelectSet.add(d);
        })
        if (assoEmbedding.parentVis != null){
            assoEmbedding.parentVis.updateSelectedCoffeeEmbedding(assoEmbedding.coffeeSelectSet, false);
        } else {
            assoEmbedding.setShowCoffeeDotColor(assoEmbedding.coffeeSelectSet);
        }
    }
}

export { embedding };