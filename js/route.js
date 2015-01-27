$(document).ready(function() {

    $("#fav-add").click({
        param: "routeAdd_view"
    }, showView);


    $("#fav-edit").click({
        param: "routeEdit_view"
    }, showView);



    $("#fav-left button").click(function() {
        var clicked = false;
        $("#fav-left button").each(function() {
            if ($(this).hasClass('clicked')) {
                $(this).removeClass('clicked');
            }
        });

        $(this).toggleClass('clicked');

    });

    $("#fav-right button").click(function() {
        var clicked = false;
        $("#fav-right button").each(function() {
            if ($(this).hasClass('clicked')) {
                $(this).removeClass('clicked');
            }
        });

        $(this).toggleClass('clicked');

    });


});