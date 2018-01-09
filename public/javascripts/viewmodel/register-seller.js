function RegisterSeller(){
    var self = this;
    self.email= ko.observable();
    self.nama = ko.observable();
    self.next=ko.observable(true);
    self.username = ko.observable();
    self.phone = ko.observable();
    self.provinsi=ko.observableArray();
    self.kabupaten = ko.observableArray();
    self.kabupatenId = ko.observable();
    self.province=ko.observable();
    self.district=ko.observable();
    self.kecamatan=ko.observable();
    self.kecamatanId=ko.observable();
    self.usernameException=ko.observable('');
    self.emailException=ko.observable('');
    self.namaException=ko.observable('');
    self.phoneException=ko.observable('');
    self.passwordException=ko.observable('');
    self.confirmPasswordException = ko.observable('');   
    self.provinceId =ko.observable();
    self.subDistrict=ko.observable();
    self.postal_code=ko.observable();
    self.companyName = ko.observable();
    self.address = ko.observable();
    self.desc = ko.observable();
    self.password=ko.observable();
    self.cpassword=ko.observable();
    
    
    

    self.loadRegisterSeller=function(){
        var json = JSON.parse(getJSON('/province/all'));
        self.provinsi(json);  
    }
    self.cekUsername = function(){
        var re =/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        var validator = re.exec(self.username());
        if(self.username()==''){
            self.usernameException('');
        }
        else if(validator){
             new Promise(function(resolve,reject){
                $.post('/users/exist/username',{username:self.username()}).done(function(data){
                    if(data.count>0){
                        self.usernameException('Username sudah ada');
                        reject();
                    }else{
                        self.usernameException('');
                        resolve();
                        
                    }
                });
            }).then(function(){
                self.usernameException('');
                self.next(true);
            }).catch(function(){
                self.next(false);
            })
        }
        else{
            self.usernameException('Minimum eight characters, at least one letter and one number')
        }
    }
    self.cekEmail = function(){
            new Promise(function(resolve,reject){
             $.post('/users/exist/email',{email:self.email()})
             .done(function(data){
                 if(data.count>0){
                     self.emailException('Email sudah ada');
                     reject();
                 }else{
                     self.emailException('');
                     resolve();
                     
                 }
             });
         }).then(function(){
             self.emailException('');
             self.next(true);
         }).catch(function(){
             self.next(false);
         })
     }
     self.cekNama = function(){
        var re = /^[A-z]+$/;
        var validator = re.exec(self.nama());
        if(validator){
            self.namaException('');
        }else{
            self.namaException('Only alphabetic')
        }

    }
    self.cekNama = function(){
        var re = /^[A-z]+$/;
        var validator = re.exec(self.nama());
        if(validator){
            self.namaException('');
        }else{
            self.namaException('Only alphabetic')
        }

    }
    self.cekPhone = function(){
        var re = /^[A-z]+$/;
        var validator = re.exec(self.phone());
        if(!validator){
            self.phoneException('');
        }else{
            self.phoneException('Only number')
        }

    }
    self.cekPhone = function(){
        var re = /^[A-z]+$/;
        var validator = re.exec(self.phone());
        if(!validator){
            self.phoneException('');
        }else{
            self.phoneException('Only number')
        }

    }
    self.cekPassword = function(){
        var re =/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if(re.exec(self.password())){
            self.passwordException('');
        }else{
            self.passwordException('Minimum eight characters, at least one letter and one number')
        }
    }
    self.cekConfirmPassword = function(){
        if(self.password()==self.cpassword()){
            self.confirmPasswordException('');
        }else{
            self.confirmPasswordException('Password not match');
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
    self.checkout=function(){
            var doc = {
                id:generateId(),
                username:self.username(),
                email:self.email(),
                fullname:self.nama(),
                photo:'',
                gender:true,
                province:self.province(),
                district:self.district(),
                sub_district:self.subDistrict(),
                address:self.address(),
                phone:self.phone(),
                company_name:self.companyName(),
                company_desc:self.desc(),
                account_number:'',
                bank_name:'',
                bank_branch:'',
                account_name:'',
                password:self.cpassword(),
                postal_code:self.postal_code(),
                confirmation:true
                
            };
            $.post('/seller/register',doc).done(function(){
               window.location.href='/login';
            })
     }  
     if( $('#sellerUpload').length>0){
        $('#sellerUpload')
        .jqxFileUpload({ width: 'auto', uploadUrl: '/me/upload/file/', 
        fileInputName: 'upload_file'});
        $('#sellerUpload').on('uploadStart', function (event) {
            setTimeout(function(){
            // self.gambar.push({nama:event.args.file,gambar:'/uploads/profile/'+self.username()+'/'+event.args.file});
            var filename = (event.args.file).replace(/^C:\\fakepath\\/i,'');
            self.photo('/uploads/profile/'+self.username()+'/'+filename);
        },1000);
            
        });
    }
    
}