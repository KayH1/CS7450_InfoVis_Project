import * as freqVis from "./frequencyPlot.js"
// import * as complexVis from "./complexVis.js"

/**********************
 Create frequencyPlot object
**********************/
// selection, transition_time, useYAxis, dotRadius, dotColor, dotOpacity, dotColorSelected, dotOpacitySelected
//var frequencyPlot = new freqVis.frequencyPlot("flavor",2000,false, 8, '#663300', 0.05, 'red', 1);
var frequencyPlot = new freqVis.frequencyPlot("flavor",2000,false, 4.5, '#663300', 0.1, 'red', 1);

/**********************
 Data preprocessing
**********************/
function dataPreprocessorCoffee(row) {
    //console.log("preprocessing data");
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
 Load the data
**********************/
var dataPath = {
    coffeePath: "./data/coffee/Coffee-clean.csv"
};

d3.csv(dataPath.coffeePath, dataPreprocessorCoffee).then(function(dataset) {
    console.log("Loading coffee");
    
    // add an attribute to each datacase, specifying whether or not it is selected
    // all datacases are not selected, by default
    dataset.forEach(function(d) {
      d.selected = false;
    });

    frequencyPlot.bins = d3.map(dataset, function(d){return d.countryOfOrigin;}).keys();
    frequencyPlot.bins = frequencyPlot.bins.sort().reverse();
    
    // bin the data
    dataset.forEach(function(d) {
        var idx = frequencyPlot.bins.indexOf(d.countryOfOrigin);
        //console.log(frequencyPlot.binned);
        if (frequencyPlot.binned[idx] !== undefined) {
            frequencyPlot.binned[idx].push(d);
        }
        else { frequencyPlot.binned[idx] = [d]; }
    });

    dataset = frequencyPlot.updateY(dataset, frequencyPlot.sortMode, frequencyPlot.sortAttr);
    //console.log("ChartScale");
    //console.log(dataset);
    //console.log(frequencyPlot.bins);
    //console.log("Binned: ",frequencyPlot.binned);
    frequencyPlot.updateChart(dataset);

    /**********************
     Scrollytelling part
    **********************/
    // check whether different DOM components are within view to determine which
    // version of the frequencyPlot viz should be shown
    window.addEventListener('scroll', function(e) {
      var curr_selected = null;
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

      if (frequencyPlot.selection !== curr_selected && curr_selected !== null) {
        frequencyPlot.selection = curr_selected;
        frequencyPlot.onXScaleChanged(dataset);
      }
    });
});


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

// select different coffee attribute components from DOM
var flavor = document.querySelector('.scrollytelling-text #fp_flavor');
var aroma = document.querySelector('.scrollytelling-text #fp_aroma');
var aftertaste = document.querySelector('.scrollytelling-text #fp_aftertaste');
var acidity = document.querySelector('.scrollytelling-text #fp_acidity');
var body = document.querySelector('.scrollytelling-text #fp_body');
var balance = document.querySelector('.scrollytelling-text #fp_balance');
var uniformity = document.querySelector('.scrollytelling-text #fp_uniformity');
var sweetness = document.querySelector('.scrollytelling-text #fp_sweetness');
var cleanCup = document.querySelector('.scrollytelling-text #fp_cleanCup');
var cupperPoints = document.querySelector('.scrollytelling-text #fp_cupperPoints');
var totalCupPoints = document.querySelector('.scrollytelling-text #fp_totalCupPoints');


// move to the top of the page if the page is refreshed/reloaded
window.onload = function () {
    $('html,body').scrollTop(0);
}