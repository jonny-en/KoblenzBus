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
		

		// for now you can only manually add favorites
		// before adding it to localforage check if there is already an entry with same referencename
		// if the list wasn't already initialised it gets initialised
		$("#addbtn").click(function(){
			if($("#stopname").val()!== "" && $("#stopname").val() !== "" && $("#reference").val() !== ""){
				var obj = new Object();
				obj.stopname = $("#stopname").val();
				obj.town = $("#town").val();
				obj.icon = "heart";
				obj.reference = $("#reference").val();

				localforage.getItem("favList",function(err,value){
					var favList = value;
					if(favList === null){
						favList = [];
						favList.push(obj);
						localforage.setItem("favList",favList,function(err){});
						$("#route_view").load("../route.html");
					}else{
						var contains = false;
						for(var i = 0;i < favList.length; i++){
							if(favList[i].reference === obj.reference){
								contains = true;
							}
						}
						if(!contains){
							favList.push(obj);
							localforage.setItem("favList",favList,function(err){});
							location.reload();
						}
					}		
				});
				
			}
					
		});
    
});
