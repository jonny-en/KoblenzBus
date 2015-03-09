var map;

var GeoIcon = L.Icon.Default.extend({
    options: {
        iconUrl: 'js/libs/images/bus-icon.png'
    }
});

var geoIcon = new GeoIcon();

$(document).ready(function() {


    $("#settingsbtn-map").click({
        param: 'settings_view'
    }, showView);

});



function onLocationFound(e) {
    var radius = e.accuracy / 2;
    var markerGeo = L.marker(e.latlng, {
        icon: geoIcon
    }).addTo(map);
    L.circle(e.latlng, radius).addTo(map);
}
