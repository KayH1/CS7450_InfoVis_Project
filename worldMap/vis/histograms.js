function histograms (divId, attributes, parentVis=null, maxWidth=null) {
    
    this.divId = divId;
    this.parentVis = parentVis;
    
    // start out not displayed
    this.visible = false;
    document.getElementById(this.divId).style.display = 'none';
    
    var width = 1600;
    if (maxWidth !== null) { width = maxWidth; }
    this.svgHistograms = d3.select("#" + this.divId).append("center")
        .append("svg").attr("class", "histograms")
        .attr("width", width)
        .attr("height", 350);


    this.outsideRequest = 0;  // if the update is called from outside, set as 1

    var svgWidthHistograms = +this.svgHistograms.attr('width');
    var svgHeightHistograms = +this.svgHistograms.attr('height');

    this.paddingHistograms = {t: 30, r: 60, b: 60, l: 80, totalCupPoints: 20};

    this.axes = attributes;
    this.numXAxesTicks = [5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5];
    this.numYAxesTicks = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10];

    var len = this.axes.length;
    //if (this.axes.length > 1) { len = len+1; }
    this.chartWidthHistograms = svgWidthHistograms - this.paddingHistograms.l - this.paddingHistograms.r;
    this.chartHeightHistograms = svgHeightHistograms - this.paddingHistograms.t - this.paddingHistograms.b;
    this.axesSpacing = this.chartWidthHistograms / (len);
    
    let assoHist = this;

    /* add brush */
    this.brush = d3.brush().extent([
            [this.paddingHistograms.l - 10, 2 * this.paddingHistograms.t - 30], 
            [this.paddingHistograms.l + this.axes.length * this.axesSpacing, 2 * this.paddingHistograms.t - 10 + this.chartHeightHistograms]
        ])
        .on("start brush", null)
        .on("end", selectCoffeeWithinSelection)
    this.svgHistograms.append("g").attr("class", "brush").call(this.brush);
    d3.select("#" + this.divId).select(".brush").each(function() {
        this.assoHist = assoHist;
    })
    /* add brush */

    // create the y and x scales
    this.yScaleHistograms = [];
    this.xScaleHistograms = [];

    // Create a group element for appending chart elements
    this.chartGHistograms = this.svgHistograms.append('g')
        .attr('transform', 'translate('+[this.paddingHistograms.l, this.paddingHistograms.t]+')');

    // Create groups for the y-axes
    this.enterTextHistograms = this.chartGHistograms.selectAll('.axistitle')
        .data(this.axes)
        .enter()
        .append('text')
        .attr("class", "axistitle")
        .attr('class', function(d,i) {
            return 'y label '+d;
        })
        .attr('transform', function(d,i) {
            var add_spacing = 15;
            var rot = -15;
            if (d === "totalCupPoints") {
                add_spacing = assoHist.paddingHistograms.totalCupPoints;
                rot = 0;
            }
            return 'translate('+(i*assoHist.axesSpacing+add_spacing)+',-10) rotate('+rot+')';
        })
        .text(function(d) {
            var att = d;
            if (att === "cleanCup") { att = "Clean cup"; }
            else if (att === "cupperPoints") { att = "Cupper points"; }
            else if (att === "totalCupPoints") { att = "TOTAL POINTS"; }//Total cup points"; }
            var att = att[0].toUpperCase() + att.slice(1);
            return att;
        })
        .style("font-weight", "bold");
        
}

var toolTipHistograms = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>Coffee id: " + d.id + "<h5>\
        <p>Country: " + d.countryOfOrigin + "</p>";
    });

/* for coffee color style */
histograms.prototype.coffeeDotStyle = {
    defaultColor: "#654321",
    ignoreColor: "#d9d9d9",
    mouseHoverColor: "red"
}

histograms.prototype.initialHistograms = function(coffeeData) {
    let assoHist = this;

    /* create the x axes */
    assoHist.axes.forEach(function(axis, i) {
        var dom = [0,10];
        if (axis === "totalCupPoints") { dom = [0,100]; }

        var freq_rank = d3.extent(coffeeData, function(d) { return d.freq[axis][1]; });
        
        var yScale = d3.scaleLinear().range([assoHist.chartHeightHistograms,0]).domain(dom).nice();
        
        assoHist.yScaleHistograms.push(yScale);

        assoHist.chartGHistograms.append('g')
            .attr('class','y-axes y axis '+axis)
            .attr('transform', function(d, idx) {
                var add_spacing = 20;
                if (axis === "totalCupPoints") { add_spacing = assoHist.paddingHistograms.totalCupPoints; }
                return 'translate('+(i*assoHist.axesSpacing+add_spacing)+','+(assoHist.paddingHistograms.t-20)+')';
            })
            .call(d3.axisLeft(assoHist.yScaleHistograms[i]).ticks(assoHist.numYAxesTicks[i]))
            .selectAll("text").style("font-size", "12px").style("font-weight", 500);

        var xScale = d3.scaleLinear().range([0, assoHist.chartWidthHistograms/(assoHist.axes.length+1)-15]).domain(freq_rank).nice();
        

        assoHist.xScaleHistograms.push(xScale);

        assoHist.chartGHistograms.append('g')
            .attr('class', function(d,idx) {
                return 'x axis '+d+' x-axes';
            }).attr('transform', function(d,idx) {
                var add_spacing = 20;
                if (axis === "totalCupPoints") { add_spacing = assoHist.paddingHistograms.totalCupPoints; }
                return 'translate('+(i*assoHist.axesSpacing+add_spacing)+','+(assoHist.chartHeightHistograms+10)+')';
            })
            .call(d3.axisBottom(assoHist.xScaleHistograms[i]).ticks(assoHist.numXAxesTicks[i]))
            .selectAll("text").style("font-size", "12px").style("font-weight", 500);
    
        assoHist.enterXTextHistograms = assoHist.chartGHistograms.selectAll('.xaxistitle')
            .data(assoHist.axes)
            .enter()
            .append('text')
            .attr("class", "xaxistitle")
            .attr('class', function(d,i) {
                return 'x label';
            })
            .attr('transform', function(d,i) {
                return 'translate('+(i*assoHist.axesSpacing + assoHist.chartWidthHistograms/(2*assoHist.axes.length))+','+(assoHist.chartHeightHistograms+ assoHist.paddingHistograms.t + 10)+')';
            })
            .text("frequency")
            .style("font-weight", "bold");
    });

    assoHist.enterXAxesHistograms = assoHist.chartGHistograms.selectAll('g.x-axes');

    /* determine the datacase dot positions */
    coffeeData.forEach(function(d) {
        d['flavorProfileDotPosition'] = []
        assoHist.axes.forEach(function(axis, i) {
            var inter = assoHist.xScaleHistograms[i](d.freq[axis][1]);
            let x = 2 + i*assoHist.axesSpacing + assoHist.xScaleHistograms[i](d.freq[axis][1]);

            let y = assoHist.paddingHistograms.t - 20 + assoHist.yScaleHistograms[i](d.freq[axis][0]);
            d['flavorProfileDotPosition'].push([x, y]);
        })

    });


    assoHist.data = coffeeData;
    assoHist.countryColorMap = d3.map();
    assoHist.coffeeAllSet = d3.set(assoHist.data.map(d=>d["id"]));
    assoHist.coffeeSelectSet = d3.set(assoHist.data.map(d=>d["id"]));
    assoHist.coffeeShowSet = assoHist.coffeeSelectSet;

    /**********************
     Draw dots
    **********************/
    assoHist.coffeeDotMap = []
    assoHist.axes.forEach(function(axis, i) {
        assoHist.dotHistograms = assoHist.chartGHistograms.selectAll('.dotHist '+axis)
            .data(assoHist.data);

        assoHist.coffeeColorMap = d3.map();
        assoHist.setColorMap(assoHist.coffeeDotStyle.defaultColor);

        // create path elements
        assoHist.coffeeDotMap.push(d3.map());
        assoHist.dotEnterHistograms = assoHist.dotHistograms.enter()
            .append('g') // create a g element
            .attr('class', 'dotHist '+axis); // assign a class ID of dot to the element
        assoHist.dotEnterHistograms.selectAll('circle').data(function(d) {
            return [d];
        }).enter().append('circle') // append a circle to the g elements
            .attr('r', function(d) {
                assoHist.coffeeDotMap[i].set(d["id"], this);
                return 2;
            })
            .attr('cy', function(d) { return d['flavorProfileDotPosition'][i][1]; })
            .attr('cx', function(d) { 
                var add_spacing = 20;
                if (axis === 'totalCupPoints') { add_spacing = assoHist.paddingHistograms.totalCupPoints; }
                return d['flavorProfileDotPosition'][i][0] + add_spacing; })
            .style('opacity', 0.5)
            .attr('fill', function(d) {
                return assoHist.coffeeColorMap.get(d["id"]);
            });

    })
    
    assoHist.dotEnterHistograms = assoHist.chartGHistograms.selectAll('.dotHist');
    
    /**********************
     Create tooltip
    **********************/
    assoHist.svgHistograms.call(toolTipHistograms);

    assoHist.dotEnterHistograms.on('mouseover', toolTipHistograms.show)
        .on('mouseout', toolTipHistograms.hide);


    /* handle toggling between histograms and parallel coordinates */
    d3.select("#switchModeComplexVisSwitch").on('click', function() {
        if (assoHist.parentVis !== null) { assoHist.parentVis.togglePCandH(); }
    });
}

histograms.prototype.setColorMap = function(color) {
    let assoHist = this;
    this.data.forEach(function(d) {
        assoHist.coffeeColorMap.set(d["id"], color);
    })
}

histograms.prototype.setShowCoffeeDotColor = function(coffeeShowSet=null) {
    let assoHist = this;
    if (coffeeShowSet != null) {
        assoHist.coffeeShowSet = coffeeShowSet;
    }
    if (assoHist.countryColorMap.size() > 0) {
        this.setColorMap(assoHist.coffeeDotStyle.ignoreColor);
        assoHist.axes.forEach(function(axis, i) {
            assoHist.data.forEach(function(coffee) {
                if (assoHist.countryColorMap.has(coffee["ISOofOrigin"]) && assoHist.coffeeShowSet.has(coffee["id"])) {
                    assoHist.coffeeColorMap.set(coffee["id"], assoHist.countryColorMap.get(coffee["ISOofOrigin"]));
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).attr("fill", assoHist.countryColorMap.get(coffee["ISOofOrigin"]))
                        .style('r',2).style("opacity", 1);
                } else {
                        d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).attr("fill", assoHist.coffeeColorMap.get(coffee["id"])).style('r',2)
                            .style("opacity", 0.2);
                }
            })
        })
    } else {
        if (assoHist.coffeeShowSet.size() != assoHist.coffeeAllSet.size()) {
            assoHist.setColorMap(assoHist.coffeeDotStyle.ignoreColor);
            assoHist.axes.forEach(function(axis, i) {
                assoHist.data.forEach(function(coffee) {
                    if (assoHist.coffeeShowSet.has(coffee["id"])) {
                        assoHist.coffeeColorMap.set(coffee["id"], assoHist.coffeeDotStyle.defaultColor);
                        d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).attr("fill", assoHist.coffeeDotStyle.defaultColor).style("opacity", 0.3);
                    } else {
                        d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).attr("fill", assoHist.coffeeDotStyle.ignoreColor).style("opacity", 0.1);
                    }
                })
            })
        } else {
            assoHist.setColorMap(assoHist.coffeeDotStyle.defaultColor);
            assoHist.axes.forEach(function(axis, i) {
                assoHist.data.forEach(function(coffee) {
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).attr("fill", assoHist.coffeeDotStyle.defaultColor).style("opacity", 0.3);
                })
            })
        }
    }
}

/* called from parent vis initial by map */
histograms.prototype.updateDotColorSelectedCountry = function(countryColorMap) {
    let assoHist = this;
    assoHist.countryColorMap = countryColorMap;
    assoHist.setShowCoffeeDotColor();
}

/* for brush event */
function selectCoffeeWithinSelection() {
    let assoHist = this.assoHist;
    assoHist.coffeeSelectSet.clear();
    /* 
        if brush is show, then d3.event.selection != null 
        if brush is disable from outside vis update call: assoHist.outsideRequest == 1, not update parentVis
    */
    if (d3.event.selection != null) {
        let [[x0, y0], [x1, y1]] = d3.event.selection;
        if (x1 > x0 && y1 > y0) {
            assoHist.axes.forEach(function(axis, i) {
                assoHist.data.forEach(function(d) {
                    let position = d["flavorProfileDotPosition"][i];
                    // add extra 20 for spacing, as above
                    if ((position[0]+assoHist.paddingHistograms.l + 20 >= x0 && position[0]+assoHist.paddingHistograms.l + 20 <= x1) && (position[1]+assoHist.paddingHistograms.t >= y0 && position[1]+assoHist.paddingHistograms.t <= y1)) {
                        assoHist.coffeeSelectSet.add(d["id"]);
                    }
                });
            });
        }

        /* call parentVis to update based on selected coffee */
        if (assoHist.parentVis != null) {
            assoHist.parentVis.updateSelectedCoffeeHist(assoHist.coffeeSelectSet, true);
        } else {
            assoHist.setShowCoffeeLineColor(assoHist.coffeeSelectSet);
        }
    } else {
        /* there is no brush current, for other vis, show all datapoint, also call parentVis */
        assoHist.coffeeAllSet.each(function(d) {
            assoHist.coffeeSelectSet.add(d);
        })
        if (assoHist.parentVis != null){
            assoHist.parentVis.updateSelectedCoffeeHist(assoHist.coffeeSelectSet, false);
        } else {
            assoHist.setShowCoffeeDotColor(assoHist.coffeeSelectSet);
        }
    }
}

export { histograms };
