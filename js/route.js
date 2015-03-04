$(document).ready(function() {
			loadOverpassData();
			localforage.getItem("date",function(err,value){
				if (value != null){
					$("#route-confirm").empty();
					var text = "<p>Los ("+value.getDate()+"."+value.getMonth()+"."+value.getFullYear()+" - "+value.getHours()+":"+value.getMinutes()+")</p>";
					$("#route-confirm").append(text);
				} else {
					$("#route-confirm").empty();
					$("#route-confirm").append("<p>Los</p>");
				}

			});
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

	$('#savebtn-edit').on('click',function(){
			if(index!=null){
				localforage.getItem("favList",function(err,value){
					for (var i=0; i<value.length; i++){
							if((value[i].reference === $('#name-edit').val())&&(i!=index)){
								alert("Name ist schon vergeben!");
								return;
							}
					}

					value[index].reference = $('#name-edit').val();
					value[index].icon = $("#icon-edit").attr("name");

					var stopname = [];

        			//Find stopnames by lookibg for class
        			$('.stopname').each(function(index) {
	          			if ($(this).val()!="" && $(this).val()!=null){
	            			stopname.push($(this).val());
	          			}          
        			});
        			value[index].stopname=stopname;
					value[index].town = $("#town-edit").val();
					localforage.setItem("favList",value,function(err){
						index = null;
						location.reload();
					});
				});
			}
		});

	$("#deletefavbtn").click(function(){
		if(index!=null){
			localforage.getItem("favList",function(err,value){
				value.splice(index,1);
				localforage.setItem("favList",value,function(err){
					index = null;
					location.reload();
				});	
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
				$('.view').each(function(index) {
			        if ($(this).attr('id') == "routeEdit_view") {
			            $(this).show();
			        } else {
			            $(this).hide();
			        }
			    });
				$('#name-edit').val(referencename);
				localforage.getItem("favList",function(err,value){
					for(var i = 0; i < value.length; i++){
						if(value[i].reference === referencename){
							index = i;
						}
					}
					$('#town-edit').val(value[index].town);
					for (var n=0; n < value[index].stopname.length; n++){
						if (n===0){
                  			$("#firststop-edit").val(value[index].stopname[0]);
		                } else {
		                  $("#stoplist-edit").append('<li><p><input class="stopname" type="text" placeholder="Haltestellenname" value="'+value[index].stopname[n]+'" /></p></li>');
		                }
					}
					$('#iconContainer-edit').append('<div id="icon-edit" name="'+value[index].icon+'"><img src="img/icons/favs/'+value[index].icon+'.svg"></img></div>');
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

        localforage.getItem("date",function(err,value){
        	getData(start,destination,value);
        });
      	

      }
 	  });	//getTownNamesByPosition(testPosLat,testPosLon);
 	});
});
