

function InfoUser(){
    
    var self=this;
    
    var session =JSON.parse(getJSON('/me/session'));
    if(session['user_type']==='pembeli'){
        var users= JSON.parse(getJSON('/me/profile/'+session['users_name']));
        
        //boolean
        self.alamat = ko.observable(false);
        self.alamatDefault = ko.observable(!self.alamat())
        self.alamatPenagihan = ko.observable(false);
        self.halamanPembayaran = ko.observable(false);
        self.halamanPengiriman = ko.observable(true);
        
        //variable
        self.cart =ko.observable(JSON.parse(window.localStorage.getItem('cart')));
        self.orderId = ko.observable(window.localStorage.getItem('order_id')||'');
        self.username = ko.observable(users.username);
        var profile = JSON.parse(getJSON('/me/'+self.username()))[0];
        self.email = ko.observable(profile.email);
        self.nama= ko.observable(profile.fullname);
        self.address= ko.observable(profile.address);
        self.province= ko.observable(profile.province);
        self.district= ko.observable(profile.district);
        self.postal_code= ko.observable(profile.postal_code);  
        self.phone = ko.observable(profile.phone);
        self.sub_district = ko.observable(profile.sub_district);


        self.checked=ko.observable(false);
        self.buktiTrsf = ko.observable();
        self.nomorRekening = ko.observable();
        self.namaPemilik = ko.observable();

        var pembayaran= getJSON('/order/status/pembayaran/'+self.orderId())[0]||{};
        self.bayar = ko.observable(pembayaran.status_pembayaran);

        //function
        self.inverseBayar = ko.computed(function(){
            return !self.bayar();
        });
        self.cartP=function(){
            return JSON.parse(window.localStorage.getItem('cart'));
        }   
        self.totalBelanja=function(){
            var temp=0;
            self.cart().forEach(function(e) {
                e.item.forEach(element => {
                    temp+=(element.count*element.harga-element.diskon);
                });
            }, this);
            return temp;
        }
        self.formatLargeNumber = function (number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        self.tambahAlamat=function(){
            self.alamat(true);
            self.alamatDefault(false);
        }
        self.setAlamatDefault=function(){
            self.alamatDefault(true);
            self.alamat(false);
        }
        self.setAlamatPenagihan = function(){
            self.alamatPenagihan(!self.alamatPenagihan());
        }
        self.bank = ko.observableArray(bank);
        self.buatPemesanan=function(){
            var d = new Date();
            var doc ={
                id:self.orderId(),
                email:self.email(),
                name:self.username()||'',
                address:self.address()||'',
                province:self.province()||'',
                district:self.district()||'',
                sub_district:self.sub_district()||'',
                postal_code:self.postal_code()||0,
                order_date:d.toLocaleDateString(),
                verification:false,   
                bank_account:JSON.stringify({nama:self.namaPemilik()}),
                transfer_note:self.buktiTrsf(),
                orders_total:self.totalBelanja(),
                payment_status:false,
                buyer:self.username()
            }
            var temp =self.cart();
            for(var i in temp){
                temp[i].item = JSON.stringify(temp[i].item);
            };
            temp = JSON.stringify(temp);
            $.post('/checkout/add/order',{cart:temp,doc:JSON.stringify(doc)}).done(function(){
                window.localStorage.removeItem('cart');
                window.localStorage.removeItem('order_id');
                window.location.href='/payment/'+doc.id;
            }).fail(function(err){
                console.log(err)
            })
            
        }
        self.kembaliKePengiriman=function(){
            self.halamanPengiriman(true);
            self.halamanPembayaran(false);
        }
        self.checkedToogle=ko.pureComputed({
            read: function () {
                return self.checked();
            },
            write: function (value) {
              self.checked(!self.checked());
            },
            owner: this
        });
        if( $('#jqxBuktiTransfer').length>0){
            $('#jqxBuktiTransfer').jqxFileUpload({  uploadUrl: '/order/upload/bukti/'+self.orderId(),
            fileInputName: 'upload_bukti' });
            $('#jqxBuktiTransfer').on('uploadStart', function (event) {
                setTimeout(function(){
                    self.buktiTrsf('/uploads/order/'+self.orderId()+'/'+event.args.file);
                },1000);
            });  
        }


    
    }   

    //#region payment orders
    if($('#orderId').val()>0){
        var id = $('#orderId').val();
        self.cart =ko.observable(JSON.parse(window.localStorage.getItem('cart')));
        self.orderId = ko.observable(id);
        var json = getJSON('/order/'+self.orderId());
        json = JSON.parse(json)[0];
        self.nominalTrsf = ko.observable();
        self.bankName = ko.observable();
        self.bankAccount = ko.observable();
        self.namaPemilik = ko.observable();

        
        self.payment=function(){
            var bank = {
                nama:self.namaPemilik(),
                bank:self.bankName(),
                rekening:self.bankAccount(),
                nominal:self.nominalTrsf(),
            }
            var doc = {
                    id:id,
                    bank:bank,
                    payment_status:true
            }
            $.post('/order/update',{order:JSON.stringify(doc)}).done(function(){
                window.location.reload();
            }).fail(function(){
                alert(123)
            })

        }        


        // alert($('#orderId').length)        
    }

    //#endregion

}