/* load data */
dataPath = {
	coffeePath: "../data/coffee/Coffee-clean.csv",
	countryCodePath: "../data/country/CountryCode.csv",
	countryGeoPath: "./countries.geojson",
	countryTempPath: "../data/country/temperature-2020_2039.csv",
	countryPrPath: "../data/country/precipitation-2020_2039.csv"
}
countryCodeMap = d3.map();
countryShowingSet = new Set();

/* test for example map */
worldMap = new worldMap("map", 19);

Promise.all([
	d3.csv(dataPath.countryCodePath), // load country code
	d3.json(dataPath.countryGeoPath)  // load country geo
]).then(function(data) {
	data[0].forEach(function(d) {
		countryCodeMap.set(d["ISO3"], d["Country"])
	})
	countryGeoData = data[1];
	countryGeoData.features = countryGeoData.features.filter(function(d) {
		return countryCodeMap.has(d["properties"]["ISO_A3"])? true : false;
	});

	/* calculate the center of country and place in properties attribute */

	/* initial showing all country with coffee */
	countryCodeMap.keys().forEach(function(d) {
		countryShowingSet.add(d)
	});
	worldMap.showCountryGeo(countryGeoData, countryShowingSet);
});