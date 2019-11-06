dataPath = {
	coffeePath: "../data/coffee/Coffee-clean.csv",
	countryInfoPath: "../data/country/CoffeeCountryInfo.csv",
	countryGeoPath: "./countries.geojson",
	countryTempPath: "../data/country/temperature-2020_2039.csv",
	countryPrPath: "../data/country/precipitation-2020_2039.csv"
}

/* map type */
worldMapType = d3.map();
worldMapType.set("UserPreference", 1);
worldMapType.set("CoffeeCompare", 2);

var countryInfoMap = d3.map(); // ISO3 -> country info data (average coordinates, iso codes, country name)
var countryClimateMap = d3.map();  // ISO3 -> country climate data {temp: [], pr: []}
var countryGeoData; // country geo data

/* test for coffee compare map */
countryWorldMap = new worldMap("map1", 4, "Coffee World Map", worldMapType.get("CoffeeCompare"));
/* test for user preference map */
userPreferenceWorldMap = new worldMap("map2", 4, "Explore Coffee Choice", worldMapType.get("UserPreference"));

Promise.all([
	d3.csv(dataPath.countryInfoPath, function(d) {
		return {
			Country: d.Country,
			ISO3: d.ISO3,
			ISO2: d.ISO2.toLowerCase(),
			lat: +d.lat,
			lng: +d.lng
		}
	}), // load country info
	d3.json(dataPath.countryGeoPath),  // load country geo data
	d3.csv(dataPath.countryTempPath, processForClimateData),
	d3.csv(dataPath.countryPrPath, processForClimateData)
]).then(function(data) {
	let countryInfoData = d3.nest()
		.key(function(d) { return d.ISO3; })
		.object(data[0]);
	let countryNameCodeMap = d3.map();
	
	data[0].forEach(function(d) {
		countryNameCodeMap.set(d["Country"], d["ISO3"]);
		countryInfoMap.set(d["ISO3"], countryInfoData[d["ISO3"]][0]);
	})
	countryGeoData = data[1];
	countryGeoData.features = countryGeoData.features.filter(function(d) {
		return countryInfoMap.has(d["properties"]["ISO_A3"])? true : false;
	});

	countryNameCodeMap.keys().forEach(function(d) {
		countryClimateMap.set(countryNameCodeMap.get(d), {});
	})
	data[2].forEach(function(d) {
		countryClimateMap.get(countryNameCodeMap.get(d["Country"])).temp = d.climateData;
	})
	data[3].forEach(function(d) {
		countryClimateMap.get(countryNameCodeMap.get(d["Country"])).pr = d.climateData;
	})
	initialMap(countryWorldMap);
	initialMap(userPreferenceWorldMap);
});

function processForClimateData(d) {
	return {
			Country: d.Country,
			climateData: [
				+d.Jan,
				+d.Feb,
				+d.Mar,
				+d.Apr,
				+d.May,
				+d.Jun,
				+d.Jul,
				+d.Aug,
				+d.Sep,
				+d.Oct,
				+d.Nov,
				+d.Dec
			]
	};
}

function initialMap(MapToInitialization) {
	/* initial map:
		1. For coffee compare map, just add all country to its set;
		2. For user preference map, take a country selection set and 
		also a map for coffee for each country in country selection, 
		using ISO3 code as key, a array of coffee as value
	*/
	if (MapToInitialization.mapType == worldMapType.get("CoffeeCompare")){
		countryInfoMap.keys().forEach(function(d) {
			MapToInitialization.countryShowSet.add(d)
		});
	} else if (MapToInitialization.mapType == worldMapType.get("UserPreference")){
		/* still need to implement, just using same operation as placeholder */
		countryInfoMap.keys().forEach(function(d) {
			MapToInitialization.countryShowSet.add(d)
		});
	}
	MapToInitialization.showCountryGeo();
}