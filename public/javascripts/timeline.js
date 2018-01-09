var right=0;
var count=0;
var sess;
var chatroom_id;
var usr;
$(document).ready(function () {
   var socket = io();
     $.get('/sess',function(data,status){
    data = JSON.parse(JSON.stringify(data));
    sess=data.users_name;
    var ably = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = ably.channels.get('dirbis');

    socket.on('istyping'+1502034338+sess,function(){
        $('#typing').text('istyping');
    });
    socket.on('notTyping'+1502034338+sess,function(){
        setTimeout(function() {
              $('#typing').text('');
        }, 3500);
      
    });
    
    channel.subscribe('post',function(message) {
        loadTimeline();
        loadFollowers();
    });
    // channel.subscribe('istyping'+1502034338+sess,function(message){
    //     $('#typing').text('istyping');
    // });
    channel.subscribe(chatroom_id,function(message){
        clearMessage('message-'+chatroom_id);
        messageBox(usr);
    })


    loadTimeline();
    loadFollowers();
    messagePosition();
    //chatbox
	$(document).on('click', '.panel-heading span.icon_minim', function (e) {
		var $this = $(this);
		if (!$this.hasClass('panel-collapsed')) {
            $this.parents('.panel').find('.panel-body').slideUp();
            $this.parents('.panel').find('.panel-footer').slideUp();
			$this.addClass('panel-collapsed');
            $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
		} else {
            $this.parents('.panel').find('.panel-body').slideDown();
            $this.parents('.panel').find('.panel-footer').slideDown();
			$this.removeClass('panel-collapsed');
            $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
		}
	});
	$(document).on('click', '.icon_close', function (e) {
        $(this).parent().parent().parent().parent().remove();
        count--;
        right-=220;
    });
    $(document).on('click', '#btn-chat', function (e) {
        var $this = $(this);
        var textBox=$this.parents('.chatbox').find('.chat_input');
        // $this.parent().parent().parent().parents('.panel').find('.panel-body').append(retSendMessage(textBox.val()));
        var doc={
            chat_room_id:chatroom_id,
            user:sess,
            message:textBox.val()
        }
         $.post('/penjual/message/send',doc,function(){
            })
            .done(function(respone){
                console.log('ok');
                messagePosition();
            }).fail(function(respone){
        
        })
        channel.publish(doc.chat_room_id,textBox.val());   
        textBox.val('');
    });
    $(document).on('keypress', '#btn-input', function (e) {
         socket.emit('istyping','istyping'+chatroom_id+sess);
    });
    $(document).on('keyup', '#btn-input', function (e) {
         socket.emit('notTyping','notTyping'+chatroom_id+sess);
    });

    var body =document.getElementsByTagName('body')[0];
	var act = document.getElementById('actScrolling');
	var contact =  document.getElementById('contactScrolling');
	var chatbox = document.getElementsByClassName('msg_container_base')[0];
	body.addEventListener('mousewheel',preventDef,false);
	act.addEventListener('mousewheel',preventDef,false);
	contact.addEventListener('mousewheel',preventDef,false);
	$('#actScrolling').mouseenter(function(){
		body.removeEventListener('mousewheel',preventDef,false);
	});
	$('#actScrolling').mouseleave(function(){
		body.addEventListener('mousewheel',preventDef,false);
	});
	$('#rightFixed').css({marginTop:'100px'})
        
    })
});
function messagePosition(){
    var messageBase = $('#message-'+chatroom_id);
    messageBase.stop().animate({
        scrollTop: messageBase.height()*10
    }, 0);
}

function retReceiveMessage(text){
    return '<div class="panel-body msg_container_base">'+
                    '<div class="row msg_container base_receive">'+
                        '<div class="col-md-2 col-xs-2 avatar">'+
                            '<img src="/dirbis.png" class=" img-responsive ">'+
                        '</div>'+
                        '<div class="col-md-10 col-xs-10">'+
                            '<div class="messages msg_receive">'+
                                '<p>'+text+'</p>'+
                                '<time datetime="2009-11-13T20:00">Timothy • 51 min</time>'+
                            '</div>'+
                        '</div>'+
                '</div>';
}
function retSendMessage(text){
    return '<div class="row msg_container base_sent">'+
                        '<div class="col-md-10 col-xs-10 ">'+
                            '<div class="messages msg_sent">'+
                            '<p>'+text+'</p>'+
                                '<time datetime="2009-11-13T20:00">Timothy • 51 min</time>'+
                            '</div>'+
                        '</div>'+
                        '<div class="col-md-2 col-xs-2 avatar">'+
                            '<img src="/dirbis.png" class=" img-responsive ">'+
                        '</div>'+
                    '</div>';
}
function clearMessage(id){
    $('#'+id).empty();
}
function messageBox(user){
    var id =user;
    $.getJSON("/penjual/user/follow/"+id,
    function (data, textStatus, jqXHR) {
        var follower=data.follower;
        var following= data.following;
        $.get('/penjual/message/'+follower+'/'+following,function(data,status){
            data=JSON.stringify(data);
            data=JSON.parse(data);
            if(!isEmpty(data)){
                chatroom_id=data[0].chat_room_id;
                for(var i in data){
                    if(sess===data[i].user){
                        insertMessage('message-'+data[i].chat_room_id,1,data[i].message);
                    }else{
                        insertMessage('message-'+data[i].chat_room_id,0,data[i].message);
                    }
                }
            }        
        });
         messagePosition();
    });
}
function isEmpty(obj){
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
function chatbox(obj){
    var id =obj.id;
    usr=id;
    $.getJSON("/penjual/user/follow/"+id,
        function (data, textStatus, jqXHR) {
            var follower=data.follower;
            var following= data.following;
            $.get('/penjual/message/'+follower+'/'+following,function(data,status){
                data=JSON.stringify(data);
                data=JSON.parse(data);
                    if(isEmpty(data)){
                        chatroom_id=generateId();
                        var doc={
                            id:chatroom_id,
                            user1:sess,
                            user2:obj.innerHTML
                        };
                        $.post('/penjual/chat/room/create',doc,function(){
                            })
                            .done(function(respone){
                                    chatTemplate(chatroom_id,220,obj.innerHTML);
                            }).fail(function(respone){
                                
                        })
                }else{
                    chatTemplate(data[0].chat_room_id,220,data[0].user);
                    chatroom_id=data[0].chat_room_id;
                    for(var i in data){
                        if(sess===data[i].user){
                            insertMessage('message-'+data[i].chat_room_id,1,data[i].message);
                        }else{
                            insertMessage('message-'+data[i].chat_room_id,0,data[i].message);
                        }
                    }    
                }  
                  messagePosition();  
            });
        }
    );



    
}

function chatTemplate(chatroom_id,right,name){
       var temp= 
       
    '<div class="row chat-window col-xs-5 col-md-3" id="'+chatroom_id+'" style="margin-left:10px; position:fixed; right:220px;">'+
    '<div class="col-xs-12 col-md-12">'+
        	'<div class="panel panel-default">'+
                '<div class="panel-heading top-bar">'+
                    '<div class="col-md-8 col-xs-8">'+
                        '<h3 class="panel-title"><span class="glyphicon glyphicon-comment"></span> Chat - '+name+'</h3>'+
                    '</div>'+
                    '<div class="col-md-4 col-xs-4" style="text-align: right;">'+
                        '<a href="#"><span id="minim_chat_window" class="glyphicon glyphicon-minus icon_minim"></span></a>'+
                        '<a href="#"><span class="glyphicon glyphicon-remove icon_close" data-id="chat_window_1"></span></a>'+
                    '</div>'+
                '</div>'+
                '<div id="message-'+chatroom_id+'" class="panel-body msg_container_base" style="min-height:280px; overflow-y:scroll">'+
                   
                '</div>'+
                '<div class="panel-footer">'+
                    '<p id="typing"></p>'+
                    '<div class="input-group chatbox">'+
                        '<input id="btn-input" type="text" class="form-control input-sm chat_input" placeholder="Write your message here..." />'+
                        '<span class="input-group-btn">'+
                        '<button class="btn btn-primary btn-sm" id="btn-chat">Send</button>'+
                        '</span>'+
                    '</div>'+
                '</div>'+
    		'</div>'+
    '</div>'+
    '</div>';
         $('body').append(temp);
}
function insertMessage(id,pos,text){
    if(pos==0){
          $('#'+id).append(retReceiveMessage(text));
           messagePosition();
    }else{
           $('#'+id).append(retSendMessage(text));
            messagePosition();
    }

  
}

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
     $.get('/penjual/timeline/list',function(data,status){
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
function loadFollowers(){
    $.get('/penjual/followers/list',function(data,status){
            data=JSON.stringify(data);
            data=JSON.parse(data);
            var temp='';
            var user;
            for(var i in data){
                if(data[i].follower===sess){
                    user=data[i].following;
                }
                else{
                    user=data[i].follower;   
                }
                temp+='<tr><td id='+data[i].id+' onClick="javascript:chatbox(this)">'+user+'</td></tr>'
            }
            $('#contactBody').html(temp);
    });
}
function generateId(){
    return Math.floor(parseInt(Date.now())/1000)+getRandom(1000,5000)
}
function getRandom(max,min){
    min=Math.ceil(min);
    max=Math.floor(max);
    return Math.floor(Math.random()*(max-min))+min;
}