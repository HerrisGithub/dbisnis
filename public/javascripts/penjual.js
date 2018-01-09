$(document).ready(function () {
    $('#btnFirst').trigger('click');
    $('body').removeClass('main-content');
});
function generatePermalink(){
    var min = 100000;
    var max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateId(){
    return Math.floor(parseInt(Date.now())/1000)+getRandom(1000,5000)
}
function editProduk(data){
    return $.post('/penjual/produk/edit',data);
}
function getHargaGrosir(id){
    return $.get('/penjual/grosir/get/'+id);
}
function postVariasi(data){
    return $.post('/penjual/variasi',data);
}
function postProduct(data){
    return $.post('/penjual/product/insert',data);
}
function getSess(){
    return $.get('/penjual/sess');
}
function postHargaGrosir(data){
    return $.post('/penjual/grosir',data)
}
function uploadGambarProduk(data){
    return $.post('/penjual/produk/gambar',data)
}

function setAsMain(data){
    return $.post('/penjual/product/setasmainimage',data)
}


function show_notification(msg, type, reload_page){
    // defaults to false
    reload_page = reload_page || false;
   
    $("#notify_message").removeClass();
    $("#notify_message").addClass('alert-' + type);
    $("#notify_message").html(msg);
    $('#notify_message').slideDown(600).delay(1200).slideUp(600, function() {
        if(reload_page == true){
            location.reload();
        }
    });
}
function getRandom(max,min){
    min=Math.ceil(min);
    max=Math.floor(max);
    return Math.floor(Math.random()*(max-min))+min;
}
function listProduct(){
    
    // $('#test-modal').modal();
     $.get("/penjual/products/all/get",function (data, textStatus, jqXHR) {})
    .done(function(data){
        data = JSON.parse(JSON.stringify(data));
        loadKo(data);
    }).fail(function(err){
        console.log(err);
    });


}

function PagerModel(records){
    var self = this;
    self.pageSizeOptions = ko.observableArray([1, 5, 25, 50, 100, 250, 500]);
    self.records = GetObservableArray(records);
    self.currentPageIndex = ko.observable(self.records().length > 0 ? 0 : -1);
    self.currentPageSize = ko.observable(5);
    self.limitPageNumber=ko.observable(4);
    self.recordCount = ko.computed(function() {
        return self.records().length;
    });
    self.numberPage=ko.observableArray();
    self.maxPageIndex = ko.computed(function() {
        return Math.ceil(self.records().length / self.currentPageSize()) - 1;
    });
    self.currentPageRecords = ko.computed(function() {
        var newPageIndex = -1;
        var pageIndex = self.currentPageIndex();
        var maxPageIndex = self.maxPageIndex();
        if (pageIndex > maxPageIndex)
        {
            newPageIndex = maxPageIndex;
        }
        else if (pageIndex == -1)
        {
            if (maxPageIndex > -1)
            {
                newPageIndex = 0;
            }
            else
            {
                newPageIndex = -2;
            }
        }
        else
        {
            newPageIndex = pageIndex;
        }
        
        if (newPageIndex != pageIndex)
        {
            if (newPageIndex >= -1)
            {
                self.currentPageIndex(newPageIndex);
            }

            return [];
        }

        var pageSize = self.currentPageSize();
        var startIndex = pageIndex * pageSize;
        var endIndex = startIndex + pageSize;
        return self.records().slice(startIndex, endIndex);
    }).extend({ throttle: 5 });
    self.moveFirst = function() {
        self.changePageIndex(0);
    };
    self.movePrevious = function() {
        var current=self.currentPageIndex()-1;
        if((current<self.numberPage()[0])&&(current>-1)){
            self.numberPage([]);
            for(var i=current-self.limitPageNumber(); i<=current;i++){
                self.numberPage.push(i);
            }

        }
            self.changePageIndex(current);
    };
    self.moveToThePage=function(index){
        self.changePageIndex(index);
    };
    self.moveNext = function() {
        var current=self.currentPageIndex()+1;
        if((current>self.numberPage()[self.numberPage().length-1])&&(current<=self.maxPageIndex())){
            self.numberPage([]);
            for(var i =current; i<=self.maxPageIndex(); i++){
                if(!(self.numberPage().length>4)){
                    self.numberPage.push(i);
                }
                
            }
        }
            self.changePageIndex(current);
    };
    self.moveLast = function() {
        self.changePageIndex(self.maxPageIndex());
    };
    self.changePageIndex = function(newIndex) {
        if (newIndex < 0
            || newIndex == self.currentPageIndex()
            || newIndex > self.maxPageIndex())
        {
            return;
        }
        self.currentPageIndex(newIndex);
    };
    self.onPageSizeChange = function() {
        self.numberPage([]);
        for(var i=0; i<=self.maxPageIndex(); i++){
            if(!(self.numberPage().length>self.limitPageNumber())){
                self.numberPage.push(i);
            }
        }
        self.currentPageIndex(0);
    };
    self.renderPagers = function() {
        var pager = "<div><span data-bind=\"text: pager.currentPageIndex() + 1\"></span> of <span data-bind=\"text: pager.maxPageIndex() + 1\"></span> <select data-bind=\"options: pager.pageSizeOptions, value: pager.currentPageSize, event: { change: pager.onPageSizeChange }\"></select></div>";
        $("div.Pager1").html(pager);
        self.numberPage([]);
        for(var i=0; i<=self.maxPageIndex(); i++){
            if(!(self.numberPage().length>self.limitPageNumber())){
                self.numberPage.push(i);
            }
        }
    };	
    self.renderNoRecords = function() {
        var message = "<span data-bind=\"visible: pager.recordCount() == 0\">No records found.</span>";
        $("div.NoRecords").html(message);
    };
    self.renderPagers();
    self.renderNoRecords();
  

}

function SorterModel(sortOptions, records){
    var self = this;
    self.records = GetObservableArray(records);
    self.sortOptions = ko.observableArray(sortOptions);
    self.sortDirections = ko.observableArray([
        {
            Name: "Asc",
            Value: "Asc",
            Sort: false
        },
        {
            Name: "Desc",
            Value: "Desc",
            Sort: true
        }]);
    self.currentSortOption = ko.observable(self.sortOptions()[0]);
    self.currentSortDirection = ko.observable(self.sortDirections()[0]);
    self.orderedRecords = ko.computed(function()
    {
        var records = self.records();
        var sortOption = self.currentSortOption();
        var sortDirection = self.currentSortDirection();
        if (sortOption == null || sortDirection == null)
        {
            return records;
        }

        var sortedRecords = records.slice(0, records.length);
        SortArray(sortedRecords, sortDirection.Sort, sortOption.Sort);
        return sortedRecords;
    }).extend({ throttle: 5 });
}

function FilterModel(filters, records){
    var self = this;
    self.records = GetObservableArray(records);
    self.filters = ko.observableArray(filters);
    self.activeFilters = ko.computed(function() {
        var filters = self.filters();
        var activeFilters = [];
        for (var index = 0; index < filters.length; index++)
        {
            var filter = filters[index];
            if (filter.CurrentOption)
            {
                var filterOption = filter.CurrentOption();
                if (filterOption && filterOption.FilterValue != null)
                {
                    var activeFilter = {
                        Filter: filter,
                        IsFiltered: function(filter, record)
                        {
                            var filterOption = filter.CurrentOption();
                            if (!filterOption)
                            {
                                return;
                            }

                            var recordValue = filter.RecordValue(record);
                            return recordValue != filterOption.FilterValue;NoMat
                        }
                    };
                    activeFilters.push(activeFilter);
                }
            }
            else if (filter.Value)
            {
                var filterValue = filter.Value();
                if (filterValue && filterValue != "")
                {
                    var activeFilter = {
                        Filter: filter,
                        IsFiltered: function(filter, record)
                        {
                            var filterValue = filter.Value();
                            filterValue = filterValue.toUpperCase();
                            
                            var recordValue = filter.RecordValue(record);
                            recordValue = recordValue().toUpperCase();
                            return recordValue.indexOf(filterValue) == -1;
                        }
                    };
                    activeFilters.push(activeFilter);
                }
            }
        }

        return activeFilters;
    });
    self.filteredRecords = ko.computed(function() {
        var records = self.records();
        var filters = self.activeFilters();
        if (filters.length == 0)
        {
            return records;
        }
        
        var filteredRecords = [];
        for (var rIndex = 0; rIndex < records.length; rIndex++)
        {
            var isIncluded = true;
            var record = records[rIndex];
            for (var fIndex = 0; fIndex < filters.length; fIndex++)
            {
                var filter = filters[fIndex];
                var isFiltered = filter.IsFiltered(filter.Filter, record);
                if (isFiltered)
                {
                    isIncluded = false;
                    break;
                }
            }
            
            if (isIncluded)
            {
                filteredRecords.push(record);
            }
        }

        return filteredRecords;
    }).extend({ throttle: 200 });
}

function ExtractModels(parent, data, constructor){
    var models = [];
    if (data == null)
    {
        return models;
    }

    for (var index = 0; index < data.length; index++)
    {
        var row = data[index];
        var model = new constructor(row, parent);
        models.push(model);
    }

    return models;
}

function GetObservableArray(array){
    if (typeof(array) == 'function')
    {
        return array;
    }

    return ko.observableArray(array);
}

function CompareCaseInsensitive(left, right){
    if (left == null)
    {
        return right == null;
    }
    else if (right == null)
    {
        return false;
    }

    return left.toUpperCase() <= right.toUpperCase();
}

function GetOption(name, value, filterValue){
    var option = {
        Name: name,
        Value: value,
        FilterValue: filterValue
    };
    return option;
}

function SortArray(array, direction, comparison){
    if (array == null)
    {
        return [];
    }

    for (var oIndex = 0; oIndex < array.length; oIndex++)
    {
        var oItem = array[oIndex];
        for (var iIndex = oIndex + 1; iIndex < array.length; iIndex++)
        {
            var iItem = array[iIndex];
            var isOrdered = comparison(oItem, iItem);
            if (isOrdered == direction)
            {
                array[iIndex] = oItem;
                array[oIndex] = iItem;
                oItem = iItem;
            }
        }
    }

    return array;
}
function fillSelf(self,data){
    var date = new Date(data.created_at);
    
    self.id(data.id);
    self.permalink(data.permalink);
    self.nama(data.nama);
    self.kategori(data.kategori);
    self.deskripsi(data.deskripsi);
    self.berat(data.berat);
    self.posting(data.posting)
    self.pre_order(data.pre_order);
    self.ongkos_kirim(data.ongkos_kirim);
    self.gambar(data.gambar);
    self.kondisi(data.kondisi);
    self.product_by(data.product_by);
    self.created_at(date.toLocaleDateString());
    self.select(false);
    fillVariasi(self);
    fillGambar(self,data);
    // self.variasi_id(data.variasi_id);
}
function fillGambar(self,data){
    $.get('/penjual/produk/gambar/get/'+data.id)
    .done(function(data){
        self.gambarProduk(data);
    }).fail(function(err){
        console.log(err);
    });
}
function fillVariasi(self){
    $.get('/penjual/produk/variasi/'+self.id()).done(function(data){
        self.variasi(data);
        $.get('/penjual/grosir/get/'+self.id())
        .done(function(data){
            for(var i in data){
                data[i].variasi=self.variasi();
            }
            self.hargaGrosir(data);
        }).fail(function(err){
        });
    }).fail(function(err){
    })
}
function setSelf(self){
    self.id         = ko.observable();
    self.permalink  = ko.observable();
    self.nama       = ko.observable();
    self.kategori   = ko.observable();
    self.deskripsi  = ko.observable();
    self.berat      = ko.observable();
    self.posting    = ko.observable()
    self.pre_order  = ko.observable();
    self.ongkos_kirim = ko.observable();
    self.gambar     = ko.observable();
    self.kondisi    = ko.observable();
    self.product_by = ko.observable();
    self.created_at = ko.observable();

    // self.variasi_id = ko.observable();
    self.variasi    = ko.observableArray();
    self.harga      = ko.observableArray();
    self.stok       = ko.observableArray();
    self.select     = ko.observable();
    self.hargaGrosir = ko.observableArray();
    self.gambarProduk=ko.observableArray();
    return self;
}
function loadKo(data){
    function CustomerModel(data){
        if (!data){
            data        = {};
        }
        var self        = this;
        setSelf(self);
        fillSelf(self,data);
        
    }
    function CustomerPageModel(data){
        if (!data){
            data = {};
        }
        var index=0;
        data.customers.forEach(function(element) {
            data.customers[index].select=false;
            index++;
        }, this);
        var self = this;
        self.customers = ExtractModels(self, data.customers, CustomerModel);
        var filters = [
            {
                Type: "text",
                Name: "Name",
                Value: ko.observable(""),
                RecordValue: function(record) { 
                    return record.nama; 
                }
            },
            {
                Type: "select",
                Name: "Status",
                Options: [
                    GetOption("All", "All", null),
                    GetOption("None", "None", "None"),
                    GetOption("New", "New", "New"),
                    GetOption("Recently Modified", "Recently Modified", "Recently Modified")
                ],
                CurrentOption: ko.observable(),
                RecordValue: function(record) { return record.status; }
            }
        ];
        var sortOptions = [
            {
                Name: "ID",
                Value: "ID",
                Sort: function(left, right) { return left.id < right.id; }
            },
            {
                Name: "Name",
                Value: "Name",
                Sort: function(left, right) { return CompareCaseInsensitive(left.name, right.name); }
            },
            {
                Name: "Status",
                Value: "Status",
                Sort: function(left, right) { return CompareCaseInsensitive(left.status, right.status); }
            }
        ];
        var prom= new Promise(function(resolve,reject){
            self.filter = new FilterModel(filters, self.customers);
            self.sorter = new SorterModel(sortOptions, self.filter.filteredRecords);
            self.pager = new PagerModel(self.sorter.orderedRecords);
            resolve();
        }).then(function(){
            document.getElementById('btnFirst').click();
        });
        var that;
        
        var vm =function(){
            var self = this;
            that = setSelf(self);
            that.gambarArr=ko.observableArray();
            that.gambarUtama=ko.observable();
            that.setAsMain=function(obj){
                self.gambarUtama(obj.gambar);
            }
            that.removeGambar=function(obj){
                var promise = new Promise(function(resolve,reject){
                  that.gambarArr.remove(obj);
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
            that.namaVariasi=ko.observable();
            that.hargaVariasi=ko.observable();
            that.stokVariasi=ko.observable();
            that.variasi_=ko.observableArray();
            that.hargaGrosir_=ko.observableArray();
            that.addVariasi=function(obj){
               self.variasi_().push({nama:that.namaVariasi(),
                harga:that.hargaVariasi(),stok:that.stokVariasi(),
                id:generateId(),product_id:that.id()});
            }
            that.variasiArr=ko.observableArray();
            that.variasiGrosir=ko.observable();
            that.satuanGrosir=ko.observable();
            that.minOrder=ko.observable();
            that.maksOrder=ko.observable();
            that.selectedVariasiGrosir=ko.observable();
            that.selectedProduk=ko.observableArray();
            that.checkBox=ko.observableArray();
           
            that.searchVariasiNameById=function(id){
                var variasi = that.variasi_()();
                var nama;
                variasi.forEach(function(i) {
                    if(i.id===id){
                        nama = i.nama
                    }
                }, this);
                return nama;    
            }
            that.searchVariasiNameByArrAndId=function(array,id){
                var nama;
                array.forEach(function(i) {
                    if(i.id===id){
                        nama = i.nama
                    }
                }, this);
                return nama;    
            }
            
            that.addGrosir=function(obj){
                that.hargaGrosir_().push({
                    id:generateId(),
                    product_id:obj.id(),
                    variasi_id:obj.variasiGrosir(),
                    min:obj.satuanGrosir(),
                    max:self.minOrder(),
                    satuan:self.maksOrder(),
                    variasi_name:that.searchVariasiNameById(obj.variasiGrosir()),
                    variasi:that.variasi()
                })
            };
            that.grosirTempArr=ko.observableArray();
            that.gambarProduk_=ko.observableArray();
            that.gambarTemp=ko.observableArray();
            that.removeGambarProduk=function(obj){
                that.gambarTemp().push(obj);
                that.gambarProduk_().remove(obj);
            }
           
            
        }
        
        var model= new vm();
        ko.applyBindings(model,document.getElementById('modal'));
        self.checkedValue=ko.observable(false);
        self.checkedType=ko.observable(0);
        
        self.checkedValue_click=function(obj){
            var checked = !self.checkedValue();
            self.checkedValue(checked);
            if(checked){
                self.checkedType(2);
            }else{
                self.checkedType(0);
            }
            return true;
        }
        self.markAll= ko.computed(function() {
            var checked = true;
            if (self.checkedValue() === false && self.checkedType()===0) {
                checked = false;
                data.customers.forEach(function(i) {
                    $('#'+i.id).removeClass('mark');
                }, this);
            }else if(self.checkedValue() === true && self.checkedType()==2){
                data.customers.forEach(function(i) {
                    $('#'+i.id).addClass('mark');
                }, this);
            }else{
                checked=false;
            }
            return checked;
        });
        
        self.selectedProd=function(obj){
            $('#'+obj.id()).toggleClass('mark');
            var element = document.getElementsByClassName('mark');
            if(element.length<data.customers.length){
                self.checkedValue(false);
                self.checkedType(1);
            }else{
                self.checkedValue(true);
                self.checkedType(2);
            }
        }
        self.edit  = function(obj){
            $('#uploadImage').jqxFileUpload({ width: 'auto', uploadUrl: '/penjual/produk/upload/gambar/'+obj.id(), fileInputName: 'upload_file' });
            $('#uploadImage').on('uploadStart', function (event) {
                setTimeout(function(){
                  that.gambarProduk_().push({nama:event.args.file,gambar:'/uploads/product_image/'+obj.id()+'/'+event.args.file});
                  that.gambarArr().push({nama:event.args.file,gambar:'/uploads/product_image/'+obj.id()+'/'+event.args.file});
                  
                },2000);
            });  
            var data = {
                id:obj.id(),
                nama : obj.nama(),
                kategori:obj.kategori(),
                deskripsi:obj.deskripsi(),
                berat:obj.berat(),
                posting:obj.posting(),
                pre_order:obj.pre_order(),
                ongkos_kirim:obj.ongkos_kirim(),
                gambar:obj.gambar(),
                kondisi:obj.kondisi(),
                product_by:obj.product_by(),
            }
            that.hargaGrosir_(obj.hargaGrosir);  
            that.variasi_(obj.variasi);
            that.gambarProduk_(obj.gambarProduk);

            $('#modal').modal();
            fillSelf(that,data);
        }
        self.posting=function(){
            $('.tb tr').each(function(i){
                var id = $(this)[0].id;
                if($('#'+id).hasClass('mark')){
                    $.post('/penjual/produk/posting',{id:id})
                    .done(function(){
                        console.log(200);
                    }).fail(function(err){
                        console.log(err);
                    })
                };
            });
            window.location.reload();

        }
        self.unpost=function(){
            $('.tb tr').each(function(i){
                var id = $(this)[0].id;
                if($('#'+id).hasClass('mark')){
                    $.post('/penjual/produk/unposting',{id:id})
                    .done(function(){
                        console.log(200);
                    }).fail(function(err){
                        console.log(err);
                    })
                };
            });
            window.location.reload();
        }
        that.update=function(){
             //update produk
            var promise = new Promise(function(resolve,reject){
                var data={
                    id:that.id(),
                    nama:that.nama(),
                    berat:that.berat(),
                    ongkos_kirim:that.ongkos_kirim(),
                    kategori:that.kategori()
                }
                $.post('/penjual/produk/update',data)
                .done(function(){
                    resolve(); 
                }).fail(function(){

                })
               
            });
            //insert or update variasi
            promise.then(function(){
                var variasi = that.variasi_()();
                variasi.forEach(function(i) {
                    $.post('/penjual/variasi',i)
                    .fail(function(data,statusText,xhr){
                        $.post('/penjual/variasi/update',i).done(function(data){
                            console.log(data)
                        }).fail(function(err){
                            console.log(err);
                        })
                    });
                    
                }, this);
            });
            //insert or update harga grosir
            promise.then(function(){
                var hargaGrosir = that.hargaGrosir_()();
                    if(hargaGrosir.length>0){
                    hargaGrosir.forEach(function(i) {
                        delete i.variasi
                        $.post('/penjual/grosir',i)
                        .fail(function(err){
                            $.post('/penjual/grosir/update',i).fail(function(err){
                                console.log(err);
                            });
                        });
                    }, this);
                }
            });
            //insert or update gambar produk
            promise.then(function(){
                if(that.gambarArr().length>0){
                    for(var i in that.gambarArr()){
                        that.gambarArr()[i].product_id=that.id();
                        that.gambarArr()[i].id=generateId();
                    }
                    var data = {
                        length:that.gambarArr().length,
                        data: that.gambarArr() 
                    };
                    uploadGambarProduk(data)
                    .fail(function(err){
                        show_notification(err,'danger',false);
                    });
                }
            });
            //set as main gambar
            promise.then(function(){
                if(typeof that.gambarUtama()!='undefined'){
                    var data ={
                        product_image:that.gambarUtama(),
                        product_id:that.id()
                    };
                    $.post('/penjual/product/setasmainimage',data)
                    .fail(function(){
                        console.log('error');
                    })
                }
            });
            //remove variasi
            promise.then(function(){
                var variasi = that.variasiArr();
                if(variasi.length>0){
                    variasi.forEach(function(i) {
                        $.post('/penjual/variasi/delete',{id:i.id}).
                        done(function(){
                            that.variasiArr.remove(i);
                        })
                        .fail(function(){
                            console.log('err')
                        })
                    }, this);
                }
            });
            //remove grosir
            promise.then(function(){
                var grosirArr=that.grosirTempArr();
                grosirArr.forEach(function(i) {
                    $.post('/penjual/grosir/delete',i)
                    .fail(function(err){
                        console.log(err);
                    });
                }, this);
            });
            //remove gambar
            promise.then(function(){
                var gambar = that.gambarTemp();
                gambar.forEach(function(i) {
                    $.post('/penjual/delete/file',{path:i.gambar})
                    .fail(function(err){
                        console.log(err)
                    });
                }, this);   
            });
            //remove gambar next
            promise.then(function(){
                var gambar = that.gambarTemp();
                gambar.forEach(function(i) {
                    $.post('/penjual/produk/gambar/delete',i)
                    .fail(function(err){
                        console.log(err);
                    })
                }, this);
                
            });
            //update variasi harga grosir
            promise.then(function(){
                var variasi = that.variasi_()();
                var hargaGrosir=that.hargaGrosir_()();
                that.variasi([]);
                that.variasi(variasi);
                for(var i in that.hargaGrosir()){
                    that.hargaGrosir()[i].variasi=variasi;
                    that.hargaGrosir()[i].variasi_name= that.searchVariasiNameByArrAndId(variasi,that.hargaGrosir()[i].variasi_id);
                }
                that.hargaGrosir_()([]);
                that.hargaGrosir_()(that.hargaGrosir());
                
            });
        }
        that.save=function(){
           that.update();
            $("#modal").modal('hide');   

        }
        that.test=function(obj){
            console.log(obj)
        }
        that.apply=function(){
            that.update();
        }
        that.removeVariasi=function(obj){
            that.variasi_().remove(obj);
            that.variasiArr().push(obj);
        }
        that.removeGrosir=function(obj){
            that.hargaGrosir_().remove(obj);
            that.grosirTempArr().push(obj);
        }
        $("#modal").on("hidden.bs.modal", function () {
            window.location.reload();
        });
    }
    
	var initialize = {
        customers: data,
    };
    
    ko.applyBindings(new CustomerPageModel(initialize),document.getElementById('product1'));
}

