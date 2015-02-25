$(document).ready(function(){


   $("#backbtnEdit").click({
        param: 'route_view'
    }, showView);
	 
	$("#changeIconEdit").click({
			param: 'chooseIcon_view'
		}, showView);

	// page needs to be reloaded for same reasons as in route.js
	$("#backbtnEdit").click(function(){
		location.reload();
	});
});
