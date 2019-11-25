var ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
var defaultweight = 0.2;
var topCoffee;
var coffeeNested;
var data;

var variableList = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'uniformity', 'cleanCup', 'sweetness', 'cupperPoints'];

function sliders(numberAttributes, divId, CoffeeData, associateMap){
    data = CoffeeData;
    this.associateMap = associateMap;
    let associatedSlider = this;
    this.divId = divId;
    this.numberAttributes = numberAttributes;
    this.variableCatalogue = new Array();
    for (let i = 0; i < this.numberAttributes; i++) {
        this.variableCatalogue.push(
            {'variable-name': variableList[i],
            'slider-id': 'slider-' + variableList[i],
            'weight-id': 'weight-' + variableList[i],
            'weight': defaultweight,
            }
        );
    }

    this.sliderHolder = []; 
    for (let i in this.variableCatalogue) {
        var divContainer = d3.select("#" + this.divId).append('div');
        divContainer.attr('class', 'container');

        var divRow = divContainer.append('div');
        divRow.attr('class', 'row align-items-center');

        var divLabelWeight = divRow.append('div');
        divLabelWeight.attr('class', 'col-sm-2 capitalize');
        divLabelWeight.textContent = this.variableCatalogue[i]['variable-name'] + ': ';

        var pWeight = divLabelWeight.append("p");
        pWeight.attr('id', this.variableCatalogue[i]['weight-id']);

        var divSliderParent = divRow.append('div');
        divSliderParent.attr('class', 'col-sm');

        var divSliderChild = divSliderParent.append('div');
        divSliderChild.attr('id', this.variableCatalogue[i]['slider-id']);

        // Step
        this.sliderHolder.push(d3
            .sliderBottom()
            .min(d3.min(ticks))
            .max(d3.max(ticks))
            .width(300)
            .tickFormat(d3.format('.0%'))
            .ticks(5)
            .default(defaultweight)
            .step(0.2)
            .on('onchange', function(d) {
                associatedSlider.variableCatalogue[this.id]['weight'] = d;
                d3.select('p#' + associatedSlider.variableCatalogue[this.id]['weight-id']).text(d3.format('.0%')(associatedSlider.variableCatalogue[this.id]['weight']));
                updateRanks(this.associatedSlider);
            }));
        this.sliderHolder[i].id = i;
        this.sliderHolder[i].associatedSlider = this;

        var gStep = d3
            .select('div#' + this.variableCatalogue[i]['slider-id'])
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gStep.call(this.sliderHolder[i]);
        d3.select('p#' + this.variableCatalogue[i]['weight-id']).text(d3.format('.0%')(this.variableCatalogue[i]['weight']));
    }
    updateRanks.call(this);
}


function updateRanks(sliders) {
    data.forEach(function(element, index, theData) {
        theData[index].pointCustomized = 0;
        for (let variable of sliders.variableCatalogue) {
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
    sliders.associateMap.updateCoffeeSelectedSet(topCoffee);
}

export { sliders };