function TimelineSeller(){
    var self     =  this;
    self.subject = ko.observable();
    self.message = ko.observable();
    self.attachment   = ko.observable();

    self.me=ko.observable(JSON.parse(me()));
    self.content = ko.observableArray();
    self.date = ko.observable();

    var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = realtime.channels.get('dirbis');
    // users
    self.username       =   ko.observable();
    self.nama           =   ko.observable();
    self.email          =   ko.observable();
    self.gender         =   ko.observable();
    // self.birth          =   ko.observable();
    self.phone          =   ko.observable();
    self.photo          =   ko.observable();
    self.address        =   ko.observable();
    self.province       =   ko.observable();
    self.district       =   ko.observable();
    self.postal_code    =   ko.observable();
    self.subDistrict    =   ko.observable();
    self.contacts       =   ko.observableArray();

    self.receiver=ko.observable({
        photo:'',
        company_name:'',
        recipient:''
    }); 

    
    self.chatsBody = ko.observableArray([]);
    self.receiverChatsBody = ko.observableArray([]);
    
    self.receiver = ko.observable({});
    self.state = ko.observable(0);
    self.sendCounter = ko.observable(0);
self.receiveCounter = ko.observable(0);
    self.room_id = ko.observable();
    // 1 is sender, 2 receiver
    
    // table.increments('id',10).primary();
    // table.string('title');
    // table.string('content');
    // table.string('image');
    // table.string('author').references('penjual.username').onUpdate('cascade').onDelete('cascade');
    // table.timestamp('created_at').defaultTo(knex.fn.now(	));

    self.loadTimelineSeller=function(){
        var data = JSON.parse(getJSON('/penjual/me/profile/'))[0];
        var date = new Date(data.birth);
        self.username(data.username);
        self.nama(data.fullname);
        self.email(data.email);
        self.gender(data.gender);
        // self.birth(date.toLocaleDateString());
        self.phone(data.phone);
        self.photo(data.photo);
        self.address(data.address);
        self.province(data.province);
        self.district(data.district);
        self.postal_code(data.postal_code);
        self.subDistrict(data.sub_district);
        // console.log(data);
        var dta = JSON.parse(getJSON('/penjual/timeline/list'));
        self.content(dta);
        var contacts = JSON.parse(getJSON('/penjual/contacts'));
        self.contacts(contacts);


    }
    self.cimage=function(img){
        if(img===null || typeof(img)==='undefined'||img===''){
            return false;
        } 
        return true;
    }

    self.sendMessage = function(){
        var content = self.chatContent();
        var photo = self.me().photo;
        self.sendTemplate(photo,content);
    }

    self.send=function(){
        var doc ={
            room_id:self.room_id(),
            creator:self.me().users_name,
            message_body:self.chatContent(),
            recipient:self.receiver().recipient
        }
        $.post('/chat/send',doc)
        .done(function(){
            self.sendMessage();
            self.chatContent('');
        }).fail(function(err){
            console.log(err);
        })
       
    }
   
    self.startChat=function(obj){
        document.getElementById('chatContent').innerHTML="";
        self.sendCounter(0);
        self.receiveCounter(0);
        self.state(0);
        
        var user1 = self.me().users_name;
        var user2 = obj.username;
        var room_id = JSON.parse(getJSON('/room/id/'+user1+'/'+user2));
        self.room_id(room_id);

        var json=JSON.parse(getJSON('/chats/'+room_id));
        json.forEach(e => {
            if(e.creator===self.me().users_name){
                self.sendTemplate('/dirbis.png',e.message_body);
            }else{
                self.receiveMessage('/dirbis.png',e.message_body);
            }
        });
        var temp={};
        if(typeof obj.company_name !=='undefined'){
            temp.name = obj.company_name;
        }
        temp.photo=obj.photo;
        temp.recipient=obj.username;
        self.receiver(temp)
        $('#sidebar_secondary').addClass('popup-box-on');
    }
    self.receiveMessage = function(photo,content){
        if(self.state()!==2){
            self.receiveCounter(self.receiveCounter()+1);
            var temp=
            '<div class="chat_message_wrapper">'+
                    '<div class="chat_user_avatar">'+
                    '<a href="#">'+
                        '<img src="'+photo+'" class="md-user-image"  style="width: 37px; height: 37px">'+
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
            $('#chatContent').append(temp);
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
            $('#chatContent').append(temp);
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

    self.posting=function(){
        var dt =  new Date(Date.now());
        self.date(dt.toLocaleDateString());
        var id = generateId();
        self.content.push({
            id:id,
            author:self.username(),
            content:self.message(),
            image:self.attachment(),
            title:self.subject()
        });
        var temp =[];
        for(var i =self.content().length-1; i>=0; i--){
            temp.push(self.content()[i]);
        }
        self.content(temp);
        var doc = {
            id:generateId(),
            title:self.subject(),
            content:self.message(),
            image:self.attachment(),
            photo:self.photo()
        }
        $.post('/penjual/timeline',doc).done(function(){
            self.subject('');
            self.message('');
            self.attachment('');
            channel.publish('channel-post',doc);
        }).fail(function(err){
            console.log(err);
        })
    }
    
    if( $('#gambar-timeline').length>0){
        $('#gambar-timeline').jqxFileUpload({ width: 300, 
            uploadUrl: '/penjual/file/upload/'+
            JSON.parse(me()).users_name+'/post', 
            fileInputName: 'upload_file' });
        $('#gambar-timeline').on('uploadStart', function (event) {
            setTimeout(function(){
              self.attachment('/uploads/files/'+JSON.parse(me()).users_name
              +'/post/'+event.args.file)
            },1000);
        });  
    }
    
}