function Chatting(){
    
    var self = this;
    self.room_id = ko.observable();
    self.chats = ko.observableArray();
    self.me = ko.observable(JSON.parse(me()));
    self.chatContent = ko.observable();
    self.receiver = ko.observable();
    self.produk = ko.observableArray();

    $("#chatModal").iziModal({
        title: 'Lampirkan Produk',
        headerColor: '#88A0B9',
        background: 'white',
        theme: 'dark',  // light
        width: 500,
        padding: 10,
        radius: 10,
        zindex: 999,
        focusInput: true,
        autoOpen: false, // Boolean, Number
        openFullscreen: false,
        closeOnEscape: true,
        closeButton: true,
        appendTo: 'body', // or false
        appendToOverlay: 'body', // or false
        overlay: true,
        overlayClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        timeout:false,
        timeoutProgressbar: true,
        pauseOnHover: false,
        timeoutProgressbarColor: 'rgba(255,255,255,0.5)',
        transitionIn: 'comingIn',
        transitionOut: 'comingOut',
        transitionInOverlay: 'fadeIn',
        transitionOutOverlay: 'fadeOut',
        onFullscreen: function(){},
        onResize: function(){},
        onOpening: function(){
            // /produk_user/get/:user
            var prod = (JSON.parse(getJSON('/produk_user/get/'+self.receiver())));
            self.produk(prod);
            console.log(self.produk())
        },
        onOpened: function(){
        },
        onClosing: function(){
        },
        onClosed: function(){},
        afterRender: function(){}
    });




    self.creatorTemp = function(message,creator,date){
        var temp =
        '<li class="right clearfix">'+
        '<span class="chat-img pull-right">'+
        '<img src="http://placehold.it/50/FA6F57/fff&text=ME" alt="User Avatar" class="img-circle" />'+
        '</span>'+
        '<div class="chat-body clearfix">'+
        '<div class="header">'+
        '<small class=" text-muted"><span class="glyphicon glyphicon-time"></span>'+moment(date).fromNow()+'</small>'+
        '<strong class="pull-right primary-font">'+creator+'</strong>'+
        '</div>'+
        '<p>'+message+
        '</p>'+
        '</div>'+
        '</li>';
        $('#chatContent').append(temp);
    }
    self.receiverTemp = function(message,creator,date){
        var temp =
        '<li class="left clearfix">'+
            '<span class="chat-img pull-left">'+
                '<img src="http://placehold.it/50/55C1E7/fff&text=U" alt="User Avatar" class="img-circle" />'+
            '</span>'+
            '<div class="chat-body clearfix">'+
            '<div class="header">'+
                '<strong class="primary-font">'+creator+'</strong> <small class="pull-right text-muted">'+
                    '<span class="glyphicon glyphicon-time"></span>'+moment(date).fromNow()+'</small>'+
            '</div>'+
            '<p>'+message+
            '</p>'+
            '</div>'+
        '</li>';
        $('#chatContent').append(temp);
    }
    self.loadChattingPage = function(){
           self.room_id($('#room_id').val());
           var json=JSON.parse(getJSON('/chats/'+self.room_id()));
            self.chats(json);
            json.forEach(e => {
                if(e.creator===self.me().users_name){
                   self.creatorTemp(e.message_body,e.creator,e.created_at);
                }else{
                    self.receiver(e.creator);
                    self.receiverTemp(e.message_body,e.creator,e.created_at);
                }
            });
    };
    self.qty=ko.observable();
    self.harga = ko.observable();
    
    self.sendMess=function(){
        var doc ={
            room_id:self.room_id(),
            creator:self.me().users_name,
            message_body:self.chatContent(),
            recipient:self.receiver()
        }
        $.post('/chat/send',doc)
        .done(function(){
            self.creatorTemp(self.chatContent(),self.me().users_name,Date.now());
            self.chatContent('');
            
        }).fail(function(err){
            console.log(err);
        })

    }
    self.lampirkanProduk =function(){
        $('#chatModal').iziModal('open');
    }
    self.lampirkan=function(obj){
        $('#chatModal').iziModal('close');
        console.log(obj)
    }
    self.penawaran=function(){
        return JSON.parse(window.localStorage.getItem('penawaran'));
    }
   
    
}