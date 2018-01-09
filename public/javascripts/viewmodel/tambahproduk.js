
function TambahProduk(){
    var self = this;
    self.product_id=ko.observable(generateId());
    self.variasi = ko.observableArray();
    self.hargaGrosir = ko.observableArray();
    self.nama=ko.observable();
    self.deskripsi=ko.observable();
    self.kategori=ko.observableArray([
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
    self.selectedCategory=ko.observable();
    self.permalink=ko.observable();
    self.harga=ko.observable();
    self.stok=ko.observable();
    self.berat=ko.observable();
    self.ongkos_kirim=ko.observable();
    self.radioSelectedOptionValue=ko.observable('pre-order');
    self.pre_order = ko.observable(false);
    self.kondisi=ko.observableArray([
        {name:'Baru'},
        {name:'Bekas'},
        {name:'Rusak'}
    ]);
    self.kodePromosi=ko.observable();
    self.minPembelian=ko.observable();
    self.maxPembelian=ko.observable();
    self.maxPotongan=ko.observable();
    self.selectedCondition=ko.observable();
    self.gambar=ko.observableArray();
    self.gambarUtama=ko.observable();
    self.variasi_id=ko.observable();
    self.persen=ko.observable();
    self.fiturUmum = ko.observableArray([]);
    self.fiturUmumInput=ko.observable();
    self.fiturUmumVisible=ko.observable(false);

    self.spesifikasi = ko.observableArray([]);
    self.kategoriSpesifikasi=ko.observable();
    self.spesifikasiInput=ko.observable();
    self.spesifikasiVisible=ko.observable(false);
    

    self.productNameException=ko.observable();
    
    self.productNameVerification=function(){
        var re = /^[A-z]+$/;
        var validator = re.exec(self.nama());
        if(validator){
            self.productNameException('');
        }else{
            self.productNameException('Only alphabetic')
        }
    };

    self.isNUllUndefinedOrWhitespace = function(obj){
        if(typeof(obj)=='undefined'){
            return true;
        }else if(obj==null){
            return true;
        }else if(obj==''){
            return true;
        }
        return false;
    }

    self.setAsMain=function(obj){
        self.gambarUtama(obj.gambar);
    }
    self.removeGambar=function(obj){
        var promise = new Promise(function(resolve,reject){
          self.gambar.remove(obj);
          resolve('Success');
        })
        .then(function(){
            $.post('/penjual/delete/file',{path:obj.gambar}).done(function(){
                console.log('ok');
            }).fail(function(err){
                console.log(err)
            });
        });
    }
    self.validatePermalink=function(){
        var data = {
            id:self.product_id(),
            permalink:self.permalink()
        }
        $.post('/penjual/api/validate_permalink',data).done(function(){
            console.log('ok')
        }).fail(function(err){
            show_notification('Permalink Already Exist','danger',false);
        })
    }
    self.generatePermalink=function(){
        var permalink = generatePermalink();
        self.permalink(permalink);
    }
    self.tambahVariasi = function() {
        $('#harga').hide();
        $('#stok').hide();
        self.harga(null);
        self.stok(null);
        $('.label-variasi').text('Variasi');
        self.variasi.push({
            id:generateId(),
            nama: "",
            harga: "",
            stok:""
        });
        self.hargaGrosir([]);
    };
    self.searchVariasiIdByName=function(nama){
        self.variasi().forEach(function(i) {
            if(i.nama===nama){
                alert(i.id)
                return i.id;
            }
        }, this);
    }
    self.removeVariasi = function(gift) {
        self.variasi.remove(gift);
        if(self.variasi().length<1){
              $('.label-variasi').text('');
             $('#harga').fadeIn();
            $('#stok').fadeIn();
        }
    };
    self.tambahHargaGrosir = function() {
        if(self.variasi().length>0){
            self.hargaGrosir.push({
                variasi:self.variasi(),
                id:generateId(),
                min: "",
                max: "",
                hargaSatuan:"",
                variasi_id:self.variasi_id()
            });
        }else{
            show_notification('Variasi Belum Ada','danger',false);
        }
    };
    self.removeHargaGrosir = function(gift) {
        self.hargaGrosir.remove(gift);
    };
    self.submit=function(){
        if(self.gambarUtama()!=null){
            var variasi;
            var promise;
            self.permalink(generatePermalink());
            var product={
                id:self.product_id(),
                permalink:self.permalink(),
                nama:self.nama(),
                kategori:self.selectedCategory(),
                deskripsi:self.deskripsi(),
                berat:self.berat(),
                posting:'false',
                pre_order:self.pre_order(),
                gambar:self.gambarUtama(),
                kondisi:self.selectedCondition()=='Baru'?1:self.selectedCondition()=='Bekas'?2:3,
                ongkos_kirim:self.ongkos_kirim(),
                fitur_umum:JSON.stringify(self.fiturUmum()),
                spesifikasi:JSON.stringify(self.spesifikasi()),
                
            }
            if(self.harga()!=null && self.stok!=null){
                promise = new Promise(function(resolve,reject){
                    postProduct(product).done(function(){
                        variasi ={
                            id:generateId(),
                            product_id:self.product_id(),
                            nama:self.nama,
                            harga:self.harga,
                            stok:self.stok
                        }
                        postVariasi(variasi)
                        .done(function(){
                            resolve("Success!");
                        }).fail(function(err){
                            console.log(err);
                        });
                    }).fail(function(err){
                        reject(err);
                    })
                });

            }else{
                promise = new Promise(function(resolve,reject){
                    postProduct(product).done(function(){
                        for(var i in self.variasi()){
                            self.variasi()[i].product_id=self.product_id();
                        }
                        var data = {
                            length:self.variasi().length,
                            data: self.variasi() 
                        };
                        console.log(data)
                        // var result = ko.mapping.fromJS(data,{copy:'data'});
                            postVariasi(data)
                            .done(function(){
                                resolve("Success!");
                            }).fail(function(err){
                                reject(err);
                            });

                    }).fail(function(err){
                        console.log(err);
                    })
                })

            }
            promise.then(function(message){
                if(self.hargaGrosir().length>0){
                    
                    for(var i in self.hargaGrosir()){
                        self.hargaGrosir()[i].product_id=self.product_id();
                    }
                    var data = {
                        length:self.hargaGrosir().length,
                        data: self.hargaGrosir() 
                    };
                    postHargaGrosir(data).done(function(){

                    }).fail(function(err){
                        console.log(err);
                    })
                }
                
            }).then(function(){
                var id = generateId();
                var doc = {
                    id:id,
                    kode_promosi:self.kodePromosi(),
                    product_id:self.product_id(),
                    persen:self.persen(),
                    min:self.minPembelian(),
                    max:self.maxPembelian(),
                    max_diskon:self.maxPotongan()
                }
               
                for(var i in self.gambar()){
                    self.gambar()[i].product_id=self.product_id();
                    self.gambar()[i].id=generateId();
                }
                var data = {
                    length:self.gambar().length,
                    data: self.gambar() 
                };
                uploadGambarProduk(data).done(function(){
                    tambahDiskon(doc).done(function(){
                        window.location.reload(); 
                    })
                   
                }).fail(function(){

                });
                
            })
        }else{
            show_notification('Gambar Utama Belum Di set','danger',false);
        }
    };
    if( $('#jqxFileUpload').length>0){
        $('#jqxFileUpload').jqxFileUpload({ width: 300, uploadUrl: '/penjual/produk/upload/gambar/'+self.product_id(), fileInputName: 'upload_file' });
        $('#jqxFileUpload').on('uploadStart', function (event) {
            setTimeout(function(){
            self.gambar.push({nama:event.args.file,gambar:'/uploads/product_image/'+self.product_id()+'/'+event.args.file});
            },1000);
        });  
    }
    self.addFiturUmum=function(){
        if(!self.isNUllUndefinedOrWhitespace(self.fiturUmumInput())){
            self.fiturUmumVisible(true);
            self.fiturUmum.push({fitur:self.fiturUmumInput()});
            self.fiturUmumInput('');
        }
    }
    self.addSpesifikasi = function(){
        if(!self.isNUllUndefinedOrWhitespace(self.spesifikasiInput()) && 
        !self.isNUllUndefinedOrWhitespace(self.kategoriSpesifikasi())){
            self.spesifikasiVisible(true);
            self.spesifikasi.push({kategori:self.kategoriSpesifikasi(),spesifikasi:self.spesifikasiInput()});
            self.spesifikasiInput('');
            self.kategoriSpesifikasi('');
        }
    };
    self.removeSpec=function(kategori){
        self.spesifikasi.remove(function(_kategori){
            return _kategori.kategori==kategori
        });
    };
    self.removeFitur=function(fitur){
        self.fiturUmum.remove(function(_fitur){
            return _fitur.fitur==fitur
        });
    };
    self.removeFiturUmum = function(obj){
        self.removeFitur(obj.fitur);
        if(self.fiturUmum().length<=0){
            self.fiturUmumVisible(false);
        }
    };
    self.removeSpesifikasi=function(obj){
        self.removeSpec(obj.kategori);
        if(self.spesifikasi().length<=0){
            self.spesifikasiVisible(false);
        }
    }
    
}