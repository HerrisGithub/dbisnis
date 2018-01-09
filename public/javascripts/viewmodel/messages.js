function Messages(){
    var self = this;
    self.creator = ko.observable();
    self.creatorImage = ko.observable();
    self.textContent =ko.observable();
    self.messages = ko.observable();
    self.reply_messages = ko.observableArray();

    self.getProfile =function(user){
        try {
            return JSON.parse(getJSON('/me/profile/'+user)); 
        } catch (error) {
            return JSON.parse(getJSON('/profile/penjual/'+user))[0]; 
        }
    }

    self.loadMessages =function(){
        var data = $('#data').data('hs');
        data = JSON.parse(JSON.stringify(data));
        self.messages(data);
        self.creatorImage(self.getProfile(data.creator).photo)
        self.creator(data.creator);
        self.getReplyMessages();

    }
    self.getReplyMessages=function(){
        var json = JSON.parse(getJSON('/messages/reply/msid/'+self.messages().id));
        self.reply_messages(json);
    }
    self.reply=function(){
        $('#emailContent').append(
            '<div  class="w3-container person w3-white" id="replyForm">'
                +'<h5 class="w3-opacity">Reply To: '+self.creator()+'</h5>'
                +'<textarea cols="100" rows="10" id="textContent"></textarea>'
                +'<hr>'
                +'<button class="btn btn-primary" onClick="javascript:send()">Send <i class="fa fa-paper-plane"></i></button>'
                +'<p></p>'
            +'</div>'+
                '<hr style="padding: 0; margin-top: 0;">'
        );
    }
    send=function(){
       var content = $('#textContent').val();
       var doc = {
            id:generateId(),
            message_id:self.messages().id,
            subject:self.messages().subject,
            creator:JSON.parse(me()).users_name,
            message_body:content,
            is_read:0
       };
        $.post('/message/reply',doc)
        .done(function(){
            $('#replyForm').remove();
            window.location.reload();
        }).fail(function(err){
            console.log(err);
        });


       
    }

}
