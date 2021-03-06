function parallelCoordinates (divId, attributes, parentVis=null) {
    
    this.divId = divId;
    this.parentVis = parentVis;

    // start out being displayed
    this.visible = true;
    document.getElementById(divId).style.display = 'block';

    this.svgParallelCoords = d3.select("#" + this.divId).append("center")
        .append("svg").attr("class", "parallel-coords")
        .attr("width", 1600)
        .attr("height", 350);

    var svgWidthParallelCoords = +this.svgParallelCoords.attr('width');
    var svgHeightParallelCoords = +this.svgParallelCoords.attr('height');

    this.paddingParallelCoords = {t: 30, r: 60, b: 50, l: 95, totalCupPoints: 20};

    this.axes = attributes;
    this.axes = this.axes; //.filter(function(v, idx, a) { return v !== "totalCupPoints"; })

    var chartWidthParallelCoords = svgWidthParallelCoords - this.paddingParallelCoords.l - this.paddingParallelCoords.r;
    var chartHeightParallelCoords = svgHeightParallelCoords - this.paddingParallelCoords.t - this.paddingParallelCoords.b;
    console.log("pc ",this.axes.length);
    this.axesSpacing = chartWidthParallelCoords / (this.axes.length);//-0.5);
    
    let assoParallel = this;

    /* add brush */
    this.brush = d3.brush().extent([
            [this.paddingParallelCoords.l - 10, 2 * this.paddingParallelCoords.t - 30], 
            [this.paddingParallelCoords.l + 10 + (this.axes.length-1) * this.axesSpacing, 2 * this.paddingParallelCoords.t - 10 + chartHeightParallelCoords]
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

    this.svgParallelCoords.append("rect").attr("class", "specialForTotal")
        .attr('x', 10*assoParallel.axesSpacing - 55+ assoParallel.paddingParallelCoords.l + assoParallel.paddingParallelCoords.totalCupPoints)
        .attr('y', assoParallel.paddingParallelCoords.t - 28)
        .attr("width", 110).attr("height", 26).attr('fill-opacity',1).attr('fill', "#ffecc3")
        .attr('stroke', '#ffecc3').attr('stroke-width', 5).attr('stroke-linecap', 'round');

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
        .each(function(d){
            if (d==='totalCupPoints') {
                let axisText = d3.select(this).selectAll("text");
                axisText.each(function(d) {
                    let points = (+d3.select(this).text());
                    d3.select(this).text(points * 10);
                })
            }
        })
        .selectAll("text").style("font-size", "12px").style("font-weight", 500)
    this.enterTextParallelCoords = this.chartGParallelCoords.selectAll('.axistitle')
        .data(this.axes)
        .enter()
        .append('text')
        .attr("class", "axistitle")
        .attr('class', function(d,i) {
            return 'y label '+d;
        })
        .attr('transform', function(d,i) {
            var add_spacing = 0;
            let rot = -15;
            if (d === "totalCupPoints") {
                add_spacing = assoParallel.paddingParallelCoords.totalCupPoints;
                rot = 0;
            }
            return 'translate('+(i*assoParallel.axesSpacing+add_spacing)+',-10) rotate(' + rot + ')';
        })
        .text(function(d) { 
            var att = d;
            if (att === "cleanCup") { att = "Clean cup"; }
            else if (att === "cupperPoints") { att = "Cupper points"; }
            else if (att === "totalCupPoints") { att = "TOTAL POINTS"; }
            var att = att[0].toUpperCase() + att.slice(1);
            return att; })
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
        d['flavorProfileLine'] = []
        d['flavorProfilePosition'] = []
        
        assoParallel.axes.forEach(function(axis, i) {
            if (axis !== 'totalCupPoints') {
                d['flavorProfileLine'].push([i*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[i]])]); 
                d['flavorProfilePosition'].push([assoParallel.paddingParallelCoords.l + i*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[i]]) ]);
            } else {
                d['flavorProfileLine'].push([i*assoParallel.axesSpacing, assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[i]]/10)]); 
                d['flavorProfilePosition'].push([assoParallel.paddingParallelCoords.l + i*assoParallel.axesSpacing, 2*assoParallel.paddingParallelCoords.t - 20 + assoParallel.yScaleParallelCoords(d[assoParallel.axes[i]]/10) ]);
            };
        });

    });
    
    this.data = coffeeData;
    
    /* add scale for stroke-width when country select */
    this.strokeWidthCountryScale = d3.scaleLog().range([4,8]).domain([250, 1]);

    this.countryStrokeWidth = d3.nest().key(function(d) {
        return d["ISOofOrigin"];
    }).object(this.data);
    Object.keys(assoParallel.countryStrokeWidth).forEach(function(key){ 
        let countryCount = assoParallel.countryStrokeWidth[key].length;
        assoParallel.countryStrokeWidth[key] = assoParallel.strokeWidthCountryScale(countryCount);  
    });
    
    // display the data as polylines
    this.chartGParallelCoords.selectAll('g')
      .data(this.data, function(d) { return d['id']; })
      .enter();

    /**********************
     Draw lines
    **********************/
    this.polylineParallelCoords = this.chartGParallelCoords.selectAll('.polyline')
        .data(this.data);

    this.coffeeColorMap = d3.map();
    this.setColorMap(assoParallel.coffeeLineStyle.defaultColor);

    this.countryColorMap = d3.map();
    this.coffeeAllSet = d3.set(this.data.map(d=>d["id"]));
    this.coffeeSelectSet = d3.set(this.data.map(d=>d["id"]));
    this.coffeeShowSet = this.coffeeSelectSet;

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

        var target = d3.select("#" + assoParallel.divId).select('#tipfollowscursor')
                .attr('cx', d3.event.offsetX)
                .attr('cy', d3.event.offsetY - 0) // 0 pixels above the cursor
                .node();
        toolTipParallelCoords.show(d, target)

        /* following will also called when hovering on data point in other vis */
            this.previousOpacity = d3.select(this).select('path').style("opacity");
            this.previousStrokeWidth = d3.select(this).select('path').style("stroke-width");
            
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

            if (assoParallel.parentVis != null) {
                let assoEmbedding = assoParallel.parentVis.embedding;
                let linkedDot = d3.select(assoEmbedding.coffeeDotMap.get(d["id"]));
                this.hoverUpdateEmbeddingOpacity = linkedDot.style('opacity');
                linkedDot.style('opacity', 1)
                    .attr('r', 6)
                    .attr('fill', assoEmbedding.coffeeDotStyle.mouseHoverColor);
            }
        /* above will also called when hovering on data point in other vis */
    })
    .on('mouseout', function(d) {
        let assoParallel = this.assoParallel;
        if (assoParallel.coffeeColorMap.get(d["id"]) === assoParallel.coffeeLineStyle.ignoreColor)
            return;
        toolTipParallelCoords.hide();
        
        /* following will also called when hovering on data point in other vis */
            let group = this;
            d3.select(this)
              .select('path')
              .style('stroke', function(d) {
                return assoParallel.coffeeColorMap.get(d["id"]);
              })
              .style('opacity', function(){
                return group.previousOpacity;
              })
              .style('stroke-width', function(){
                return group.previousStrokeWidth;
              });

            if (assoParallel.parentVis != null) {
                let assoEmbedding = assoParallel.parentVis.embedding;
                let linkedDot = d3.select(assoEmbedding.coffeeDotMap.get(d["id"]));
                linkedDot.style('opacity', this.hoverUpdateEmbeddingOpacity)
                    .attr('r', 2)
                    .attr('fill', assoEmbedding.coffeeColorMap.get(d['id']));
            }
        /* above will also called when hovering on data point in other vis */
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

parallelCoordinates.prototype.setShowCoffeeLineColor = function(coffeeShowSet=null) {
    let assoParallel = this;
    if (coffeeShowSet != null) {
        assoParallel.coffeeShowSet = coffeeShowSet;
    }
    
    if (assoParallel.countryColorMap.size() > 0) {
        this.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
        this.data.forEach(function(coffee) {
            if (assoParallel.countryColorMap.has(coffee["ISOofOrigin"]) && assoParallel.coffeeShowSet.has(coffee["id"])) {
                assoParallel.coffeeColorMap.set(coffee["id"], assoParallel.countryColorMap.get(coffee["ISOofOrigin"]));
                d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.countryColorMap.get(coffee["ISOofOrigin"]))
                    .style("stroke-width", assoParallel.countryStrokeWidth[coffee["ISOofOrigin"]]).style("opacity", 0.5);
            } else {
                d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeColorMap.get(coffee["id"]))
                    .style('stroke-width', 1).style("opacity", 0.1);
            }
        })
    } else {
        if (assoParallel.coffeeShowSet.size() == assoParallel.coffeeAllSet.size()) {
            assoParallel.setColorMap(assoParallel.coffeeLineStyle.defaultColor);
            this.data.forEach(function(coffee) {
                d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.defaultColor).style("stroke-width", 1).style("opacity", 0.2);
            });
        } else {
            this.setColorMap(assoParallel.coffeeLineStyle.ignoreColor);
            this.data.forEach(function(coffee) {
                if (assoParallel.coffeeShowSet.has(coffee["id"])) {
                    assoParallel.coffeeColorMap.set(coffee["id"], assoParallel.coffeeLineStyle.defaultColor);
                    d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.defaultColor).style("opacity", 0.3).style("stroke-width", 3);
                } else {
                    d3.select(assoParallel.coffeeLineMap.get(coffee["id"])).style("stroke", assoParallel.coffeeLineStyle.ignoreColor).style('stroke-width', 1).style("opacity", 0.1);
                }
            });
        }
    }
}

/* called from parent vis initial by map */
parallelCoordinates.prototype.updateLineColorSelectedCountry = function(countryColorMap) {
    let assoParallel = this;
    assoParallel.countryColorMap = countryColorMap;
    assoParallel.setShowCoffeeLineColor();
}


/* for brush event */
function selectCoffeeWithinSelection() {
    let assoParallel = this.assoParallel;
    assoParallel.coffeeSelectSet.clear();
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
                        assoParallel.coffeeSelectSet.add(d["id"]);
                        break;
                    }
                }
            });
        }
        /* call parentVis to update based on selected coffee */
        if (assoParallel.parentVis != null) {
            assoParallel.parentVis.updateSelectedCoffeeParallel(assoParallel.coffeeSelectSet, true);
        } else {
            assoParallel.setShowCoffeeLineColor(assoParallel.coffeeSelectSet);
        }
    } else {
        /* there is no brush current, for other vis, show all datapoint, also call parentVis */
        assoParallel.coffeeAllSet.each(function(d) {
            assoParallel.coffeeSelectSet.add(d);
        })
        if (assoParallel.parentVis != null){
            assoParallel.parentVis.updateSelectedCoffeeParallel(assoParallel.coffeeSelectSet, false);
        } else {
            assoParallel.setShowCoffeeDotColor(assoParallel.coffeeSelectSet);
        }
    }
}

export { parallelCoordinates };