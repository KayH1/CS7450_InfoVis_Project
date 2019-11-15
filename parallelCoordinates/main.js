/**********************
 Parallel coord SVG element
**********************/
// create svg element (class frequencyPlot)
var svg = d3.select('svg.parallel-coords');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 30, r: 40, b: 50, l: 60};

var axes = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']
//var axes = ['flavor', 'uniformity', 'aroma', 'sweetness', 'aftertaste', 'cleanCup', 'acidity', 'cupperPoints', 'balance']

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var axesSpacing = chartWidth / (axes.length-0.5);

// create the y scale
yScale = d3.scaleLinear().range([chartHeight, 0]).domain([0,10]);

// Create a group element for appending chart elements
var chartG = svg.append('g')
  .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Create groups for the y-axes

var enterAxes = chartG.selectAll('g')
  .data(axes)
  .enter()
  .append('g')
  .attr('class', function(d,i) {
    return 'y axis '+d;
  })
  .attr('transform', function(d,i){
    return 'translate('+(i*axesSpacing)+','+(padding.t)+')';
  });

var enterText = chartG.selectAll('text')
    .data(axes)
    .enter()
    .append('text')
    .attr('class', function(d,i) {
      return 'y label '+d;
    })
    .attr('transform', function(d,i) {
      return 'translate('+(i*axesSpacing+10)+',10) rotate(-20)';
    })
    .text(function(d) { return d; });


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
    console.log("Loading coffee (parallel-coords)");
    coffee = dataset;

    // add the flavor profile line coords to each datacase
    coffee.forEach(function(d) {

      console.log(yScale(d[axes[0]])+' vs '+d[axes[0]]+ ' '+chartHeight);

      d['flavorProfileLine'] = [[0, padding.t+yScale(d[axes[0]])],
                                [axesSpacing, padding.t+yScale(d[axes[1]])],
                                [2*axesSpacing, padding.t+yScale(d[axes[2]])],
                                [3*axesSpacing, padding.t+yScale(d[axes[3]])],
                                [4*axesSpacing, padding.t+yScale(d[axes[4]])],
                                [5*axesSpacing, padding.t+yScale(d[axes[5]])],
                                [6*axesSpacing, padding.t+yScale(d[axes[6]])],
                                [7*axesSpacing, padding.t+yScale(d[axes[7]])],
                                [8*axesSpacing, padding.t+yScale(d[axes[8]])]
                                ]
    });

    //console.log(coffee);

    updateChart();

});


/**********************
 Update chart viz
**********************/
function updateChart() {
    // display the y axes
    enterAxes.call(d3.axisLeft(yScale).ticks(5));

    // display the data as polylines
    chartG.selectAll('g')
      .data(coffee, function(d) { return d['id']; })
      .enter()

    drawLines();
}

function drawLines() {
  //console.log(coffee);  
  
  chartG.selectAll('paths')
    .data(coffee, function(d) { return d['id']; })
    .enter()
    .append('path')
    .attr('d', function(d){
      var lineGenerator = d3.line();
      return lineGenerator(d['flavorProfileLine']);
    });

}