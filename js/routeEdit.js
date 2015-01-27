$(document).ready(function(){
  $("#busstops a[href]").click(function(){
    $(this).parent().remove();
  });

   $("#backbtnEdit").click({
        param: 'route_view'
    }, showView);

});
