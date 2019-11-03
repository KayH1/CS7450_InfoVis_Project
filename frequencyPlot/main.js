/**********************
 Logistical variables
**********************/
var selection = "flavor";
var transition_time = 3000;
var useYAxis = false;


/**********************
 Freq plot SVG element
**********************/
// create svg element (class frequencyPlot)
var svg = d3.select('svg.freq-plot');

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
chartScales = {x: selection, y: {}};

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Create groups for the x- and y-axes
var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');
var xAxisLabel = chartG.append('text')
    .attr('class', 'x label')
    .attr('transform', 'translate('+(chartWidth/2)+','+(svgHeight-padding.b)+')')
    .text(selection);
if (useYAxis) {
  var yAxisG = chartG.append('g')
    .attr('class', 'y axis');
  var yAxisLabel = chartG.append('text')
      .attr('class', 'y label')
      .attr('transform', 'translate('+(-2*padding.l/3)+','+(chartHeight/2)+') rotate(-90)')
      .text('frequency');
}



/**********************
 Freq plot scale funcs
**********************/
// Global functions called when select elements changed
function onXScaleChanged(selected) {
    //console.log("Selection",selection);
    d3.select(".sidenav a.active").classed('active', false);
    d3.select(".sidenav a."+selected)
        .classed('active', true);
    
    // Save current selection to global chartScales
    chartScales.x = selected;
    
    selection = selected;
    // Update chart
    updateChart();
}

function updateY(dataset) {
  chartScales.y = {};

  dataset.forEach(function(d) {
      //console.log(d[selection]);
      //console.log("Before: ",d.rank,selection);
      chartScales.y[d[selection]] = (chartScales.y[d[selection]]||0) + 1;
      d.rank = chartScales.y[d[selection]];
      //console.log("After: ",d.rank,selection);
  });

  return dataset;
}

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
    console.log("Loading coffee");
    coffee = dataset;

    domainMap = {};

    dataset.columns.forEach(function(column) {
        domainMap[column] = d3.extent(dataset, function(data_element){
            return data_element[column];
        });
    });
    
    dataset = updateY(dataset);
    //console.log("ChartScale");
    //console.log(dataset);

    updateChart();

    $(document).on("scroll",function scrollytell() {
      curr_selected = null;
      if (isInViewport(flavor)) { curr_selected = "flavor"; }
      else if (isInViewport(aroma)) { curr_selected = "aroma"; }
      else if (isInViewport(aftertaste)) { curr_selected = "aftertaste"; }
      else if (isInViewport(acidity)) { curr_selected = "acidity"; }
      else if (isInViewport(body)) { curr_selected = "body"; }
      else if (isInViewport(balance)) { curr_selected = "balance"; }
      else if (isInViewport(uniformity)) { curr_selected = "uniformity"; }
      else if (isInViewport(sweetness)) { curr_selected = "sweetness"; }
      else if (isInViewport(cleanCup)) { curr_selected = "cleanCup"; }
      else if (isInViewport(cupperPoints)) { curr_selected = "cupperPoints"; }
      else if (isInViewport(totalCupPoints)) { curr_selected = "totalCupPoints"; }

      if (selection !== curr_selected && curr_selected !== null) {
        onXScaleChanged(curr_selected);
        selection = curr_selected;
      }

    });

});


function updateChart() {
    // **** Draw and Update your chart here ****
    // Update the scales based on new data attributes
    //console.log(d3.extent(chartScales.y));
    
    coffee = updateY(coffee);
    freq_rank = d3.extent(coffee, function(d) { return d.rank; });

    //console.log("rank ",freq_rank);

    yScale.domain(freq_rank);

    //xScale.domain(domainMap[chartScales.x]).nice();
    
    // change the x scale domain depending on freq plot being shown
    // 0-10 if any of the 10 attributes
    // 0-100 if showing total cup points
    if (chartScales.x !== "totalCupPoints") {
        xScale.domain([0,10]).nice();
    }
    else {
        xScale.domain([50,100]).nice();
    }
    
    // create/update the x- and y-axes of the chart
    xAxisG.transition()
        .duration(transition_time)
        .call(d3.axisBottom(xScale));
    if (useYAxis) {
      yAxisG.transition()
        .duration(transition_time)
        .call(d3.axisLeft(yScale));
    }

    // create d3 selection on the class dot & create a data-join with coffee
    var dots = chartG.selectAll('.dot')
        .data(coffee);

    // create .dot elements
    var dotsEnter = dots.enter() // prepare placeholders for each data case
        .append('g') // create a g element
        .attr('class', 'dot'); // assign a class ID of dot to the element
    dotsEnter.append('circle') // append a circle to the g elements
        .attr('r', 2);

    var xAxisLabel = chartG.selectAll('.x.label')
    .text(selection);

    /**********************
     Create tooltip
    **********************/
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-12, 0])
      .html(function(d) {
          return "<h5>"+d.countryOfOrigin+"<br>"+d[selection]+"</h5>";
    });

    svg.call(toolTip);

    dotsEnter.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    dots.merge(dotsEnter) // combine enter and update selections
        .transition()
        .duration(transition_time)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            //console.log(d.rank);
            var ty = yScale(d.rank);
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


/**********************
 Scrollytelling part
**********************/

/*
isInViewport function from https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
*/
var isInViewport = function (elem) {
    if (elem !== null) {
      var bounding = elem.getBoundingClientRect();
      return (
          bounding.top >= 0 &&
          bounding.left >= 0 &&
          bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    return false;
};

var flavor = document.querySelector('.scrollytelling-text .flavor');
var aroma = document.querySelector('.scrollytelling-text .aroma');
var aftertaste = document.querySelector('.scrollytelling-text .aftertaste');
var acidity = document.querySelector('.scrollytelling-text .acidity');
var body = document.querySelector('.scrollytelling-text .body');
var balance = document.querySelector('.scrollytelling-text .balance');
var uniformity = document.querySelector('.scrollytelling-text .uniformity');
var sweetness = document.querySelector('.scrollytelling-text .sweetness');
var cleanCup = document.querySelector('.scrollytelling-text .cleanCup');
var cupperPoints = document.querySelector('.scrollytelling-text .cupperPoints');
var totalCupPoints = document.querySelector('.scrollytelling-text .totalCupPoints');




