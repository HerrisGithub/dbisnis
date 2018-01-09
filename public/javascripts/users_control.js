
$(document).ready(function () {
	
	var height = $('#page-wrapper').height();
    var nav = $('.sidebar-dashboard').height(height);
    $(document).scroll(function (e) {  
		var top = ($(document).scrollTop());
		var scrollCount =0;
		if(top===0){
			  $('.sidebar-dashboard').css({top:'160px'})
		}
		else{
            $('.sidebar-dashboard').css({top:'60px'})
		}
		 $('.top-fixed').css({top:'10px'})
    });
    
});

var globalPager;
 

function loadUsers(type){
    if(type==='all'){
        $.get('/protected/users/all/get')
            .done(function(data){
                loadKo(data);
            }).fail(function(err){
            console.log(err);
        });
    }
    else if(type==='active'){
         $.get('/protected/users/active/get')
            .done(function(data){
                loadKo(data);
            }).fail(function(err){
            console.log(err);
        });
    }
    else if(type==='unverified'){
         $.get('/protected/users/unverified/get')
            .done(function(data){
                loadKo(data);
            }).fail(function(err){
            console.log(err);
        });
    }
    else if(type==='cancel'){
         $.get('/protected/users/cancel/get')
            .done(function(data){
                loadKo(data);
            }).fail(function(err){
            console.log(err);
        });
    }
}
function Active(obj){
    var id =(obj.id);
		var o = obj;
    $.get('/protected/auth/'+id+'/true',function(data,status){
    }).done(function(resp){
		var td = $('#td'+o.id);
		td.empty();
		td.html('<span style="padding-left: 40%; color: green"><i class="fa fa-check-square-o fa-2x" aria-hidden="true"></span>')
				
	}).fail(function(err){
        console.log(err);
    })
}
function NonActive(obj){
        var id =(obj.id);
        var o = obj;
    $.get('/protected/auth/'+id+'/false',function(data,status){
    }).done(function(resp){
		var td = $('#td'+o.id);
		td.empty();
		td.html('<span style="padding-left: 40%; color: tomato"><i class="fa fa-times-circle-o fa-2x" aria-hidden="true"></span>')
    }).fail(function(err){
        console.log(err);
    })
}


function loadKo(data){
	function CustomerModel(data){
		if (!data){
			data = {};
		}
		var self = this;
		self.id = data.id;
		self.username = data.username;
		self.email=data.email;
		self.name=data.fullname;
		self.confirm_token=data.confirm_token;
		self.confirmation=data.confirmation;
		self.uid=data.uid;
	}

	function CustomerPageModel(data){
		if (!data){
			data = {};
		}
		var self = this;
		self.customers = ExtractModels(self, data.customers, CustomerModel);
		var filters = [
			{
				Type: "text",
				Name: "Name",
				Value: ko.observable(""),
				RecordValue: function(record) { 
					return record.name; 
				}
			},
			{
				Type: "select",
				Name: "Status",
				Options: [
					GetOption("All", "All", null),
					GetOption("All1", "All1", 'asas'),
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
		self.filter = new FilterModel(filters, self.customers);
		self.sorter = new SorterModel(sortOptions, self.filter.filteredRecords);
		self.pager = new PagerModel(self.sorter.orderedRecords);
	}


	var initialize = {
		customers: data
	};
	ko.applyBindings(new CustomerPageModel(initialize));
			
}