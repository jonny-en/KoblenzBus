$(document).ready(function(){

	$("#addStopEdit").click(function(){
		$("#stoplistEdit").append('<li><p><input class="stopname" type="text" placeholder="Haltestellenname" /></p></li>')
	});

	$("#deleteStopEdit").click(function(){
		if($("#stoplistEdit").children().last().attr("id")!="firstEdit"){
			$("#stoplistEdit").children().last().remove();
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
				console.log(icon);
				$("#icon-edit").remove();
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
