function Timeline(){
    var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = realtime.channels.get('dirbis');
    var self     =  this;
    
    self.me=ko.observable(JSON.parse(me()));

    self.subject = ko.observable();
    self.message = ko.observable();
    self.attachment   = ko.observable();

    self.content = ko.observableArray();
    self.contacts = ko.observableArray();
    self.date = ko.observable();

    self.notif = ko.observable(false);
    
    self.receiver=ko.observable({
        photo:'',
        company_name:'',
        recipient:''
    });

    // users
    self.username       =   ko.observable();
    self.nama           =   ko.observable();
    self.email          =   ko.observable();
    self.gender         =   ko.observable();
    self.birth          =   ko.observable();
    self.phone          =   ko.observable();
    self.photo          =   ko.observable();
    self.address        =   ko.observable();
    self.province       =   ko.observable();
    self.district       =   ko.observable();
    self.postal_code    =   ko.observable();
    self.subDistrict    =   ko.observable();
    self.followEnabled  =   ko.observable(true);
    self.company_name =ko.observable();

    self.notif          =   ko.observableArray([]);
    self.comments = ko.observableArray();
    self.obj = ko.observable({
        photo:''
    });
    

    // table.increments('id',10).primary();
    // table.string('title');
    // table.string('content');
    // table.string('image');
    // table.string('author').references('penjual.username').onUpdate('cascade').onDelete('cascade');
    // table.timestamp('created_at').defaultTo(knex.fn.now(	));

    self.loadTimeline=function(){
            var data = JSON.parse(getJSON('/me/get/profile/'))[0];
            var date = new Date(data.birth);
            self.username(data.username);
            self.nama(data.fullname);
            self.email(data.email);
            self.gender(data.gender);
            self.birth(date.toLocaleDateString());
            self.phone(data.phone);
            self.photo(data.photo);
            self.address(data.address);
            self.province(data.province);
            self.district(data.district);
            self.postal_code(data.postal_code);
            self.subDistrict(data.sub_district);
            var dta = JSON.parse(getJSON('/timeline/list'));
            self.content(dta);
            var contacts = JSON.parse(getJSON('/contacts'));
            self.contacts(contacts);

            self.contacts().forEach(e => {
                var read = JSON.parse(getJSON('/chats/read/'+self.me().users_name+'/'+e.username))[0];
                if(read.sum>0){
                    self.notif.push({username:e.username,read:0});
                    // $('#contact-'+e.username).append('<i class="fa fa-comments fa-3x" aria-hidden="true" style="color: red"></i>');
                }
            });
    }

    self.loadTimelineSeller=function(){
        var data = JSON.parse(getJSON('/penjual/me/profile/'))[0];
        var date = new Date(data.birth);

        
        self.username(data.username);
        self.nama(data.fullname);
        self.email(data.email);
        self.gender(data.gender);
        self.phone(data.phone);
        self.photo(data.photo);
        self.address(data.address);
        self.province(data.province);
        self.district(data.district);
        self.postal_code(data.postal_code);
        self.subDistrict(data.sub_district);
        self.company_name(data.company_name);
        var dta = JSON.parse(getJSON('/penjual/timeline/list'));
        self.content(dta);
        var index = 0;
        self.content().forEach(e => {
            if(e.id===self.content()[index].id){
                var count = self.getLikesCount(e.postid);
                self.content()[index].likeCount = count;
            }
            index++;
        });
        var contacts = JSON.parse(getJSON('/penjual/contacts'));
        self.contacts(contacts);

        self.contacts().forEach(e => {
            var read = JSON.parse(getJSON('/chats/read/'+self.me().users_name+'/'+e.username))[0];
            if(read.sum>0){
                self.notif.push({username:e.username,read:0});
            }
        });

        $("#comment").iziModal({
            title: 'Comments',
            headerColor: '#6d7d8d',
            background: 'white',
            theme: 'dark',  // light
            width: 900,
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
                var json = JSON.parse(getJSON('/comment/post/'+self.obj().postid));
                self.comments(json);
            },
            onOpened: function(){

            },
            onClosing: function(){
            },
            onClosed: function(){},
            afterRender: function(){
            }
        });

    }


    // self.checkLike = function(obj){
    //    console.log(obj)
    //     // var postid = obj.postid;
    //     // var likePost = JSON.parse(getJSON("/db/select * from post a join likes b on a.id = b.post_id where a.id ="+postid+" and b.user_like='"+self.me().users_name+"'"));
    //     // // if(likePost.length>0){
    //     // //     return true;
    //     // // }
    //     // return false;
    // }
    
    
    self.checkLike = ko.computed({
        read:function(){
            return 1
        },
        write:function(){
            alert(123)
        }
    });


    self.moment=function(date){
        return moment(date).fromNow();
    }
    self.isMe=function(postid){
        var select = _.filter(self.content(),function(o){return (o.postid == postid & o.username==self.me().users_name)});
        if(select.length>0){
            return false;
        }
        return true;
    }
    self.cimage=function(img){
        if(img===null || typeof(img)==='undefined'||img===''){
            return false;
        } 
        return true;
    }
    //#region emitter
    channel.subscribe('timeline-news',function(data){
        var data = data.data;
        var temp=[];
        temp.push(data);
        self.content().forEach(e => {
            temp.push(e)
        });
        self.content(temp);
        
        // self.loadTimeline();
    })
    self.receiveContent=ko.observable();
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
    // channel.subscribe('chats-notif-'+self.me().users_name,function(data){
    //     data = data.data.data;
    //     var temp={};
    //     var creator;
    //     try {
    //         creator = JSON.parse(getJSON('/me/profile/'+data.creator));  
    //         temp.name = 'skip dulu';
    //     } 
    //     catch (error) {
    //         creator = JSON.parse(getJSON('/profile/penjual/'+data.creator))[0];
    //         temp.name = creator.company_name;
    //     }
    //     finally{
    //         temp.photo=creator.photo;
    //         temp.recipient=creator.username;
    //         self.receiver(temp);
    //         // $('#sidebar_secondary').addClass('popup-box-on');
    //         self.receiveMessage(creator.photo,data.message_body);
    //         $('#contact-'+creator.username).empty();
    //         $('#contact-'+creator.username).append('<i class="fa fa-comments fa-3x" aria-hidden="true" style="color: red"></i>');
            
    //         iziToast.show({
    //             image:'/dirbis.png',
    //             title: self.me().users_name,
    //             message: data.message_body,
    //             position: 'topCenter'
    //         });
    //     }
      
    // })

    //#endregion
    

    self.chatsBody = ko.observableArray([]);
    self.receiverChatsBody = ko.observableArray([]);
    
    self.receiver = ko.observable({});
    self.state = ko.observable(0);
    self.sendCounter = ko.observable(0);
    self.receiveCounter = ko.observable(0);
    self.room_id = ko.observable();
    // 1 is sender, 2 receiver

    self.chatContent = ko.observable();

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
        $.post('/chats/read/',{user1:user1,user2:user2})
        .done(function(){
                        
            $('#contact-'+user2).empty();
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
        }).fail(function(err){
            console.log(err);
        })
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
    self.follow=function(obj){
        $.post('/following',obj).done(function(){
            $('.username-'+obj.username).attr('disabled',true);
        }).fail(function(err){
            console.error(err);
        })
    }
    self.hasFollow=function(obj){
        var following = JSON.parse(getJSON('/following/'+obj));
        if(following.count==1){
            return false;
        }
        
        return true;
    }
    self.getLikesCount = function(id){
        var count = JSON.parse(getJSON('/likes/count/'+id));
        return count;
    }

    self.like=function(obj){
        $.post('/like',{id:obj.postid})
        .done(function(data){
            if(data.aksi==1){
                obj.likeCount+=1;
                $('#lc'+obj.postid).text(obj.likeCount);
            }
            else if(data.aksi==2){
                obj.likeCount-=1;
                $('#lc'+obj.postid).text(obj.likeCount);
            }
        }).fail(function(err){
           console.log(err)
        })

    }
    self.chatToPerson=function(obj){
        self.receiver(obj);
    }
    self.getProfile=function(user){
        var profile = JSON.parse(getJSON('/profile/penjual/'+user));
        if(profile.length<1){
           profile = JSON.parse(getJSON('/me/profile/'+user)); 
        }
        console.log(profile)
        return profile[0];
    }
    self.comment = function(obj){
        // /profile/penjual/:user
        // /me/profile/:username
        self.obj(obj);
        $('#comment').iziModal('open');
    }
    self.getProfile
    self.commentContent = ko.observable();
    self.submitComment = function(obj){
        var doc = {
            id:generateId(),
            post_id:self.obj().postid,
            creator:self.me().users_name,
            message_body:self.commentContent(),
            attachment:''
        }
        $.post('/comment/post/add',doc)
        .done(function(){
            self.commentContent('');
            console.log(self.comments())
        }).fail(function(err){
            console.log(err);
        })
    }

    //#region posting
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
    //#endregion
    
    
}