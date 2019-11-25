import * as slider from "./sliders.js"
import * as mapVis from "./worldMap.js"

var variableList = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'uniformity', 'cleanCup', 'sweetness', 'cupperPoints'];

function preferenceCombine (divId) {
	this.divId = divId;
	let assoMapId = this.divId + "map";
	let assoSliderId = this.divId + "sliders";
	d3.select("#" + divId).append("div").attr("id", assoSliderId);
	d3.select("#" + divId).append("div").attr("id", assoMapId)
		.style("height", "520px")
		.style("width", "1000px")
		.style("border", "1px solid #777");
	this.worldMap = new mapVis.worldMap(assoMapId, 4, "Explore Coffee Choice", "UserPreference");
	let selectedAttributes = ['aroma', 'flavor', 'aftertaste', 'acidity', 'sweetness'];
	this.sliders = new slider.sliders(assoSliderId, selectedAttributes, this);
}

preferenceCombine.prototype.loadData = function(coffeeData) {
	this.data = coffeeData;
	this.sliders.updateRanks();
}

preferenceCombine.prototype.updateVis = function() {
	console.log(this.sliders.coffeeNested);
	console.log(this.sliders.topCoffee);
};

export { preferenceCombine };