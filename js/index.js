$(document).ready(function() {
    //preload all views
	$("#routeEdit_view").load("../routeEdit.html");
    $("#route_view").load("../route.html");
    $("#map_view").load("../map.html");
    $("#date_view").load("../date.html");
    $("#routeAdd_view").load("../routeAdd.html");
    $("#routeEdit_view").load("../routeEdit.html");
	$("#settings_view").load("../settings.html");
	$("#chooseIcon_view").load("../chooseIcon.html");
    $("#stopSelection_view").load("../stopSelection.html");


    //Start Navi
    $("#panel1 , #tab1").click({
        param: 'route_view'
    }, showView);

    $("#panel2 , #tab2").click({
        param: 'map_view'
    }, showView);


    $("#panel3 , #tab3").click({
        param: 'date_view'
    }, showView);
    // End Navi

    //Start Navi design (clicked = blue)
    $("#panel1 , #tab1").click(function() {
        $("#panel1").attr("aria-selected", true);
        $("#panel2").attr("aria-selected", false);
        $("#panel3").attr("aria-selected", false);
    });

    $("#panel2 , #tab2").click(function() {
        $("#panel1").attr("aria-selected", false);
        $("#panel2").attr("aria-selected", true);
        $("#panel3").attr("aria-selected", false);
        checkMap();
    });

    $("#panel3 , #tab3").click(function() {
        $("#panel1").attr("aria-selected", false);
        $("#panel2").attr("aria-selected", false);
        $("#panel3").attr("aria-selected", true);

    });
    //End Navi design

});

//Change View. 
function showView(event) {
    $('.view').each(function(index) {
        if ($(this).attr('id') == event.data.param) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
};

function checkMap(){
    if (map==null){
        map = L.map('map');


      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ',
        id: 'examples.map-i875mjb7'
      }).addTo(map);
      map.setView(new L.LatLng(50.3533278, 7.5943951), 14);
    }
}
