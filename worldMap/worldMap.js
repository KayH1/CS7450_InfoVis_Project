/*
This file is used to generate world map for specific div component
in the html file, taking the component id as input for initialization
*/
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
		maxZoom: maxZoom,
		zoomDelta: 0.5
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
		this.countryClickedSet = d3.set()
		this.countryCompareInfo = L.control();
		this.countryCompareInfo.associatedMap = this;
		this.countryCompareInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'countryCompareInfo');
			return this._div;
		}
		this.countryCompareInfo.addTo(this.map);
		let appenddiv = d3.select("#" + this.divId).select(".countryCompareInfo")
			.attr("width", 200)
			.attr("height", 30)
			.style("z-index", 300);
		appenddiv.append("h3")
			.text("Country Comparison")
		/*
		appenddiv.append("svg")
			.attr("id", "tempDash")
			.attr("width", 195)
			.attr("height", 0)
			.style("margin", 0);
		appenddiv.append("br");
		appenddiv.append("svg")
			.attr("id", "prDash")
			.attr("width", 195)
			.attr("height", 0)
			.style("margin", 0);
		*/
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
				dblclick: zoomToFeature
			});
			/* record the top object */
			layer.associatedMap = associatedMap;
			/* record whether the layer is cliced or not */
			layer.clicked = false;
			let countryInfo = countryInfoMap.get(layer.feature["properties"]["ISO_A3"]);
			let offset = [20, -20];
			if (countryInfo["ISO3"] == "JPN" || countryInfo["ISO3"] == "PNG")
				offset = [-50, 50];
			
			let htmlContent = countryInfo["Country"] + "  \
				<img src='../data/country/flags/64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' style='width:48px;height:48px;float:right;'><br/>\
				#Coffee:&nbsp;&nbsp;5<br/>\
				Coffee AVG Rating:&nbsp;&nbsp;4.5<br/>\
				World Ranking:&nbsp;&nbsp;-1";
			
			if (countryInfo["ISO3"] == "USA" || countryInfo["ISO3"] == "TZA" || countryInfo["ISO3"] == "PNG"){
				htmlContent = countryInfo["Country"] + "<br/>\
					#Coffee:&nbsp;&nbsp;5<img src='../data/country/flags/64/" + countryInfo["ISO2"] + "_64.png' alt='Flag' \
					style='width:48px;height:48px;float:right;display:block;position:absolute;top:10px;right:10px;'><br/>\
					Coffee AVG Rating:&nbsp;&nbsp;4.5<br/>\
					World Ranking:&nbsp;&nbsp;-1";
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
	/* show country name label for country compare */
	updateCountryLabel.call(this.map);
	/* show coffee bean with label for user selected top coffee */

	this.countryLayer.addTo(this.map);
	this.countryLayer.associatedMap = this;
}
/* end map function */

/* for map interaction */
function highlightFeature(e) {
	let layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#fe9929',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
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
	console.log(titlePosition);
	mapTitle.attr("x", associatedMap.map.latLngToLayerPoint(titlePosition).x)
		.attr("y", associatedMap.map.latLngToLayerPoint(titlePosition).y);
}

function updateCountryInfo(e) {
	if (this.clicked) {
		// remove graph from country info compare
	} else {

	}
}

/* end map interaction */