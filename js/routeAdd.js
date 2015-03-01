$(document).ready(function(){
  $("#locationbtn").click(function(){
    if($("#location").hasClass("notselected")){
     $("#location").removeClass("notselected").addClass("selected");
     $("#manual").removeClass("selected").addClass("notselected");
     $("#manualview").css("z-index","-1");
     $("#locationview").css("z-index","1");
    }
  });
  
  $("#manualbtn").click(function(){
    if($("#manual").hasClass("notselected")){
     $("#manual").removeClass("notselected").addClass("selected");
     $("#location").removeClass("selected").addClass("notselected");
     $("#locationview").css("z-index","-1");
     $("#manualview").css("z-index","1");
    }
  });

   $("#backbtnAdd").click({
        param: 'route_view'
    }, showView);
	
	 $("#changeIconAdd").click({
				param: 'chooseIcon_view'
		},showView);
		

	$("#trackLocation").click(function(){
		findStops();
	});

  $("#addStop-add").click(function(){
    $("#stoplist-add").append('<li><p><input class="stopname" type="text" placeholder="Haltestellenname" /></p></li>')
  });

   $("#deleteStop-add").click(function(){
    if($("#stoplist-add").children().last().attr("id")!="first"){
      $("#stoplist-add").children().last().remove();
    }
  });
		// for now you can only manually add favorites
		// before adding it to localforage check if there is already an entry with same referencename
		// if the list wasn't already initialised it gets initialised
		$("#addbtn").click(function(){
			if($("#stopname").val()!== "" && $("#stopname").val() !== "" && $("#reference").val() !== ""){
				var obj = new Object();
				obj.stopname = [];

        //Find stopnames by lookibg for class
        $('.stopname').each(function(index) {
          obj.stopname.push($(this).val());
        });

				obj.town = $("#town").val();
				obj.icon = "heart";
				obj.reference = $("#reference").val();

				localforage.getItem("favList",function(err,value){
					var favList = value;
					if(favList === null){
						favList = [];
						favList.push(obj);
						localforage.setItem("favList",favList,function(err){location.reload();});
					}else{
						var contains = false;
						for(var i = 0;i < favList.length; i++){
							if(favList[i].reference === obj.reference){
								contains = true;
							}
						}
						if(!contains){
							favList.push(obj);
							localforage.setItem("favList",favList,function(err){location.reload();});
						}
					}		
				});
				
			}
					
		});
    
	$("#changeIconEdit").click(function(){
		$('.view').each(function(index) {
    	if($(this).attr('id') == 'chooseIcon_view') {
      	$(this).show();
      }else {
      	$(this).hide();
      }
		});
		$(".iconDiv").click(function(event){
			var icon = event.target.id;
			if(icon!=""){
				$("#icon-add").remove();
				$("#icon-container").append('<div id="icon-add" name="'+icon+'"><img src="img/icons/favs/'+icon+'.svg"></img></div>');
				
				

				$('.view').each(function(index) {
    			if($(this).attr('id') == 'routeAdd_view') {
      			$(this).show();
      		}else {
      			$(this).hide();
      		}
				});
			}
		});
	});	

});


//Globals 
var range=200.0;

function findStops(){
  //Normale Lösung
  /*
  if ("geolocation" in navigator) {
  // geolocation is available 
  navigator.geolocation.getCurrentPosition(function(position) {
    getTownNamesByPosition(position.coords.latitude, position.coords.longitude);
  });
  } else {
  // geolocation IS NOT available 
  console.log("Sorry but your geolocation is not available!");
  }
  */

  //TEST Version
  getStopAndTownByPosition(50.3611643, 7.559261);
}

function getStopAndTownByPosition(latitude,longitude){
  var request="[out:json];is_in("+latitude+","+longitude+");out;node(around:"+range+","+latitude+","+longitude+");out;"; // Alle Routen mit Haltestellen etc
  var query='http://overpass-api.de/api/interpreter?data='+request;

  var x = new XMLHttpRequest();
  x.open("GET", query);
  x.onload = x.onerror = function(){
      console.log("LOADING COMPLETE");
      
      var responseObject = JSON.parse(x.responseText);
      var elements = responseObject.elements;
      var town = null;
      var busStops = [];
      for (var i=0; i<elements.length; i++){
        if (elements[i].type === "area"){
          //console.log(JSON.stringify(elements[i].tags));
          if (elements[i].tags['de:place']==="city"){
            town = elements[i].tags.name;
          }
        }
        if (elements[i].type==="node"){
          if (elements[i].tags != null){
            if((elements[i].tags.highway === "bus_stop")||(elements[i].tags.amenity === "bus_station")||(elements[i].tags.public_transport === "platform")){
              if (busStops.indexOf(elements[i].tags.name)===-1){
                busStops.push(elements[i].tags.name);
              }
            } 
          }
        }
      }
      if (town===null){ //Stadt nicht gefunden -> alert
        console.log("ERROR, STADT NICHT GEFUNDEN!");
        alert("Keine Haltestellen gefunden");
        return;
      }
      if (busStops === []){ //Stops nicht gefunden -> alert
        console.log("NO BUSSTOPS IN YOUR AREA!");
        alert("Keine Haltestellen gefunden");
        return;
      }
      if (busStops.length===1){ // 1 Ergebnis -> Trage ein
        console.log("1 BUSSTOPS IN YOUR AREA!");
        if($("#manual").hasClass("notselected")){
           $("#manual").removeClass("notselected").addClass("selected");
           $("#location").removeClass("selected").addClass("notselected");
           $("#locationview").css("z-index","-1");
           $("#manualview").css("z-index","1");
        }
        
        $("#town").val(town);
        $("#firststop").val(busStops[0]);
        
      } else{ // mehrere Ergebnisse -> Auswahlbildschirm -> Trage ein

        console.log("MULTIPLE BUSSTOPS IN YOUR AREA!");
        $('.view').each(function(index) {
	        if ($(this).attr('id') == 'stopSelection_view') {
	            $(this).show();
	        } else {
	            $(this).hide();
        	}
        });

        $("#stops").empty();
        //Fülle mit Liste
		for (var n=0; n<busStops.length;n++){
	          $("#stops").append("<li><button class='stopselect-btn' id='btn"+n+"'>"+busStops[n]+"</button></li>");
	          $("#btn"+n).click(function(){
                if($(this).hasClass('clicked')){
                  $(this).removeClass('clicked');
                }else{
                  $(this).toggleClass('clicked');
                }
       		  });
	    }
      $("#stops").append("<li><button id='continue-track'>Weiter</button></li>");
      $("#continue-track").click(function(){
                //All checked in an Array -> Fill Add
                var selectedButtons =[];
                $(".stopselect-btn").each(function(){
                  if($(this).hasClass('clicked')){
                    selectedButtons.push($(this).text());
                  }
                });

                //Zurück zu RouteAdd 
                $('.view').each(function(index) {
                if ($(this).attr('id') == 'routeAdd_view') {
                   $(this).show();
                } else {
                    $(this).hide();
                }
              });
              //Switch auf manual
              if($("#manual").hasClass("notselected")){
                 $("#manual").removeClass("notselected").addClass("selected");
                 $("#location").removeClass("selected").addClass("notselected");
                 $("#locationview").css("z-index","-1");
                 $("#manualview").css("z-index","1");
              }
              $("#town").val(town);

              for (var n=0;n<selectedButtons.length;n++){
                if (n===0){
                  $("#firststop").val(selectedButtons[0]);
                } else {
                  $("#stoplist-add").append('<li><p><input class="stopname" type="text" placeholder="Haltestellenname" value="'+selectedButtons[n]+'" /></p></li>');
                }
                
              }
              
            });
      }



      console.log(town);
      console.log(JSON.stringify(busStops));

    };
  x.send(); 
}
