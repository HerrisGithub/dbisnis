function getJSON(url) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url,false);
        httpRequest.send();
        return httpRequest.responseText;
}

function Admin(){ 
	
    var realtime = new Ably.Realtime('_-wzFw.epqIdQ:s15wobsXH1aT-n1Q');
    var channel = realtime.channels.get('dirbis');
    
   
	var self = this;
	self.users = ko.observable();
	self.katalog = ko.observableArray();
	self.orders = ko.observableArray();

	self.loadAdmin=function(){
		self.users(JSON.parse(getJSON('/protected/users/all/get')));
		self.katalog(JSON.parse(getJSON('/protected/katalog/list')));
		self.orders(JSON.parse(getJSON('/protected/orders')));
		
	}
	self.confirm=function(obj){
		var user = obj.username;
		$.get('/protected/users/verifikasi/'+user+'/'+'true')
		.done(function(data){
			window.location.reload();
		}).fail(function(){

		})
	}
	self.decline=function(obj){
		var user = obj.username;
		$.get('/protected/users/verifikasi/'+user+'/'+'false')
		.done(function(data){
			window.location.reload();
		}).fail(function(){

		})
	}
	self.suksesVerifikasi=function(obj){
		$.post('/protected/orders/sukses',obj)
		.done(function(){
			var od = JSON.parse(getJSON('/protected/order/details/'+obj.id));
			_.each(od,function(data){
				channel.publish(data.product_by+'orders',data);
			})
		}).fail(function(err){
			console.log(err);
		});
	}



}