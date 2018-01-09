function Account(){
    var self = this;
    self.fbId=ko.observable();
    self.name = ko.observable();
    self.username = ko.observable();
    self.email = ko.observable();
    self.password = ko.observable();
    self.confirmPassword = ko.observable();
    self.birth = ko.observable();
    self.phone = ko.observable();
    self.gender = ko.observable();
    self.genderOptions = ko.observableArray([{gender:'male',id:true},{gender:'female',id:false}] )
    
    self.address        =   ko.observable();
    self.province       =   ko.observable();
    self.city           =   ko.observable();
    self.district       =   ko.observable();
    self.postal_code    =   ko.observable();
    self.subDistrict    =   ko.observable();
    self.provinsi=ko.observableArray();

    self.provinceId = ko.observable();
    self.kabupatenId = ko.observable();
    self.kecamatanId = ko.observable();
    self.provinsi = ko.observableArray();
    self.kabupaten = ko.observableArray([{id:'',province_id:'',district:''}]);
    self.kecamatan = ko.observableArray();
    self.provinsi = ko.observableArray();
    


    self.districtToggle=ko.observable(false);
    self.subDistrictToggle=ko.observable(false);
    self.postalCodeToggle=ko.observable(false);
    
    self.loadAccount=function(){
        var json = JSON.parse(getJSON('/province/all'));
        var usr = JSON.parse(getJSON('/me/profile/facebook'));
        self.name(usr.name);
        self.gender(usr.gender);
        self.fbId(usr.id);
        self.provinsi(json);
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
        self.districtToggle(true);
    }
    self.changeDistrict=function(){
        self.district(self.getKabupaten(self.kabupatenId())[0].district);
        var json = self.getKecamatanByDistrictId(self.kabupatenId());
        self.kecamatan(json);
        self.subDistrictToggle(true);
    }
    self.changeSubDistrict=function () { 
        self.subDistrict(self.getKecamatanById(self.kecamatanId())[0].sub_district);
        self.postal_code(self.getKecamatanById(self.kecamatanId())[0].zip_code);
        self.postalCodeToggle(true);
    }
    
    self.isNullOrWhiteSpace=function(value){
        if(value==''){
            return true;
        }
        return false;
    }
    self.jk =function(value){
        if(value===1){
            return true;
        }
        return false;
    }
    self.register =function(obj){
        var doc = {
            id:generateId(),
            username:self.username()||'',
            email:self.email()||'',
            fullname:self.name()||'',
            photo:'',
            gender:self.gender(),
            province:self.province()||'',
            district:self.district()||'',
            sub_district:self.subDistrict()||'',
            address:self.address()||'',
            phone:self.phone()||'',
            postal_code:self.postal_code()||'',
            birth:self.birth()
        };
        
        $.post('/register/fb',doc)
        .done(function(){
            alert(123);
        }).fail(function(err){
            console.log(err)
        })

        
    }
}