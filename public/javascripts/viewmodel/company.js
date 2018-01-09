function Company(){
    $("#modal").iziModal({
        title: 'Unduh Katalog',
        headerColor: '#88A0B9',
        background: 'white',
        theme: 'dark',  // light
        width: 500,
        padding: 10,
        radius: 10,
        zindex: 999,
        focusInput: true,
        autoOpen: false, // Boolean, Number
        openFullscreen: false,
        closeOnEscape: true,
        closeButton: true,
        appendTo: 'body', // or false
        appendToOverlay: 'body', // or false
        overlay: true,
        overlayClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        timeout:false,
        timeoutProgressbar: true,
        pauseOnHover: false,
        timeoutProgressbarColor: 'rgba(255,255,255,0.5)',
        transitionIn: 'comingIn',
        transitionOut: 'comingOut',
        transitionInOverlay: 'fadeIn',
        transitionOutOverlay: 'fadeOut',
        onFullscreen: function(){},
        onResize: function(){},
        onOpening: function(){
            $('#ctx').append('asd')
        },
        onOpened: function(){
        },
        onClosing: function(){
        },
        onClosed: function(){},
        afterRender: function(){}
    });
    var self =  this;

    self.currentFilter=ko.observable();
    self.company = ko.observableArray();
    self.temp = ko.observableArray();
    self.searchBox = ko.computed({
        read:function(){
            return self.currentFilter();
        },
        write:function(){
            if (!self.currentFilter() || self.currentFilter()=='') {
                self.company(self.temp());
            }
            else{
                var comp= ko.utils.arrayFilter(self.company(), 
                    function (c) {
                       return stringStartsWith((c.company_name).toLowerCase()
                       ,self.currentFilter())
                });
                self.company(comp);
                return comp;
            }
        }            
    }) 
    self.getRating=function(user){
        var rating = JSON.parse(
            getJSON('/product/rating/all/'+user));
            self.setStar(3,'rating-'+user);
        
    }
    self.setStar = function(val,element){
        var index =0;
        var html='';
        var star = '<i class="glyphicon glyphicon-star" style="font-size: 18pt; color: gold"></i>';
        var unstar = '<i class="glyphicon glyphicon-star" style="font-size: 10pt; color:grey"></i>';
            for(var i=0; i<5; i++){
                if(i<val){
                    html+=star;
                    index++;
                }else{
                    html+=unstar;
                }
            }

        $('#'+element).append(html);
    }
    
    self.getAllCompany = function(){
        var company = JSON.parse(getJSON('/company/all'));
        self.company(company);
        self.temp(JSON.parse(getJSON('/company/all')));
    }
    self.katalogToggle=function(obj){
        var x = document.getElementById('katalog-'+obj.id);
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
            x.previousElementSibling.className += " w3-theme-d1";
        } else { 
            x.className = x.className.replace("w3-show", "");
            x.previousElementSibling.className = 
            x.previousElementSibling.className.replace(" w3-theme-d1", "");
        }
    }
    self.getKatalog=function(users){
        var a = JSON.parse(JSON.stringify(getJSON('/katalog/'+users)));
        a= JSON.parse(a);
        return a;
    };
    self.viewProfile=function(obj){
        window.location.href="/company/profile/"+obj.id;
    }

    self.showKatalog = function(obj){
        $('#modal').iziModal('open');
    }

}
