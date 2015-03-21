
var map;
var markers;

// Icons
var GreenIcon;
var greenIcon = null;
var RedIcon;
var redIcon = null;
var PinkIcon;
var pinkIcon = null;
var LightgreenIcon;
var lightgreenIcon = null;

var current_construction_id = null;

$(document).ready(function() {
  if ($('#map').exists()) {
    var ConstructionIcon = L.Icon.Default.extend({ options: { iconUrl: '/static/img/under_construction_icon.png', iconSize: [40, 35] } });
    constructionIcon = new ConstructionIcon();
    var RedIcon = L.Icon.Default.extend({ options: { iconUrl: '/static/js/images/marker-icon-red.png' } });
    redIcon = new RedIcon();
    var PinkIcon = L.Icon.Default.extend({ options: { iconUrl: '/static/js/images/marker-icon-pink.png' } });
    pinkIcon = new PinkIcon();
    var LightgreenIcon = L.Icon.Default.extend({ options: { iconUrl: '/static/js/images/marker-icon-lightgreen.png' } });
    lightgreenIcon = new LightgreenIcon();
    
    map = new L.Map('map', {});
    var backgroundLayer = new L.TileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
      maxZoom: 18,
      minZoom: 4,
      attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> contributors, Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>.'
    });
    map.setView(new L.LatLng(51.451117, 6.629194), 13).addLayer(backgroundLayer);
    /*$.getJSON('/static/js/bochum.json', function(result) {
      route = L.geoJson(result, {
        style: {
          'color': "#000000",
          'weight': 2,
          'opacity': 0.65
        }
      }).addTo(map);
    });*/
    if ($('#flashes').exists())
      close_sidebar();
    get_construction_sites();
  }
});


function get_construction_sites() {
  $.getJSON('/construction-list', function(result) {
    if (!markers) {
      markers = new L.LayerGroup();
      markers.addTo(map);
    }
    else
      markers.clearLayers();
    $.each(result['response'], function(key, construction) {
      marker = L.marker([construction['lat'], construction['lng']], {icon: constructionIcon, title: construction.id});
      marker.on('click', function (current_marker) {
        if ($('#flashes').exists())
          $('#flashes').remove();
        current_marker_id = current_marker['target']['options']['title'];
        $.getJSON('/construction-details?id=' + current_marker_id, function(result) {
          $("#details").animate({width:"290px"});
          construction = result['response'];
          current_construction_id = construction['id'];
          var html = '<span id="close-sidebar" onclick="close_sidebar();">schließen</span>';
          html += '<h2>Details</h2>';
          
          if (construction['begin'])
            html += '<h3>Start</h3><p>' + construction['begin'] + '</p>';
          html += '<h3>Ende</h3><p>' + construction['end'] + '</p>';
          
          if (construction['descr'])
            html += '<h3>Beschreibung</h3><p>' + construction['descr'] + '</p>';
          html += '<h3>Ort</h3><p>' + construction['position_descr'] + '</p>';
          html += '<h3>Bauherr</h3><p>' + construction['constructor'] + '</p>';
          if (construction['execution'])
            html += '<h3>Bauunternehmen</h3><p>' + construction['execution'] + '</p>';
          
          $('#details').html(html);
        });
      });
      markers.addLayer(marker);
    });
  });
}

function close_sidebar() {
  $("#details").html('');
  $("#details").animate({width:"0px", 'padding-left': '0px', 'padding-right': '0px'});
}

function filterGeocodingChoices(results) {
  results = deepCopy(results);
  // Alle Einträge bekommen eigenen Qualitäts-Koeffizienten
  for (var n in results) {
    results[n].okquality = 1.0;
    // verdreifache wenn neighborhood gesetzt
    if (results[n].address.suburb != '') {
      results[n].okquality *= 3.0;
    }
    // verdopple wenn PLZ gesetzt
    if (results[n].address.postcode != '') {
      results[n].okquality *= 3.0;
    }
    // keine Straße gesetzt: Punktzahl durch 10
    if (typeof(results[n].address.road) === 'undefined') {
        results[n].okquality *= 0.1;
    }
  }
  // Sortieren nach 'okquality' abwärts
  results.sort(qualitySort);
  var resultByPostCode = {};
  var n;
  for (n in results) {
    if (typeof(resultByPostCode[results[n].address.postcode]) === 'undefined') {
      resultByPostCode[results[n].address.postcode] = results[n];
    }
  }
  ret = [];
  for (n in resultByPostCode) {
    ret.push(resultByPostCode[n]);
  }
  // Sortieren nach Längengrad
  ret.sort(longitudeSort);
  return ret;
}

function longitudeSort(a, b) {
  return parseFloat(a.lon) - parseFloat(b.lon)
}

function qualitySort(a, b) {
  return b.okquality - a.okquality
}

function deepCopy(obj) {
  if (typeof obj !== "object") return obj;
  if (obj.constructor === RegExp) return obj;
  
  var retVal = new obj.constructor();
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    retVal[key] = deepCopy(obj[key]);
  }
  return retVal;
}

jQuery.fn.exists = function(){return this.length>0;}