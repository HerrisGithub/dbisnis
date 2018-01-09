

function Produk() {

var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
var channel = realtime.channels.get('dirbis');

   
    

    // variable
var self = this;
self.products = ko.observableArray();
self.kategoriOptions =ko.observableArray();


self.produk = ko.observableArray();
self.harga = ko.observable(0);
self.total = ko.observable(0);
self.diskon = ko.observable(0);
self.unit = ko.observable(1);
self.hasDiskon=ko.observable(false);
self.variasi=ko.observableArray();
self.variasiSelection = ko.observable(1);
self.category = ko.observableArray();
// self.variasi=ko.observable();
self.kodeDiskon = ko.observable();
self.cekDiskon=ko.observable(false);
self.addToCartEnable = ko.observable(true);
self.valueUpdateDiskon = ko.observable();
self.hargaView = ko.observable(0);
self.hargaBeli = ko.observable(0);

self.category([
    {name:'Laptop & PC'},
    {name:'CPU Processors'},
    {name:'Motherboard'},
    {name:'VGA Card'},
    {name:'Internal Hard Drives'},
    {name:'SSD'},
    {name:'Kartu Memori Komputer'},
    {name:'Casing Komputer'},
    {name:'Power Supplies'},
    {name:'Monitor'},
    {name:'Internal Optical Drives'},
    {name:'Kipas & Sistem Pendingin'},
    {name:'Mouse'},
    {name:'Webcams'},
    {name:'Keyboards'},
    {name:'Flash USB'},
    {name:'External Hard Drives'},
    {name:'Kabel & Adapters'},
    {name:'UPS'},
    {name:'Sounds Card'},
    {name:'External DVD Drives'},
    {name:'Card Readers'}
]);

self.cart = ko.observableArray([]);
self.cartCount = ko.observable();
var cart = JSON.parse(window.localStorage.getItem('cart'));
if (cart != null) {
self.cart(cart);
self.cartCount(self.cart().length)
} else {
self.cartCount(0);
}

self.printProducts=function(){
    console.log(self.products())    
}
// function
self.loadCategoryProduct=function(){
    var json = window.localStorage.getItem('search');
    json = JSON.parse(JSON.parse(json));
    var promise = new Promise(function (resolve, reject) {
            resolve(json)
    });
    promise.then(function (data) {
        $('#modal').modal();
        setTimeout(function () {
            self.tampilHargaMin(data);
            self.tampilHargaMax(data);
            self
                .tampilHarga(data)
                .then(function (data) {
                    self.produk([]);
                    self.produk(data);
                    $('#modal').modal('hide');
                })
        }, 1000);
        
    });
}
self.createProducts=function(pageSize,d){
    if($('#data-container').length>0){
    function simpleTemplating(data) {
        var html = '';
            $.each(data, function(index, item){
                var temp='';
                
                if(typeof item.max!=='undefined'){
                    temp = formatRupiah(item.min)+' - '+formatRupiah(item.max)
                } else{
                    temp= formatRupiah(item.min);
                }
                html += '<a href="/produk/get/'+item.id+'" class="asdad"><div class="w3-third w3-container w3-margin-bottom" style="border-color: white; border-style: solid; border-width: 1px; padding: 0; padding-right: 5px;">'+
                '<img alt="Norway" src="'+item.gambar+'" style="width:100%; height: 150px" class="w3-hover-opacity">'+
                '<div class="w3-container w3-white"><p></p>'+
                  '<p><b>'+item.nama+'</b></p>'+
                  '<p style="color:grey">'+item.deskripsi+'</p>'+
                  '<p style="color:grey">'+temp+'</p>'+
                '</div>'+
              '</div></a>'
            });
            return html;
    }
    $('#pagination').pagination({
        dataSource: d,
        pageSize:pageSize,
        callback: function(data, pagination) {
            var html = simpleTemplating(data);
            $('#data-container').html(html);
        }
    })}
}

self.filterKategori=function(val){
    var temp =[];
    self.products().forEach(e => {
        if(e.kategori===val){
            console.log(self.products())
            
            temp.push(e);
        }
    });
    self.createProducts(6,temp);
}
self.all=function(){
    self.createProducts(self.products().length,self.products());
}
self.currentFilter = ko.observable();
self.searchBox = ko.computed({
    read:function(){
        return self.currentFilter();
    },
    write:function(){
        if (!self.currentFilter() || self.currentFilter()=='') {
            self.createProducts(6,self.products());
        }else{
            var products = 
            ko.utils.arrayFilter(self.products(), 
                function (prod) {
                   return stringStartsWith(prod.nama.toLowerCase(),self.currentFilter())
            });
            self.createProducts(6,products);

            return products;
        }
            // return self.currentFilter();
            
           
    }            
})  
self.urutkan=function(obj){
    //Terbaru
    if(obj.id===1){
        self.createProducts(6,self.products());
    }
    // termurah
    else if(obj.id===2){
        var sort = _.sortBy(self.products(),function(o){return o.min});
            self.createProducts(6,sort);
    }
     // termahal
    else if(obj.id===3){
        var sort = _.sortBy(self.products(),function(o){return o.min});
            self.createProducts(6,sort.reverse());
    }
     // terlaris
     else if(obj.id===4){
        var temp=[];
        var sort = _.sortBy(self.products(),function(o){
                return o.terjual
        });
        sort=sort.reverse();
        sort.forEach(e => {
            if(e.terjual>0){
                temp.push(e);
            }
        });
            self.createProducts(6,temp);
    }
}
self.loadHalamanProduk = function(){
        var bs = JSON.parse(getJSON('/produk/best/selling'));
        var products = JSON.parse(getJSON('/produk/all'));
        products = _.where(products,{posting:true});
        self.products(products);
        var kategoriOptions=[];
        var index =0;
        self.products().forEach(e => {
            var gmin = JSON.parse(getJSON('/produk/grosir/satuan/min/'+e.id))[0].min;
            var gmax = JSON.parse(getJSON('/produk/grosir/satuan/max/'+e.id))[0].max;
            var vmin =  JSON.parse(getJSON('/produk/variasi/harga/min/'+e.id))[0].min;
            var vmax =  JSON.parse(getJSON('/produk/variasi/harga/max/'+e.id))[0].max;
            kategoriOptions.push(e.kategori);
            
            if(gmin>vmin){
                self.products()[index].min=vmin;
            }else{
                self.products()[index].min=gmin;
            }

            if(gmax>vmax){
                self.products()[index].max=gmax;
            }else{
                self.products()[index].min=vmax;
            }
            bs.forEach(el => {
                if(e.id===el.product_id){
                    self.products()[index].terjual=el.qty
                }else{
                    self.products()[index].terjual=0;
                }
            });
        
            index++;
        });
        self.kategoriOptions(_.uniq(kategoriOptions));
        self.createProducts(6,self.products());
}   
self.tampilHargaMax = function (data) {
    return new Promise(function (resolve, reject) {
        $.each(data, function (i, item) {
                $
                    .getJSON('/produk/grosir/max/' + data[i].id, function (_data) {
                        data[i].max = _data[0].max
                        if (i == data.length - 1) {
                            resolve(data);
                        }
                    });
            });
    })
}
self.tampilHargaMin = function (data) {
    return new Promise(function (resolve, reject) {
        $
            .each(data, function (i, item) {
                $
                    .getJSON('/produk/grosir/min/' + data[i].id, function (_data) {
                        data[i].min = _data[0].min
                        if (i == data.length - 1) {
                            resolve(data);
                        }
                    });
            });
    })
}
self.tampilHarga = function (data) {
    return new Promise(function (resolve, reject) {
        $
            .each(data, function (i, item) {
                $
                    .getJSON('/produk/variasi/harga/' + data[i].id, function (_data) {
                        data[i].harga = _data[0].harga
                        if (i == data.length - 1) {
                            resolve(data);
                        }
                    });
            });
    })
}
self.searchVariasi = function(id){
    for(var i in self.variasi()){
        if(self.variasi()[i].id===id){
            return self.variasi()[i];
            break;
        }
    }
    return;
}
self.bruto = function(){
    return self.harga()*parseInt(self.unit()) ;
}
self.searchVariasiById=function(id){
    return JSON.parse(getJSON('/produk/variasi/'+id));
};
self.produkLoad = function(){
    var idProduk = $('.idProduk').val();
    self.variasi(self.searchVariasiById(idProduk));
};
self.setTotal = function(){
self.total((self.harga()* parseInt(self.unit()))-self.diskon());
}
self.changeVariasi = function(obj,event){
    var idProduk = $('.idProduk').val();
        self.searchVariasiById(idProduk).forEach(element => {
        if(self.variasiSelection()===element.nama){
            self.harga(element.harga);
            self.setTotal();
        }
        });
}
self.getHargaGrosir=function(id){
    var grosir;
    try {
        grosir = JSON.parse(getJSON('/produk/grosir/'+id));
    } catch (error) {
        grosir=[];            
    }finally{
        return grosir;
    }
};
self.unitChange=function(){
    var id = $('.idProduk').val();
    var grosir = self.getHargaGrosir(id)
    for(var i in grosir){
        if(self.searchVariasi(grosir[i].variasi_id).nama === self.variasiSelection() 
            && self.unit()>=parseInt(grosir[i].min) 
            && self.unit()<=parseInt(grosir[i].max)){
                self.harga(parseInt(grosir[i].satuan))
                break;
        }else if(self.searchVariasi(grosir[i].variasi_id).nama === self.variasiSelection()
            && self.unit()>=parseInt(grosir[grosir.length-1].max)){
                self.harga(parseInt(grosir[grosir.length-1].satuan))
        }else{
            self.changeVariasi();   
        }
    }
    self.valueChangeDiskon();
    self.setTotal();

}
self.getPersenDiskon=function(){
    var idProduk = $('.idProduk').val();
    var promosi;
    try {
        promosi = JSON.parse(getJSON('/produk/promosi/'+idProduk+"/"+self.valueUpdateDiskon()));
        
    } catch (error) {
        promosi=[];            
    }finally{
        if(promosi.length>0){
            return promosi[0].persen;    
        }
        return 0;
    }
    }
    self.isNotUndefinedOrNUll=function(data){
    if(typeof data!='undefined' && data!=null){
        return true;
    }
    return false;
    }
    self.valueChangeDiskon = function(){
    if(self.valueUpdateDiskon()!=='' && typeof(self.valueUpdateDiskon())!=='undefined' ){
        var idProduk = $('.idProduk').val();
        var promosi;
        try {
            promosi = JSON.parse(getJSON('/produk/promosi/'+idProduk+"/"+self.valueUpdateDiskon()));
        } catch (error) {
            promosi=[];            
        }
        if(promosi.length>0){
            var data = {
                persen : promosi[0].persen,
                minimalHargaPembelian : promosi[0].min,
                maksimalUnitPembelian : promosi[0].max,
                maksimalHargaDiskon : promosi[0].max_diskon
            }
            if(!((self.harga()*self.unit())<data.minimalHargaPembelian)){
                if(self.unit()<data.maksimalUnitPembelian){
                    self.diskon((self.harga()*data.persen/100)*self.unit());
                    self.hasDiskon(true);
                    
                }else if(self.unit()>data.maksimalUnitPembelian){
                    self.diskon((self.harga()*data.persen/100)*data.maksimalUnitPembelian);
                    self.hasDiskon(true);
                }
                
            }else{
                self.diskon(0);
                self.hasDiskon(false);
            }
            if(self.diskon()>data.maksimalHargaDiskon){
                self.diskon(data.maksimalHargaDiskon);
            }
            
            self.setTotal();    
            self.cekDiskon(false);
            
        }else{
            self.cekDiskon(true);
            self.hasDiskon(false);
            self.diskon(0);
            self.setTotal();
        }
    }else{
        self.cekDiskon(false);
        self.hasDiskon(false);
        self.diskon(0);
        self.setTotal();
    }
}
self.refillCart = {
    addItemCount: function (obj) {
        obj.count=parseInt(obj.count)+ 1;
        temp = (JSON.parse(window.localStorage.getItem('cart')));
        self.cart([]);
        for(var i in temp){
            if(temp[i].cid==obj.cid){
                self.cart.push(obj);
            }else{
                self.cart.push(temp[i]);
            }
        }
        window.localStorage.setItem('cart',JSON.stringify(self.cart()));
    },
    substractItemCount: function (obj) {
        obj.count=parseInt(obj.count)-1;
        temp = (JSON.parse(window.localStorage.getItem('cart')));
        self.cart([]);
        for(var i in temp){
            if(temp[i].cid==obj.cid){
                self.cart.push(obj);
            }else{
                self.cart.push(temp[i]);
            }
        }
        window.localStorage.setItem('cart',JSON.stringify(self.cart()));
    },
    changeItemCount: function (obj) {
        var temp = self.cart();
        self.cart([]);
        for (var i in temp) {
            if (temp[i].nama === obj.nama) {
                if (temp[i].count == 0) {
                    if (!confirm('Yakin Mau Hapus Item Pembelian?')) {
                        self
                            .cart
                            .push(temp[i]);
                    } else {
                        self.cartCount(self.cartCount() - 1);
                    }
                } else {
                    temp[i].count = parseInt(obj.count);
                    self
                        .cart
                        .push(temp[i]);
                }
            } else {
                self
                    .cart
                    .push(temp[i]);
            }
        }

        self.setJsonLocalStorage(self.cart(), 'cart');
    }
}
self.setJsonLocalStorage = function (data, name) {
    var data = JSON.stringify(data)
    window
        .localStorage
        .setItem(name, data);
}
self.addItemCount = function (obj) {
self
    .refillCart
    .addItemCount(obj);
}
self.substractItemCount = function (obj) {
self
    .refillCart
    .substractItemCount(obj);
}
self.addToCart = function (data) {
    $('#modal').modal();
    setTimeout(function () {
        var index = 0;
        if (self.cart().length > 0) {
            var cek;
            for (var i in self.cart()) {
                if (self.cart()[i].nama == data.nama) {
                    self
                        .refillCart
                        .addItemCount(data);
                    $('#cart').modal();
                    $('#modal').modal('hide');
                    cek = true;
                    break;
                } else {
                    cek = false;
                }
            }
            if (cek == false) {
                data.count = 1;
                self
                    .cart
                    .push(data);
                self.cartCount(self.cartCount() + 1);
                $('#modal').modal('hide');
            }

        } else {
            data.count = 1;
            self
                .cart
                .push(data);
            self.cartCount(self.cartCount() + 1);
            $('#modal').modal('hide');
        }
        self.setJsonLocalStorage(self.cart(), 'cart');
    }, 400);
    }
    self.searchProdukById = function (data) {
    var res;
        self
        .produk()
        .forEach(function (i) {
            if (i.id == data) {
                res = i;
            }
        }, this);
        
    return res;


}
self.addToCartView = function (data) {
    // $('#modal').modal();
    var id = document.getElementsByClassName('btnAddCart')[0].id;

    //  = _.filter(self.products(),function(o){return o.id=id});
    var produk = _.find(self.products(),function(o){return o.id ==id});
        var cart =[];
        var newP = false;
        
        var prod = {
            id:produk.id,
            nama:produk.nama,
            berat:produk.berat,
            count:self.unit(),
            harga:self.harga(),
            diskon:self.diskon(),
            total:self.total(),
            variasi:self.variasiSelection(), 
            gambar:produk.gambar,
            cid:generateId(),
            permalink:produk.permalink,
            ongkos_kirim:produk.ongkos_kirim,
            deskripsi:produk.deskripsi,
            product_by:produk.product_by
        };

        self.searchVariasiById(id).forEach(element => {
            if(prod.variasi===element.nama){
                prod.harga=element.harga;
                prod.variasi = element.nama;
            }
        });

        if(self.cart().length>0){
            for(var i in self.cart()){
                if(prod.product_by===self.cart()[i].product_by){
                    self.cart()[i].item.push(prod);
                    newP=false;
                    break;
                }else{
                    newP=true;
                }
            }
        }else{
            newP=true;
        }
        if(newP){
            var _temp = {
                product_by:prod.product_by,
                item:[]
            }
            _temp.item.push(prod);
            self.cart.push(_temp);
        }
        var temp = self.cart();
        self.cart(temp);
        self.cartCount(self.cartCount()+1);
        window.localStorage.setItem('cart',JSON.stringify(self.cart()));
    // })

}
self.checkedItem=ko.observableArray();
self.subTotalItem=function(name){
    var total=0;
    self.cart().forEach(element => {
        if(element.product_by===name){
            element.item.forEach(el=>{
                total+= parseInt(el.total) 
            });
        }
    });
    return (total);
};
self.totalHargaProduk=function(){
    var total=0;
    self.cart().forEach(element => {
        element.item.forEach(el=> {
            total+=el.total
        });
    });
    return total
}
self.grandTotal=function(){

}    
self.removeCartProduk = function(name){
    var temp = self.cart();
    self.cart([]);
    for(var i in temp){
        if(!(temp[i].product_by===name)){
            self.cart.push(temp[i]);
        }
    }
    self.setJsonLocalStorage(self.cart(),'cart');
    
}
self.removeCartItem = function (obj) {
    
        for(var j in self.checkedItem()){
            self.removeCartProduk(self.checkedItem()[j])
        }
}
self.removeAllCartItem = function (obj) {
    self.cart([]);
    self.cartCount(0);
    self.setJsonLocalStorage(self.cart(), 'cart');
}
self.formatLargeNumber = function (number) {
    return  number
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
self.fiturUmum = ko.pureComputed({
    read: function () {
        console.log(self.produk())
    }
})
self.selectVariasi = ko.pureComputed({
    read:function(){
        try {
            var id = document.getElementsByClassName('btnAddCart')[0].id;
                self.searchVariasiById(id).forEach(element => {
                if($('#selectVariasi').val()===element.nama){
                    self.hargaView(element.harga);
                }
                });
        } catch (error) {
        }
    },
    write:function(){
        var id = document.getElementsByClassName('btnAddCart')[0].id;
        self.searchVariasiById(id).forEach(element => {
            if($('#selectVariasi').val()===element.nama){
                self.hargaView(element.harga);
            }
        });
    }
});
self.categoryAction = function (obj) {
    $('#modal').modal();
    setTimeout(function () {
        $('#modal').modal();
        new Promise(function (resolve, reject) {
            $
                .get('/produk/category/' + obj.nama)
                .done(function (data) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve(data)
                })
                .fail(function (err) {
                    reject();
                })
        })
            .then(function (data) {
                self.tampilHargaMin(data);
                self.tampilHargaMax(data);
                self
                    .tampilHarga(data)
                    .then(function (data) {
                        self.produk([]);
                        self.produk(data);
                    })
                $('#modal').modal('hide');
            });
    }, 1000);
};
self.filter = function () {
    self.filterProducts('a');
}
self.setCartCountNull = function () {
    self.cartCount(0);
}
self.checkout = function () {
    var total = 0;
    if (window.localStorage.getItem('order_id') == null) {
        window
            .localStorage
            .setItem('order_id', generateId());
    }
    window.location.href = '/checkout/step/infopengiriman';

}

self.addQty=function(obj){
    var item =[];
    var ele = [];
    self.cart().forEach(element => {
        element.item.forEach(el => {
            if(el.cid === obj.cid){
                el.count=el.count+1;
                el.total=el.harga* el.count - el.diskon;
            }
            item.push(el);
        });
        ele.push(element)
    });
    self.cart([]);
    self.cart(ele);
    window.localStorage.setItem('cart',JSON.stringify(ele));
};
self.substractQty = function(obj){
    var item =[];
    var ele = [];
    self.cart().forEach(element => {
        element.item.forEach(el => {
            if(el.cid === obj.cid){
                el.count=el.count-1;
                el.total=el.harga* el.count;
            }
            item.push(el);
        });
        ele.push(element)
    });
    self.cart([]);
    self.cart(ele);
    window.localStorage.setItem('cart',JSON.stringify(ele));
};


//#region chat dengan penjual
    self.receiver=ko.observable();
    self.content = ko.observable();


    self.chatsBody = ko.observableArray([]);
    self.receiverChatsBody = ko.observableArray([]);
    
    self.receiver = ko.observable({});
    self.state = ko.observable(0);
    self.sendCounter = ko.observable(0);
    self.receiveCounter = ko.observable(0);
    self.room_id = ko.observable();

    self.sendTemplate=function(photo,content){
        if(self.state()!==1){
            self.sendCounter(self.sendCounter()+1);
            var temp =
                '<div class="chat_message_wrapper chat_message_right">'+
                '   <div class="chat_user_avatar">'+
                '       <a href="#" >'+
                '           <img class="md-user-image" src="'+photo+'" style="width: 37px; height: 37px">'+
                '       </a>'+
                '   </div>'+
                '    <ul class="chat_message" id="send'+self.sendCounter()+'">'+
                '            <li style="width: 200px">'+
                '                <span>'+content+'</span>'+
                '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                '            </li>'+
                '    </ul>'+
                '</div>';
            $('#chatContent').append(temp);
            self.state(1);
        }else if(self.state()===1){
            $('#send'+self.sendCounter()).append(
                '            <li style="width: 200px">'+
                '                <span>'+content+'</span>'+
                '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                '            </li>'
            )
        }
    }
    self.receiveMessage = function(photo,content){
        if(self.state()!==2){
            self.receiveCounter(self.receiveCounter()+1);
            var temp=
            '<div class="chat_message_wrapper">'+
                    '<div class="chat_user_avatar">'+
                    '<a href="#">'+
                        '<img src="'+photo+'" class="md-user-image"  style="width: 37px; height: 37px">'+
                    '</a>'+
                    '</div>'+
                    '<ul class="chat_message" id="receive'+self.receiveCounter()+'">'+
                        '<li style="width: 200px">'+
                            '<p>'+
                            '                <span>'+content+'</span>'+
                            '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                            '</p>'+
                        '</li>'+
                    '</ul>'+
            '</div>';
            $('#chatContent').append(temp);
            self.state(2);


        }else if(self.state()===2){
            $('#receive'+self.receiveCounter()).append(
                '            <li style="width: 200px">'+
                '                <span>'+content+'</span>'+
                '                <span class="chat_message_time">23 Jun 1:10am</span>'+
                '            </li>'
            )
        }
    }
    self.startChat = function(obj){
        document.getElementById('chatContent').innerHTML="";
        self.sendCounter(0);
        self.receiveCounter(0);
        self.state(0);
        // var user= $(".startChat").attr('data-username');
        // var penjual = JSON.parse(getJSON('/profile/penjual/'+user));
        // self.receiver(penjual[0]);
        // var user1 = JSON.parse(me()).users_name;
        // var user2 = self.receiver().username;
        // var room_id = JSON.parse(getJSON('/room/id/'+user1+'/'+user2));
        // self.room_id(room_id);
        // var json=JSON.parse(getJSON('/chats/'+room_id));
        

        // json.forEach(e => {
        //     if(e.creator===user1){
        //         self.sendTemplate('/dirbis.png',e.message_body);
        //     }else{
        //         self.receiveMessage('/dirbis.png',e.message_body);
        //     }
        // });
        
        // $('#chat').addClass('popup-box-on');
    }
    self.closeChat=function(){
        $('#chat').removeClass('popup-box-on');
    }
    self.sendMessage = function(){
        var content = self.content();
        var photo = JSON.parse(me()).photo;
        self.sendTemplate(photo,content);
    }
    self.send = function(){
       
        var doc ={
            room_id:self.room_id(),
            creator:JSON.parse(me()).users_name,
            message_body:self.content(),
            recipient:self.receiver().username
        }
        $.post('/chat/send',doc)
        .done(function(){
            // channel.publish(doc.recipient+'chats',doc);
            self.sendMessage();
            self.content('');
        }).fail(function(err){
            console.log(err);
        })
    }
   
//#endregion


}
