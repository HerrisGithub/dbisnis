$(document).ready(function () {
    
    function AppViewModel() {
          var id = $('.id').val();
         var self = this;
         self.people = ko.observableArray([]);
         self.harga=ko.observable();
         self.stok=ko.observable();
         self.removePerson = function() {
             self.people.remove(this);
             var data ={
                 path:this.gambar
             }
             $.post('/penjual/delete/file',data,function(){})
             .done(function(data){
                 console.log('ok');
             }).fail(function(err){
                 console.log(err);
             })
         }
         self.setAsMain=function(){
              var data ={
                 product_id:id,
                 product_image:this.gambar
             }
             $.post('/penjual/product/setasmainimage',data,function(){})
             .done(function(data){
                 console.log('ok');
             }).fail(function(err){
                 console.log(err);
             })
         }
       
         $('#jqxFileUpload').jqxFileUpload({ width: 300, uploadUrl: '/penjual/variasi/upload/gambar/'+id, fileInputName: 'upload_file' });
         $('#jqxFileUpload').on('uploadStart', function (event) {
           setTimeout(function(){
             self.people.push({variasi:$('#warna').val(),gambar:'/uploads/variasi/'+id+'/'+event.args.file})  
           },1000);
         });
                    
        ko.bindingHandlers.currencyFormat = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ko.utils.registerEventHandler(element, 'keyup', function (event) {
                    var observable = valueAccessor();
                    observable(formatInput(element.value));
                    observable.notifySubscribers(5);
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                $(element).val(value);
            }
        };
        
        function formatInput(value) {
            value += '';
            value = value.replace(/,/g, '');
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(value)) {
                value = value.replace(rgx, '$1' + ',' + '$2');
            }
            return value;
            }
    
     }
      ko.applyBindings(new AppViewModel());
 });