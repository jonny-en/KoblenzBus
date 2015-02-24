$(document).ready(function() {
			
			var index;
			// load favorites from localforage and add them to the favorites-lists
			localforage.getItem("favList",function(err,value){
				for(var i = 0; i < value.length; i++){
					$("#fav-left").append("<li><button><img src=\"img/icons/favs/"+value[i].icon+".svg\" /></button><h3>"+value[i].reference+"</h3></li>");
			
					$("#fav-right").append("<li><button><img src=\"img/icons/favs/"+value[i].icon+".svg\" /></button><h3>"+value[i].reference+"</h3></li>");	
				}		
			});

    $("#fav-add").click({
        param: "routeAdd_view"
    }, showView);


    $("#fav-edit").click({
        param: "routeEdit_view"
    }, showView);

		$("#settingsbtn-route").click({
				param: "settings_view"
		}, showView);

		// if alreadyclicked button is clicked remove class click
		// else add class to clicked button and remove from other buttons
    $("#fav-left").on('click','button',function() {
			if($(this).hasClass('clicked')){
				$(this).removeClass('clicked');
			}else{
        $("#fav-left button").each(function() {
            if ($(this).hasClass('clicked')) {
                $(this).removeClass('clicked');
            }
        });

        $(this).toggleClass('clicked');
			}
    });

    $("#fav-right").on('click','button',function() {
			if($(this).hasClass('clicked')){
				$(this).removeClass('clicked');
			}else{
        $("#fav-right button").each(function() {
            if ($(this).hasClass('clicked')) {
                $(this).removeClass('clicked');
            }
        });

        $(this).toggleClass('clicked');
			}
    });

	// change favoritelist in localforage
	// for now you can only change the referencename
	// also it reloads the whole page, because else you can only add one favorite
	// for some reason the click-event only works one time

	$('#busstops').on('click','button',function(){
			if(index!=null){
				localforage.getItem("favList",function(err,value){
					value[index].reference = $('#name-edit').val();
					value[index].icon = "heart";
					localforage.setItem("favList",value,function(err){location.reload();});
				});
			}
		});
	
	// find reference name of clicked button
	// the referencename is unique because it gets checked before adding new favorites
	// find entry in favoritelist with referencename and show stopname, and reference
	// now you can change attributes and it changes in localforage after you press "bestätigen"
	$("#fav-edit").click(function(){
			var referencename;
			$("#fav-left button").each(function(){
				if($(this).hasClass('clicked')){
					referencename = $(this).parent().children('h3').html();
				}		
			});
			if(referencename){
				$('#name-edit').val(referencename);
				localforage.getItem("favList",function(err,value){
					for(var i = 0; i < value.length; i++){
						if(value[i].reference === referencename){
							index = i;
						}
					}
					$('#busstops-edit').append("<div><legend class=\"action\">"+value[index].stopname+"</legend><a href=\"#\"><div class=\"delete\"><span></span></div></a></div>");
				});
			}
		});
		
	$("#route-confirm").click(function(){ //Reset Liste
		localforage.getItem("favList",function(err,value){		
			var favoriteList = value;
			var startName;
			var destinationName;
			$("#fav-left button").each(function(){
					if($(this).hasClass('clicked')){
						startName = $(this).parent().children('h3').html();
					}		
			});


			$("#fav-right button").each(function(){
					if($(this).hasClass('clicked')){
						destinationName = $(this).parent().children('h3').html();
					}		
			});	

			if(startName!=null && destinationName!=null && startName!=destinationName){
				
        for (var i=0; i<favoriteList.length;i++){
          if (favoriteList[i].reference===startName){
            var start = favoriteList[i];
          }
          if (favoriteList[i].reference===destinationName){
            var destination = favoriteList[i]; 
          }
        }


      	//Finde ausgewählte Elemente und baue daraus Anfragen
      	var startQuery= start.stopname +" "+ start.town;
      	var destinationQuery= destination.stopname +" "+destination.town;
      	getData(startQuery,destinationQuery,null);

      }
 	  });	//getTownNamesByPosition(testPosLat,testPosLon);
 	});
});
