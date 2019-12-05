import * as mapVis from "./vis/worldMap.js"
import * as parallelCoords from "./vis/parallelCoordinates.js"
import * as embedding from "./vis/embedding.js"
import * as hists from "./vis/histograms.js"
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

function coffeeCompareCombine (divId, attributes) {
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

    /* for histograms */
    let assoHistogramVisId = this.divId + "histograms";
    d3.select("#" + divId).append("div").attr("id", assoHistogramVisId)
        .style("margin-top", "30px");

    
    this.worldMap = new mapVis.worldMap(assoMapId, 4, "Coffee World Map", "CoffeeCompare", this);
	this.embedding = new embedding.embedding(assoEmbeddingId, this);
	this.parallelCoords = new parallelCoords.parallelCoordinates(assoBrushingVisId, attributes, this);
    this.histograms = new hists.histograms(assoHistogramVisId, attributes, this);

}





coffeeCompareCombine.prototype.loadData = function(coffeeData) {
	this.data = d3.nest().key(function(d){
	    return d["id"];
	}).object(coffeeData);
	this.countryCode = Object.keys(
		d3.nest().key( function(d){ 
			return d["ISOofOrigin"]; 
		}).object(coffeeData)
	);
	this.parallelCoords.initialParallelCoordinates(coffeeData);
    this.histograms.initialHistograms(coffeeData);
}


coffeeCompareCombine.prototype.togglePCandH = function() {
    if (this.parallelCoords.visible) {
        document.getElementById(this.parallelCoords.divId).style.display = 'none';
        this.parallelCoords.visible = false;
        document.getElementById(this.histograms.divId).style.display = 'block';
        this.histograms.visible = true;
    } else if (this.histograms.visible) {
        document.getElementById(this.parallelCoords.divId).style.display = 'block';
        this.parallelCoords.visible = true;
        document.getElementById(this.histograms.divId).style.display = 'none';
        this.histograms.visible = false;
    }
}

/* called from map and update other vis */
coffeeCompareCombine.prototype.updateCountryClicked = function(countryClickedMap) {
	/* call other vis to update based on the country and color in map */
	this.parallelCoords.updateLineColorSelectedCountry(countryClickedMap);
    this.histograms.updateDotColorSelectedCountry(countryClickedMap);
};

/* called from parallel coordinates and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeParallel = function(selectedCoffeeSet, brushing) {
	/* 
		map do not have coffee data copy and selectedCoffeeSet is a d3.set with only Coffee Id,
		some treatment need to do here to extract coffee country here for map 
	*/
	let assoCoffeeCompareCombine = this;

	let countryCodeShow;
	if (brushing) {  // there is brushing, although the selection might be empty
		/* update based on the selected Coffee Set */
		countryCodeShow = d3.set();
		selectedCoffeeSet.each(function(d) {
			countryCodeShow.add(assoCoffeeCompareCombine.data[d][0]["ISOofOrigin"])
		})

		/* some treatment for embedding to show selected coffee set */


	} else {
		/* restore the map show all country */
		countryCodeShow = d3.set(assoCoffeeCompareCombine.countryCode);

		/* some treatment for embedding to show initial look */
	}
	this.worldMap.updateCoffeeSelectedSet(countryCodeShow);
}

/* called from brush hist and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeHist = function(selectedCoffeeSet, brushing) {
    let assoCoffeeCompareCombine = this;

    let countryCodeShow;
    if (brushing) {  // there is brushing, although the selection might be empty
        /* update based on the selected Coffee Set */
        countryCodeShow = d3.set();
        selectedCoffeeSet.each(function(d) {
            countryCodeShow.add(assoCoffeeCompareCombine.data[d][0]["ISOofOrigin"])
        })

        /* some treatment for embedding to show selected coffee set */


    } else {
        /* restore the map show all country */
        countryCodeShow = d3.set(assoCoffeeCompareCombine.countryCode);

        /* some treatment for embedding to show initial look */
    }
    this.worldMap.updateCoffeeSelectedSet(countryCodeShow);
}

/* called from embedding and update other vis */
coffeeCompareCombine.prototype.updateSelectedCoffeeEmbedding = function(selectedCoffeeSet) {

}

/* inter change parallel coordinate between brush histor */
export { coffeeCompareCombine };