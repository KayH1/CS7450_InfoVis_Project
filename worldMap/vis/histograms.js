function histograms (divId, attributes, parentVis=null) {
    
    this.divId = divId;
    this.parentVis = parentVis;
    
    // start out not displayed
    this.visible = false;
    document.getElementById(this.divId).style.display = 'none';
    
    this.svgHistograms = d3.select("#" + this.divId).append("center")
        .append("svg").attr("class", "histograms")
        .attr("width", 1450)
        .attr("height", 350)
        ;

    

    this.outsideRequest = 0;  // if the update is called from outside, set as 1

    var svgWidthHistograms = +this.svgHistograms.attr('width');
    var svgHeightHistograms = +this.svgHistograms.attr('height');

    this.paddingHistograms = {t: 30, r: 40, b: 50, l: 60};

    this.axes = attributes;
    this.numAxesTicks = [5,5,5,5,5,5,3,3,3,5];

    this.chartWidthHistograms = svgWidthHistograms - this.paddingHistograms.l - this.paddingHistograms.r;
    this.chartHeightHistograms = svgHeightHistograms - this.paddingHistograms.t - this.paddingHistograms.b;
    this.axesSpacing = this.chartWidthHistograms / (this.axes.length);
    
    let assoHist = this;

    /* add brush */
    this.brush = d3.brush().extent([
            [this.paddingHistograms.l - 10, 2 * this.paddingHistograms.t - 30], 
            [this.paddingHistograms.l + 10 + 8 * this.axesSpacing, 2 * this.paddingHistograms.t - 10 + this.chartHeightHistograms]
        ])
        .on("start brush", null)
        .on("end", selectCoffeeWithinSelection)
    this.svgHistograms.append("g").attr("class", "brush").call(this.brush);
    d3.select("#" + this.divId).select(".brush").each(function() {
        this.assoHist = assoHist;
    })
    /* add brush */

    // create the y and x scales
    this.yScaleHistograms = d3.scaleLinear().range([this.chartHeightHistograms,0]).domain([0,10]).nice();
    this.xScaleHistograms = [];

    // Create a group element for appending chart elements
    this.chartGHistograms = this.svgHistograms.append('g')
        .attr('transform', 'translate('+[this.paddingHistograms.l, this.paddingHistograms.t]+')');

    // Create groups for the y-axes
    this.enterYAxesHistograms = this.chartGHistograms.selectAll('g.y-axes')
        .data(this.axes)
        .enter()
        .append('g')
        .attr('class', function(d,i) {
            return 'y axis '+d+' y-axes';
        })
        .attr('transform', function(d,i){
            return 'translate('+(i*assoHist.axesSpacing)+','+(assoHist.paddingHistograms.t-20)+')';
        });
    this.enterYAxesHistograms.call(d3.axisLeft(this.yScaleHistograms).ticks(5))
        .selectAll("text").style("font-size", "12px").style("font-weight", 500);
    this.enterTextHistograms = this.chartGHistograms.selectAll('.axistitle')
        .data(this.axes)
        .enter()
        .append('text')
        .attr("class", "axistitle")
        .attr('class', function(d,i) {
            return 'y label '+d;
        })
        .attr('transform', function(d,i) {
            return 'translate('+(i*assoHist.axesSpacing-10)+',-10) rotate(-20)';
        })
        .text(function(d) { return d; })
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
        
        var freq_rank = d3.extent(coffeeData, function(d) { return d.freq[axis][1]; });

        var xScale = d3.scaleLinear().range([0, assoHist.chartWidthHistograms/(assoHist.axes.length+1)-15]).domain(freq_rank).nice();

        assoHist.xScaleHistograms.push(xScale);

        assoHist.chartGHistograms.append('g')
            .attr('class', function(d,idx) {
                return 'x axis '+d+' x-axes';
            }).attr('transform', function(d,idx) {
                return 'translate('+(i*assoHist.axesSpacing)+','+(assoHist.chartHeightHistograms+10)+')';
            })
            .call(d3.axisBottom(assoHist.xScaleHistograms[i]).ticks(assoHist.numAxesTicks[i]))
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
                return 'translate('+(i*assoHist.axesSpacing + assoHist.chartWidthHistograms/(2*assoHist.axes.length+2))+','+(assoHist.chartHeightHistograms+4.5*assoHist.paddingHistograms.b/5)+')';
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
            let y = assoHist.paddingHistograms.t - 20 + assoHist.yScaleHistograms(d.freq[axis][0]);
            d['flavorProfileDotPosition'].push([x, y]);
        })

    });


    assoHist.data = coffeeData;

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
        assoHist.dotEnterHistograms.append('circle') // append a circle to the g elements
            .attr('r', function(d) {
                assoHist.coffeeDotMap[i].set(d["id"], this);
                return 1;
            })
            .attr('cy', function(d) { return d['flavorProfileDotPosition'][i][1]; })
            .attr('cx', function(d) { return d['flavorProfileDotPosition'][i][0]; })
            .style('opacity', 0.5);

    })
    
    assoHist.dotEnterHistograms = assoHist.chartGHistograms.selectAll('.dotHist');
    
    /**********************
     Create tooltip
    **********************/
    assoHist.svgHistograms.call(toolTipHistograms);

    assoHist.dotEnterHistograms.on('mouseover', toolTipHistograms.show)
        .on('mouseout', toolTipHistograms.hide);


    /* handle toggling between histograms and parallel coordinates */
    d3.select("#complexVisSwitchMode").on('click', function() {
        if (assoHist.parentVis !== null) { assoHist.parentVis.togglePCandH(); }
    });
}



var toolTipHistograms = d3.tip()
  .attr("class", "d3-tip")
  .offset([-12, 0])
  .html(function(d) { 
      return "<h5>Country: "+d.countryOfOrigin+"<br>"+"</h5>";
});



histograms.prototype.setColorMap = function(color) {
    let assoHist = this;
    this.data.forEach(function(d) {
        assoHist.coffeeColorMap.set(d["id"], color);
    })
}

histograms.prototype.setSelectedCoffeeDotColor = function(coffeeSelectSet) {
    let assoHist = this;
    if (d3.event.selection != null) {
        assoHist.setColorMap(assoHist.coffeeDotStyle.ignoreColor);
        assoHist.axes.forEach(function(axis, i) {
            assoHist.data.forEach(function(coffee) {
                if (coffeeSelectSet.has(coffee["id"])) {
                    assoHist.coffeeColorMap.set(coffee["id"], assoHist.coffeeDotStyle.defaultColor);
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("fill", assoHist.coffeeDotStyle.defaultColor).style("opacity", 0.3).style("stroke-width", 3);
                } else {
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("fill", assoHist.coffeeDotStyle.ignoreColor).style('stroke-width', 1).style("opacity", 0.1).style("stroke-width", 1);
                }
            })
        })
    } else {
        assoHist.setColorMap(assoHist.coffeeDotStyle.defaultColor);
        assoHist.axes.forEach(function(axis, i) {
            assoHist.data.forEach(function(coffee) {
                d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("stroke", assoHist.coffeeDotStyle.defaultColor).style("stroke-width", 1).style("opacity", 0.3);
            })
        })
    }
}

/* called from parent vis initial by map */
histograms.prototype.updateDotColorSelectedCountry = function(countryColorMap) {
    let assoHist = this;
    /* remove brush */
    this.outsideRequest = 1
    d3.select("#" + assoHist.divId).select(".brush").call(assoHist.brush.clear);

    /* set color */
    if (countryColorMap.size() > 0) {
        this.setColorMap(assoHist.coffeeDotStyle.ignoreColor);
    } else {
        this.setColorMap(assoHist.coffeeDotStyle.defaultColor);
    }
    assoHist.axes.forEach(function(axis, i) {
        assoHist.data.forEach(function(coffee) {
            if (countryColorMap.has(coffee["ISOofOrigin"])) {
                assoHist.coffeeColorMap.set(coffee["id"], countryColorMap.get(coffee["ISOofOrigin"]));
                console.log(assoHist.coffeeDotMap[i].get(coffee["id"]));
                d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("fill", countryColorMap.get(coffee["ISOofOrigin"]))
                    .style('r',1).style('stroke',countryColorMap.get(coffee["ISOofOrigin"])).style("opacity", 1);
            } else {
                if (countryColorMap.size() == 0) {
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("fill", assoHist.coffeeColorMap.get(coffee["id"])).style('r',1)
                        .style('stroke-width', 1).style("opacity", 0.2);
                } else {
                    d3.select(assoHist.coffeeDotMap[i].get(coffee["id"])).style("stroke", assoHist.coffeeColorMap.get(coffee["id"])).style('r',1)
                        .style('stroke-width', 1).style("opacity", 0.1);
                }
            }
        })
    })
}

/* called from parent vis initial by embedding */ 
histograms.prototype.updateDotColorSelectedCoffee = function(coffeeSelectSet) {
    let assoHist = this;
    /* remove brush */
    this.outsideRequest = 1;
    d3.select("#" + assoHist.divId).select(".brush").call(assoHist.brush.clear);
    assoHist.setSelectedCoffeeDotColor(coffeeSet);
}

/* for brush event */
function selectCoffeeWithinSelection() {
    let assoHist = this.assoHist;
    let coffeeSet = d3.set();
    /* 
        if brush is show, then d3.event.selection != null 
        if brush is disable from outside vis update call: assoHist.outsideRequest == 1, not update parentVis
    */
    if (d3.event.selection != null) {
        let [[x0, y0], [x1, y1]] = d3.event.selection;
        console.log(x0,y0,x1,y1);
        if (x1 > x0 && y1 > y0) {
            assoHist.axes.forEach(function(axis, i) {
                assoHist.data.forEach(function(d) {
                    let position = d["flavorProfileDotPosition"][i];
                    if ((position[0]+assoHist.paddingHistograms.l >= x0 && position[0]+assoHist.paddingHistograms.l <= x1) && (position[1]+assoHist.paddingHistograms.t >= y0 && position[1]+assoHist.paddingHistograms.t <= y1)) {
                        console.log(d);
                        coffeeSet.add(d["id"]);
                    }
                });
            });
        }

        console.log(coffeeSet);
        /* call parentVis to update based on selected coffee */
        if (assoHist.parentVis != null) {
            assoHist.parentVis.updateSelectedCoffeeHist(coffeeSet, true);
        }
    } else {
        if (assoHist.outsideRequest == 0) {
            /* there is no brush current, for other vis, show all datapoint, also call parentVis */
            if (assoHist.parentVis != null)
                assoHist.parentVis.updateSelectedCoffeeHist(coffeeSet, false);
        }
        assoHist.outsideRequest = 0;
    }
    assoHist.setSelectedCoffeeDotColor(coffeeSet);
}


export { histograms };