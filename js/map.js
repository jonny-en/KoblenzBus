var map;
var GeoIcon = L.Icon.Default.extend({
    options: {
        iconUrl: 'js/libs/images/bus-icon.png'
    }
});
var geoIcon = new GeoIcon();
var geoLocation;
var slideUp = $('#slideup');
var point = new L.point([0,150]);

$(document).ready(function() {


    $("#settingsbtn-map").click({
        param: 'settings_view'
    }, showView);

});



function onLocationFound(e) {
    var radius = e.accuracy / 2;
    geoLocation = e.latlng;
    var markerGeo = L.marker(geoLocation, {
        icon: geoIcon
    }).addTo(map);
    L.circle(geoLocation, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}



function onMarkerClick() {
    
    slideUp.slideToggle('300');
    slideUp.toggleClass('slideActive');
    if (!(slideUp.hasClass('slideActive'))) {
        map.panBy(point);
        point = point.multiplyBy(-1);
    } else {
        map.panBy(point);
        point = point.multiplyBy(-1);
    }
}


function onMapClick(e) {
    
    if(slideUp.hasClass('slideActive')){
        slideUp.slideToggle('300');
        slideUp.toggleClass('slideActive');
        map.panBy(point);
        point = point.multiplyBy(-1);
    }
}


