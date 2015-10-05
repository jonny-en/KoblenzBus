$(document).ready(function(){
	
	$("#backbtn-settings").click({
        param: 'route_view'
    }, showView);
	
	// first button in settings is to reset favoritelist
	// an empty list gets assigned to the favoritelist in localforage
	$("#clearbtn").click(function(){
		localforage.setItem("favList",[],function(err){});
		location.reload();
	});
});
