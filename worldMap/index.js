/* load data */
dataPath = {
	coffeePath: "../data/coffee/Coffee-clean.csv",
	countryInfoPath: "../data/country/CoffeeCountryInfo.csv",
	countryGeoPath: "./countries.geojson",
	countryTempPath: "../data/country/temperature-2020_2039.csv",
	countryPrPath: "../data/country/precipitation-2020_2039.csv"
}

var countryInfoMap = d3.map(); // ISO3 -> country info data (average coordinates, iso codes, country name)
var countryGeoData; // country geo data

/* test for example map */
worldMap = new worldMap("map", 19);

Promise.all([
	d3.csv(dataPath.countryInfoPath, function(d) {
		return {
			Country: d.Country,
			ISO3: d.ISO3,
			ISO2: d.ISO2,
			lat: +d.lat,
			lng: +d.lng
		}
	}), // load country code
	d3.json(dataPath.countryGeoPath)  // load country geo
]).then(function(data) {
	let countryInfoData = d3.nest()
		.key(function(d) { return d.ISO3; })
		.object(data[0]);
	data[0].forEach(function(d) {
		countryInfoMap.set(d["ISO3"], countryInfoData[d["ISO3"]][0]);
	})
	countryGeoData = data[1];
	countryGeoData.features = countryGeoData.features.filter(function(d) {
		return countryInfoMap.has(d["properties"]["ISO_A3"])? true : false;
	});

	/* initial showing all country with coffee */
	countryInfoMap.keys().forEach(function(d) {
		worldMap.countryShowSet.add(d)
	});
	worldMap.showCountryGeo();
});