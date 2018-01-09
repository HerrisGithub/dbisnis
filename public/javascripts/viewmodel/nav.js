
function Nav(){
    var self=this;
    // console.log(window.location)
    self.nav=ko.observableArray();
    
    self.nav([
        {name:'Laptop & PC'},
        {name:'CPU'},  
        {name:'Motherboard'},
        {name:'VGA Card'} 
        
        
        
    ]);
    
    self.searchBox=ko.observable();
    self.options=ko.observableArray([{name:'UKM'},{name:'Produk'}])
    self.kategoriSearch=ko.observable();
    self.UKM=ko.observableArray();

    self.search=function(){
        var json =JSON.stringify(getJSON('/produk/search/category/'+self.kategoriSearch()+'/'+self.searchBox()));
        window.localStorage.setItem('search',json);
        if(self.kategoriSearch()=='Produk'){
            var doc = {
                kategori:self.kategoriSearch(),
                text:self.searchBox(),
            };
            window.location.href="/pages/products/category";
        }else {
            window.location.href="/pages/ukm/category";
        }
    }
    self.loadUkm=function(){
        var ukm = window.localStorage.getItem('search');
        ukm = JSON.parse(JSON.parse(ukm));
        self.UKM(ukm);
    }

}