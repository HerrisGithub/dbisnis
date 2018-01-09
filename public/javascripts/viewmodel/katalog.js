function Katalog(){
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.expired = ko.observable();
    self.path = ko.observable();
    var u = JSON.parse(me());

    if( $('#katalogUpload').length>0){
        $('#katalogUpload').jqxFileUpload({ width: 300, 
            uploadUrl: '/penjual/file/upload/'+
            u.users_name+'/katalog', 
            fileInputName: 'upload_file' });
        $('#katalogUpload').on('uploadStart', function (event) {
            setTimeout(function(){
                self.path((event.args.file).replace(' ','_'));  
            },2000);
        });  
    }
    self.addKatalog=function(){
        var date = new Date(self.expired());
        // table.increments('id');
        // table.string('title');
        // table.text('desc');
        // table.string('file');
        // table.string('upload_by').notNullable().references('penjual.username').onDelete('cascade').onUpdate('cascade');
        // table.string('product_permalink').unique();
		// table.timestamp('created_at').defaultTo(knex.fn.now());
        // table.timestamp('updated_at').defaultTo(knex.fn.now());
        var doc = {
            id:generateId(),
            title:self.title(),
            desc:self.description(),
            upload_by:u.users_name,
            product_permalink:generateId(),
            file:'/uploads/files/'+u.users_name+'/katalog/'+self.path()
        }
        $.post('/penjual/katalog/new',doc).done(function(){
            window.location.reload();
        }).fail(function(err){
            alert(err);
        });
    };
    
    //#region view
    self.cdate=function(date){
        date = new Date(date);
        return date.toLocaleDateString();
    }
    self.listKatalog=ko.observableArray();
    self.loadKatalogList=function(){
        var json = getJSON('/penjual/katalog/get/list');
        json = JSON.parse(json);
        self.listKatalog(json);
    };
    self.removeItem=function(obj){
        $.post('/penjual/katalog/delete',{id:obj.katalogId})
        .done(function(){
            self.listKatalog.remove(obj);
        }).fail(function(err){
            console.log(err);
        })
    }
    self.setting=function(obj){
        $('#katalog-edit').modal();
    }
   
    //#endregion



    // id: 1512919067,
    // username: 'aas123111',
    // email: 'herris@adl.com',
    // fullname: 'Herris Suhendra',
    // created_at: '2017-12-16T06:04:56.821Z',
    // updated_at: '2017-12-16T06:04:56.821Z',
    // title: 'adadad',
    // desc: 'adad',
    // file: null,
    // upload_by: 'aas123111',
    // product_permalink: '1513406713',
    // gender: true,
    // photo: '/uploads/profile/aas123111/perusahaan-listrik-negara-pln-indonesia.jpg',
    // province: 'Sumatera Utara',
    // district: 'Medan',
    // postal_code: '20524',
    // sub_district: 'Medan Labuhan',
    // address: 'jdkakjdk',
    // phone: '085262845577',
    // company_name: 'PT. Anugrah Karya Prima',
    // company_desc: 'Perusahaan yang bergerak di bidang distribusi minuman',
    // account_number: '830-524-6448',
    // bank_name: 'Bca',
    // bank_branch: 'Asia Megamas',
    // account_name: '' 
}
