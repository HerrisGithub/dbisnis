



$(document).ready(function () { 
    var connected=true;
    var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = realtime.channels.get('dirbis');
    
   
      
   
    if(window.location.href!=='http://localhost:5000/penjual/products' && 
    window.location.href!=='http://localhost:5000/penjual/products#' && 
    window.location.href!=='http://dbisnis.herokuapp.com/penjual/products' && 
    window.location.href!=='http://dbisnis.herokuapp.com/penjual/products#'){ 
    function vm(){
        var self = this;
        self.lay = new function(){
            var self = this;
            self.notifLength=ko.observable(0);
            self.messages = ko.observableArray([]);
            self.messagesLength = ko.observable(0);
            self.chatsLength = ko.observable(0);
            self.ordersNotif = ko.observable(0);
            self.orders = ko.observableArray([]);
            self.chats = ko.observableArray([]);

            self.sendCounter = ko.observable(0);
            self.receiveCounter = ko.observable(0);
            self.state = ko.observable(0);
            self.room_id = ko.observable();
            self.content = ko.observable();
            
            //#region selesai
            realtime.connection.on('connected', function() {
                if(window.localStorage.getItem('connection')=='false'){
                    iziToast.success({
                        title: 'OK',
                        message: 'Connection Successfully',
                        position: 'topCenter',
                    });
                  
                    window.localStorage.setItem('connection',true);
                }
                var user = JSON.parse(getJSON('/me/session'));
                if(user.users_name!==null || user.passport!=null){
                    var notif = JSON.parse(getJSON('/messages/user/'+user.users_name))
                    var find = _.filter(notif,{recipient:user.users_name});
                    var index =0;
                    find.forEach(e => {
                        var rm = JSON.parse(getJSON('/messages/reply/msid/'+e.message_id));
                            rm.forEach(el => {
                                if(el.message_id===e.message_id && el.is_read===0){
                                    e.is_read=0;
                                }
                            });
                            try {
                                e.profile= self.getProfile(e.creator);
                                if(e.is_read==0){
                                    e.color='#232f3e';
                                }else{
                                    e.color='transparent';
                                }                           
                            } catch (error) {
                                e.profile = self.getProfilePenjual(e.creator);
                                if(e.is_read==0){
                                    e.color='#232f3e';
                                }else{
                                    e.color='transparent';
                                }     
                            }
                    });
                    self.messages(find);
                    self.messagesLength(_.filter(self.messages(),{is_read:0}).length);
                    self.notifLength(find.length);

                    var chats = JSON.parse(getJSON('/chats/get/all'));
                    var chatsHasRead = _.filter(chats,{is_read:0});
                    // var top10 = _.chain(chats).first(10).value();
                    // self.chats(top10);
                    var chatsUniq = _.uniq(chats,function(item,key,a){
                        return item.room_id
                    })
                    self.chats(chatsUniq);
                    self.chatsLength(chatsHasRead.length);
                   
                }
                
            });
        
            realtime.connection.on('disconnected', function() {
                iziToast.error({
                    title: 'Error',
                    message: 'Error Connection',
                    position: 'topCenter',
                });
                window.localStorage.setItem('connection',false);
                
            });
            self.getProfile=function(user){
                return JSON.parse(getJSON('/me/profile/'+user)); 
            }
            self.getProfilePenjual=function(user){
                return JSON.parse(getJSON('/profile/penjual/'+user))[0]; 
            }
            self.getProf =function(user){
                var profile;
                try {
                    profile = JSON.parse(getJSON('/me/profile/'+user));
                } catch (error) {
                    profile = JSON.parse(getJSON('/profile/penjual/'+user))[0];
                }
                return profile;
            }
            self.openMessage=function(mes){
                mes.is_read=1;
                mes.color='transparent';
                $.post('/messages/update',mes)
                .done(function(){   
                    window.location.href='/message/'+mes.id;
                }).fail(function(err){
                    console.log(err);
                })
            }
            //#endregion
            try {
                var details = JSON.parse(getJSON('/order/details'));
                var dt = _.filter(details,{status:2});
                self.ordersNotif(self.ordersNotif()+dt.length);
                dt.forEach(e => {
                    self.orders.push(e);
                });
            } catch (error) {
            }
            self.toOrdersPage=function(){
                window.location.href="/penjual/orders";
            }
            
            //#region chats
            self.creator=ko.observable();

            var chatActive = window.localStorage.getItem('chatActive');
            if(chatActive=='true'){
                $('#chatss').addClass('popup-box-on');
                window.localStorage.setItem('chatActive',false);
            }else{
                $('#chatss').removeClass('popup-box-on');
            }
            self.chatbox = ko.observable({});
            self.creatorProfile = ko.observable({});
            var chatbox = window.localStorage.getItem('chatbox');
            
            self.receiveMessage = function(photo,content){
                if(self.state()!==2){
                    self.receiveCounter(self.receiveCounter()+1);
                    var temp=
                    '<div class="chat_message_wrapper">'+
                            '<div class="chat_user_avatar">'+
                            '<a href="#">'+
                                '<img src="'+''+'" class="md-user-image"  style="width: 37px; height: 37px">'+
                            '</a>'+
                            '</div>'+
                            '<ul class="chat_message" id="receive'+self.receiveCounter()+'">'+
                                '<li style="width: 200px">'+
                                    '<p>'+
                                    '                <span>'+content+'</span>'+
                                    '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                                    '</p>'+
                                '</li>'+
                            '</ul>'+
                    '</div>';
                    $('.chat_box').append(temp);
                    self.state(2);
        
                }else if(self.state()===2){
                    $('#receive'+self.receiveCounter()).append(
                        '            <li style="width: 200px">'+
                        '                <span>'+content+'</span>'+
                        '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                        '            </li>'
                    )
                }
            }
            self.sendTemplate=function(photo,content){
                if(self.state()!==1){
                    self.sendCounter(self.sendCounter()+1);
                    var temp =
                        '<div class="chat_message_wrapper chat_message_right">'+
                        '   <div class="chat_user_avatar">'+
                        '       <a href="#" >'+
                        '           <img class="md-user-image" src="'+photo+'" style="width: 37px; height: 37px">'+
                        '       </a>'+
                        '   </div>'+
                        '    <ul class="chat_message" id="send'+self.sendCounter()+'">'+
                        '            <li style="width: 200px">'+
                        '                <span>'+content+'</span>'+
                        '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                        '            </li>'+
                        '    </ul>'+
                        '</div>';
                    $('.chat_box').append(temp);
                    self.state(1);
                }else if(self.state()===1){
                    $('#send'+self.sendCounter()).append(
                        '            <li style="width: 200px">'+
                        '                <span>'+content+'</span>'+
                        '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                        '            </li>'
                    )
                }
            }
           
            self.lampiranCreatorTemplate=function(photo,gambar,namaProduk,qty,harga,id){
                self.sendTemplate(photo,
                    '<a href="#"><div class="w3-third w3-margin-bottom" style="width:100%">'+
                    '<img alt="Norway" src="'+gambar+'" style="width:100%; height: 150px" class="w3-hover-opacity">'+
                    '<div class="w3-container w3-white"><p></p>'+
                      '<p><b>'+namaProduk+'</b></p>'+
                      '<p style="color:grey"> Kuantitas : '+qty+'</p>'+
                      '<p style="color:grey"> Harga : Rp. '+harga+'</p>'+
                    '</div>'+
                  '</div></a>');
            }    
            self.lampiranReceiverTemplate=function(photo,gambar,namaProduk,qty,harga,id){
                self.receiveMessage(photo,
                    '<a href="#"><div class="w3-third w3-margin-bottom" style="width:100%">'+
                    '<img alt="Norway" src="'+gambar+'" style="width:100%; height: 150px" class="w3-hover-opacity">'+
                    '<div class="w3-container w3-white"><p></p>'+
                      '<p><b>'+namaProduk+'</b></p>'+
                      '<p style="color:grey"> Kuantitas : '+qty+'</p>'+
                      '<p style="color:grey"> Harga : Rp. '+harga+'</p>'+
                      '<p></p>'+
                      '<button class="btn btn-success btn-sm" data-bind="click:function(){lay.terimaNego('+id+')}">Terima</button>'+
                    '</div>'+
                  '</div></a>');
            }  
            self._lampiran=ko.observable();
            self.message = function(){
                var content = self.content();
                var photo = JSON.parse(me()).photo;
                self.sendTemplate(photo,content);
            }

            self.sendChat=function(){
                var doc ={
                    room_id:self.room_id(),
                    creator:JSON.parse(me()).users_name,
                    message_body:self.content(),
                    recipient:self.creatorProfile().username,
                    lampiran:self._lampiran()
                }
                $.post('/chat/send',doc)
                .done(function(){
                    channel.publish(doc.recipient+'chats2',doc);
                    self.message();
                    self.content('');
                }).fail(function(err){
                    console.log(err);
                })
            }
            window.localStorage.setItem('chatbox','');
            if(chatbox!==''){
                self.chatbox(JSON.parse(chatbox));
                var _creator;
                try {
                    _creator = JSON.parse(getJSON('/me/profile/'+self.chatbox().creator));
                } catch (error) {
                    _creator = JSON.parse(getJSON('/profile/penjual/'+self.chatbox().creator))[0];
                }
                 
                self.creatorProfile(_creator);
                document.getElementById('chatContent').innerHTML="";
                self.sendCounter(0);
                self.receiveCounter(0);
                self.state(0);
                
                var user1 = JSON.parse(me()).users_name;
                var user2 = self.chatbox().creator;
                var room_id = JSON.parse(getJSON('/room/id/'+user1+'/'+user2));
                self.room_id(room_id);
                var json=JSON.parse(getJSON('/chats/'+room_id));
                json.forEach(e => {
                    if(e.creator===user1){
                        if(e.lampiran!='' && e.lampiran!==null && typeof(e.lampiran)!=='undefined'){
                            var message={};
                            try {
                                message = JSON.parse(e.message_body);
                            } catch (error) {
                                
                            }
                            self.lampiranCreatorTemplate(JSON.parse(me()).photo,e.lampiran,message.namaProduk,message.qty,message.harga,e.id);
                        }else{
                            self.sendTemplate(JSON.parse(me()).photo,e.message_body);
                        }
                    }else{
                        if(e.lampiran!='' && e.lampiran!==null && typeof(e.lampiran)!=='undefined'){
                            var message={};
                            try {
                                message = JSON.parse(e.message_body);
                            } catch (error) {
                                
                            }
                            self.lampiranReceiverTemplate(JSON.parse(me()).photo,e.lampiran,message.namaProduk,message.qty,message.harga,e.id);
                        }else{
                            self.receiveMessage(self.creatorProfile().photo,e.message_body);
                        }
                    }
                });
                window.localStorage.setItem('chatbox','');
                // console.log(self.creatorProfile());
            }
            self.chatss = function(obj){
                document.getElementById('chatContent').innerHTML="";
                self.sendCounter(0);
                self.receiveCounter(0);
                self.state(0);
                var doc = {user2:obj.creator,user1:obj.receiver}
                $.post('/chats/read',doc)
                .then(function(){
                    window.localStorage.setItem('chatActive',true);
                    window.localStorage.setItem('chatbox',JSON.stringify(obj));
                    window.location.reload();
                    // obj.is_read=1;
                    // _.extend(_.findWhere(self.chats(), { room_id: obj.room_id }), obj);
                   
                }).fail(function(err){
                    console.log(err);
                })
            }
            self.chatsAnother=function(user){
                var _creator;
                _creator = JSON.parse(getJSON('/profile/penjual/'+user))[0];
                 
                self.creatorProfile(_creator);
                document.getElementById('chatContent').innerHTML="";
                self.sendCounter(0);
                self.receiveCounter(0);
                self.state(0);
                var user1 = JSON.parse(me()).users_name;
                var user2 = user;
                var room_id = JSON.parse(getJSON('/room/id/'+user1+'/'+user2));
                self.room_id(room_id);
                var json=JSON.parse(getJSON('/chats/'+room_id));
                json.forEach(e => {
                    if(e.creator===user1){
                        if(e.lampiran!='' && e.lampiran!==null && typeof(e.lampiran)!=='undefined'){
                            var message={};
                            try {
                                message = JSON.parse(e.message_body);
                            } catch (error) {
                                
                            }
                            self.lampiranCreatorTemplate(JSON.parse(me()).photo,e.lampiran,message.namaProduk,message.qty,message.harga,e.id);
                        }else{
                            self.sendTemplate(JSON.parse(me()).photo,e.message_body);
                        }
                    }else{
                        if(e.lampiran!='' && e.lampiran!==null && typeof(e.lampiran)!=='undefined'){
                            var message={};
                            try {
                                message = JSON.parse(e.message_body);
                            } catch (error) {
                                
                            }
                            self.lampiranReceiverTemplate(JSON.parse(me()).photo,e.lampiran,message.namaProduk,message.qty,message.harga,e.id);
                        }else{
                            self.receiveMessage(self.creatorProfile().photo,e.message_body);
                        }
                    }
                });
                $('#chatss').addClass('popup-box-on');
            }

            self.lampiran=ko.observable(true);
            self.lampirkanProduk=function(){
                $('#lampiran').iziModal('open');}
            self.nego=ko.observable(false);
            self.pilihProduk = ko.observable();
            self.products=ko.observableArray();
            self.qty = ko.observable(0);
            self.harga = ko.observable(0);
            self.getVariasi = function(id){
                var temp = JSON.parse(getJSON('/produk/variasi/'+id));
                return temp;}
            self.getGrosirByVariasi = function(id){
                return JSON.parse(getJSON('/produk/harga/grosir/'+id));
            }
            $("#lampiran").iziModal({
                title: 'Lampiran Produk',
                headerColor: '#6d7d8d',
                background: '#eee',
                theme: 'dark',  // light
                width:600,
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
                    var user = self.creatorProfile().username;
                    var products = JSON.parse(getJSON('/produk_user/get/'+user));
                    self.products(products);
                },
                onOpened: function(){
    
                },
                onClosing: function(){
                },
                onClosed: function(){},
                afterRender: function(){
                    
                }
            });
            self.getVariasiMin=function(id){
                return JSON.parse(getJSON('/produk/variasi/harga/min/'+id))[0];
            }        
            self.lampirkanProdukAction = function(){
                var lampiran = _.filter(self.products(),{product_id:self.pilihProduk()})[0];
                var qty = self.qty();
                var harga = self.harga();
                self._lampiran(lampiran.gambar);
                var doc ={
                    room_id:self.room_id(),
                    creator:JSON.parse(me()).users_name,
                    message_body:JSON.stringify({qty:qty,harga:harga,namaProduk:lampiran.nama,idProduk:lampiran.product_id}),
                    recipient:self.creatorProfile().username,
                    lampiran:self._lampiran()
                }
                $.post('/chat/send',doc)
                .done(function(){
                    channel.publish(doc.recipient+'chats2',doc);
                    self.lampiranCreatorTemplate(JSON.parse(me()).photo,lampiran.gambar,lampiran.nama,qty,harga);
                    self.content('');
                    $('#lampiran').iziModal('close');
                }).fail(function(err){
                    console.log(err);
                })
            }
            self.terimaNego =function(obj){
                var chat = JSON.parse(getJSON('/chat/get/'+obj));
                console.log(chat);
            }
            self.closeChat=function(){
                $('#chatss').removeClass('popup-box-on');
            }
            //#endregion

            //#region emitter
                channel.subscribe(JSON.parse(me()).users_name+'chats2',function(data){
                    var data=data.data;
                    console.log(data)
                    self.receiveMessage('self.getProf(data.creator).photo',data.message_body);
                })
                channel.subscribe(JSON.parse(me()).users_name+'orders',function(data){
                    iziToast.success({
                        title: '',
                        image : data.gambar,
                        message: 'Orderan Baru Telah Masuk',
                        position: 'topCenter',
                    });
                    self.ordersNotif(self.ordersNotif()+1);
                    self.orders.push(data);
                })
                channel.subscribe(JSON.parse(me()).users_name+'kemas',function(data){
                    iziToast.success({
                        title: '',
                        image : data.gambar,
                        message: 'Orderan Baru Telah Masuk',
                        position: 'topCenter',
                    });
                    // self.ordersNotif(self.ordersNotif()+1);
                    // self.orders.push(data);
                });
                channel.subscribe(JSON.parse(me()).users_name+'message',function(data){
                    iziToast.success({
                        title: '',
                        titeColor:'white',
                        icon:'fa fa-envelope',
                        image : '',
                        message: '1 Pesan Masuk',
                        position: 'topCenter',
                    });
                    data.data.color="#232f3e";
                    data.data.is_read=0;
                    data.data.message_id=data.data.id;
                    data.data.created_at=Date.now();
                    data.data.profile = self.getProf(data.data.creator);
                    self.messages.push(data.data);
                    self.messagesLength(self.messagesLength()+1);
                })
             //#endregion
 
        }
        
        self.prod = new Produk();  
        self.nav= new Nav();
        self.addProd =new TambahProduk();
        self.orders = new Orders();
        self.user = new InfoUser();
        self.o=new OrdersPenjual();
        // self.chat=new Chatbox();
        self.reg = new Register();
        self.prof = new Profile();
        self.regs= new RegisterSeller();
        self.profs= new ProfileSeller();
        self.pj=new Pengajuan();
        self.kl =  new Katalog();
        self.p=new Permintaan();
        self.c=new Company();
        self.t=new Timeline();
        self.ts=new TimelineSeller();
        self.acc = new Account();
        self.pc = new ProfilCompany();
        self.ms = new Messages();
        self.pn = new Penawaran();
        self.hp = new Hpenawaran();
        self.chat = new Chatting();
        self.adm =new Admin();
    }
    ko.applyBindings(new vm(),document.getElementsByClassName('main-content')[0]);
    }
    
});