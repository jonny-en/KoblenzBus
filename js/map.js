var map;
var GeoIcon = L.Icon.Default.extend({
    options: {
        iconUrl: 'js/libs/images/bus-icon.png'
    }
});
var geoIcon = new GeoIcon();
var geoLocation;
var slideUp = $('#slideup');


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
    }).addTo(map).on('click', onMarkerClick);
    L.circle(geoLocation, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}



function onMarkerClick() {
    
    slideUp.slideToggle('slow');
    slideUp.toggleClass('slideActive');
    if (!(slideUp.hasClass('slideActive'))) {
        map.panTo(this.getLatLng())
    } else {
    	map.panTo([this.getLatLng().lat - 0.007, this.getLatLng().lng])
    }
}


function onMapClick(e) {
    
    if(slideUp.hasClass('slideActive')){
        slideUp.slideToggle('slow');
        slideUp.toggleClass('slideActive');
    }
}


