function worldMap(divId, maxZoom, title, mapType) {
	/* add divId of world map */
	this.divId = divId;
	/* add title of world map */
	this.mapTitle = title;
	/* add set to record which country to show */
	this.countryShowSet = d3.set()
	/* add mapType of world map */
	this.mapType = mapType;
	
	/* declare meta map attribute */
	var minZoom = 2;
	this.mapInitialCenter = new L.LatLng(21, -5);
	var maxBounds = L.latLngBounds(L.latLng(-60, -150), L.latLng(73, 130));

	this.map = L.map(divId, {
		maxBounds: maxBounds,
		minZoom: minZoom,
		maxZoom: maxZoom
	}).setView(this.mapInitialCenter, minZoom);
	this.map.associatedMap = this;
	this.map.setMaxBounds(maxBounds);

	this.mapInitialCenterPoint = this.map.latLngToLayerPoint(this.mapInitialCenter);

	// add pane to map for showing country name
	this.map.createPane('labelLayer');
	// set the stack position of added pane layer
	this.map.getPane('labelLayer').style.zIndex = 350;
	// make the mouse event go through the event and reach below
	this.map.getPane('labelLayer').style.pointerEvents = 'none';

	// add pane to map for svg
	this.map.createPane('svgLayer');
	// set the stack position of added pane layer
	this.map.getPane('svgLayer').style.zIndex = 400;
	// make the mouse event go through the event and reach below
	this.map.getPane('svgLayer').style.pointerEvents = 'none';

	// add pane to map for country name tooltip
	this.map.createPane('nameTooltipLayer');
	// set the stack position of added pane layer
	this.map.getPane('nameTooltipLayer').style.zIndex = 575;
	// make the mouse event go through the event and reach below
	this.map.getPane('nameTooltipLayer').style.pointerEvents = 'none';

	// add pane to map for country layer
	this.map.createPane('countryLayer');
	// set the stack position of added pane layer
	this.map.getPane('countryLayer').style.zIndex = 200;

	// add tile layer for map
	this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
		//attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: maxZoom,
		minZoom: minZoom,
	});
	this.labelLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
		//attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: maxZoom,
		minZoom: minZoom,
		pane: 'labelLayer'
	});
	this.svgLayer = L.svg({
		pane: 'svgLayer'
	});

	if (this.mapType == worldMapType.get("CoffeeCompare")){
		this.countryClickedMap = d3.map()
		this.countryInfoColorMap = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"];
		this.countryCompareInfo = L.control();
		this.countryCompareInfo.associatedMap = this;
		this.countryCompareInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'countryCompareInfo');
			return this._div;
		}
		this.countryCompareInfo.addTo(this.map);
		let appenddiv = d3.select("#" + this.divId).select(".countryCompareInfo")
			.attr("width", 200)
			.attr("height", 30);
		appenddiv.append("h3")
			.text("Country Comparison");
		this.climateXscale = d3.scaleBand()
			.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
			.range([20, 175])
			.padding(0.02);
		L.DomUtil.setPosition(this.countryCompareInfo._div, L.point(-782, 250));
	}

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.tileLayer.associatedMap = this;
	this.svgLayer.addTo(this.map);
	this.svgLayer.associatedMap = this;
	this.labelLayer.addTo(this.map);
	this.labelLayer.associatedMap = this;
	d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");

	// add listener for zoom end and move end
	this.map.on('zoomend', updateCountryLabel);
	this.map.on('moveend', updateMapTitle);
}

/* for map style */
worldMap.prototype.countryGeoStyle = function(f) {
    return {
        weight: 1,
        opacity: 0.7,
        color: '#fc9272',
        dashArray: '4',
        fillOpacity: 0.7,
        fillColor: '#654321'
    }
}
/* end map style */

/* for map function */
magicParameter = {
	BRA: {direction: "right", latoffset: -9, lngoffset: -5},//
	UMI: {direction: "right", latoffset: -2, lngoffset: 10},
	MMR: {direction: "right", latoffset: -5, lngoffset: -5},//
	CIV: {direction: "top", latoffset: -10, lngoffset: 0},//
	THA: {direction: "left", latoffset: -7, lngoffset: 5},//
	JPN: {direction: "right", latoffset: -5, lngoffset: -5},//
	ECU: {direction: "right", latoffset: -10, lngoffset: 0},//
	MWI: {direction: "right", latoffset: -10, lngoffset: -5},//
	MUS: {direction: "right", latoffset: -12, lngoffset: -10},//
	PAN: {direction: "right", latoffset: -8, lngoffset: -5},//
	VNM: {direction: "bottom", latoffset: -5, lngoffset: 3},//
	PER: {direction: "left", latoffset: -9, lngoffset: 3}, //
	ZMB: {direction: "bottom", latoffset: -1, lngoffset: -1},//
	IND: {direction: "left", latoffset: -10, lngoffset: 0},//
	LAO: {direction: "right", latoffset: -9, lngoffset: -5},//
	TWN: {direction: "right", latoffset: -9, lngoffset: -5},//
	NIC: {direction: "left", latoffset: -11, lngoffset: 5},//
	CHN: {direction: "left", latoffset: -11, lngoffset: 10},//
	BDI: {direction: "top", latoffset: 0, lngoffset: 0},//
	CRI: {direction: "right", latoffset: -10, lngoffset: 18},//
	USA: {direction: "right", latoffset: -15, lngoffset: -60},//
	IDN: {direction: "right", latoffset: -12, lngoffset: -10},//
	UGA: {direction: "right", latoffset: -7, lngoffset: -10},//
	MEX: {direction: "left", latoffset: -9, lngoffset: 8},//
	GTM: {direction: "right", latoffset: -11, lngoffset: -3},//
	COL: {direction: "left", latoffset: -9, lngoffset: 6},//
	HTI: {direction: "right", latoffset: -9, lngoffset: 0},//
	HND: {direction: "left", latoffset: -9, lngoffset: 3},//
	ETH: {direction: "right", latoffset: -8, lngoffset: -5},//
	KEN: {direction: "right", latoffset: -11, lngoffset: -5},//
	TZA: {direction: "right", latoffset: -10, lngoffset: -5},//
	PNG: {direction: "top", latoffset: -10, lngoffset: 0},//
	RWA: {direction: "left", latoffset: -3, lngoffset: 5},//
	SLV: {direction: "top", latoffset: -2, lngoffset: 5}, //
	PRI: {direction: "right", latoffset: 0, lngoffset: -5},//
	PHL: {direction: "right", latoffset: -9, lngoffset: -5},//
}

worldMap.prototype.showCountryGeo = function() {
	this.map.setZoom(this.map.getMinZoom());
	/* use d3 to add coffee bean effect */

	/* todo, not finish yet */

	/* end coffee bean effect */

	/* for country compare function */

	var whetherInitial = false;
	if (this.countryLayer != undefined){
		this.map.removeLayer(this.countryLayer);
	} else {
		/* first time to set up map, all country is in set */
		whetherInitial = true;
		this.countryNameMarkerMap = d3.map();
	}

	var associatedMap = this;
	this.countryLayer = L.geoJson(countryGeoData, {
		style: this.countryGeoStyle,
		filter: function(feature) {
			return associatedMap.countryShowSet.has(feature["properties"]["ISO_A3"])? true : false;
		},
		onEachFeature: function(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				dblclick: zoomToFeature,
				click: updateSelectedCountrySet
			});
			/* record the top object */
			layer.associatedMap = associatedMap;
			let countryInfo = countryInfoMap.get(layer.feature["properties"]["ISO_A3"]);
			let offset = [20, -20];
			if (countryInfo["ISO3"] == "JPN" || countryInfo["ISO3"] == "PNG")
				offset = [-50, 50];
			
			let htmlContent = countryInfo["Country"] + "  \
				<img src='../data/country/flags/64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' style='width:48px;height:48px;float:right;'><br/>\
				#Coffee:&nbsp;&nbsp;5<br/>\
				AVG Rating:&nbsp;&nbsp;4.5<br/>\
				Rating Range:&nbsp;[min, max]<br/>\
				World Ranking:&nbsp;&nbsp;-1";
			
			if (countryInfo["ISO3"] == "USA" || countryInfo["ISO3"] == "TZA" || countryInfo["ISO3"] == "PNG"){
				htmlContent = countryInfo["Country"] + "<br/>\
					#Coffee:&nbsp;&nbsp;5<img src='../data/country/flags/64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' \
					style='width:48px;height:48px;float:right;display:block;position:absolute;top:10px;right:10px;'><br/>\
					AVG Rating:&nbsp;&nbsp;4.5<br/>\
					Rating Range:&nbsp;[min, max]<br/>\
					World Ranking:&nbsp;&nbsp;-1";
			}

			if(associatedMap.mapType == worldMapType.get("CoffeeCompare")){
				layer.selected = false;
			}
			
			layer.bindTooltip(htmlContent, {
					className: "countryInfoTooltip",
					offset: offset,
					direction: "top"
				});
			},
		pane: 'countryLayer'
	})

	if (whetherInitial) {
		let generateSeparateGeo = d3.map();
		countryGeoData.features.forEach(function(countryGeoFeature) {
			let extractedFeature = {type: "FeatureCollection", features: [countryGeoFeature]};
			generateSeparateGeo.set(countryGeoFeature["properties"]["ISO_A3"], extractedFeature);
		})

		let countryNamePositions = new Array();
		this.countryLayer.eachLayer(function(layer) {
			let ISO3code = layer.feature["properties"]["ISO_A3"];
			let centroid = turf.centerOfMass(generateSeparateGeo.get(ISO3code)).geometry.coordinates;
  			countryNamePositions.push({position: new L.LatLng(centroid[1] + magicParameter[ISO3code]["latoffset"], centroid[0] + magicParameter[ISO3code]["lngoffset"]), ISO3: ISO3code});
		});

		countryNamePositions.forEach(function(d) {
			let countryNameMarker = new L.marker([d.position.lat, d.position.lng], { opacity: 0.01, pane: 'nameTooltipLayer' });
			countryNameMarker.bindTooltip(countryInfoMap.get(d.ISO3)["Country"].length <= 12 || d.ISO3 == "CIV" ? countryInfoMap.get(d.ISO3)["Country"] : d.ISO3, {
				permanent: true, 
				className: "countryNameLabel", 
				offset: [0, 0], 
				direction: magicParameter[d.ISO3]["direction"]
			});
			associatedMap.countryNameMarkerMap.set(d.ISO3, countryNameMarker)
		});
	}

	if (this.mapType == worldMapType.get("CoffeeCompare")){
		this.countryClickedMap.clear();
		this.updateCountryInfoCompare();
	}

	if (this.mapType == worldMapType.get("UserPreference")){
		/* we can get ISO3 - coffee map */
		this.updateCoffeeMarker();
	}

	/* show country name label for country compare */
	updateCountryLabel.call(this.map);
	/* show coffee bean with label for user selected top coffee */

	this.countryLayer.addTo(this.map);
	this.countryLayer.associatedMap = this;
}

worldMap.prototype.updateCountryInfoCompare = function() {
	if (this.mapType == worldMapType.get("CoffeeCompare")){
		let associatedMap = this;
		let appenddiv = d3.select("#" + this.divId).select(".countryCompareInfo");
		let tempSVG = appenddiv.select("#" + this.divId + "tempDash");
		let prSVG = appenddiv.select("#" + this.divId + "prDash");
		let brGroup = appenddiv.selectAll("br");

		if (this.countryClickedMap.size() == 0) {
			if (!tempSVG.empty()){
				tempSVG.remove();
			}
			if (!prSVG.empty()){
				prSVG.remove();
			}
			if (!brGroup.empty()){
				brGroup.remove();
			}
			appenddiv.attr("width", 200)
				.attr("height", 30);
		} else {
			appenddiv.attr("width", 200)
				.attr("height", 210);
			if (tempSVG.empty()){
				tempSVG = appenddiv.append("svg")
					.attr("id", this.divId + "tempDash")
					.attr("width", 180)
					.attr("height", 90)
					.style("margin", 0);
				tempSVG.selectAll("#temptitle")
					.data(["Temperature MAVG (°C)"])
					.enter().append("text")
					.attr("id", "temptitle")
					.text(d=>d)
					.attr("transform", "translate(" + (tempSVG.attr("width")/2) + ", 10)")
					.style("font-weight", "bold")
					.style("font-size", 10)
					.style("text-anchor", "middle");
				tempSVG.selectAll("#tempsubtitle")
					.data(["predicted"])
					.enter().append("text")
					.attr("id", "tempsubtitle")
					.text(d=>d)
					.attr("transform", "translate(" + (tempSVG.attr("width")/2) + ", 18)")
					.style("font-weight", "bold")
					.style("font-size", 8)
					.style("text-anchor", "middle");
			}
			if (brGroup.empty()){
				brGroup = appenddiv.append("br");
			}
			if (prSVG.empty()){
				prSVG = appenddiv.append("svg")
					.attr("id", this.divId + "prDash")
					.attr("width", 180)
					.attr("height", 105)
					.style("margin", 0);
				prSVG.selectAll("#prtitle")
					.data(["Precipitation MAVG (mm)"])
					.enter().append("text")
					.attr("id", "prtitle")
					.text(d=>d)
					.attr("transform", "translate(" + (prSVG.attr("width")/2) + ", 10)")
					.style("font-weight", "bold")
					.style("font-size", 10)
					.style("text-anchor", "middle");
				prSVG.selectAll("#prsubtitle")
					.data(["predicted"])
					.enter().append("text")
					.attr("id", "prsubtitle")
					.text(d=>d)
					.attr("transform", "translate(" + (tempSVG.attr("width")/2) + ", 18)")
					.style("font-weight", "bold")
					.style("font-size",8)
					.style("text-anchor", "middle");
			}
			/* plot the svg line chart */
			let lineChartData = [];
			this.countryClickedMap.keys().forEach(function(countryCode) {
				lineChartData.push({CountryCode: countryCode, Climate: countryClimateMap.get(countryCode)})
			})
			let tempRange = [
				d3.min([d3.min(lineChartData, function(d) {
					return d3.min(d.Climate.temp);
				}), 0]),
				d3.max([d3.max(lineChartData, function(d) {
					return d3.max(d.Climate.temp);
				}), 38])
			];
			let prRange = [
				d3.min([d3.min(lineChartData, function(d) {
					return d3.min(d.Climate.pr);
				}), 50]),
				d3.max([d3.max(lineChartData, function(d) {
					return d3.max(d.Climate.pr);
				}), 150])
			];

			var tempScale = d3.scaleLinear()
        		.domain(tempRange)
        		.range([75, 10]);

        	var prScale = d3.scaleLinear()
        		.domain(prRange)
        		.range([75, 10]);

        	let xAxisTemp = tempSVG.select(".x-axis");
        	if (xAxisTemp.empty()){
        		xAxisTemp = tempSVG.append("g").attr("class", "x-axis").attr("transform", "translate(0, 75)").call(d3.axisBottom(this.climateXscale).tickSize(0));
        		xAxisTemp.selectAll("text").filter(function(d, i){
        			return i%2 == 0? true : false; 
        		}).remove();
            }
        	
        	let yAxisTemp = tempSVG.select(".y-axis");
        	if (yAxisTemp.empty())
        		yAxisTemp = tempSVG.append("g").attr("class", "y-axis").attr("transform", "translate(20,0)");
        	yAxisTemp.call(d3.axisLeft(tempScale).tickSize(0).ticks(6));

        	let xAxisPr = prSVG.select(".x-axis");
        	if (xAxisPr.empty()){
        		xAxisPr = prSVG.append("g").attr("class", "x-axis").attr("transform", "translate(0, 75)").call(d3.axisBottom(this.climateXscale).tickSize(0));
        		xAxisPr.selectAll("text").filter(function(d, i){
        			return i%2 == 0? true : false; 
        		}).remove();
        	}

        	let yAxisPr = prSVG.select(".y-axis");
        	if (yAxisPr.empty())
        		yAxisPr = prSVG.append("g").attr("class", "y-axis").attr("transform", "translate(20,0)");
        	yAxisPr.call(d3.axisLeft(prScale).tickSize(0).ticks(6));
			
			let presentClimateLegend = prSVG.selectAll(".countryLegend")
				.data(lineChartData);
			presentClimateLegend.enter()
				.append("rect")
				.attr("class", "countryLegend")
				.attr("width", 15)
				.attr("height", 15)
				.merge(presentClimateLegend)
				.attr("x", function(d, i){
					return 3 + i * 45;
				})
				.attr("y", 90)
				.attr("fill", function(d, i){
					return associatedMap.countryInfoColorMap[associatedMap.countryClickedMap.get(d.CountryCode)];
				});
			presentClimateLegend.exit().remove();

			let presentClimateLegendText = prSVG.selectAll(".countryLegendText")
				.data(lineChartData);
			presentClimateLegendText.enter()
				.append("text")
				.attr("class", "countryLegendText")
				.attr("width", 15)
				.attr("height", 15)
				.merge(presentClimateLegendText)
				.attr("x", function(d, i){
					return 21 + i * 45;
				})
				.attr("y", 102)
				.text(d=>d.CountryCode)
				.style("font-size", 15)
				.style("font-weight", "bold");
			presentClimateLegendText.exit().remove();

			/* plot line chart */
			let climateXscale = this.climateXscale;
			let climateMonth = this.climateXscale.domain();
			var tempLine = d3.line().x(function(d, i) { return climateXscale(climateMonth[i]); })
        		.y(function(d) { return tempScale(d); })
        		.curve(d3.curveMonotoneX);

			var prLine = d3.line()
				.x(function(d, i) { return climateXscale(climateMonth[i]); })
        		.y(function(d) { return prScale(d); })
        		.curve(d3.curveMonotoneX);

        	let presentTempLine = tempSVG.selectAll(".linePlot").data(lineChartData);
			presentTempLine.enter().append("path").attr("class", "linePlot")
				.merge(presentTempLine)
			    .attr('d', function(d){ return tempLine(d.Climate.temp); })
			    .style('stroke', function(d, i) { return associatedMap.countryInfoColorMap[associatedMap.countryClickedMap.get(d.CountryCode)]; })
			    .style('stroke-width', 2)
			    .style("fill", "none");
			presentTempLine.exit().remove();

        	let presentPrLine = prSVG.selectAll(".linePlot").data(lineChartData);
			presentPrLine.enter().append("path").attr("class", "linePlot")
				.merge(presentPrLine)
			    .attr('d', function(d){ return prLine(d.Climate.pr); })
			    .style('stroke', function(d, i) { return associatedMap.countryInfoColorMap[associatedMap.countryClickedMap.get(d.CountryCode)]; })
			    .style('stroke-width', 2)
			    .style("fill", "none");
			presentPrLine.exit().remove();
		}
	}
}

worldMap.prototype.updateCoffeeMarker = function() {
	if (this.mapType == worldMapType.get("UserPreference")){
		console.log("Update based on the iso coffee map");
	}
}
/* end map function */

/* for map interaction */
function highlightFeature(e) {
	let layer = e.target;

	if(this.associatedMap.mapType == worldMapType.get("CoffeeCompare") && layer.selected)
		return;

	layer.setStyle({
		weight: 5,
		color: '#fb8072',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
	if(this.associatedMap.mapType == worldMapType.get("CoffeeCompare") && this.selected)
		return;

	this.associatedMap.countryLayer.resetStyle(e.target);
}

function zoomToFeature(e) {
	this.associatedMap.map.fitBounds(e.target.getBounds());
}

function updateCountryLabel(e) {
	let associatedMap = this.associatedMap;

	if (this.getZoom() == this.getMinZoom()){
		associatedMap.countryNameMarkerMap.keys().forEach(function(key) {
			if (associatedMap.countryShowSet.has(key)){
				associatedMap.countryNameMarkerMap.get(key).addTo(associatedMap.map);
			} else {
				if (associatedMap.map.hasLayer(associatedMap.countryNameMarkerMap.get(key)))
					associatedMap.map.removeLayer(associatedMap.countryNameMarkerMap.get(key));
			}
		});
	} else {
		associatedMap.countryNameMarkerMap.keys().forEach(function(key) {
			if (associatedMap.map.hasLayer(associatedMap.countryNameMarkerMap.get(key)))
				associatedMap.map.removeLayer(associatedMap.countryNameMarkerMap.get(key));
		});
	}
}

function updateMapTitle(e) {
	let associatedMap = this.associatedMap;
	let svg = d3.select('#'+ associatedMap.divId).select("#" + associatedMap.divId + "geoSvg");
	let mapTitle = svg.select("#" + associatedMap.divId + "mapTitle");

	if (mapTitle.empty()){
		mapTitle = svg.append("text")
			.attr("id", associatedMap.divId + "mapTitle")
			.text(associatedMap.mapTitle);
	}
	let mapBound = associatedMap.map.getBounds();
	let titlePosition = L.latLng({lat: mapBound["_southWest"].lat + (mapBound["_northEast"].lat - mapBound["_southWest"].lat) * 0.85, lng: 1.08 * (mapBound["_northEast"].lng + mapBound["_southWest"].lng)/2});
	mapTitle.attr("x", associatedMap.map.latLngToLayerPoint(titlePosition).x)
		.attr("y", associatedMap.map.latLngToLayerPoint(titlePosition).y);
}

/* update selectedCountrySet when layer selected */
function updateSelectedCountrySet(e) {
	let associatedMap = this.associatedMap;
	let layer = e.target;

	if (associatedMap.mapType == worldMapType.get("CoffeeCompare")){
		if (associatedMap.countryClickedMap.has(layer.feature["properties"]["ISO_A3"])){
			associatedMap.countryClickedMap.remove(layer.feature["properties"]["ISO_A3"]);
			layer.selected = false;
			this.associatedMap.countryLayer.resetStyle(e.target);
			associatedMap.updateCountryInfoCompare();
		} else {
			if (associatedMap.countryClickedMap.size() < associatedMap.countryInfoColorMap.length) {
				layer.selected = true;
				let colorCandidate = [0, 1, 2, 3];
				let colorAssigned = d3.set(associatedMap.countryClickedMap.values());
				console.log(colorAssigned);
				let colorToAssign = colorCandidate.filter(function(d) {
					return colorAssigned.has(d)? false : true;
				})[0]
				associatedMap.countryClickedMap.set(layer.feature["properties"]["ISO_A3"], colorToAssign);
				
				layer.setStyle({
					weight: 8,
					color: associatedMap.countryInfoColorMap[colorToAssign],
					dashArray: '2',
					fillOpacity: 0.7
				});
				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
					layer.bringToFront();
				}
				associatedMap.updateCountryInfoCompare();
			}
		}
	}
}
/* end map interaction */