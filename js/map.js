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
        slideUp.slideUp('300');}
    );


});



function onLocationFound(e) {
    var radius = e.accuracy / 2;
    geoLocation = e.latlng;
    var markerGeo = L.marker([50.3643368, 7.5601237], {
        icon: geoIcon
    }).addTo(map);
    markerGeo.bindPopup('Du bist hier!');
    L.circle([50.3643368, 7.5601237], radius).addTo(map);

}

function onLocationError(e) {
    alert(e.message);
}



function onMarkerClick(e) {
    
    slideUp.slideDown('300');
    slideUp.toggleClass('slideActive');

   
}



function onMapClick(e) {
    
    if(slideUp.hasClass('slideActive')){
        slideUp.slideUp('300');
        slideUp.toggleClass('slideActive');
    
    }
}


