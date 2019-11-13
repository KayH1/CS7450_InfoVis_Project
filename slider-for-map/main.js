var ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
var defaultweight = 0.2;
weightaroma = defaultweight;
var topranked;
var coffeeNested;

// Step
var sliderStep = d3
    .sliderBottom()
    .min(d3.min(ticks))
    .max(d3.max(ticks))
    .width(300)
    .tickFormat(d3.format('.0%'))
    .ticks(5)
    .step(0.2)
    .default(defaultweight)
    .on('onchange', val => {
        weightaroma = val;
        d3.select('p#weight-aroma').text(d3.format('.0%')(weightaroma));
        updateRanks();
    });

var gStep = d3
    .select('div#slider-aroma')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

gStep.call(sliderStep);

d3.select('p#weight-aroma').text(d3.format('.0%')(weightaroma));

d3.csv('../data/coffee/coffee-clean.csv', dataPreprocessorCoffee).then(function (dataset) {
    data = dataset;
});

function updateRanks() {
    console.log(weightaroma);
    data['pointCustomized'] = +data.aroma * weightaroma;
    data.sort(function (a, b) { return +a.pointCustomized - +b.pointCustomized });
    topranked = data.filter(function (d, i) { return i < 5 });
    coffeeNested = d3.nest()
        .key(function (d) { return d.ISOofOrigin; })
        .rollup(function (leaves) {
            var pointCustomized = d3.sum(leaves, function (c) {
                return c.pointCustomized;
            });
            return { total: pointCustomized, countries: leaves };
        })
        .entries(data);
    console.log(topranked);
    console.log(coffeeNested);
}

//copied from Kaylin's /frequencyPlot/main.js, added ISO:
function dataPreprocessorCoffee(row) {
    //console.log(row);
    return {

        'id': +row['id'],
        'species': row['species'],
        'owner': row['owner'],
        'countryOfOrigin': row['countryOfOrigin'],
        'company': row['company'],
        'region': row['region'],
        'producer': row['producer'],
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
        'pointCustomized': +row['aroma'] * weightaroma,
    };
}