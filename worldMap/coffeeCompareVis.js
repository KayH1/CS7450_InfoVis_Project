import * as mapVis from "./vis/worldMap.js"

/*
    <div id="complex" style="padding: 100px 0px 50px 0px;">
        <div id="mapwithcluster" style="display: table;margin-left: auto;margin-right: auto;">
            <div id="countryWorldMap" style="display: inline-block;height: 520px; width: 1000px; border: 1px solid #777;"></div>   
            <div style="margin-left: 20px;display: inline-block;">
                <svg class="embeddings" width="450" height="520">
                </svg>
            </div>
        </div>
        <div style="margin-top: 30px;">
            <center><svg class="parallel-coords" width="1450" height="360">
            </svg></center>
        </div>
    </div>
*/

function coffeeCompareCombine (divId) {
	this.divId = divId;
	d3.select("#" + divId).append()
	let assoMapId = this.divId + "map";

}

/* inter change parallel coordinate between brush histor */


/* function call from different vis */
	function mapCall() {
		/* update parallel and cluster view */
	}

	function paralleCall() {
		/* update map and cluster view */
	}

	function clusterCall() {
		/* update parallel and map view */
	}
/* function call from different vis */