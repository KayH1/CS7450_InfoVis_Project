// to store references (id) to datapoints that are currently highlighted
var activeData = {};


/**********************
 Embeddings SVG element
**********************/
var transitionTime = 3000;
var svgEmbeddings = d3.select('svg.embeddings');
// Get layout parameters
var svgWidthEmbeddings = +svgEmbeddings.attr('width');
var svgHeightEmbeddings = +svgEmbeddings.attr('height');

var paddingEmbeddings = {t: 40, r: 40, b: 50, l: 60};

// Compute chart dimensions
var chartWidthEmbeddings = svgWidthEmbeddings - paddingEmbeddings.l - paddingEmbeddings.r;
var chartHeightEmbeddings = svgHeightEmbeddings - paddingEmbeddings.t - paddingEmbeddings.b;

// create the x and y scales
xScaleEmbeddings = d3.scaleLinear().range([0, chartWidthEmbeddings]);
yScaleEmbeddings = d3.scaleLinear().range([chartHeightEmbeddings, 0]);

// Create a group element for appending chart elements
var chartGEmbeddings = svgEmbeddings.append('g')
    .attr('transform', 'translate('+[paddingEmbeddings.l, paddingEmbeddings.t]+')');








/**********************
 Parallel coord SVG element
**********************/
// create svg element (class parallel-coords)
var svgParallelCoords = d3.select('svg.parallel-coords');
// Get layout parameters
var svgWidthParallelCoords = +svgParallelCoords.attr('width');
var svgHeightParallelCoords = +svgParallelCoords.attr('height');

var paddingParallelCoords = {t: 30, r: 40, b: 40, l: 60};

var axes = ['flavor', 'aroma', 'aftertaste', 'acidity', 'balance', 'uniformity', 'sweetness', 'cleanCup', 'cupperPoints']
//var axes = ['flavor', 'uniformity', 'aroma', 'sweetness', 'aftertaste', 'cleanCup', 'acidity', 'cupperPoints', 'balance']

// Compute chart dimensions
var chartWidthParallelCoords = svgWidthParallelCoords - paddingParallelCoords.l - paddingParallelCoords.r;
var chartHeightParallelCoords = svgHeightParallelCoords - paddingParallelCoords.t - paddingParallelCoords.b;

var axesSpacing = chartWidthParallelCoords / (axes.length-0.5);

// create the y scale
yScaleParallelCoords = d3.scaleLinear().range([chartHeightParallelCoords, 0]).domain([0,10]);

// Create a group element for appending chart elements
var chartGParallelCoords = svgParallelCoords.append('g')
  .attr('transform', 'translate('+[paddingParallelCoords.l, paddingParallelCoords.t]+')');

// Create groups for the y-axes
var enterAxesParallelCoords = chartGParallelCoords.selectAll('g')
  .data(axes)
  .enter()
  .append('g')
  .attr('class', function(d,i) {
    return 'y axis '+d;
  })
  .attr('transform', function(d,i){
    return 'translate('+(i*axesSpacing)+','+(paddingParallelCoords.t)+')';
  });
var enterTextParallelCoords = chartGParallelCoords.selectAll('text')
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
d3.csv('./data/coffee/Coffee-clean.csv', dataPreprocessorCoffee).then(function(dataset) {
    // **** Your JavaScript code goes here ****
    // Create global object called coffee to store dataset
    console.log("Loading coffee (complex viz)");
    coffee = dataset;

    // add the flavor profile line coords to each datacase
    coffee.forEach(function(d) {
      d['flavorProfileLine'] = [[0, paddingParallelCoords.t+yScaleParallelCoords(d[axes[0]])],
                                [axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[1]])],
                                [2*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[2]])],
                                [3*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[3]])],
                                [4*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[4]])],
                                [5*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[5]])],
                                [6*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[6]])],
                                [7*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[7]])],
                                [8*axesSpacing, paddingParallelCoords.t+yScaleParallelCoords(d[axes[8]])]
                                ]
    });

    //console.log(coffee);

    updateParallelCoordinates();
    updateEmbeddings();
});


/**********************
 Update Embeddings viz
**********************/
function updateEmbeddings() {
    // get the value ranges for the x and y embedding values
    yEmbeddingsExtent = d3.extent(coffee, function(d) { return d.mdsY; });
    xEmbeddingsExtent = d3.extent(coffee, function(d) { return d.mdsX; });

    // set the x & y axes domains
    yScaleEmbeddings.domain(yEmbeddingsExtent);
    xScaleEmbeddings.domain(xEmbeddingsExtent);

    // create d3 selection on the class dot & create a data-join with coffee
    var dotsEmbeddings = chartGEmbeddings.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnterEmbeddings = dotsEmbeddings.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnterEmbeddings.append('circle') // append a circle to the g elements
        .attr('r', 2);


    /**********************
     Create tooltip
    **********************/
    var toolTipEmbeddings = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"</h5>";
    });

    svgEmbeddings.call(toolTipEmbeddings);

    dotsEnterEmbeddings.on('mouseover', toolTipEmbeddings.show)
    .on('mouseout', toolTipEmbeddings.hide);

    dotsEmbeddings.merge(dotsEnterEmbeddings) // combine enter and update selections
        .transition()
        .duration(transitionTime)
        .attr('transform', function(d) {
            var tx = xScaleEmbeddings(d.mdsX);
            //console.log(d.rank);
            var ty = yScaleEmbeddings(d.mdsY);
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });

    /**********************
     Enable selecting and deselecting dot
    **********************/
    d3.selectAll('.dot circle')
      .on('click', function() {
        var isActive = d3.select(this).attr('class')==='active';
        //console.log("is active? ",isActive);
        d3.select(this)
          .classed('active', function(d) {
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



/**********************
 Update Parallel Coordinates viz
**********************/
function updateParallelCoordinates() {
    // display the y axes
    enterAxesParallelCoords.call(d3.axisLeft(yScaleParallelCoords).ticks(5));

    // display the data as polylines
    chartGParallelCoords.selectAll('g')
      .data(coffee, function(d) { return d['id']; })
      .enter()


    /**********************
     Draw lines
    **********************/
    var polylineParallelCoords = chartGParallelCoords.selectAll('.polyline')
        .data(coffee);

    // create .dot elements
    var polylineEnterParallelCoords = polylineParallelCoords.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'polyline'); // assign a class ID of dot to the element
    polylineEnterParallelCoords.append('path') // append a circle to the g elements
        .attr('d', function(d){
      var lineGenerator = d3.line();
      return lineGenerator(d['flavorProfileLine']);
    })
    .style('stroke-width', 1);


    /**********************
     Create tooltip
    **********************/
    var toolTipParallelCoords = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"</h5>";
    });

    // solution for getting the tooltip to follow the mouse cursor from:
    // https://github.com/Caged/d3-tip/issues/53
    svgParallelCoords.append('circle').attr('id', 'tipfollowscursor')
    svgParallelCoords.call(toolTipParallelCoords);

    polylineEnterParallelCoords.on('mouseover', function(d) {
        var target = d3.select('#tipfollowscursor')
                .attr('cx', d3.event.offsetX)
                .attr('cy', d3.event.offsetY - 0) // 0 pixels above the cursor
                .node();

        toolTipParallelCoords.show(d, target)
    })
    .on('mouseout', toolTipParallelCoords.hide);


    /**********************
     Enable selecting and deselecting polyline
    **********************/
    d3.selectAll('.polyline path')
      .on('click', function() {
        var isActive = d3.select(this).attr('class')==='active';
        //console.log("is active? ",isActive);
        d3.select(this)
          .classed('active', function(d) {
            isActive = !isActive;
            return isActive;
          })
          .style('stroke', function() {
            if (!isActive){ return '#663300'; }
            return 'red';
          })
          .style('opacity', function(){
            if (!isActive){ return 0.3; }
            return 1;
          })
          .style('stroke-width', function(){
            if (!isActive){ return 1; }
            return 5;
          });
      })
}