import * as slider from "./vis/sliders.js"
import * as mapVis from "./vis/worldMap.js"

var coffeeBeanPath = "./worldMap/icons/coffeeBeanIcon.png";
var variableList = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'uniformity', 'cleanCup', 'sweetness', 'cupperPoints'];

function preferenceCombine (divId) {
	this.divId = divId;
    let assoSliderId = this.divId + "sliders";	
	d3.select("#" + divId).style("display", "flex")
	d3.select("#" + divId).append("div").attr("id", assoSliderId)
		.style("margin-left", "30px")
	    .style("margin-top", "50px")
        .style("margin-bottom", "30px");

    let mapIconGroupId = this.divId + "mapIconGroup";
    let mapIconGroup = d3.select("#" + this.divId).append("div").attr("id", mapIconGroupId);
    
    let assoMapId = this.divId + "map";
	mapIconGroup.append("div").attr("id", assoMapId)
		.style("margin-top", "50px")
		.style("height", "520px")
		.style("width", "1000px")
		.style("border", "1px solid #777");
	let coffeeIconDiv = mapIconGroup.selectAll(".coffeeIconUnderMap").data([0, 1, 2, 3, 4])
		.enter().append("div")
		.style("position", "relative")
		.style("width", "180px").style("height", "100px")
		.style("margin", "10px 10px 10px 10px")
		.style("border","2px solid #8da0cb")
		.style("background", "#FDFAF0")
		.style("border-radius", "25px")
		.style("display", "inline-block")
		.attr("class", "coffeeIconUnderMap");
	coffeeIconDiv.append("div").attr("class", "coffeeDetail")
		.style("display", "inline-block").style("margin-left", "10px");
	coffeeIconDiv.append("img").attr("src", coffeeBeanPath)
			.style("position", "absolute")
			.style("bottom", 0)
			.style("right", 0)
			.style("width", "120px")
			.style("height", "80px");

	this.worldMap = new mapVis.worldMap(assoMapId, 4, "Explore Coffee Choice", "UserPreference");
	this.worldMap.assoPreferenceVis = this;
	let selectedAttributes = ['aroma', 'flavor', 'aftertaste', 'sweetness',];//'acidity', 'uniformity', 'sweetness'];
	this.sliders = new slider.sliders(assoSliderId, selectedAttributes, this);
	this.sliders.assoPreferenceVis = this;
}

preferenceCombine.prototype.loadData = function(coffeeData) {
	this.data = coffeeData;
	this.sliders.updateRanks();
}

preferenceCombine.prototype.updateVis = function() {
	console.log(this.sliders.topCoffee);
    //console.log(d3.set(Object.keys(selectedCountry)));
    this.worldMap.updateCoffeeSelectedSet(this.sliders.topCoffee);
    d3.select("#" + this.divId).selectAll(".coffeeIconUnderMap").data(this.sliders.topCoffee)
    	.selectAll("div").data(function(d) { return [d]; })
    	.style("padding-top", "8px")
    	.style("padding-left", "3px")
    	.html(function(d) {
    		let htmlContent = "No." + d.rank + " from ";
    		if (d.countryOfOrigin.length >= 10){
    			htmlContent += d.ISOofOrigin
    		} else {
    			htmlContent += d.countryOfOrigin;
    		}
    		htmlContent += "<br>Region:<br>";
    		htmlContent += '<p style="font-size:14px;">'
    		if (d.region === ""){
				htmlContent += "NA";
    		} else {
    			if (d.region.length >= 8){
	    			htmlContent += d.region.substring(0, 8)
	    		} else {
	    			htmlContent += d.region;
	    		}
    		}
    		htmlContent += "</p>"
    		return htmlContent;
    	});
};

export { preferenceCombine };