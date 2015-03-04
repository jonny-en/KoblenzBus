$(document).ready(function(){
 
   $("#backbtnDate").click({
        param: 'route_view'
    }, showView);

		$("#setTime").click(function(){
			if($("#departure_time").val()!=""&& $("#departure_date").val()!=""){
				
				var time = $("#departure_time").val().split(":");
				var date = $("#departure_date").val().split(".");
				
				var year = date[2];
				var month = date[1];
				var day = date[0];
				var hours = time[0];
				var minutes = time[1];
			
				var d = new Date(year, month, day, hours, minutes, 0, 0);

				localforage.setItem("date",d,function(err){
						$("#panel1").attr("aria-selected", true);
        				$("#panel2").attr("aria-selected", false);
        				$("#panel3").attr("aria-selected", false);
						location.reload();
				});
			}
			
			
		});

		$("#setNow").click(function(){
			localforage.removeItem("date",function(err){
				$("#panel1").attr("aria-selected", true);
        		$("#panel2").attr("aria-selected", false);
        		$("#panel3").attr("aria-selected", false);
				location.reload();
			});
		});
});
