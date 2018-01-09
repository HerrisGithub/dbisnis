$(document).ready(function () {
   
});

 function follow(obj){
    $.get("/follow/"+obj.id,function (){})
    .done(function(resp){
        $('#'+obj.id).css({backgroundColor:'red'});
    }).fail(function(err){
        console.log(err);
    });
}