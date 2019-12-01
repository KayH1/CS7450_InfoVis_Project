import * as coffeeCompareVis from "./coffeeCompareVis.js"
import * as preferenceVis from "./preferenceVis.js"

/* test for user preference map */
var preferenceVisCombine = new preferenceVis.preferenceCombine("preferenceVis");
/* test for coffee compare map */
var coffeeCompareVisCombine = new coffeeCompareVis.coffeeCompareCombine("complexVis");


/* load data */
	var dataPath = {
		coffeePath: "../data/coffee/Coffee-clean.csv",
		countryInfoPath: "../data/country/CoffeeCountryInfo.csv",
		countryGeoPath: "../worldMap/countries.geojson",
		countryTempPath: "../data/country/temperature-2020_2039.csv",
		countryPrPath: "../data/country/precipitation-2020_2039.csv"
	}

	var countryInfoMap = d3.map(); // ISO3 -> country info data (average coordinates, iso codes, country name)
	var countryClimateMap = d3.map();  // ISO3 -> country climate data {temp: [], pr: []}
	var countryGeoData; // country geo data

	/* for coffee info, not implement yet */
	var countryCoffeeInfoMap = d3.map(); // ISO3 -> array for coffee, avg rating for coffee, range for coffee, world rank of country

	Promise.all([
		d3.csv(dataPath.coffeePath, dataPreprocessorCoffee),
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
		d3.csv(dataPath.countryPrPath, processForClimateData),
	]).then(function(data) {
		/* add slider */
		let countryInfoData = d3.nest()
			.key(function(d) { return d.ISO3; })
			.object(data[1]);
		let countryNameCodeMap = d3.map();
		
		data[1].forEach(function(d) {
			countryNameCodeMap.set(d["Country"], d["ISO3"]);
			countryInfoMap.set(d["ISO3"], countryInfoData[d["ISO3"]][0]);
		})
		countryGeoData = data[2];
		countryGeoData.features = countryGeoData.features.filter(function(d) {
			return countryInfoMap.has(d["properties"]["ISO_A3"])? true : false;
		});

		countryNameCodeMap.keys().forEach(function(d) {
			countryClimateMap.set(countryNameCodeMap.get(d), {});
		})
		data[3].forEach(function(d) {
			countryClimateMap.get(countryNameCodeMap.get(d["Country"])).temp = d.climateData;
		})
		data[4].forEach(function(d) {
			countryClimateMap.get(countryNameCodeMap.get(d["Country"])).pr = d.climateData;
		})

		/* get country coffee Info */
	    let coffeeInfo = d3.nest()
	        .key(function (d) { return d.ISOofOrigin; })
	        .rollup(function (leaves) {
	            var totalCupPoints = d3.mean(leaves, function(c) {
	                return c.totalCupPoints;
	            })
	            var minCupPoints = d3.min(leaves, function(c) {
	                return c.totalCupPoints;
	            })
	            var maxCupPoints = d3.max(leaves, function(c) {
	                return c.totalCupPoints;
	            })
	            return { meanR: Math.round(totalCupPoints), minR: Math.round(minCupPoints), maxR: Math.round(maxCupPoints), coffee: leaves };
	        })
	        .entries(data[0]);
	    coffeeInfo.sort(function (a, b) { return +a.value.totalCupPoints - +b.value.totalCupPoints });
	    coffeeInfo.forEach(function(d, i) {
	    	d.value.rank = i + 1;
	    	countryCoffeeInfoMap.set(d.key, d);
	    });
		
		initialMap(preferenceVisCombine.worldMap);
		preferenceVisCombine.loadData(data[0])

		initialMap(coffeeCompareVisCombine.worldMap);
		coffeeCompareVisCombine.loadData(data[0])
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

	function dataPreprocessorCoffee(row) {
    //console.log(row);
    return {
        'id': +row['id'],
        'species': row['species'],
        'owner': row['owner'].replace(/\n/g, "").replace(/ /g, ""),
        'countryOfOrigin': row['countryOfOrigin'],
        'company': row['company'].replace(/\n/g, "").replace(/ /g, ""),
        'region': row['region'],
        'producer': row['producer'].replace(/\n/g, "").replace(/ /g, ""),
        'harvestYear': row['harvestYear'],
        'gradingDate': row['gradingDate'],
        'owner1': row['owner1'],
        'variety': row['variety'],
        'processingMethod': row['processingMethod'],
        'aroma': +row['aroma'],
        'flavor': +row['flavor'],
        'aftertaste': +row['aftertaste'],
        'acidity': +row['acidity'],
        'body': +row['body'],
        'balance': +row['balance'],
        'uniformity': +row['uniformity'],
        'cleanCup': +row['cleanCup'],
        'sweetness': +row['sweetness'],
        'cupperPoints': +row['cupperPoints'],
        'totalCupPoints': +row['totalCupPoints'],
        'moisture': +row['moisture'],
        'color': row['color'],
        'ISOofOrigin': row['ISOofOrigin'],
        'pointCustomized': 0,
    };
}
/* load data */


/* initialize vis components when data is ready */
	function initialMap(Map) {
		/* initial map:
			1. For coffee compare map, just add all country to its set;
			2. For user preference map, take a country selection set and 
			also a map for coffee for each country in country selection, 
			using ISO3 code as key, a array of coffee as value
		*/
		Map.data = {countryInfoMap: countryInfoMap, countryClimateMap: countryClimateMap, countryGeoData: countryGeoData, countryCoffeeInfoMap: countryCoffeeInfoMap};
		/* change to coffee select when coffee data is ready */
		var countryShowSet = d3.set();
		countryInfoMap.keys().forEach(function(d) {
			countryShowSet.add(d)
		});
		Map.updateCountryShowSet(countryShowSet);
	}
/* initialize vis components */