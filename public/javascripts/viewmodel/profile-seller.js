function ProfileSeller(){
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
    self.company_desc = ko.observable();
    self.company_name = ko.observable();

    self.bank = ko.observableArray();
    
    self.bank_name = ko.observable();
    self.account_name = ko.observable();
    self.account_number = ko.observable();
    self.bank_branch=ko.observable();

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
    

    //#region collapse
        self.infoCollapse=ko.observable(false); 
        self.collapseInfo=function(){
                self.infoCollapse(!self.infoCollapse());
                
        }
        self.contactCollapse=ko.observable(false);
        self.collapseContact=function(){
            self.contactCollapse(!self.contactCollapse());
        }
        self.addressCollapse=ko.observable(false);
        self.collapseAddress=function(){
            self.addressCollapse(!self.addressCollapse());
        }

        
        

    //#endregion



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
    self.isNullOrWhiteSPace=function(text){
        if(text==null || typeof(text)=='undefined' || text == '' ){
            return true;
        }
        return false;
    }
    // photo	"/uploads/company/b/kartu-as-577x310.jpg"
    // fullname	"aadmdmdkmkd" ok
    // gender	false ok
    // company_name	"a" ok
    // company_desc	"aad" ok
    // account_number	null
    // bank_name	null
    // bank_branch	null
    // account_name	null

    // email	"a@gmail.com"
    // phone	"b"

    // province	"sumatera utara"
    // district	"a"
    // sub_district	"a"
    // postal_code	"20252"
    // address	"a"
    // id	1
    // username	"b@gmail.com"
    // created_at	null
    // updated_at	null
    // password	"a1234567"
    // confirm_token	null
    // confirmation	true
    self.loadProfileSeller=function(){
        var data = JSON.parse(getJSON('/penjual/me/profile/'))[0];
        var json = JSON.parse(getJSON('/province/all'));
        var bank = JSON.parse(getJSON('/penjual/bank/'+data.username));
        self.bank(bank);
        self.username(data.username);
        self.nama(data.fullname);
        self.email(data.email);
        self.gender(data.gender);
        self.phone(data.phone);
        self.photo(data.photo);
        self.company_desc(data.company_desc);
        self.company_name(data.company_name);
        self.address(data.address);
        self.province(data.province);
        self.city(data.city);
        self.district(data.district);
        self.postal_code(data.postal_code);
        self.subDistrict(data.sub_district);
        self.provinsi(json);


        // self.bank_name(bank.bank_name);
        // self.account_name(bank.account_name);
        // self.account_number(bank.account_number);
        // self.bank_branch(data.bank_branch);

        console.log(bank)
        
        // self.kabupaten(self.getKabupatenByProvinceId(json[0].id))
        // self.kecamatan(self.getKecamatanByDistrictId(self.kabupaten()[0].id))
    };
    if( $('#imageUploadSeller').length>0){
        $('#imageUploadSeller')
        .jqxFileUpload({ width: 300, 
            uploadUrl: '/penjual/profile/upload', 
        fileInputName: 'seller_file'});
        $('#imageUploadSeller').on('uploadStart', function (event) {
            setTimeout(function(){
            // self.gambar.push({nama:event.args.file,gambar:'/uploads/profile/'+self.username()+'/'+event.args.file});
            var filename = (event.args.file).replace(/^C:\\fakepath\\/i,'');
            self.photo('/uploads/profile/'+self.username()+'/'+filename);
        },1000);
            
        });
    }
    self.getImageBank =function(bank){
        try {
            if(bank.toLowerCase()=='bca'){
                return '/img/bank/bca.png';
            }    
        } catch (error) {
            return '';
                        
        }
        
    }
    self.saveInformasiUmum=function(){
        var users ={
            username:self.username(),
            email:self.email(),
            fullname : self.nama(),
        }
      
        var penjual={
            gender:self.gender(),
            photo:self.photo(),
            province:self.province(),
            district:self.district(),
            postal_code:self.postal_code(),
            sub_district:self.subDistrict(),
            address:self.address(),
            phone:self.phone(),
            company_name:self.company_name(),
            company_desc:self.company_desc(),
        }
        $.post('/penjual/profile',{
            users:JSON.stringify(users),
            penjual:JSON.stringify(penjual),
            bank:JSON.stringify(self.bank())
        })
        .done(function(){
            window.location.reload();
        });
    }
    self.changePassword = function(){
        var doc ={
            username:self.username(),
            passwordBaru:self.passwordBaru(),
            passwordSekarang:self.passwordSekarang()
        }
        alert(doc.username)
        var re =/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        var validator = re.exec(doc.passwordBaru);

        if(validator){
            self.passwordBaruException('');
            if(self.passwordBaru()===self.cpasswordBaru()){
                self.cpasswordBaruException('');
                $.post('/penjual/update/password/',doc)
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

    self.modalInformasiUmum=function(){
        document.getElementById('informasi-umum-seller').style.display='block'
    }
   

    
}