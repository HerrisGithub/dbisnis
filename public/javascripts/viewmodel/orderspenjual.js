
function OrdersPenjual(){
    var self = this;
    self.orders=ko.observableArray();
    self.belumProses=ko.observableArray();
    self.sedangKemas =ko.observableArray();
    self.dikirim =ko.observableArray();
    self.pengembalian =ko.observableArray();
    
    
    self.dataInfoPembeli=ko.observable({
        nama:''
    });
    self.uniqOrderId = ko.observableArray();
    self.uniqKemasId = ko.observableArray();
    self.uniqKirimId = ko.observableArray();
    self.uniqKembaliId = ko.observableArray();
    

    self.checkInfoPembeli=ko.observable(false);

    self.formatLargeNumber = function (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    self.getDetails=function(id){
    }
    self.getDetailsBelumProses = function(id){
        var details = _.filter(self.belumProses(),{order_id:id});
        return details;
    }
    self.getDetailsKemas=function(id){
        var details = _.filter(self.sedangKemas(),{order_id:id});
        console.log(details)
        return details;
    }
    self.getDetailsKembali=function(id){
        var details = _.filter(self.pengembalian(),{order_id:id});
        return details;
    }
    self.getDetailsKirim=function(id){
        var details = _.filter(self.dikirim(),{order_id:id});
        return details;
    }
    self.getDetailsTotal=function(id){
        alert(id)
        return JSON.parse(getJSON('/penjual/orders/new/details/total/'+id));
    };
    self.getNewOrders=function(id){
        return JSON.parse(getJSON('/penjual/orders/new/'+id))
    }
    self.formatLocalDate = function (date) {
        var dt = new Date(date);
        return dt.toLocaleDateString()+' '+dt.getHours()+' : '+dt.getMinutes()
    }
    self.getProduk=function(id){
        return JSON.parse(getJSON('/penjual/produk/get/'+id));
        console.log(JSON.parse(getJSON('/penjual/produk/get/'+id)))
    }
    self.infoPembeli=function(obj){
        var order_id = obj.order_id;
        self.dataInfoPembeli(self.getNewOrders(order_id)[0]);
        self.checkInfoPembeli(true);
    }
    self.getInfoPembeli=function(){
        return self.dataInfoPembeli();
    }
    //event
    // self.pengemasan=function(obj){
    //     var order_id= obj.order_id;
    //     $.post('/penjual/orders/details/kemas',{id:order_id,status:''})
    //     .done(function(){
    //         window.location.href='/penjual/orders';
    //     });
    // }
    self.getOrdersById=function(id){
        return JSON.parse(getJSON('/penjual/orders/get/'+id))[0];
    }
    
    self.initialProses = function(){
        var details = JSON.parse(getJSON('/order/details'));
        // self.orders(details);
        var belumProses = _.filter(details,{status:2});
        var sedangKemas = _.filter(details,{status:4});
        var dikirim = _.filter(details,{status:5});
        var batal = _.filter(details,{status:3});


        var uniq = _.uniq(belumProses,function(o){
            return o.order_id
        });

        var uniqKemas = _.uniq(sedangKemas,function(o){
            return o.order_id
        });
        
        var uniqKirim = _.uniq(dikirim,function(o){
            return o.order_id
        });
        
        var uniqKembali = _.uniq(batal,function(o){
            return o.order_id
        });



        self.uniqOrderId(uniq);
        self.uniqKemasId(uniqKemas);
        self.uniqKirimId(uniqKirim);
        self.uniqKembaliId(uniqKembali);
        

        self.belumProses(belumProses);
        self.sedangKemas(sedangKemas);
        self.dikirim(dikirim);
        self.pengembalian(batal);
    }
    self.loadPenjual=function(){

        try {
            self.initialProses();
           } catch (error) {
           }
           
    }

    self.checkOrders=function(){
        if(self.orders().length>0){
            return true;
        }
        return false;
    }
    self.kemas = function(obj){
         $.post('/penjual/orders/update',{id:obj.detail_id,status:4})
        .done(function(){
            iziToast.success({
                title: (obj.order_id).toString(),
                message: 'Telah Dikemas',
            });
           self.initialProses();
        }).fail(function(err){
                console.log(err);
        })
    }
    self.batal = function(obj){
        $.post('/penjual/orders/update',{id:obj.detail_id,status:3})
        .done(function(){
            iziToast.success({
                title: (obj.detail_id).toString(),
                message: 'Telah Dibatalkan',
            });
            self.initialProses();
        }).fail(function(err){
                console.log(err);
        })
    }
    self.kirim=function(obj){
        $.post('/penjual/orders/update',{id:obj.detail_id,status:5})
        .done(function(){
            iziToast.success({
                title: (obj.detail_id).toString(),
                message: 'Telah Berhasil Dikirim',
            });
            self.initialProses();
        }).fail(function(err){
                console.log(err);
        })
    }
}