var worldMapType = d3.map();
worldMapType.set("UserPreference", 1);
worldMapType.set("CoffeeCompare", 2);

var coffeeIconPath = "./worldMap/icons/coffeeBeanTooltip.png";
var countryFlagPath = "./data/country/flags/";

/* if having parentVis and mapType is CoffeeCompare, 
parentVis method will be called in "updateCountryInfoCompare" to
update the clicked country and corresponding color map,
parentVis must have method "updateCountryClicked" */

function worldMap(divId, maxZoom, title, mapType, parentVis=null) {
	/* add data as place holder */
	this.data = {};
	/* add divId of world map */
	this.divId = divId;
	/* add title of world map */
	this.mapTitle = title;
	/* add mapType of world map */
	this.mapType = worldMapType.get(mapType);
	/* add parentVis */
	this.parentVis = parentVis;

	/* declare meta map attribute */
	let minZoom = 2;
	this.mapInitialCenter = new L.LatLng(21, -5);
	var maxBounds = L.latLngBounds(L.latLng(-60, -150), L.latLng(73, 130));

	this.map = L.map(divId, {
		maxBounds: maxBounds,
		minZoom: minZoom,
		maxZoom: maxZoom
	}).setView(this.mapInitialCenter, minZoom);
	this.map.associatedMap = this;
	this.map.setMaxBounds(maxBounds);
	this.previousZoomLevel = -1;

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
	this.svgLayer = L.svg({'pane': 'svgLayer'});

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.tileLayer.associatedMap = this;
	this.svgLayer.addTo(this.map);
	this.svgLayer.associatedMap = this;
	this.labelLayer.addTo(this.map);
	this.labelLayer.associatedMap = this;
	// enable mouse event for svg components
	d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");

	// add listener for zoom end and move end
	this.map.on('zoomend', updateMapZoom);
	this.map.on('moveend', updateMapTitle);

	/* add color legend for country show geo */
		this.countryShowColorLegend = L.control();
		this.countryShowColorLegend.associatedMap = this;
		this.countryShowColorLegend.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'countryShowColorLegend');
			return this._div;
		}
		this.countryShowColorLegend.addTo(this.map);
		let appenddiv = d3.select("#" + this.divId).select(".countryShowColorLegend")
			.attr("width", "280px")
			.attr("height", "40px");
		
		let countryShowColorLegendSVG = appenddiv.append("svg").attr("height", "35px").attr("width", "270px")
			.style("padding", 0).style("margin", "2px");
		
		countryShowColorLegendSVG.selectAll("rect")
			.data(["#654321", "#bdbdbd"])
			.enter()
			.append("rect")
			.attr("class", "countryShowLegendRect")
			.attr("height", "20px")
			.attr("width", "45px")
			.attr("x", function(d, i) {
				if (i == 0) {
					return 5;
				} else if (i == 1) {
					return 128;
				}
			})
			.attr("y", 0)
			.style("fill", d=>d);

		countryShowColorLegendSVG.selectAll("text")
			.data(["Selected", "Not Selected"])
			.enter()
			.append("text")
			.attr("class", "countryShowLegendText")
			.attr("transform", function(d, i) {
				if (i == 0) {
					return "translate(53,15)";
				} else if (i == 1) {
					return "translate(176,15)";
				}
			})
			.text(d=>d);
		L.DomUtil.setPosition(this.countryShowColorLegend._div, L.point(5, -3));
	/* add color legend for country show geo */

	/* add for country climate compare */
	if (this.mapType == worldMapType.get("CoffeeCompare")){
		this.countryClickedMap = d3.map()
		this.countryInfoColorMap = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"];
		this.countryCompareInfo = L.control({position: 'bottomleft'});
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
			.text("Country Comparison")
			.style("padding-left", "3px")
			.style("padding-top", "3px");
		this.climateXscale = d3.scaleBand()
			.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
			.range([20, 190])
			.padding(0.02);
		L.DomUtil.setPosition(this.countryCompareInfo._div, L.point(-5, 5));
	}
}

worldMap.prototype.updateCoffeeSelectedSet = function(coffeeShowInfo) {
	/* update map show coffee */

	/*
		parameter would be a array contain selected coffee along with information for User Preference 
		parameter would be a set contain selected countryC for CoffeeCompare, called by other vis
	*/
	if (this.mapType == worldMapType.get("UserPreference")){
		this.selectedCountryCoffeeInfoMap = d3.nest().key(function(d){
	        return d.ISOofOrigin;
	    }).object(coffeeShowInfo);
	    this.selectedCountryCoffeeInfoHolder = d3.nest().key(function(d){
	        return d.ISOofOrigin;
	    }).entries(coffeeShowInfo);
		this.showCoffeeGeo();
		this.updateCountryShowSet(d3.set(Object.keys(this.selectedCountryCoffeeInfoMap)));
	} else if (this.mapType == worldMapType.get("CoffeeCompare")) {
		this.updateCountryShowSet(coffeeShowInfo);  // coffeeShow is set with country code to show
	}
}

/* ---------------------follow will not be used external, only called within worldMap-------------------------------- */

/* for map tooltip float when min zoom */
var magicParameter = {
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

/* update country show in map based on showCountry */
worldMap.prototype.updateCountryShowSet = function(countryShowSet) {
	/* update map show geo */
	this.countryShowSet = countryShowSet;
	if (this.countryLayer == undefined){
		this.initialCountryGeo();
	}
	this.showCountryGeo();
	updateMapZoom.call(this.map);
}

worldMap.prototype.showCoffeeGeo = function() {
	/*
	var countryCoffeeInfoMap = {
		"CHN": [{country: "CHN", id:"coffee1", rating: 10}, {country: "CHN", id:"coffee2", rating:4}], 
		"USA": [{country: "USA", id:"coffeeUSA", rating:8}]
	}; // fake data for testing
	var countryCoffeeInfoHolder = [
		{key: "CHN", values: [{country: "CHN", id:"coffee1", rating: 10}, {country: "CHN", id:"coffee2", rating:4}]}, 
		{key: "USA", values: [{country: "USA", id:"coffeeUSA", rating:8}]}
	]; // fake data for testing
	*/
	
	let associatedMap = this;
	let svg = d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");
	svg.selectAll(".coffeeIconGroup").remove();
	
	let coffeeIconGroup = svg.selectAll(".coffeeIconGroup")
		.data(associatedMap.selectedCountryCoffeeInfoHolder).enter()
		.append("g").attr("class", "coffeeIconGroup")
		.attr("transform", function(d) {
			let countryInfo = associatedMap.data.countryInfoMap.get(d.key);
			let iconPosition = associatedMap.map.latLngToLayerPoint(new L.LatLng(countryInfo["lat"], countryInfo["lng"]));
			return "translate(" + (iconPosition.x-35) + "," + (iconPosition.y - 55) + ")";
		}).selectAll("coffeeIcon").data(d=>d.values)
		.enter().append("image").attr("class", "coffeeIcon")
		.attr("pointer-events", "visible")
		.attr("href", coffeeIconPath) // address tag
		.style("height", "80px")
		.style("width", "48px")
		.attr("transform", function(d, i) {
			/* check length of coffee data */
			let transformText = "translate(" + i*25 + ",0)";
			if (associatedMap.selectedCountryCoffeeInfoMap[d.ISOofOrigin].length > 1) {
				let step = 30/(associatedMap.selectedCountryCoffeeInfoMap[d.ISOofOrigin].length - 1);
				transformText += " rotate(" + (-15 + step*i) + ",24,40)"
			}
			return transformText;
		})
		.on("mouseover", function(e) {
			/* add highlight for coffee icon */
			let coffeeInfo = d3.select(this).datum();
			let selectedDiv = d3.select("#preferenceVis").selectAll(".coffeeIconUnderMap").filter(function(d, i) {
				return d.rank === coffeeInfo.rank? true : false;
			})
			selectedDiv.style("outline","5px solid #feb24c")
				.style("outline-radius", "15px")
				.style("outline-offset", "-5px")
				.style("background", "rgba(222,184,135,0.7)")
				.style("border-radius", "10px")
				.style("border", "2px solid rgba(0,0,0,0)");
			d3.select(this).transition()
				.style("height", "120px")
				.style("width", "72px")
				.duration(400);
		})
		.on("mouseout", function(e) {
			/* remove highlight for coffee icon */
			let coffeeInfo = d3.select(this).datum();
			let selectedDiv = d3.select("#preferenceVis").selectAll(".coffeeIconUnderMap").filter(function(d, i) {
				return d.rank === coffeeInfo.rank? true : false;
			})
			selectedDiv.style("outline","")
				.style("background", "#FDFAF0")
				.style("outline-offset", "")
				.style("border-radius", "25px")
				.style("border","2px solid #8da0cb");
			d3.select(this).transition()
				.style("height", "80px")
				.style("width", "48px")
				.duration(400);
		});
}

/* for geo map style */
worldMap.prototype.countryGeoShowStyle = function(f) {
    return {
        weight: 1,
        opacity: 0.7,
        color: '#fc9272',
        dashArray: '4',
        fillOpacity: 0.7,
        fillColor: '#654321'
    }
}

worldMap.prototype.countryGeoNotShowStyle = function(f) {
    return {
        weight: 2,
        opacity: 0.7,
        color: '#fdc086',
        dashArray: '4',
        fillOpacity: 0.7,
        fillColor: '#bdbdbd'
    }
}

worldMap.prototype.countrySelectedStyle = function(color) {
	return {
		weight: 8,
		color: color,
		dashArray: '2',
		fillOpacity: 0.7
	}
}
/* end map style */

worldMap.prototype.initialCountryGeo = function() {
	this.map.setZoom(this.map.getMinZoom());
	
	var associatedMap = this;
	this.countryLayer = L.geoJson(this.data.countryGeoData, {
		onEachFeature: function(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				dblclick: zoomToFeature,
				click: updateSelectedCountrySet
			});
			/* record the top object */
			layer.associatedMap = associatedMap;
			let countryInfo = associatedMap.data.countryInfoMap.get(layer.feature["properties"]["ISO_A3"]);
			let countryCoffeeInfo = associatedMap.data.countryCoffeeInfoMap.get(layer.feature["properties"]["ISO_A3"]);

			let offset = [20, -20];
			if (countryInfo["ISO3"] == "JPN" || countryInfo["ISO3"] == "PNG")
				offset = [-50, 50];
			
			/* tooltip content */
				let htmlContent = countryInfo["Country"] + "  \
					<img src='" + countryFlagPath + "64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' style='width:48px;height:48px;float:right;'><br/>\
					#Coffee:&nbsp;&nbsp;" + countryCoffeeInfo["value"]["coffee"].length + "<br/>"
				
				if (countryInfo["ISO3"] == "USA" || countryInfo["ISO3"] == "TZA" || countryInfo["ISO3"] == "PNG"){
					htmlContent = countryInfo["Country"] + "<br/>\
						#Coffee:&nbsp;&nbsp;5<img src='" + countryFlagPath + "64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' \
						style='width:48px;height:48px;float:right;display:block;position:absolute;top:10px;right:10px;'><br/>"
				}

				//htmlContent += "AVG Rating:&nbsp;&nbsp;4.5<br/>Rating Range:&nbsp;[min, max]<br/>World Ranking:&nbsp;&nbsp;-1";
				htmlContent = htmlContent + "AVG Rating:&nbsp;&nbsp;" + countryCoffeeInfo["value"]["meanR"] + "<br/>Rating Range:&nbsp;[" + countryCoffeeInfo["value"]["minR"] + ", " + countryCoffeeInfo["value"]["maxR"] + "]<br/>World Ranking:&nbsp;&nbsp;" + countryCoffeeInfo["value"]["rank"];
			/* tooltip cointent */
			
			layer.bindTooltip(htmlContent, {
					className: "countryInfoTooltip",
					offset: offset,
					direction: "top"
				});
			},
		pane: 'countryLayer'
	})

	//if (this.mapType == worldMapType.get("CoffeeCompare")) {
		this.countryNameMarkerMap = d3.map();
		
		let generateSeparateGeo = d3.map();
		this.data.countryGeoData.features.forEach(function(countryGeoFeature) {
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
			countryNameMarker.bindTooltip(associatedMap.data.countryInfoMap.get(d.ISO3)["Country"].length <= 12 || d.ISO3 == "CIV" ? associatedMap.data.countryInfoMap.get(d.ISO3)["Country"] : d.ISO3, {
				permanent: true, 
				className: "countryNameLabel", 
				offset: [0, 0], 
				direction: magicParameter[d.ISO3]["direction"]
			});
			associatedMap.countryNameMarkerMap.set(d.ISO3, countryNameMarker)
		});
	//}

	this.countryLayer.associatedMap = this;
	this.countryLayer.addTo(this.map);
}

worldMap.prototype.showCountryGeo = function() {
	let associatedMap = this;
	if (this.mapType == worldMapType.get("CoffeeCompare")) {
		/* show country name label for country compare */
		updateMapZoom.call(this.map);
		/* clear selected country set */
		//this.countryClickedMap.clear();
		//this.updateCountryInfoCompare();
		/* remove above to create filter */
	}

	this.map.setZoom(this.map.getMinZoom());
	if (associatedMap.mapType == worldMapType.get("CoffeeCompare")) {
		this.countryLayer.eachLayer(function(layer) {
			/* update selected country style and restore clicked style */
			if (associatedMap.countryShowSet.has(layer.feature["properties"]["ISO_A3"])) {
				layer.setStyle(associatedMap.countryGeoShowStyle());
			} else {
				layer.setStyle(associatedMap.countryGeoNotShowStyle());
			}
			if (associatedMap.countryClickedMap.has(layer.feature["properties"]["ISO_A3"])){
				let colorToAssign = associatedMap.countryClickedMap.get(layer.feature["properties"]["ISO_A3"]);
				layer.setStyle(associatedMap.countrySelectedStyle(associatedMap.countryInfoColorMap[colorToAssign]));
			}
		});
	} else if (associatedMap.mapType == worldMapType.get("UserPreference")) {
		this.countryLayer.eachLayer(function(layer) {
			if (associatedMap.countryShowSet.has(layer.feature["properties"]["ISO_A3"])) {
				layer.setStyle(associatedMap.countryGeoShowStyle());
			} else {
				layer.setStyle(associatedMap.countryGeoNotShowStyle());
			}
		});
	}
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
					.attr("width", 200)
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
					.attr("width", 200)
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
				lineChartData.push({CountryCode: countryCode, Climate: associatedMap.data.countryClimateMap.get(countryCode)})
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
					return 5 + i * 47;
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
					return 22 + i * 47;
				})
				.attr("y", 102)
				.text(d=>d.CountryCode)
				.style("font-size", 12)
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
		/* treat for broadcast present selection country to update the color in embedding and parallel coordinate */
		if (this.parentVis !== null) {
			let countryClickedColorMap = d3.map();
			associatedMap.countryClickedMap.keys().forEach(function(countryCode) {
				countryClickedColorMap.set(countryCode, associatedMap.countryInfoColorMap[associatedMap.countryClickedMap.get(countryCode)]);
			});
			this.parentVis.updateCountryClicked(countryClickedColorMap);
		}
	}
}

worldMap.prototype.showCoffeeBeanEffect = function() {
	/* use d3 to add coffee bean effect, disappear after effect */
}
/* end map function */

/* for map interaction */
function highlightFeature(e) {
	let layer = e.target;
	if (layer.associatedMap.mapType == worldMapType.get("CoffeeCompare") && layer.associatedMap.countryClickedMap.has(layer.feature["properties"]["ISO_A3"]))
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
	if (this.associatedMap.mapType == worldMapType.get("CoffeeCompare") && this.associatedMap.countryClickedMap.has(this.feature["properties"]["ISO_A3"]))
		return;

	if (this.associatedMap.countryShowSet.has(this.feature["properties"]["ISO_A3"])) {
		this.setStyle(this.associatedMap.countryGeoShowStyle());
	} else {
		this.setStyle(this.associatedMap.countryGeoNotShowStyle());
	}
}

function zoomToFeature(e) {
	this.associatedMap.map.fitBounds(e.target.getBounds());
}

function updateMapZoom(e) {
	let associatedMap = this.associatedMap;

	//if (associatedMap.mapType == worldMapType.get("CoffeeCompare")){
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
	//}
	if (associatedMap.mapType == worldMapType.get("UserPreference")){
		d3.select("#" + associatedMap.divId).select("#" + associatedMap.divId + "geoSvg")
			.selectAll(".coffeeIconGroup")
			.attr("transform", function(d) {
				let countryInfo = associatedMap.data.countryInfoMap.get(d.key);
				let iconPosition = associatedMap.map.latLngToLayerPoint(new L.LatLng(countryInfo["lat"], countryInfo["lng"]));
				return "translate(" + (iconPosition.x-24) + "," + (iconPosition.y - 40) + ")";
			});
	}
}

function updateMapTitle(e) {
	let associatedMap = this.associatedMap;
	
	if (this.getZoom() == associatedMap.previousZoomLevel)
		return;
	associatedMap.previousZoomLevel = this.getZoom();
	
	let svg = d3.select('#'+ associatedMap.divId).select("#" + associatedMap.divId + "geoSvg");
	let mapTitle = svg.select("#" + associatedMap.divId + "mapTitle").remove();

	mapTitle = svg.append("text")
		.attr("id", associatedMap.divId + "mapTitle")
		.text(associatedMap.mapTitle);
	let mapBound = associatedMap.map.getBounds();
	let titlePosition = L.latLng({lat: mapBound["_southWest"].lat + (mapBound["_northEast"].lat - mapBound["_southWest"].lat) * 0.85, lng: 1.08 * (mapBound["_northEast"].lng + mapBound["_southWest"].lng)/2});
	
	mapTitle.transition()
		.attr("transform", "translate(" + associatedMap.map.latLngToLayerPoint(titlePosition).x + "," + associatedMap.map.latLngToLayerPoint(titlePosition).y + ")")
		.duration(500);
}

/* update selectedCountrySet when layer selected */
function updateSelectedCountrySet(e) {
	let associatedMap = this.associatedMap;
	let layer = e.target;

	if (associatedMap.mapType == worldMapType.get("CoffeeCompare")){
		if (associatedMap.countryClickedMap.has(layer.feature["properties"]["ISO_A3"])){
			associatedMap.countryClickedMap.remove(layer.feature["properties"]["ISO_A3"]);
			associatedMap.updateCountryInfoCompare();
			if (associatedMap.countryShowSet.has(layer.feature["properties"]["ISO_A3"])) {
				layer.setStyle(associatedMap.countryGeoShowStyle());
			} else {
				layer.setStyle(associatedMap.countryGeoNotShowStyle());
			}
		} else {
			if (associatedMap.countryClickedMap.size() < associatedMap.countryInfoColorMap.length) {
				let colorCandidate = [0, 1, 2, 3];
				let colorAssigned = d3.set(associatedMap.countryClickedMap.values());
				let colorToAssign = colorCandidate.filter(function(d) {
					return colorAssigned.has(d)? false : true;
				})[0]
				associatedMap.countryClickedMap.set(layer.feature["properties"]["ISO_A3"], colorToAssign);
				layer.setStyle(associatedMap.countrySelectedStyle(associatedMap.countryInfoColorMap[colorToAssign]));
				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
					layer.bringToFront();
				}
				associatedMap.updateCountryInfoCompare();
			}
		}
	}
}
/* end map interaction */

/* ---------------------above will not be used external-------------------------------- */

export { worldMap };