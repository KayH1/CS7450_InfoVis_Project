import * as mapVis from "./vis/worldMap.js"
import * as parallelCoords from "./vis/parallelCoordinates.js"
import * as embedding from "./vis/embedding.js"

/*
    <div id="complexVis" style="padding: 100px 0px 50px 0px;">
        <div id="MapEmbedding" style="display: table;margin-left: auto;margin-right: auto;">
            <div id="complexVismap" style="display: inline-block;height: 520px; width: 1000px; border: 1px solid #777;"></div>   
            <div id="complexVisembedding" style="margin-left: 20px;display: inline-block;">
                <svg class="embeddings" width="450" height="520">
                </svg>
            </div>
        </div>
        <div id="complexVisbrushing" style="margin-top: 30px;">
            <center><svg class="parallel-coords" width="1450" height="360">
            </svg></center>
        </div>
    </div>
*/

function coffeeCompareCombine (divId) {
	this.divId = divId;
	let mapEmbeddingDiv = d3.select("#" + this.divId).append("div").attr("id", "MapEmbedding")
		.style("display", "table")
		.style("margin-left", "auto")
		.style("margin-right", "auto");
	
	/* for map */
	let assoMapId = this.divId + "map";
	mapEmbeddingDiv.append("div").attr("id", assoMapId)
		.style("margin-top", "50px")
		.style("height", "520px")
		.style("width", "1000px")
		.style("border", "1px solid #777")
		.style("display", "inline-block");

	/* for embedding */
	let assoEmbeddingId = this.divId + "embedding"
	mapEmbeddingDiv.append("div").attr("id", assoEmbeddingId)
		.style("margin-left", "20px")
		.style("display", "inline-block");

	/* for parallel coordinate or brushing hist */
	let assoBrushingVisId = this.divId + "brushing"
	d3.select("#" + divId).append("div").attr("id", assoBrushingVisId)
		.style("margin-top", "30px");

	this.worldMap = new mapVis.worldMap(assoMapId, 4, "Coffee World Map", "CoffeeCompare", this);
	this.embedding = new embedding.embedding(assoEmbeddingId);
	this.parallelCoords = new parallelCoords.parallelCoordinates(assoBrushingVisId);
}

coffeeCompareCombine.prototype.loadData = function(coffeeData) {
	this.data = d3.nest().key(function(d){
	    return d["id"];
	}).object(coffeeData);
	this.parallelCoords.initialParallelCoordinates(coffeeData);
}

/* called from map and update other vis */
coffeeCompareCombine.prototype.updateCountryClicked = function(countryClickedMap) {
	/* call other vis to update based on the country and color in map */
	this.parallelCoords.updateLineColorSelectedCountry(countryClickedMap);
};

/* called from parallel coordinates and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeParallel = function(selectedCoffeeSet, brushing) {
	/* 
		since map do not have coffee data copy and selectedCoffeeSet is a d3.set with only Coffee Id
		some treatment need to do here to extract coffee country here for map 
	*/
	if (brushing) {
		/* update based on the selected Coffee Set */
	} else {
		/* there is no brush, restore other vis to initial state */
	}

}

/* called from brush hist and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeHist = function(selectedCoffeeSet) {

}

/* called from embedding and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeEmbedding = function(selectedCoffeeSet) {

}

/* inter change parallel coordinate between brush histor */
export { coffeeCompareCombine };