$(document).ready(function(){


   $("#backbtnEdit").click({
        param: 'route_view'
    }, showView);
	 
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
				console.log(icon);
				$("#icon").remove();
				$("#iconContainer-edit").append('<div id="icon-edit" name="'+icon+'"><img src="img/icons/favs/'+icon+'.svg"></img></div>');
				
				

				$('.view').each(function(index) {
    			if($(this).attr('id') == 'routeEdit_view') {
      			$(this).show();
      		}else {
      			$(this).hide();
      		}
				});
			}
		});
	});

	// page needs to be reloaded for same reasons as in route.js
	$("#backbtnEdit").click(function(){
		location.reload();
	});
});
