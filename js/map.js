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

    $("#exit").click(function(){
        slideUp.slideToggle('300');}
    );

});



function onLocationFound(e) {
    var radius = e.accuracy / 2;
    geoLocation = e.latlng;
    var markerGeo = L.marker(geoLocation, {
        icon: geoIcon
    }).addTo(map);
    markerGeo.bindPopup('Du bist hier!');
    L.circle(geoLocation, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}



function onMarkerClick() {
    
    slideUp.slideToggle('300');
    slideUp.toggleClass('slideActive');
   
}


function onMapClick(e) {
    
    if(slideUp.hasClass('slideActive')){
        slideUp.slideToggle('300');
        slideUp.toggleClass('slideActive');
    
    }
}


