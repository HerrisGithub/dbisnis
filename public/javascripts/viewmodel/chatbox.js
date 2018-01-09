function Chatbox(){
   

   

    
//     //#region variable
//     var self = this;
//     var ably = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
//     var channel = ably.channels.get('dirbis');
//     var _me = JSON.parse(me());
//     self.keyword=ko.observable('');
//     self.receiver= ko.observable();
//     self.sender=ko.observable();
//     self.product_id=ko.observable();
//     self.caption=ko.observable();
//     self.enableChat = ko.observable(false);
//     self.userProduct=ko.observableArray([]);
//     //#endregion
//     //#region pubsub
//     channel.subscribe('inbox-chat-text-'+_me.users_name,function(message){
//         var data = message.data;
//         var sender = data.username;
//         self.receiver(sender);
//         self.sender(_me.users_name);
//         self.startChat();
//         $('.direct-chat-messages').append(self.messageReceived(data));
//     });
//     channel.subscribe('inbox-chat-file-'+_me.users_name,function(message){
//         var data = message.data;
//         var sender = data.username;
//         self.receiver(sender);
//         self.sender(_me.users_name);
//         self.startChat();
//         self.photoUrl(data.photoUrl);
//         self.caption(data.caption);
//         $('.direct-chat-messages').append(self.appendGambar());

//     });
//     self.getImage=function(){
        
//     };
//     //#endregion
//     //#region template
//         self.messageSend= function(data){
//             return '<div class="direct-chat-msg doted-border">'+
//                         '<div class="direct-chat-info clearfix">'+
//                             '<span class="direct-chat-name pull-left">'+'Me'+'</span>'+
//                         '</div>'+
//                         '<img  src="'+data.photo+'" class="direct-chat-img">'+
//                         '<div class="direct-chat-text">'+
//                             data.message+
//                         '</div>'+
//                         '<div class="direct-chat-info clearfix">'+
//                         '<span class="direct-chat-timestamp pull-right">'+data.time+'</span>'+
//                         '</div>'+
//                         '</div>';
//         };
//         self.appendGambar=function(){
//             var date = new Date();
            
//             return '<div class="direct-chat-msg doted-border">'+
//             '<div class="direct-chat-info clearfix">'+
//                 '<span class="direct-chat-name pull-left">'+'Me'+'</span>'+
//             '</div>'+
//             '<img  src="'+self.photoUrl()+'" class="direct-chat-img">'+
//             '<div class="direct-chat-text">'+
//                 '<img src='+self.photoUrl()+' style="height:80px;text-align="center">'+
//             '</div>'+
//             '<div class="direct-chat-info clearfix">'+
//                 '<span class="direct-chat-timestamp pull-left" style="padding-left:50px; width:250px">'+self.caption()+'<span class="direct-chat-timestamp pull-right">'+'13.13'+'</span>'+'</span>'
//             +
//             '</div>'+
//             '</div>';
//         }
//         self.messageReceived= function(data){
//             return '<div class="direct-chat-msg doted-border">'+
//                     '<div class="direct-chat-info clearfix">'+
//                         '<span class="direct-chat-name pull-left">'+data.username+'</span>'+
//                     '</div>'+
//                     '<img  src="'+data.photo+'" class="direct-chat-img">'+
//                     '<div class="direct-chat-text">'+
//                         data.message+
//                     '</div>'+
//                     '<div class="direct-chat-info clearfix">'+
//                     '<span class="direct-chat-timestamp pull-right">'+data.time+'</span>'+
//                     '</div>'+
//                     '</div>';
//         };
//         self.appendProduk=function(data){
//             var date = new Date();
//             var temp =
            
//             '<div class="direct-chat-msg doted-border">'+
//             '<div class="direct-chat-info clearfix">'+
//                 '<span class="direct-chat-name pull-left">'+'Me'+'</span>'+
//             '</div>'+
//             '<img  src="'+data.gambar+'" class="direct-chat-img">'+
//             '<div class="direct-chat-text">'+
//                 '<div class="row">'+
//                 '<div class="col-md-6">'+
//                     '<img src='+data.gambar+' style="height:50px; width:30px;text-align="center">'+
//                 '</div>'+
//                 '<div class="col-md-6"><button class="btn btn-info">Tawar</button></div>'+
//                 '</div>'+
                
               
//             '</div>'+
//             '<div class="direct-chat-info clearfix">'+
//                 '<span class="direct-chat-timestamp pull-left" style="padding-left:50px; width:250px">'+data.nama+'<span class="direct-chat-timestamp pull-right">'+'13.13'+'</span>'+'</span>'
//             +
//             '</div>'+
//             '</div>';
//             $('.direct-chat-messages').append(temp);
//         }
//     //#endregion
//     self.setPerson=function(sender,receiver){
//         self.sender(sender);
//         self.receiver(receiver);
//     };
//     self.chatWithSeller=function(){
//         var _me = JSON.parse(me());
//         var seller = document.getElementsByClassName('startChat')[0].getAttribute('data-username');
//         if(_me.users_name===seller){
//             alert('gak')
//         }else{
//             self.sender(_me.users_name);
//             self.receiver(seller);
//             self.startChat();    
//         }
        
//     };
//     self.startChat=function(){
//         $('#qnimate').addClass('popup-box-on');
//         $('#chatpic').attr('src','/uploads/product_image/1509209934/3.jpg');
//         $('#username').html(self.receiver());
//         self.product_id($('.startChat').attr('id'));
//         // document.getElementById('btn-chat').style.display='none';
//     }
//     self.sendMessage=function(d,e){
//         var date = new Date(Date.now());
//         var data ={
//             username:_me.users_name,
//             photo:_me.photo,
//             message:self.keyword(),
//             time:date.getHours()+'.'+date.getMinutes(),
//             receiver:self.receiver(),
//         }
//         if(e.keyCode===13){
//             channel.publish('inbox-chat-text-'+data.receiver,data);
//             $('.direct-chat-messages').append(self.messageSend(data));
//             $('#status_message').val('');
//         }
//     };
//     self.endChat=function(){
//         $('#qnimate').removeClass('popup-box-on');
//         // document.getElementById('btn-chat').style.display='unset';
//     };
//     self.getProduct=function(){
//         var id = document.getElementsByClassName('startChat')[0].getAttribute('id');
//         var temp = JSON.parse(getJSON('/produk/get1/'+id))[0];
//         return temp;
//     };
//     self.getProdukByUser=ko.pureComputed(function(){
//         try {
//             var seller = document.getElementsByClassName('startChat')[0].getAttribute('data-username');
//             var produk = JSON.parse(JSON.stringify(getJSON('/produk_user/get/'+seller)));
//             self.userProduct(JSON.parse(produk));
//         } catch (error) {
//             self.userProduct([]);
//         }
//     },self);
//     self.sendProduk = function(root){
//         self.appendProduk(root);
//     }

//     //#region popover
//         $('#attachment').popover({ 
//             html : true,
//             title: function() {
//             return $("#attachment-head").html();
//             },
//             content: function() {
//             return $("#attachment-content").html();
//             },
//             placement: function (context, source) {
//                 var position = $(source).position();
//                 return "top";
//             }
//         });
//         $('#attachment').click(function(){
//             var popov = $('.popover');
//             var popover = popov[0];
//             popover.style.left = '10px';
//             popover.firstElementChild.style.left='115px';
//             $('.btn-galeri').click(function(){
                
//             });

//         });
//         $('html').on('mouseup', function(e) {
//             if(typeof $(e.target).data('toggle') === "undefined" && $(e.target).attr('id') != 'toggle') {
//                 $('#attachment').popover('hide');
//             }
//         });
//     //#endregion
//     //#region attachPicture
//         self.photoUrl=ko.observable();
//         self.file=ko.observable();
//         self.attachPicture = function(data,e){
//             var file    = e.target.files[0];
//             var reader  = new FileReader();

//             reader.onloadend = function (onloadend_e) 
//             {
//             var result = reader.result; // Here is your base 64 encoded file. Do with it what you want.
//             self.photoUrl(result);
//             };

//             if(file)
//             {
//                 self.file(file);
//                 reader.readAsDataURL(file);
//             }
//         }
//         self.upload=function(){
//             $('.direct-chat-messages').append(self.appendGambar());
//             var date = new Date(Date.now());
//             var data ={
//                 username:_me.users_name,
//                 photo:_me.photo,
//                 message:self.keyword(),
//                 time:date.getHours()+'.'+date.getMinutes(),
//                 receiver:self.receiver(),
//                 photoUrl:self.photoUrl(),
//                 caption:self.caption()
//             }
//             channel.publish('inbox-chat-file-'+data.receiver,data)

//         }
//     //#endregion
     
      
      
}