
function setBarChart(success,fail,elementId){
   
    var ctx = document.getElementById(elementId).getContext('2d');
    var labels =[];
    var s={
        data:[],
        backgroundColor:[],
        borderColor:[]
    };
    var f={
        data:[],
        backgroundColor:[],
        borderColor:[]
    };
    success.forEach(e => {
        var date = new Date(e.date);
        labels.push(date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear());
        s.data.push(e.sum);
        s.backgroundColor.push('#4CAF50');
        s.borderColor.push('orange');
    });
    fail.forEach(e => {
        var date = new Date(e.date);
        labels.push(date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear());
        f.data.push(e.sum);
        f.backgroundColor.push('#F08080');
        f.borderColor.push('orange');
    });
    
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sukses',
                data: s.data,
                backgroundColor: s.backgroundColor,
                borderColor: s.borderColor,
                borderWidth: 2,
            },
            {
                label: 'Pengembalian',
                data: f.data,
                backgroundColor: f.backgroundColor,
                borderColor: f.borderColor,
                borderWidth: 2,
            }
        ]
        },
        options: {
            tooltips: {
                mode: 'nearest'
            }
        }
    });
}


function ProfilCompany(){
    var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = realtime.channels.get('dirbis');
    var self = this;

    var nav = {
        all:$('#allNav')
    }

    self.username = ko.observable();
    self.products = ko.observableArray();
    self.ratingAll = ko.observableArray();
    self.averageRating = ko.observable(0);
    self.ratingCount = ko.observable(0);

    self.orders = ko.observableArray();
    self.ordersCount = ko.observable(0);
    self.averageSuccessOrders = ko.observable(0);
    self.averageFailOrders = ko.observable(0);
    self.successOrders = ko.observable(0);
    self.failOrders = ko.observable(0);
    self.sortPriceToggle=ko.observable(false);
    self.kategori = ko.observableArray();
    self.katalog = ko.observableArray();

    // kategori sorting
    self.kategoriSort = ko.observableArray([
        {kategori:'Terbaru',id:1},
        {kategori:'Harga rendah - tinggi',id:2},
        {kategori:'Harga tinggi - rendah',id:3},
        {kategori:'Terlaris',id:4},

    ]);

   
    self.createProducts=function(pageSize,d){
        // href="javascript:detailProduct('+item.product_id+')"
      try {
        function simpleTemplating(data) {
            
            var html = '';
                $.each(data, function(index, item){
                    var temp='';
                    if(typeof item.max!=='undefined'){
                        temp = formatRupiah(item.min)+' - '+formatRupiah(item.max)
                    } else{
                        temp= formatRupiah(item.min);
                    }
                    html += '<a href="javascript:detailProduct('+item.product_id+')" class="asdad"><div class="w3-third w3-container w3-margin-bottom" style="border-color: white; border-style: solid; border-width: 1px; padding: 0; padding-right: 5px;">'+
                    '<img alt="Norway" src='+item.gambar+' style="width:100%; height: 150px" class="w3-hover-opacity">'+
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
        })
        } 
        catch (error) {
          
        }
    }
    
    self.load=function(json,rating,orders){

        var bs = JSON.parse(getJSON('/produk/best/selling'));
        var index =0;
        self.orders(orders);
        self.ratingAll(rating);
        self.products(json);
        self.ratingCount(self.ratingAll().length);
        self.ordersCount(self.orders().length);
        self.products().forEach(e => {
            var gmin = JSON.parse(getJSON('/produk/grosir/satuan/min/'+e.product_id))[0].min;
            var gmax = JSON.parse(getJSON('/produk/grosir/satuan/max/'+e.product_id))[0].max;
            var vmin =  JSON.parse(getJSON('/produk/variasi/harga/min/'+e.product_id))[0].min;
            var vmax =  JSON.parse(getJSON('/produk/variasi/harga/max/'+e.product_id))[0].max;
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
                if(e.product_id===el.product_id){
                    self.products()[index].terjual=el.qty
                }else{
                    self.products()[index].terjual=0;
                }
            });
            index++;
            
           
        });
        var kategori = self.products().map(function(obj) { 
            return obj.kategori; 
        });
        kategori = kategori.filter(function(v,i) { 
            return kategori.indexOf(v) == i; 
        });
        kategori.forEach(e => {
            self.kategori.push({kategori:e});
        });
        self.orders().forEach(e => {
            if((e.status)===5){
                self.successOrders(self.successOrders()+1)
            }
            else if((e.status)===3){
                self.failOrders(self.failOrders()+1)
            }
        });
        var rate=0;
        self.ratingAll().forEach(e=> {
            rate+=e.star
        });
        self.averageRating((rate/self.ratingAll().length)/5*100);
        self.averageSuccessOrders(self.successOrders()/self.ordersCount()*100);
        self.averageFailOrders(self.failOrders()/self.ordersCount()*100);
        self.createProducts(6,self.products());
        // var success = JSON.parse(getJSON('/seller/monthly/selling/'+self.username()));
        var fail = JSON.parse(getJSON('/seller/monthly/refund/'+self.username()));
        // setBarChart(success,fail,'myChart');
        var rate = (self.rating(self.averageRating()));
        self.setStar(rate);
    }
    self.loadProfileC=function(){
        self.username($('#idCompany').val());
        var json = JSON.parse(getJSON('/produk_user/get/'+self.username()));
        var rating = JSON.parse(getJSON('/product/rating/all/'+self.username()));
        var orders = JSON.parse(getJSON('/orders/seller/'+self.username()))
        self.load(json,rating,orders);
        var katalog = JSON.parse(getJSON('/katalog/'+self.username()));
        self.katalog(katalog);

    }
    self.setStar = function(val){
        var html='';
        var star = '<i class="glyphicon glyphicon-star" style="font-size: 36pt; color: gold"></i>';
        var unstar = '<i class="glyphicon glyphicon-star" style="font-size: 36pt; color: white"></i>';
        for(var i=0; i<5; i++){
            if(i<val){
                html+=star;
            }else{
                html+=unstar;
            }
        }
        $('#rating-pembeli').append(html);
    }
  
    self.all=function(obj){
      nav.all.removeClass('w3-white');
      nav.all.addClass('w3-black');
        self.createProducts(self.products().length,self.products());
    }
    self.clearNavHover = function(){
        nav.all.addClass('w3-white');
        nav.all.removeClass('w3-black');
    }
    self.urutkan=function(obj){
        // self.createProducts(6,temp);
        self.clearNavHover();

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
    self.filterKategori=function(obj){
        var temp =[];
        self.products().forEach(e => {
            if(e.kategori===obj.kategori){
                temp.push(e);
            }
        });
        self.createProducts(6,temp);
    }

    self.currentFilter = ko.observable();
    self.searchBox = ko.computed({
        read:function(){
            return self.currentFilter();
        },
        write:function(){
            console.log(self.currentFilter())
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
    
    self.rating=function(val){
        if(val>80){
            return 5;
        }else if(val>60){
            return 4;
        }else if(val>40){
            return 3;
        }else if(val>20){
            return 2;
        } else if(val>0){
            return 1;
        }
        return 0;
    }

    self.subject = ko.observable();
    self.messageBody=ko.observable();
    self.sendMessage=function(){
        var doc = {
            id:generateId(),
            subject:self.subject(),
            creator:JSON.parse(me()).users_name,
            message_body:self.messageBody(),
            recipient:self.username()
        }
        $.post('/messages/send',doc)
        .then(function(){
            channel.publish(doc.recipient+'message',doc);
            self.subject('');
            self.messageBody('');
        })
    }



    ko.bindingHandlers.pagination = {
        init: function(elem, valueAccessor) {
            var item =self.tempProducts().length;
            var pageSize = Math.ceil(item/6);

            // <a href="#" class="w3-bar-item w3-button w3-hover-black">«</a>
            var previous =  document.createElement('a');
            previous.appendChild(document.createTextNode('«'));
            previous.setAttribute("data-bind","click:''")
            previous.classList.add('w3-bar-item')
            previous.classList.add('w3-button')
            previous.classList.add('w3-hover-black')
            elem.appendChild(previous)
            
            for(var i=0; i<pageSize; i++){
                var number =  document.createElement('a');
                number.setAttribute("data-bind","text:"+(i+1))
                number.classList.add('w3-bar-item')
                number.classList.add('w3-button')
                number.classList.add('w3-black')
                elem.appendChild(number)
            }
            var next =  document.createElement('a');
            next.appendChild(document.createTextNode('»'));
            next.setAttribute("data-bind","click:''")
            next.classList.add('w3-bar-item')
            next.classList.add('w3-button')
            next.classList.add('w3-hover-black')
            elem.appendChild(next)
            
          

           
        }
    };
    
}
function detailProduct(obj){
    window.location.href='/produk/get/'+obj;
}

var stringStartsWith = function (string, startsWith) {          
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};