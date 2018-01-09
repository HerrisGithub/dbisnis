function Register(){

    // confirmation_token
    // confirmation
    //#region buyer
    var self = this;

    self.id             =   ko.observable('');
    self.username       =   ko.observable('');
    self.email          =   ko.observable('');
    self.nama           =   ko.observable('');
    self.password       =   ko.observable('');
    self.secondpassword =   ko.observable('');


    self.gender         =   ko.observable();
    self.birth          =   ko.observable('');
    self.phone          =   ko.observable('');
    self.photo          =   ko.observable('');
    self.address        =   ko.observable('');
    self.province       =   ko.observable('');
    self.district       =   ko.observable('');
    self.postal_code    =   ko.observable('');
    self.subDistrict    =   ko.observable('');
    
    self.next=ko.observable(true);
    self.usernameException=ko.observable('');
    self.emailException=ko.observable('');
    self.namaException=ko.observable('');
    self.phoneException=ko.observable('');
    self.passwordException=ko.observable('');
    self.confirmPasswordException = ko.observable('');    
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
        if(self.password()==self.secondpassword()){
            self.confirmPasswordException('');
        }else{
            self.confirmPasswordException('Password not match');
        }
    }
    self.checked = function(that){
        
    }
    self.parseBoolean=function(bol){
        if(bol == '0'){
            self.gender(false);
        }else{
            self.gender(true);
        }
    }
    self.submit =function(){
        self.parseBoolean(self.gender());
        var date = new Date();
        if(self.next()){
            var doc = {
                id:generateId(),
                username:self.username(),
                email : self.email(),
                fullname:self.nama(),
                phone:self.phone(),
                password:self.secondpassword(),

                gender:self.gender(),
                birth:date.toLocaleDateString(),
                phone:self.phone(),
                photo:self.photo(),
                address:self.address(),
                province:self.province(),
                district:self.district(),
                postal_code:self.postal_code(),
                sub_distict:self.subDistrict()
            }
            $.post('/register',doc)
            .done(function(){
                window.location.href='/login';
            });

        }
        

    }   
    //#endregion
    
}