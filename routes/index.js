var express = require('express');
var router = express.Router();
var common = require('./common');
var model  = require('.././model/model');
var controller=require('../controller').pembeli;
var PController=require('../controller').penjual;
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy,
GoogleStrategy = require('passport-google-oauth2').Strategy;
var requestify = require('requestify'); 
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var localStorage = require('localStorage');
var restrict = common.restrict;



router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/auth', failureRedirect: '/login' }));
router.route('/auth').get(controller.auth);
router.get('/me/facebook',controller.meFacebook);
router.get('/me/profile/facebook',controller.getMeFacebookProfile);

router.get('/me/session',function(req,res){
    res.send(req.session);
});
router.get('/auth/google', passport.authenticate('google', { scope: ['email','profile',
'https://www.googleapis.com/auth/plus.me',
'https://www.googleapis.com/auth/calendar'] }));
router.get('/auth/google/callback',
passport.authenticate('google', { successRedirect: '/auth', scope:[
'email','profile',
'https://www.googleapis.com/auth/plus.me',
'https://www.googleapis.com/auth/calendar',
]}));



router.route('/auth').get(controller.auth);



router.get('/',controller.index);
router.get('/register',controller.register);
router.post('/register',controller.register);
router.get('/logout', controller.logout);
router.get('/products', restrict, controller.products);
router.get('/cart',restrict,controller.cart);
router.get('/login', controller.login);
router.get('/setup',controller.setup);
router.post('/login_action', controller.login_action);
router.post('/register/fb',controller.registerByFb);
router.get('/sess',function (req,res) {res.send( JSON.stringify(req.session)).status(200);}); 
router.get('/test',function (req,res) {  
     requestify.get('http://127.0.0.1:5000/sess').then(function(response) {
	    // Get the response body
	    var resp = response.getBody();
        res.send(resp);
    });
    console.log(req.session.cart);
});
router.post('/seller/register',
upload.single('upload_file'),PController.register);


router.get('/timeline/search/:key',restrict,controller.timelineSearch);
router.get('/users/:id',controller.userInfo);
router.get('/panel/:name',restrict,controller.panel);
router.get('/follower/count/:user',controller.followerCount);
router.get('/testing',function(req,res){res.send({name:'herris'});});
router.get('/product/category/get',controller.productCategory);
router.get('/db/:query',controller.db);
router.get('/db/insert',controller.dbInsert);

router.get('/testing1',function(req,res){
    res.render('test');
});


//#region messages
    router.post('/messages/send',common.restrict,controller.sendMessage);
    router.post('/messages/update',common.restrict,controller.updateMessage);
    router.get('/message/:id',common.restrict,controller.message);
    router.post('/message/reply',common.restrict,controller.replyMessage);

//#endregion
//#region profile
router.get('/me/profile',common.restrict,controller.editProfile);
router.get('/me/profile/:username',common.restrict,controller.getProfile);
router.get('/me/get/profile/',controller.meProfile);
router.get('/me/facebook/get/profile/',controller.meFacebookProfile);

router.post('/me/update/profile/',controller.updateProfile);
router.post('/me/update/password/',controller.updatePassword);
router.post('/me/upload/file',common.restrict,upload.single('upload_file'),controller.uploadFile);
router.get('/province/all',controller.getAllProvinces);
router.get('/province/:id',controller.getProvinceById);
router.get('/profile/penjual/:user',
controller.getProfilePenjual);


router.get('/me/:username',common.restrict,controller.getMe);


router.get('/district/province/:id',controller.getDistrictByProvinceId);
router.get('/district/:id',controller.getDistrictById);
router.get('/sub_district/district/:id',controller.getSubDistrictByDistrictId);
router.get('/sub_district/:id',controller.getSubDistrictById);
//#endregion
//#region users
    router.post('/users/exist/username',controller.userExist);
    router.post('/users/exist/email',controller.emailExist);
    router.get('/contacts',common.restrict,controller.contacts);
//#endregion
//#region  produk
    router.get('/produk/best/selling',controller.bestSelling);
    router.get('/produk',controller.halamanProduk);
    router.get('/produk/get/:id',controller.getProductById);
    router.get('/produk/get1/:id',controller.getProdukById);
    router.get('/produk/all',controller.getAllProducts);
    router.get('/produk/category/:category',controller.getProductsByCategory);
    router.get('/produk/variasi/harga/:id',controller.getVariasiHarga);
    router.get('/produk/variasi/harga/min/:id',controller.getVariasiHargaMin);
    router.get('/produk/variasi/harga/max/:id',controller.getVariasiHargaMax);
    

    router.get('/produk/variasi/:id',controller.getVariasiByProductId);
    router.get('/produk/grosir/:id',controller.getHargaGrosir);
    router.get('/produk/grosir/max/:id',controller.getMaxHargaGrosir);
    router.get('/produk/grosir/min/:id',controller.getMinHargaGrosir);
    router.get('/produk/harga/grosir/:id',controller.getHargaGrosirByVariasi);
    
    router.get('/produk/grosir/satuan/min/:id',controller.getMinHargaSatuan);
    router.get('/produk/grosir/satuan/max/:id',controller.getMaxHargaSatuan);

    router.get('/produk/get/promosi/:id',common.restrict,controller.getDiscount);
    router.get('/produk_user/get/:user',common.restrict,controller.getProductByUser);
    router.get('/produk/promosi/:id/:kode',controller.getPromosiByKode);
    router.get('/pages/products/category',controller.productCategoryPage);
    router.get('/product/image/get/:id',common.restrict,controller.getImageProductById);
    // router.get('/pages/product/:id',controller.productPagesById);
    // router.get('/produk/user/category/:user',common.restrict,controller.getCategoryAllFromUser);
    router.get('/seller/monthly/selling/:user',common.restrict,controller.getMonthlySellingByUser);
    router.get('/seller/monthly/refund/:user',common.restrict,controller.getMonthlyRefundByUser);
    //#endregion

//#region rating
    router.get('/product/rating/all/:username',common.restrict,controller.getRatingAllByUser);
//#endregion



//#region search
    router.get('/pages/ukm/category',controller.UKMCategoryPage);
    router.get('/produk/search/category/:cat/:text',controller.searchProductByCategory);
//#endregion
//#region orders
    
    router.get('/order/status/pembayaran/:id',
    common.restrict,
    controller.getStatusPembayaran);
    router.post('/order/upload/bukti/:id',common.restrict,upload.single('upload_bukti'),controller.uploadBukti);
    router.post('/order/detail',common.restrict,controller.order_details);
    router.get('/order/get/:id',common.restrict,controller.getOrderById);
    router.get('/order/myorders',common.restrict,
    controller.myorders);
    router.get('/order/get/orders/me',common.restrict,
    controller.getMyOrders);
    router.get('/order/get/myorder/:id',common.restrict,controller.getMyOrderDetail);
    router.get('/order/get/myorder/details/:id',common.restrict,controller.getMyOrderDetailsByOrderId);
    router.get('/order/details/',common.restrict,controller.getOrderDetailsBySession);
    router.get('/payment/:id',common.restrict,controller.paymentPage);
    router.get('/order/:id', common.restrict, controller.getOrderById);
    router.post('/order/update', common.restrict, controller.updateOrder);
    router.get('/orders/seller/:username', common.restrict, controller.getOrdersSellerByUser);
    // router.get('/order/penawaran')

//#endregion
//#region company
    router.get('/pages/company',common.restrict,controller.companyPages);
    router.get('/company/all',common.restrict,controller.getAllCompany);
    router.get('/company/profile/:id',common.restrict,controller.companyProfilPages);
    
    //#endregion
//#region katalog
    router.get('/katalog/:users',common.restrict,controller.getKatalog);
//#endregion
//#region timeline
    router.route('/timeline').get(common.restrict,controller.timeline)
    .post(common.restrict,controller.timeline);
    router.get('/timeline/list',common.restrict,controller.timelineList);
    router.post('/following',restrict,controller.follow);
    router.get('/following/:username',restrict,controller.following);
    router.get('/likes/count/:id',restrict,controller.getLikesCount);
    router.post('/like',common.restrict,controller.timelineLike);
    router.post('/unlike',common.restrict,controller.timelineUnLike);
    router.post('/comment/post/add',common.restrict,controller.addPostComment);
    router.get('/comment/post/:id',common.restrict,controller.getCommentById);   
//#endregion
//#region chatbox
    router.post('/chat/send',common.restrict,controller.sendChat);
    // router.post('/chat/update',common.restrict,controller.updateMessage);
    router.get('/chat/:id',common.restrict,controller.message);
    // router.post('/chat/reply',common.restrict,controller.replyMessage);
    router.get('/room/id/:user1/:user2',common.restrict,controller.getRoom);
    router.get('/chats/:id',common.restrict,controller.getChatsById);
    router.get('/chat/get/:id',common.restrict,controller.getChatById);
    router.get('/chats/read/:user1/:user2',common.restrict,controller.hasReadChat);
    router.post('/chats/read',common.restrict,controller.setReadChat);
    router.get('/chats/get/all',common.restrict,controller.getAllChatByUser);
    router.get('/pages/chatting/:room',common.restrict,controller.chatPages);
//#endregion
//#region permintaan
router.route('/pages/demands/new')
.get(restrict,upload.single('upload_file'),controller.buatPermintaan)
.post(restrict,upload.single('upload_file'),controller.buatPermintaan);
router.get('/pages/demands/get',restrict,controller.permintaan);
router.get('/penawaran/setuju/:id/:qty/:harga',common.restrict,controller.setujuPenawaran);
router.get('/penawaran/tolak/:id',common.restrict,controller.tolakPenawaran);
router.get('/penawaran/bayar/:id',common.restrict,controller.bayarPenawaran);
router.get('/permintaan/all',common.restrict,controller.getAllPermintaan);

//#endregion
//#region  file
router.post('/file/upload/:users/:folder',common.restrict,upload.single('upload_file'),
controller.uploadFile2);
//#endregion
//#region  checkout
    router.get('/checkout', controller.checkout);
    router.get('/checkout/step/infopengiriman',common.restrict,controller.infoPengiriman);
    router.post('/checkout/add/order',common.restrict,controller.orders);
//#endregion
    
//#region notifications
    router.get('/messages/user/:user',common.restrict,controller.getNotificationMessages);
    router.get('/messages/reply/msid/:id',common.restrict,controller.getMessagesReply);
    
//#endregion


//#region penawaran
router.get('/penawaran',common.restrict,controller.halamanPenawaran);
router.get('/penawaran/all/user/:username',common.restrict,controller.getAllPenawaran);
// router.get('/penawaran/nonaktif/:id',common.restrict,controller.nonaktifkanPenawaran);
//#endregion


// ======================================================================
//#region another
router.get('/test88',function(req,res){
    var boss = req.boss;
    boss.on('error', onError);
    
   boss.start()
     .then(ready)
     .catch(onError);
    
   function ready() {
     boss.publish('some-job', {param1: 'parameter1'})
       .then()
       .catch(onError);
    
    //  boss.subscribe('some-job', someJobHandler)
    //    .then(() => console.log('subscribed to some-job'))
    //    .catch(onError);
   }
    
   function someJobHandler(job) {
     job.done()
       .then(function(){ 
           console.log(job);
        })
       .catch(onError);
   }
    
   function onError(error) {
     console.error(error);
   }
});
router.get('/test99',function(req,res){
    var boss = req.boss;
    boss.on('error', onError);
    
   boss.start()
     .then(ready)
     .catch(onError);
    
   function ready() {
    //  boss.publish('some-job', {param1: 'parameter1'})
    //    .then(jobId => console.log(`created some-job ${jobId}`))
    //    .catch(onError);
    
     boss.subscribe('some-job', someJobHandler)
    //    .then()
       .catch(onError);
   }
    
   function someJobHandler(job) {
    //  console.log(`received ${job.name} ${job.id}`);
    //  console.log(`data: ${JSON.stringify(job.data)}`);
    
     job.done()
       .then(function(){ console.log(job);
        })
       .catch(onError);
   }
    
   function onError(error) {
     console.error(error);
   }
});
// export files into .md files and serve to browser
router.get('/export', restrict, function(req, res) {
	var db    = req.db;
	var fs    = require('fs');
	var JSZip = require("jszip");
	
	// dump all articles to .md files. Article title is the file name and body is contents
	db.products.find({}, function (err, results) {
		
		// files are written and added to zip.
		var zip = new JSZip();
		for (var i = 0; i < results.length; i++) {
			// add and write file to zip
			zip.file(results[i].product_title + ".md", results[i].product_description);
		}
		
		// save the zip and serve to browser
		var buffer = zip.generate({type:"nodebuffer"});
		fs.writeFile("data/export.zip", buffer, function(err) {
			if (err) throw err;
			res.set('Content-Type', 'application/zip');
			res.set('Content-Disposition', 'attachment; filename=data/export.zip');
			res.set('Content-Length', buffer.length);
			res.end(buffer, 'binary');
			return;
		});
	});
});
//return sitemap
router.get('/sitemap.xml', function(req, res, next) { 
    var sm = require('sitemap');
    
    common.add_products(req, res, function (err, products){
        var sitemap = sm.createSitemap (
        {
            hostname : req.config.get('application').base_url,
            cacheTime: 600000,                                   // 600 sec - cache purge period 
            urls     : [
                { url: '/', changefreq: 'weekly', priority: 1.0 }
            ]
        });

        var current_urls = sitemap.urls;
        var merged_urls  = current_urls.concat(products);
            sitemap.urls = merged_urls;
        // render the sitemap
        sitemap.toXML( function (err, xml) {
            if (err) {
                return res.status(500).end();
            }
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });
});
// This is called on all URL's. If the "password_protect" config is set to true
// we check for a login on thsoe normally public urls. All other URL's get
// checked for a login as they are considered to be protected. The only exception
// is the "setup", "login" and "login_action" URL's which is not checked at all.
function restrict(req, res, next){
	var url_path = req.url;
    
    if(url_path.substring(0,12) == "/user_insert"){
		next();
		return;
	}
	// if not a public page we 
	check_login(req, res, next);
}
// does the actual login check
function check_login(req, res, next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/login');
	}
}
function safe_trim(str){
	if(str != undefined){
		return str.trim();
	}else{
		return str;
	}
}
//#endregion

module.exports = router;
