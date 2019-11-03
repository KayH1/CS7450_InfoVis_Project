/*
This file is used to generate world map for specific div component
in the html file, taking the component id as input for initialization
*/
function worldMap(divId, maxZoom) {
	this.divId = divId;
	/* declare meta map attribute */
	this.map = L.map(divId).setView(new L.LatLng(0, 0), 1.5);;
	// add tile layer for map
	this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
		//attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: maxZoom
	});
	this.labelLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
		//attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: maxZoom
	});
	// add pane to map for showing country name
	this.map.createPane('countryName');
	// set the stack position of added pane layer
	this.map.getPane('countryName').style.zIndex = 550;
	// make the mouse event go through the event and reach below
	this.map.getPane('countryName').style.pointerEvents = 'none';

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	//this.labelLayer.addTo(this.map);
}

/* for map style */
worldMap.prototype.countryGeoStyle = function(f) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '4',
        fillOpacity: 0.7,
        fillColor: '#654321'
    }
}

/* end map style */

/* for map function */
worldMap.prototype.showCountryGeo = function(countryGeoData, countryShowingSet) {
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
				click: zoomToFeature
			});
			layer.associatedMap = associatedMap;
		}
	})
	this.countryLayer.addTo(this.map);
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
}

function resetHighlight(e) {
	this.associatedMap.countryLayer.resetStyle(e.target);
}

function zoomToFeature(e) {
	this.associatedMap.map.fitBounds(e.target.getBounds());
}
/* end map interaction */