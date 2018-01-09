function Penawaran(){
    var self = this;
    self.id = ko.observable();
    self.harga = ko.observable();
    self.kuantitas = ko.observable();
    self.kategori=ko.observable();
    self.pesan = ko.observable();
    self.namaProduk = ko.observable();
    self.satuan = ko.observable();
    self.creator = ko.observable();
    self.me = ko.observable(JSON.parse(me()))

    if( $('#uploadPenawaran').length>0){
        $('#uploadPenawaran')
        .jqxFileUpload({ width: 'auto', uploadUrl: '/file/upload/'+JSON.parse(me()).users_name+'/penawaran', 
        fileInputName: 'upload_file'});
        $('#uploadPenawaran').on('uploadStart', function (event) {
            setTimeout(function(){
            var filename = (event.args.file).replace(/^C:\\fakepath\\/i,'');
            self.path('/uploads/files/'+JSON.parse(me()).users_name+'/penawaran/'+filename);
            },1000);
            
        });
    }
    self.produk = ko.observable([{
        nama:"",
        id:""
    }]);
    
    self.loadPenawaran=function(){
        try {
            var id = $('#id').text();
            var kategori = $('#kategori').text();
        
            self.id = ko.observable(id);
            self.kategori(kategori);
            self.produk(JSON.parse(getJSON('/penjual/produk/get/kategori/'+self.kategori())));
    
        } catch (error) {
            console.log(error);   
        }
    }
    
   self.buatPenawaran = function(obj){
    var prod = _.filter(self.produk(),{id:self.namaProduk()})[0];
    // console.log(prod)
    // console.log(self.namaProduk());
       var doc ={
        id_permintaan:self.id(),
        jenis_produk:self.kategori(),
        nama_produk:prod.nama,
        desc:self.pesan(),
        kuantitas:self.kuantitas(),
        satuan:self.satuan(),
        harga:self.harga(),
        status:1,
        product_id:prod.id
    }
       $.post('/penjual/penawaran/buat',doc)
       .done(function(){
            window.location.href='/penjual/permintaan';
       }).fail(function(err){
           console.log(err);
       })
   }

   self.getPenawaran=function(){
     var json =  JSOn.parse(getJSON('/penawaran/all/user/'+JSON.parse(me()).users_name));
   }
   self.setuju = function(obj){
       var idPermintaan = obj.id_permintaan;
        $.get('/penawaran/setuju/'+idPermintaan+'/'+obj.kuantitas+'/'+obj.harga)
       .done(function(){
            window.location.href='/pages/demands/get';
       }).fail(function(err){
        console.log(err);
       })
       
   }
   self.chat=function(obj){
        var to = obj.username;
        var me = self.me().users_name;
        var room_id = JSON.parse(getJSON('/room/id/'+me+'/'+to));
        window.localStorage.setItem('penawaran',JSON.stringify(obj));
        window.location.href='/pages/chatting/'+room_id;

   }
 

}