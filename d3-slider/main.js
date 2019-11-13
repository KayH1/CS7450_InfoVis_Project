var weightaroma = 0;
var topranked;
var coffeeNested;

d3.select('#slider-aroma').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-aroma').text(value);
    weightaroma = value;
    updateRanks();
  }));

  d3.select('#slider-flavor').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-flavor').text(value);
  }));

  d3.select('#slider-aftertaste').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-aftertaste').text(value);
  }));

  d3.select('#slider-acidity').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-acidity').text(value);
  }));

  d3.select('#slider-body').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-body').text(value);
  }));

  d3.select('#slider-balance').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-balance').text(value);
  }));

  d3.select('#slider-uniformity').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-uniformity').text(value);
  }));

  d3.select('#slider-sweetness').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-sweetness').text(value);
  }));

  d3.select('#slider-cleancup').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-cleancup').text(value);
  }));

  d3.select('#slider-cupperpoint').call(d3.slider().axis(d3.svg.axis()).snap(true).on("slide", function(evt, value) {
    d3.select('#weight-cupperpoint').text(value);
  }));

  d3.select('#slider1').call(d3.slider());

  d3.select('#slider2').call(d3.slider().value( [ 10, 25 ] ));

  d3.select('#slider3').call(d3.slider().axis(true).value( [ 10, 25 ] ).on("slide", function(evt, value) {
    d3.select('#slider3textmin').text(value[ 0 ]);
    d3.select('#slider3textmax').text(value[ 1 ]);
  }));

  d3.select('#slider4').call(d3.slider().on("slide", function(evt, value) {
    d3.select('#slider4text').text(value);
  }));

  d3.select('#slider5').call(d3.slider().axis(true));

  var axis = d3.svg.axis().orient("top").ticks(4);
  d3.select('#slider6').call(d3.slider().axis(axis));

  d3.select('#slider7').call(d3.slider().axis(true).min(2000).max(2100).step(5));

  d3.select('#slider8').call(d3.slider().value(50).orientation("vertical"));

  d3.select('#slider9').call(d3.slider().value( [10, 30] ).orientation("vertical"));

  d3.select('#slider10').call(d3.slider().scale(d3.time.scale().domain([new Date(1984,1,1), new Date(2014,1,1)])).axis(d3.svg.axis()));

  d3.select('#slider11').call(d3.slider().scale(d3.time.scale().domain([new Date(1984,1,1), new Date(2014,1,1)])).axis(d3.svg.axis()).snap(true).value(new Date(2000,1,1)));

  essai = d3.slider().scale(d3.scale.ordinal().domain(["Gecko", "Webkit", "Blink", "Trident"]).rangePoints([0, 1], 0.5)).axis(d3.svg.axis()).snap(true).value("Gecko");
  d3.select('#slider12').call(essai);

d3.csv('../data/coffee/coffee-clean.csv', dataPreprocessorCoffee).then(function(dataset) {
  console.log(dataset);
  data = dataset;
});

function updateRanks() {
    data.pointCustomized = (+data.aroma * weightaroma);
    data.sort(function(a,b) { return +a.pointCustomized - +b.pointCustomized });
    topranked = data.filter(function(d,i){ return i<5 });
    coffeeNested = d3.nest()
    .key(function(d) { return d.ISOofOrigin; })
    .rollup(function(leaves) {
        var pointCustomized = d3.sum(leaves, function(c){
            return c.pointCustomized;
        });
        return {total: pointCustomized, countries: leaves};
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
  };
}