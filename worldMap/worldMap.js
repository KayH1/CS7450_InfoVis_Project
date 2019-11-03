/*
This file is used to generate world map for specific div component
in the html file, taking the component id as input for initialization
*/
function worldMap(divId, maxZoom) {
	this.divId = divId;
	/* declare meta map attribute */
	var minZoom = 1.5;
	var maxBounds = L.latLngBounds(L.latLng(-60, -150), L.latLng(73, 130));

	this.map = L.map(divId, {
		maxBounds: maxBounds,
		minZoom: minZoom,
		maxZoom: maxZoom
	}).setView(new L.LatLng(21, -5), minZoom);
	this.map.setMaxBounds(maxBounds);

	// add pane to map for showing country name
	this.map.createPane('labelLayer');
	// set the stack position of added pane layer
	this.map.getPane('labelLayer').style.zIndex = 550;
	// make the mouse event go through the event and reach below
	this.map.getPane('labelLayer').style.pointerEvents = 'none';

	// add pane to map for svg
	this.map.createPane('svgLayer');
	// set the stack position of added pane layer
	this.map.getPane('svgLayer').style.zIndex = 300;
	// make the mouse event go through the event and reach below
	this.map.getPane('svgLayer').style.pointerEvents = 'none';

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
		maxZoom: minZoom + 1,
		minZoom: minZoom,
		pane: 'labelLayer'
	});
	this.svgLayer = L.svg({
		pane: 'svgLayer'
	});
	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.svgLayer.addTo(this.map);
	this.labelLayer.addTo(this.map);

	var svg = d3.select('#'+ this.divId).select('svg');
	var svgSize = {width: svg.attr("width"), height: svg.attr("height")};
	svg.append('text')
		.attr("transform", "translate(" + svgSize.width/2 + ", 100)" )
		.text("Coffee World");
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
worldMap.prototype.showCountryGeo = function(countryGeoData, countryShowingSet) {
	if (this.countryLayer != undefined)
		this.map.removeLayer(this.countryLayer);


	var associatedMap = this;
	this.countryLayer = L.geoJson(countryGeoData, {
		style: this.countryGeoStyle,
		filter: function(feature) {
			return countryShowingSet.has(feature["properties"]["ISO_A3"])? true : false;
		},
		onEachFeature: function(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				dblclick: zoomToFeature
			});
			layer.associatedMap = associatedMap;
		},
		pane: 'countryLayer'
	})
	this.countryLayer.addTo(this.map);
	
	/* use d3 to add coffee bean effect */

}

worldMap.prototype.addCountryTooltip = function(countryData) {
	
}

worldMap.prototype.updateCountryPin = function(countryData) {

}
/* end map function */

/* for map interaction */
function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	/* generate tooltip */
}

function resetHighlight(e) {
	this.associatedMap.countryLayer.resetStyle(e.target);
	/* tooltip disappear */
}

function zoomToFeature(e) {
	this.associatedMap.map.fitBounds(e.target.getBounds());
}
/* end map interaction */