mapboxgl.accessToken = 'pk.eyJ1IjoibGlhbW02NzciLCJhIjoiY202bjVxNXcxMG12ODJyb2doaW94dzRwbCJ9.B4TbOqS-H4wJblaC-E-T7Q';

let selectedFelony = "murder";
let selectedYear = 2000;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74, 40.71],
    zoom: 12,
    pitch: 60,
    bearing: -17.6
});

// Tooltip Popup
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

// Function to dynamically get the color and height
function getColorAndHeight(feature) {
    var stat = feature.properties[selectedFelony + selectedYear];
    var color;
    if(selectedFelony === 'murder') {
     color = stat > 20 ? '#800026' :
                stat > 14.768 ? '#BD0026' :
                stat > 10.38  ? '#E31A1C' :
                stat > 7.33   ? '#FC4E2A' :
                stat > 4.93   ? '#FD8D3C' :
                stat > 3.16   ? '#FEB24C' :
                stat > 1.42   ? '#FED976' :
                                '#FFEDA0';
    }
    else if(selectedFelony === 'rape') {
        color = stat > 40 ? '#800026' :
           stat > 34.8  ? '#BD0026' :
           stat > 26.0  ? '#E31A1C' :
           stat > 20.26  ? '#FC4E2A' :
           stat > 15.98  ? '#FD8D3C' :
           stat > 11  ? '#FEB24C' :
           stat > 8.136   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(selectedFelony === 'assault') {
        color = stat > 600 ? '#800026' :
           stat > 432.78  ? '#BD0026' :
           stat > 317.66  ? '#E31A1C' :
           stat > 249.58  ? '#FC4E2A' :
           stat > 187.14  ? '#FD8D3C' :
           stat > 146.32  ? '#FEB24C' :
           stat > 102   ? '#FED976' :
                      '#FFEDA0';
    }
  
    
    
    else if(selectedFelony === 'burglary') {
        color = stat > 500 ? '#800026' :
           stat > 380  ? '#BD0026' :
           stat > 315.02  ? '#E31A1C' :
           stat > 264.08  ? '#FC4E2A' :
           stat > 214.756  ? '#FD8D3C' :
           stat > 164.56  ? '#FEB24C' :
           stat > 118.15   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(selectedFelony === 'grandlarency') {
        color = stat > 900 ? '#800026' :
           stat > 754  ? '#BD0026' :
           stat > 590.4  ? '#E31A1C' :
           stat > 495  ? '#FC4E2A' :
           stat > 433  ? '#FD8D3C' :
           stat > 361  ? '#FEB24C' :
           stat > 280   ? '#FED976' :
                      '#FFEDA0';
    }

    else if(selectedFelony === 'grandlarency_vehicles') {
        color = stat > 400 ? '#800026' :
           stat > 304  ? '#BD0026' :
           stat > 231  ? '#E31A1C' :
           stat > 182  ? '#FC4E2A' :
           stat > 138  ? '#FD8D3C' :
           stat > 88  ? '#FEB24C' :
           stat > 59   ? '#FED976' :
                      '#FFEDA0';
    }
    
    else if(selectedFelony === 'robbery') {
        color = stat > 600 ? '#800026' :
           stat > 403.54  ? '#BD0026' :
           stat > 308.52  ? '#E31A1C' :
           stat > 255.38  ? '#FC4E2A' :
           stat > 214.05  ? '#FD8D3C' :
           stat > 171.05  ? '#FEB24C' :
           stat > 117.59   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(selectedFelony === 'totalcrimes') {
        color = stat > 3000 ? '#800026' :
           stat > 2215  ? '#BD0026' :
           stat > 1843  ? '#E31A1C' :
           stat > 1581  ? '#FC4E2A' :
           stat > 1332  ? '#FD8D3C' :
           stat > 1147  ? '#FEB24C' :
           stat > 926   ? '#FED976' :
                      '#FFEDA0';
    }
    var height = stat * 1.5;
    return { color, height };
}

// Load the map and add data
map.on('load', function() {
    map.addSource('crime-data', {
        'type': 'geojson',
        'data': nydata1
    });

    addPolygonsLayer();
});

function addPolygonsLayer() {
    nydata1.features.forEach((feature, index) => {
        var { color, height } = getColorAndHeight(feature);
        feature.properties.color = color;
        feature.properties.height = height;

        feature.id = feature.properties.Precinct || index;
    });

    // Update the GeoJSON source
    map.getSource('crime-data').setData(nydata1);

    // Remove existing layers if needed
    if (map.getLayer('polygons')) map.removeLayer('polygons');
    if (map.getLayer('borders')) map.removeLayer('borders');

    // Add 3D polygons
    map.addLayer({
        'id': 'polygons',
        'type': 'fill-extrusion',
        'source': 'crime-data',
        'paint': {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.6
        }
    });

    // Add border lines for hover effects
    map.addLayer({
        'id': 'borders',
        'type': 'line',
        'source': 'crime-data',
        'paint': {
            'line-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], '#FFFF00', // Yellow on hover
                '#000000' // Default white
            ],
            'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 6, // Thicker on hover
                2 // Default thickness
            ],
            'line-opacity': 0.9
        }
    });
}

// Hover effects + Tooltip
let hoveredFeatureId = null;

map.on('mousemove', 'polygons', function(e) {
    if (e.features.length > 0) {
        if (hoveredFeatureId !== null) {
            map.setFeatureState(
                { source: 'crime-data', id: hoveredFeatureId },
                { hover: false }
            );
        }
        
        let feature = e.features[0];
        hoveredFeatureId = feature.properties.Precinct; //get the precinct of the hovered area

        if (hoveredFeatureId !== undefined) { //if it doesn't exist, use the id
            map.setFeatureState(
                { source: 'crime-data', id: hoveredFeatureId },
                { hover: true }
            );

            // Show tooltip
            let crimeCount = feature.properties[selectedFelony + selectedYear];
            popup.setLngLat(e.lngLat)
                .setHTML(
                    `<strong>Precinct: ${hoveredFeatureId}</strong><br>
                     ${selectedFelony} in ${selectedYear}: <strong>${crimeCount}</strong>`
                )
                .addTo(map);
        }
    }
});

map.on('mouseleave', 'polygons', function() {
    if (hoveredFeatureId !== null) {
        map.setFeatureState(
            { source: 'crime-data', id: hoveredFeatureId },
            { hover: false }
        );
    }
    hoveredFeatureId = null;
    popup.remove(); // Hide tooltip
});

// Update felony type
function getFelony() {
    selectedFelony = document.getElementById("Felonies").value;
    addPolygonsLayer();
}

// Update year
function getYear() {
    selectedYear = document.getElementById("Years").value;
    addPolygonsLayer();
}
