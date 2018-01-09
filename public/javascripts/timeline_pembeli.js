$(document).ready(function () {
    var ably = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = ably.channels.get('dirbis');
    chan=channel;
    channel.subscribe('post',function(message) {
        loadTimeline();
    });
    loadTimeline();
    $('#searchBox').mousedown(function(){ 
      $('#filterDropdown').addClass('show');  
    })

    $('#searchBox').keyup(function(){ 
            $.get('/timeline/search/'+ $('#searchBox').val(),function(data,status){
                var temp='';
                data=JSON.stringify(data);
                data=JSON.parse(data);
                for(var i in data){
                    temp+=
                    '<a href="/users/'+data[i].id+'">'+data[i].fullname+'</a>';
                }
                $('.itemsearch').html(temp);
            
            })
    })
    
});
function filterFunction() {
    var input, filter, ul, li, a, i,div;
    input = document.getElementById("searchBox");
    filter = input.value.toUpperCase();
    div = document.getElementById("filterDropdown");
    a = div.getElementsByTagName("a");
    item = div.getElementsByClassName('itemsearch');
    for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                    item[i].style.display = "";
            } else {
                    item[i].style.display = "none";
            }
    }
}
function accordion(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-theme-d1";
    } else { 
        x.className = x.className.replace("w3-show", "");
        x.previousElementSibling.className = 
        x.previousElementSibling.className.replace(" w3-theme-d1", "");
    }
}
// Used to toggle the menu on smaller screens when clicking on the menu button
function openNav() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
}
function search(){}

function like(obj){
    var ably = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = ably.channels.get('dirbis');
  var button = obj.id;
  var likes_label = $('#like-'+button);
    
  $.post('/timeline/like',{id:button},function(){
  }).done(function(respone){
    
    var count = likes_label.text();
    if(count===''){
        count=0;
    }
    count++;
    likes_label.text(count);
    channel.publish('post','');
  }).fail(function(respone){
   
  })

}
function setLikes(i,postid){
    $.get('/likes/count/'+postid,function(data,status){
        $('#like-'+postid).text(data);
    })
}
function loadTimeline(){
     $.get('/pembeli/timeline/list',function(data,status){
            data=JSON.stringify(data);
            data=JSON.parse(data);
            var temp='';
            for(var i in data){
            postid=data[i].postid;
                temp+='<div class="w3-container w3-card-2 w3-white w3-round w3-margin"><br>'
                        +'<img src="'+data[i].photo+'" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:60px">'
                        +'<span class="w3-right w3-opacity">1 min</span>'
                        +'<h4>'+data[i].fullname+'</h4><br>'
                        +'<hr class="w3-clear">'
                            +'<div class="w3-row-padding" style="margin:0 -16px">'
                            +'<div class="w3-full">'
                                +'<img src="'+data[i].image+'" style="width:100%; border-repeat:round; " alt="Northern Lights" class="w3-margin-bottom">'
                            +'</div>'
                        +'</div>'
                         +'<p>'+data[i].content+'</p>'
                        +'<button id="'+data[i].postid+'" onClick="javascript:like(this)" type="button" class="w3-button w3-theme-d1 w3-margin-bottom"><i class="fa fa-thumbs-up"></i>  Like <span id="like-'+data[i].postid+'"></span></button> ' 
                        +'<button type="button" class="w3-button w3-theme-d2 w3-margin-bottom"><i class="fa fa-comment"></i>  Comment</button>'
                        +'</div>';
                setLikes(i,data[i].postid);
              
            }
            $('#middle-content').html(temp);
    });
    
    

}

