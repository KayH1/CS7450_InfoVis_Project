transition_time = 3000;

/**********************
 Embeddings SVG element
**********************/
// create svg element (class embeddings)
var svg = d3.select('svg.embeddings');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 50, l: 60};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// create the x and y scales
xScale = d3.scaleLinear().range([0, chartWidth]);
yScale = d3.scaleLinear().range([chartHeight, 0]);

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');


/**********************
 Data preprocessing
**********************/
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
        'mdsX': +row['mdsX'],
        'mdsY': +row['mdsY'],
        //'altitudeLowMeters': row[altitudeLowMeters],
        //'altitudeHighMeters': row[altitudeHighMeters],
        //'altitudeMeanMeters': row[altitudeMeanMeters]
    };
}


/**********************
 Load coffee dataset
**********************/
d3.csv('../data/coffee/coffee-clean.csv', dataPreprocessorCoffee).then(function(dataset) {
    // **** Your JavaScript code goes here ****
    // Create global object called coffee to store dataset
    console.log("Loading coffee (embeddings)");
    coffee = dataset;

    updateChart();

});


function updateChart() {
    // get the value ranges for the x and y embedding values
    yEmbeddingsExtent = d3.extent(coffee, function(d) { return d.mdsY; });
    xEmbeddingsExtent = d3.extent(coffee, function(d) { return d.mdsX; });

    // set the x & y axes domains
    yScale.domain(yEmbeddingsExtent);
    xScale.domain(xEmbeddingsExtent);

    // create d3 selection on the class dot & create a data-join with coffee
    var dots = chartG.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnter = dots.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnter.append('circle') // append a circle to the g elements
        .attr('r', 2);


    /**********************
     Create tooltip
    **********************/
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"</h5>";
    });

    svg.call(toolTip);

    dotsEnter.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    dots.merge(dotsEnter) // combine enter and update selections
        .transition()
        .duration(transition_time)
        .attr('transform', function(d) {
            var tx = xScale(d.mdsX);
            //console.log(d.rank);
            var ty = yScale(d.mdsY);
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });

    d3.selectAll('.dot circle')
      .on('click', function() {
        var isActive = d3.select(this).attr('class')==='active';
        //console.log("is active? ",isActive);
        d3.select(this)
          .classed('active', function() {
            isActive = !isActive;
            return isActive;
          })
          .style('fill', function() {
            if (!isActive){ return '#663300'; }
            return 'red';
          })
          .style('opacity', function(){
            if (!isActive){ return 0.3; }
            return 1;
          })
          .style('r', function(){
            if (!isActive){ return 2; }
            return 3;
          });
      })
}


