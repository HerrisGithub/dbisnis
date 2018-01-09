function Profile(){
    var self = this;
    self.username       =   ko.observable();
    self.nama           =   ko.observable();
    self.email          =   ko.observable();
    self.gender         =   ko.observable();
    self.birth          =   ko.observable();
    self.phone          =   ko.observable();
    self.photo          =   ko.observable();
    
    self.address        =   ko.observable();
    self.province       =   ko.observable();
    self.city           =   ko.observable();
    self.district       =   ko.observable();
    self.postal_code    =   ko.observable();
    self.subDistrict    =   ko.observable();

    self.passwordBaru = ko.observable();
    self.cpasswordBaru = ko.observable();
    self.passwordSekarang = ko.observable();
    
    self.passwordBaruException = ko.observable();
    self.cpasswordBaruException = ko.observable();
    self.passwordSekarangException=ko.observable();
    
    self.provinceId = ko.observable();
    self.kabupatenId = ko.observable();
    self.kecamatanId = ko.observable();
    self.provinsi = ko.observableArray();
    self.kabupaten = ko.observableArray([{id:'',province_id:'',district:''}]);
    self.kecamatan = ko.observableArray()
    self.jk = ko.observable();
    self.pass = ko.observable(true);

    
    self.loadProfile = function(){
       var data;
       if(window.location.href=='http://localhost:5000/me/profile#_=_'){
            data= JSON.parse(getJSON('/me/facebook/get/profile/'))[0]; 
            self.pass(false);
       }
       else{
           data= JSON.parse(getJSON('/me/get/profile/'))[0];
       }
           
       var date = new Date(data.birth);
       var json = JSON.parse(getJSON('/province/all'));
       console.log(json)
       
       self.username(data.username);
       self.nama(data.fullname);
       self.email(data.email);
       self.gender(data.gender);
       self.birth(date.toLocaleDateString());
       self.phone(data.phone);
       self.photo(data.photo);
       self.address(data.address);
       self.province(data.province);
       self.city(data.city);
       self.district(data.district);
       self.postal_code(data.postal_code);
       self.subDistrict(data.sub_district);
       self.provinsi(json);
       self.kabupaten(self.getKabupatenByProvinceId(json[0].id))
       self.kecamatan(self.getKecamatanByDistrictId(self.kabupaten()[0].id))
    }
    self.getAll=function(){
        var temp =true;
        if(self.jk()=='0'){
            temp=false;
        }else{
            temp=true;
        }
        return {
            username:self.username(),
            email:self.email(),
            fullname:self.nama(),
            gender:temp,
            birth:self.birth(),
            phone:self.phone(),
            photo:self.photo(),
            address:self.address(),
            province:self.province(),
            city:self.city(),
            district:self.district(),
            postal_code:self.postal_code(),
            sub_district:self.subDistrict()
        }
    }
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
    
    self.isNullOrWhiteSpace=function(value){
        if(value==''){
            return true;
        }
        return false;
    }

    self.informasiUmumClick=function(){
        $('#info-umum').modal('show');
    }
    
    if( $('#imageUpload').length>0){
        $('#imageUpload')
        .jqxFileUpload({ width: 300, uploadUrl: '/me/upload/file/', 
        fileInputName: 'upload_file'});
        $('#imageUpload').on('uploadStart', function (event) {
            setTimeout(function(){
            // self.gambar.push({nama:event.args.file,gambar:'/uploads/profile/'+self.username()+'/'+event.args.file});
            var filename = (event.args.file).replace(/^C:\\fakepath\\/i,'');
            self.photo('/uploads/profile/'+self.username()+'/'+filename);
        },1000);
            
        });
    }
    
    self.saveEditInformasiUmum=function(){
            $.post('/me/update/profile/',self.getAll()).done(function(){
                window.location.reload();  
            })
    }

    self.changePassword = function(){
        
        var doc ={
            username:self.username(),
            passwordBaru:self.passwordBaru(),
            passwordSekarang:self.passwordSekarang()
        }
        var re =/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        var validator = re.exec(doc.passwordBaru);

        if(validator){
            self.passwordBaruException('');
            if(self.passwordBaru()===self.cpasswordBaru()){
                self.cpasswordBaruException('');
                $.post('/me/update/password/',doc)
                .done(function(){
                    window.location.reload();
                })
                .fail(function(err){
                    self.passwordSekarangException(err.statusText);
                });
            }else{
                self.cpasswordBaruException('password tidak cocok');
            }
        }else{
            self.passwordBaruException('Minimum eight characters, at least one letter and one number');
        }

         
    }


}