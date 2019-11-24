var ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
var defaultweight = 0.2;
var topranked;
var coffeeNested;

variableList = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'uniformity', 'cleanCup', 'sweetness', 'cupperPoints'];

variableCatalogue = new Array();
for (i in variableList) {
    variableCatalogue.push(
        {'variable-name': variableList[i],
        'slider-id': 'slider-' + variableList[i],
        'weight-id': 'weight-' + variableList[i],
        'weight': defaultweight,
        }
    );
}

var sliderHolder = []; 
for (i in variableCatalogue) {
    var pWeight = document.createElement('p');
    pWeight.setAttribute('id', variableCatalogue[i]['weight-id']);

    var divLabelWeight = document.createElement('div');
    divLabelWeight.setAttribute('class', 'col-sm-2 capitalize');
    divLabelWeight.textContent = variableCatalogue[i]['variable-name'] + ': ';

    var divSliderChild = document.createElement('div');
    divSliderChild.setAttribute('id', variableCatalogue[i]['slider-id']);

    var divSliderParent = document.createElement('div');
    divSliderParent.setAttribute('class', 'col-sm');

    var divRow = document.createElement('div');
    divRow.setAttribute('class', 'row align-items-center');

    var divContainer = document.createElement('div');
    divContainer.setAttribute('class', 'container');

    divLabelWeight.appendChild(pWeight);
    divSliderParent.appendChild(divSliderChild);
    divRow.appendChild(divLabelWeight);
    divRow.appendChild(divSliderParent);
    divContainer.appendChild(divRow);
    document.body.appendChild(divContainer);

    // Step

    sliderHolder.push(d3
        .sliderBottom()
        .min(d3.min(ticks))
        .max(d3.max(ticks))
        .width(300)
        .tickFormat(d3.format('.0%'))
        .ticks(5)
        .step(0.2)
        .default(defaultweight)
        .on('onchange', function(d) {
            variableCatalogue[this.id]['weight'] = d;
            d3.select('p#' + variableCatalogue[this.id]['weight-id']).text(d3.format('.0%')(variableCatalogue[this.id]['weight']));
            updateRanks();
        }));
    sliderHolder[i].id = i;

    var gStep = d3
        .select('div#' + variableCatalogue[i]['slider-id'])
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gStep.call(sliderHolder[i]);

    d3.select('p#' + variableCatalogue[i]['weight-id']).text(d3.format('.0%')(variableCatalogue[i]['weight']));
}

d3.csv('../data/coffee/coffee-clean.csv', dataPreprocessorCoffee).then(function (dataset) {
    data = dataset;
});

function updateRanks() {
    data.forEach(function(element, index, theData) {
        theData[index].pointCustomized = 0;
        for (variable of variableCatalogue) {
            theData[index].pointCustomized += theData[index][variable['variable-name']] * variable['weight'];
        }
    });
    data.sort(function (a, b) { return +a.pointCustomized - +b.pointCustomized }).reverse();
    topCoffee = data.filter(function (d, i) { return i < 5 });
    coffeeNested = d3.nest()
        .key(function (d) { return d.ISOofOrigin; })
        .rollup(function (leaves) {
            var pointCustomized = d3.mean(leaves, function (c) {
                return c.pointCustomized;
            });
            var totalCupPoints = d3.mean(leaves, function(c) {
                return c.totalCupPoints;
            })
            var minCupPoints = d3.min(leaves, function(c) {
                return c.totalCupPoints;
            })
            var maxCupPoints = d3.max(leaves, function(c) {
                return c.totalCupPoints;
            })
            return { pointCustomized: pointCustomized, totalCupPoints: totalCupPoints, minCupPoints: minCupPoints, maxCupPoints: maxCupPoints, countries: leaves };
        })
        .entries(data);
    coffeeNested.sort(function (a, b) { return +a.value.totalCupPoints - +b.value.totalCupPoints }).reverse();
    topCountries = coffeeNested.filter(function (d, i) { return i < 5});
    console.log(variableCatalogue);
    console.log(topCoffee);
    console.log(topCountries);
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
        'pointCustomized': 0,
    };
}