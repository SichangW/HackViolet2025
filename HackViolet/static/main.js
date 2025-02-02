var map = L.map('map').setView([40.71, -74], 10);
let selectedYear = 2000;
let selectedFelony = "murder";

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var geojsonLayer; // Declare geojsonLayer globally to update later

function style(feature) {
    console.log(feature.properties[selectedFelony + selectedYear]);

   // console.log(typeof(selectedFelony+selectedYear));
   //console.log(typeof(selectedYear));
    
    //console.log(max(feature.properties.murder2000))
    return {
        fillColor: getColor(feature.properties[selectedFelony + selectedYear], selectedFelony),
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function getColor(stat, crime) {
//console.log(stat) 
  // console.log(`Stat ${stat}  Crime: ${crime}`)
    if(crime === ("murder")) {
        return stat > 20 ? '#800026' :
        stat > 14.768  ? '#BD0026' :
        stat > 10.38  ? '#E31A1C' :
        stat > 7.33  ? '#FC4E2A' :
        stat > 4.93  ? '#FD8D3C' :
        stat > 3.16  ? '#FEB24C' :
        stat > 1.42   ? '#FED976' :
                   '#FFEDA0';
    }
    else if(crime === 'rape') {
        return stat > 40 ? '#800026' :
           stat > 34.8  ? '#BD0026' :
           stat > 26.0  ? '#E31A1C' :
           stat > 20.26  ? '#FC4E2A' :
           stat > 15.98  ? '#FD8D3C' :
           stat > 11  ? '#FEB24C' :
           stat > 8.136   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(crime === 'assault') {
        return stat > 600 ? '#800026' :
           stat > 432.78  ? '#BD0026' :
           stat > 317.66  ? '#E31A1C' :
           stat > 249.58  ? '#FC4E2A' :
           stat > 187.14  ? '#FD8D3C' :
           stat > 146.32  ? '#FEB24C' :
           stat > 102   ? '#FED976' :
                      '#FFEDA0';
    }
  
    
    
    else if(crime === 'burglary') {
        return stat > 500 ? '#800026' :
           stat > 380  ? '#BD0026' :
           stat > 315.02  ? '#E31A1C' :
           stat > 264.08  ? '#FC4E2A' :
           stat > 214.756  ? '#FD8D3C' :
           stat > 164.56  ? '#FEB24C' :
           stat > 118.15   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(crime === 'grandlarency') {
        return stat > 900 ? '#800026' :
           stat > 754  ? '#BD0026' :
           stat > 590.4  ? '#E31A1C' :
           stat > 495  ? '#FC4E2A' :
           stat > 433  ? '#FD8D3C' :
           stat > 361  ? '#FEB24C' :
           stat > 280   ? '#FED976' :
                      '#FFEDA0';
    }

    else if(crime === 'grandlarency_vehicles') {
        return stat > 400 ? '#800026' :
           stat > 304  ? '#BD0026' :
           stat > 231  ? '#E31A1C' :
           stat > 182  ? '#FC4E2A' :
           stat > 138  ? '#FD8D3C' :
           stat > 88  ? '#FEB24C' :
           stat > 59   ? '#FED976' :
                      '#FFEDA0';
    }
    
    else if(crime === 'robbery') {
        return stat > 600 ? '#800026' :
           stat > 403.54  ? '#BD0026' :
           stat > 308.52  ? '#E31A1C' :
           stat > 255.38  ? '#FC4E2A' :
           stat > 214.05  ? '#FD8D3C' :
           stat > 171.05  ? '#FEB24C' :
           stat > 117.59   ? '#FED976' :
                      '#FFEDA0';
    }
    else if(crime === 'totalcrimes') {
        return stat > 3000 ? '#800026' :
           stat > 2215  ? '#BD0026' :
           stat > 1843  ? '#E31A1C' :
           stat > 1581  ? '#FC4E2A' :
           stat > 1332  ? '#FD8D3C' :
           stat > 1147  ? '#FEB24C' :
           stat > 926   ? '#FED976' :
                      '#FFEDA0';
    }
    
    
}

function getYear() {  // get's the year from the 
    selectedYear = document.getElementById("Years").value; // Get selected year from dropdown
    console.log(selectedYear);

    // Remove the previous geojson layer before adding the new one
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    // Add the updated geojson layer with the new year
    geojsonLayer = L.geoJson(nydata1, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

function getFelony() {  // get's the year from the 
    selectedFelony = document.getElementById("Felonies").value; // Get selected year from dropdown

    // Remove the previous geojson layer before adding the new one
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    // Add the updated geojson layer with the new year
    geojsonLayer = L.geoJson(nydata1, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

// Declare the data and initialize geojson layer
geojsonLayer = L.geoJson(nydata1, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });

    // Add a tooltip that displays information when hovering
    layer.bindTooltip(function (layer) {
        return "District: " + feature.properties.Precinct + `<br>${selectedFelony} in ` + selectedYear + ": " + feature.properties[selectedFelony + selectedYear];
    }, {
        permanent: false,
        direction: 'auto'
    });

    // Optional: Add a popup
    layer.bindPopup(function (layer) {
        return "<b>District:</b> " + feature.properties.district_name + "<br><b>Felonies in " + selectedYear + ":</b> " + feature.properties[selectedFelony + selectedYear];
    });
}
