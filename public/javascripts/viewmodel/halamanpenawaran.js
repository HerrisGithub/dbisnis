function Hpenawaran(){
    var self = this;
    self.penawaran=ko.observableArray();
    self.loadHalamanPenawaran=function(){
        var json =  JSON.parse(getJSON('/penawaran/all/user/'+JSON.parse(me()).users_name));
        self.penawaran(json);
    }



}