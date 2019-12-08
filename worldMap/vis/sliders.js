var ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
var defaultweight = 0.2;

function sliders(divId, selectedAttributes, assoPreferenceVis){
    this.assoPreferenceVis = assoPreferenceVis;
    this.divId = divId;
    this.variableCatalogue = new Array();
    for (let i = 0; i < selectedAttributes.length; i++) {
        this.variableCatalogue.push(
            {'variable-name': selectedAttributes[i],
            'slider-id': 'slider-' + selectedAttributes[i],
            'weight-id': 'weight-' + selectedAttributes[i],
            'weight': defaultweight,
            }
        );
    }

    let associatedSlider = this;
    this.sliderHolder = []; 
    for (let i in this.variableCatalogue) {
        var divContainer = d3.select("#" + this.divId).append('div');
        divContainer.attr('class', 'container')

        var divRow = divContainer.append('div')
            .style("display", "flex");
        //divRow.attr('class', 'row align-items-center');

        var divLabelWeight = divRow.append('div');
        divLabelWeight.attr('class', 'sliderTitle')
            .style("width", "100px")
            .style("height", "30px");
        divLabelWeight.text(this.variableCatalogue[i]['variable-name'] + ': ')

        var divSliderParent = divRow.append('div');
        //divSliderParent.attr('class', 'col-sm');

        var divSliderChild = divSliderParent.append('div');
        divSliderChild.attr('id', this.variableCatalogue[i]['slider-id']);

        // Step
        this.sliderHolder.push(d3
            .sliderBottom()
            .min(d3.min(ticks))
            .max(d3.max(ticks))
            .width(250)
            .tickFormat(d3.format('.0%'))
            .ticks(5)
            .default(defaultweight)
            .step(0.2)
            .on('onchange', function(d) {
                associatedSlider.variableCatalogue[this.id]['weight'] = d;
                this.associatedSlider.updateRanks();
            }));
        this.sliderHolder[i].id = i;
        this.sliderHolder[i].associatedSlider = this;

        var gStep = d3
            .select('div#' + this.variableCatalogue[i]['slider-id'])
            .append('svg')
            .attr('width', 320)
            .attr('height', 85)
            .append('g')
            .attr('transform', 'translate(30,16)');

        gStep.call(this.sliderHolder[i]);
        d3.select('p#' + this.variableCatalogue[i]['weight-id']).text(d3.format('.0%')(this.variableCatalogue[i]['weight']));
    }
}

sliders.prototype.updateRanks = function() {
    let associatedSlider = this;
    associatedSlider.assoPreferenceVis.data.forEach(function(element, index, theData) {
        theData[index].pointCustomized = 0;
        for (let variable in associatedSlider.variableCatalogue) {
            theData[index].pointCustomized += theData[index][associatedSlider.variableCatalogue[variable]['variable-name']] * associatedSlider.variableCatalogue[variable]['weight'];
        }
    });
    
    /* get top coffee */
    associatedSlider.assoPreferenceVis.data.sort(function (a, b) { return +a.pointCustomized - +b.pointCustomized }).reverse();
    associatedSlider.topCoffee = associatedSlider.assoPreferenceVis.data.filter(function (d, i) { return i < 5 });
    associatedSlider.topCoffee.forEach(function(d, i) { d.rank = i + 1; });// swallow copy
    associatedSlider.assoPreferenceVis.updateVis();
}

export { sliders };