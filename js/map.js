var map;
<<<<<<< HEAD
$(document).ready(function(){
=======

var GeoIcon = L.Icon.Default.extend({
    options: {
        iconUrl: 'js/libs/images/bus-icon.png'
    }
});

var geoIcon = new GeoIcon();

$(document).ready(function() {
>>>>>>> origin/master

	
	$("#settingsbtn-map").click({
		param: 'settings_view'
	}, showView);

});



	

