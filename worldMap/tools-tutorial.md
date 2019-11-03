# Map Tutorial

Leaflet is a lightweight JS library for mobile-friendly interactive maps. Leaflet's global namespace is *L*. Leaflet takes [latitude, longtitude] pair for location.

```
# the location of Atlanta #
var atlLatLng = new L.LatLng(33.7771, -84.3900);
# create a map associate with dom id (div) in html component#
var myMap = L.map('map').setView(atlLatLng, 5);
# set the view point in that location and set default zoom level as 5 #

# minZoom, maxZoom, layer, maxBounds
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13
});
```

- Include tile layer
Tile is the actual representation of the world and as the base layer on which to draw other shapes and visualization.

- Create map boundary
```
map.fitBounds([
    [40.712, -74.227],
    [40.774, -74.125]
]);

# southwest, northeast

var corner1 = L.latLng(40.712, -74.227),
corner2 = L.latLng(40.774, -74.125),
bounds = L.latLngBounds(corner1, corner2);
```

As following, a tile layer is included. 