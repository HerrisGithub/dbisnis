function Permintaan(){
    var self = this;
    self.nama = ko.observable();
    self.qty = ko.observable();
    self.satuan = ko.observable();
    self.hargaNet = ko.observable();
    self.hargaMin = ko.observable();
    self.hargaMax = ko.observable();
    
    self.pesan = ko.observable();
    self.path = ko.observable();
    self.kategori = ko.observable();
    
    //#region alamat
    self.province=ko.observable();
    self.district=ko.observable();
    self.kecamatan=ko.observable();
    self.subDistrict=ko.observable();
    self.postal_code=ko.observable();
    self.address = ko.observable();

    self.provinsi=ko.observableArray();
    self.kabupaten = ko.observableArray();
    self.kabupatenId = ko.observable();
    self.kecamatanId=ko.observable();
    self.provinceId =ko.observable();
    
    
    //#endregion

    var json = JSON.parse(getJSON('/province/all'));
    self.provinsi(json);  

    self.getProvinceById=function (id) { 
        return JSON.parse(getJSON('/province/'+id));
    }
    self.getKabupatenByProvinceId=function(id){
        return JSON.parse(getJSON('/district/province/'+id));
    }
    self.getKabupaten =function (id) {
        return JSON.parse(getJSON('/district/'+id));
    }

    self.getKecamatanByDistrictId=function(id){
        return JSON.parse(getJSON('/sub_district/district/'+id));
    }
    self.getKecamatanById=function(id){
        return JSON.parse(getJSON('/sub_district/'+id));
    }
    self.changeProvince=function(){
        self.province(self.getProvinceById(self.provinceId())[0].provinsi);
        var json = self.getKabupatenByProvinceId(self.provinceId());
        self.kabupaten(json);
    }
    self.changeDistrict=function(){
        self.district(self.getKabupaten(self.kabupatenId())[0].district);
        var json = self.getKecamatanByDistrictId(self.kabupatenId());
        self.kecamatan(json);
    }
    self.changeSubDistrict=function () { 
        self.subDistrict(self.getKecamatanById(self.kecamatanId())[0].sub_district);
        self.postal_code(self.getKecamatanById(self.kecamatanId())[0].zip_code);
    }

    self.formatLargeNumber = function (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    self.satuanOptions=ko.observableArray([
        {nama:'PCS'},
        {nama:'LUSIN'},
    ])
    if( $('#uploadPermintaan').length>0){
        $('#uploadPermintaan')
        .jqxFileUpload({ width: 'auto', uploadUrl: '/file/upload/'+JSON.parse(me()).users_name+'/permintaan', 
        fileInputName: 'upload_file'});
        $('#uploadPermintaan').on('uploadStart', function (event) {
            setTimeout(function(){
            var filename = (event.args.file).replace(/^C:\\fakepath\\/i,'');
            self.path('/uploads/files/'+JSON.parse(me()).users_name+'/permintaan/'+filename);
            },1000);
            
        });
    }
    self.moment =function(date){
        return moment(date).fromNow();
        
    }

    self.default = function(){
       var username = JSON.parse(me()).users_name;
       var data = JSON.parse(getJSON('/me/profile/'+username));
       self.province(data.province);
       self.district(data.district);
       self.subDistrict(data.sub_district);
       self.postal_code(data.postal_code);
       self.address(data.address);
    }


    self.buatPermintaan=function(){
        var doc ={
            name:self.nama(), //ok
            kuantitas:self.qty(), //ok
            satuan:self.satuan(), //ok
            harga:self.hargaNet(), //belum
            desc:self.pesan(), //pesan
            lampiran:self.path(), //path lampiran
            province:self.province(),
            district:self.district(),
            subdistrict:self.subDistrict(),
            address:self.address(),
            zip_code:self.postal_code(),
            create_by:JSON.parse(me()).users_name,
            status:0,
            kategori:self.kategori()
        }
        $.post('/pages/demands/new',doc)
        .done(function(){
            window.location.reload();
        }).fail(function(err){
            alert(123)
            console.log(err);
        })
    };
   
    self.getPermintaan=function(){
        var json = JSON.parse(getJSON('/permintaan/all'));
        return json;
    }
    self.getPembeli=function(user){

        var data = JSON.parse(getJSON('/me/profile/'+user));
        return data;

    }
    self.buatPenawaran=function(obj){
       window.location.href='/penjual/penawaran/baru/'+obj.id+'/'+obj.kategori;
    }





    // <form action="/pembeli/buat/permintaan" method="POST" class="container">
    
    
}