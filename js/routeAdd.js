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

    
});