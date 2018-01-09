function Orders(){
    var self = this;
    self.orders=ko.observableArray([]);
    self.orderDetails = ko.observable({});
    self.detailToogle =ko.observable(false);
    self.loadOrders=function(){
        var json;
        try {
            json= JSON.parse(
                (getJSON('/order/get/orders/me')));
        } catch (error) {
            json=[];
        }finally{
            self.orders(json);
        }
        console.log(json)
    };
    self.details=function(id){
        return JSON.parse(getJSON('/order/get/myorder/details/'+id));
    };
    self.getImageByProductId=function(id){
        var image = JSON.parse(getJSON('/product/image/get/'+id));
        return image.gambar;
    }
    self.checkPayment=function(cond){
        if(cond){
            return 'Sudah Bayar';
        }
        return 'Belum Bayar';
    }
    self.getListImage=function(id){
        var details = self.details(id);
        return details;
    }
    self.converToDateLocal = function(date){
        var dt = new Date(date);
        return dt.toLocaleDateString()
    }
    self.viewDetails=function(obj){
        self.detailToogle(!self.detailToogle());
        if(self.detailToogle()){
            $('#orders-'+obj.id).show();
        }else{
            $('#orders-'+obj.id).hide();
        }
        
    }
    self.cur=function(number){
        return  number
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    self.bayarSekarang =function(obj){
        window.location.href='/payment/'+obj.id
    }
    
    // self.getProfilePenjual=function(user){
    //     var json = JSON.parse(getJSON('/profile/penjual/'+user));
    //     return json[0];
    // }
   

    // self.formatLocalDate = function (date) {
    //     var dt = new Date(date);
    //     return dt.toLocaleDateString()+' '+dt.getHours()+' : '+dt.getMinutes()
    // }
    // self.formatLargeNumber = function (number) {
    //     return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // }
   
    // self.gambarProduk=function(id){
    //   return (JSON.parse(getJSON('/produk/get1/'+id))[0].gambar);
    // };
   
}
