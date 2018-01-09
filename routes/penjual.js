var express = require('express');
var common = require('./common');
var router = express.Router();
var model=require('.././model/model');
var controller=require('../controller').penjual;

var maxSize = 32 * 1000 * 1000;
var multer  = require('multer');
var upload = multer({ 
	dest: 'public/uploads/' ,
	onFileUploadStart: function(file, req, res){
		if(req.files.file.length > maxSize) {
			return false;
		}
	},
	onError : function(err, next) {
      console.log('error', err);
      next(err);
	},
	// function(req, res) {
	// 	res.status(204).end();
	// }
});
// penjual section
router.get('/', common.restrict_penjual, controller.index);
// edit user
router.get('/user/edit/:id', common.restrict_penjual, controller.editUserById);
// validate the permalink
router.post('/api/validate_permalink', controller.apiValidatePermalink);
// insert new product form action
router.post('/product/insert', common.restrict_penjual,controller.productInsert);
// penjual section
router.get('/products', common.restrict_penjual, controller.products);
// penjual section
router.get('/orders', common.restrict_penjual, controller.pageOrders);

// render the editor
router.get('/order/view/:id', common.restrict_penjual, controller.viewOrderById);
// penjual section
router.post('/product/addtocart',controller.addtocart);
// insert form
router.get('/product/new', common.restrict_penjual, controller.newProduct);
// render the editor
router.get('/product/edit/:id', common.restrict_penjual, controller.editProductById);
// upload the file
router.post('/file/upload', common.restrict_penjual, upload.single('upload_file'), controller.fileUpload);
// router.post('/file/upload/company', common.restrict_penjual, upload.single('upload_file'), controller.uploadFileSupporting);
// deletes a product image
router.post('/product/deleteimage', common.restrict_penjual, controller.deleteImage);
// set as main product image
router.post('/product/setasmainimage', common.restrict_penjual, controller.setAsMainImage);
router.get('/permintaan',common.restrict_penjual,controller.permintaan);
// update order status


//#region timeline
router.post('/order/statusupdate', common.restrict_penjual, controller.updateStatusOrder);
router.route('/timeline')
.get(common.restrict_penjual,controller.timeline)
.post(common.restrict_penjual,upload.single('upload_file'),controller.timeline);
router.get('/timeline/list',common.restrict_penjual,controller.timelineList);

//#endregion
// Update an existing product form action
router.post('/product/update', common.restrict_penjual, controller.editProductById);
// router.get('/produk/informasi/:id',common.restrict_penjual, controller.tambahInformasiProduk);
// router.post('/produk/informasi',common.restrict_penjual, controller.tambahInformasiProduk);
// router.get('/produk/informasi/pengiriman/:id',common.restrict_penjual, controller.tambahInformasiPengiriman);
// router.post('/produk/informasi/pengiriman',common.restrict_penjual, controller.tambahInformasiPengiriman);


// users
//#region users
	router.get('/me/profile',common.restrict_penjual,controller.getProfile);
	router.route('/profile',common.restrict_penjual).get(controller.profile).post(controller.editProfile);
	router.post('/profile/upload',common.restrict_penjual,upload.single('seller_file'),controller.uploadProfileImage);
	router.post('/update/password',common.restrict_penjual,controller.updatePassword);
	router.get('/contacts',common.restrict_penjual,controller.contacts);
//#endregion
//#region bank
	router.get('/bank/:username',common.restrict_penjual,controller.getBankAccount);
//#endregion

router.get('/order/view/details/:id', common.restrict_penjual, controller.viewOrderDetailsById);
router.post('/order/details/status/update',common.restrict_penjual,controller.setStatusOrder);
router.get('/db',controller.db);

router.get('/penawaran/baru/:id/:kategori',common.restrict_penjual,controller.penawaran);
//#region 
	
//#endregion



router.get('/followers/list',common.restrict_penjual,controller.getFollowers);
router.get('/message/:follower/:following',common.restrict_penjual,controller.getMessage);
router.post('/message/send',common.restrict_penjual,controller.sendMessage);
router.post('/chat/room/create',common.restrict_penjual,controller.createChatRoom);
router.get('/user/follow/:id',common.restrict_penjual,controller.getUserFollow);
router.post('/penawaran/buat',common.restrict_penjual,controller.buatPenawaran)	;
router.get('/user/follow/:id',common.restrict_penjual,controller.getUserFollow);
router.get('/products/all/get',common.restrict_penjual,controller.getProductsAll);
// router.post('/variasi/upload/gambar/:id',common.restrict_penjual,upload.single('upload_file'),controller.uploadGambarVariasi);

router.post('/produk/upload/gambar/:id',common.restrict_penjual,upload.single('upload_file'),controller.uploadGambarProduk);
router.get('/produk/variasi/:id',common.restrict_penjual,controller.getVariasiByProductId);
router.post('/produk/gambar',common.restrict_penjual,controller.uploadGambar); 
router.post('/produk/gambar/delete',common.restrict_penjual,controller.deleteGambarProduk);   
router.post('/produk/update',common.restrict_penjual,controller.updateProduk);   
router.get('/produk/gambar/get/:id',common.restrict_penjual,controller.getGambarProduk);
router.post('/produk/posting',common.restrict_penjual,controller.postingProduct);
router.post('/produk/unposting',common.restrict_penjual,controller.unposting);
router.post('/produk/add/discount',common.restrict_penjual,controller.addDiscount);
router.get('/produk/get/:id',common.restrict_penjual,controller.getProdukById);
router.get('/produk/get/kategori/:kat',common.restrict,controller.getProdukByKategori);



router.post('/file/upload/:users/:folder',
common.restrict_penjual,
upload.single('upload_file'),
controller.uploadFile);


router.route('/katalog/new').get(common.restrict_penjual,controller.katalog)
	  .post(common.restrict_penjual,controller.katalog);
router.get('/katalog/list',common.restrict_penjual,controller.katalogList);
router.get('/katalog/get/list',common.restrict_penjual,controller.getListKatalog);
router.post('/katalog/delete',common.restrict_penjual,controller.deleteKatalogById);



router.post('/variasi',common.restrict_penjual,controller.variasi);
router.post('/variasi/update',common.restrict_penjual,controller.updateVariasi);
router.post('/variasi/delete',common.restrict_penjual,controller.removeVariasi);
router.get('/variasi/:id',common.restrict_penjual,controller.getVariasiById);



router.post('/delete/file',common.restrict_penjual,controller.deleteImageByPath);
router.get('/sess',function(req,res){
	res.send(req.session);
});                                 
router.post('/grosir',common.restrict_penjual,controller.grosir);     
router.post('/grosir/update',common.restrict_penjual,controller.updateHargaGrosir);                             
router.get('/grosir/get/:id',common.restrict_penjual,controller.getHargaGrosir);
router.post('/grosir/delete',common.restrict_penjual,controller.removeGrosir);
router.post('/orders/update',common.restrict_penjual,controller.updateOrderDetails);

//get order
// router.get('/orders/get',common.restrict)
// router.get('/orders/new/:id',common.restrict_penjual,controller.getNewOrders);
// router.get('/orders/get/id',controller.getNewOrdersId);
// router.get('/orders/kemas/get/id',common.restrict_penjual,controller.getOrdersIdKemas);
// router.get('/orders/details/kemas/get/:id',common.restrict_penjual,controller.getOrderDetailsKemas);
router.get('/orders/new/details/:id',common.restrict_penjual,controller.getOrderDetails);
router.get('/orders/new/details/total/:id',common.restrict_penjual,controller.getOrderDetailsTotal);
// router.post('/orders/details/kemas',common.restrict_penjual	,controller.pengemasan);
router.get('/orders/get/:id',common.restrict,controller.getOrdersById);
// router.post('/orders/pengemasan',common.restrict,controller.pengemasan);


router.get('/ty',function(req,res){
	var boss = req.boss;
	boss.on('error', onError);
	boss.start()
	.then(ready)
	.catch(onError);
   
	function ready() {
		boss.subscribe('some-job', someJobHandler)
		// .then(() => console.log('subscribed to some-job'))
		.catch(onError);

	}
   
	function someJobHandler(job) {
		console.log('received '+job.name+job.id);
		console.log('data: '+JSON.stringify(job.data));
	
		job.done()
		.then(function(){res.send(200);})
		.catch(onError);
	}
   
	function onError(error) {
		console.error(error);
	}
});
// =========================================================


// penjual section
router.get('/orders/filter/:search', common.restrict_penjual, function(req, res, next) {
	var search_term = req.params.search;
	var orders_index = req.orders_index;
	// we strip the ID's from the lunr index search
	var lunr_id_array = [];
	orders_index.search(search_term).forEach(function(id) {
		lunr_id_array.push(id.ref);
	});
	
	// we search on the lunr indexes
	
	req.db.orders.find({ _id: { $in: lunr_id_array}}, function (err, orders) {
		res.render('orders', { 
			title: 'Order results', 
            orders: orders, 
            config: req.config.get('application'),
			session: req.session, 
			search_term: search_term,
			message: common.clear_session_value(req.session, "message"),
			message_type: common.clear_session_value(req.session, "message_type"),
			helpers: req.handlebars.helpers,
			show_footer: "show_footer"
		});
	});
});

// order product
router.get('/order/delete/:id', common.restrict_penjual, function(req, res) {
  	var db = req.db;
	var orders_index = req.orders_index;
	
	// remove the article
	db.orders.remove({_id: req.params.id}, {}, function (err, numRemoved) {
		
		// remove the index
		orders_index.remove({id: req.params.id}, false);
        
		// redirect home
		req.session.message = "Order successfully deleted";
		req.session.message_type = "success";
		res.redirect('/penjual/orders');
  	});
});



// Updates a single product quantity
// router.post('/product/updatecart', function(req, res, next) {	
//     var product_quantity = req.body.product_quantity ? req.body.product_quantity: 1;
    
//     if(product_quantity == 0){
//         // quantity equals zero so we remove the item
//         delete req.session.cart[req.body.product_id]; 
        
//         // update total cart amount
//         common.update_total_cart_amount(req, res);       
//         res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
//     }else{
//         req.db.products.findOne({_id: req.body.product_id}).exec(function (err, product) {
//             if(product){
//                 var product_price = parseFloat(product.product_price).toFixed(2);
//                 if(req.session.cart[req.body.product_id]){
//                     (req.session.cart[req.body.product_id])['quantity'] = product_quantity;
//                     (req.session.cart[req.body.product_id])['total_item_price'] = product_price * product_quantity;
                    
//                     // update total cart amount
//                     common.update_total_cart_amount(req, res);
//                     res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
//                 }else{
//                     res.status(400).json({message: 'Error updating cart. Please try again', "total_cart_items": Object.keys(req.session.cart).length});
//                 }
//             }else{
//                 res.status(400).json({message: 'Cart item not found', "total_cart_items": Object.keys(req.session.cart).length});
//             }
//         });
//     }
// });

// Remove single product from cart
router.post('/product/removefromcart', function(req, res, next) {	
    delete req.session.cart[req.body.product_id]; 
    
    // update total cart amount
    common.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Product successfully removed', "total_cart_items": 0});
});

// Totally empty the cart
router.post('/product/emptycart', function(req, res, next) {	
    delete req.session.cart;
    delete req.session.order_id;
    
    // update total cart amount
    common.update_total_cart_amount(req, res);
    res.status(200).json({message: 'Cart successfully emptied', "total_cart_items": 0});
});

// penjual section
router.get('/products/filter/:search', common.restrict_penjual, function(req, res, next) {
	var search_term = req.params.search;
	var products_index = req.products_index;

	// we strip the ID's from the lunr index search
	var lunr_id_array = [];
	products_index.search(search_term).forEach(function(id) {
		lunr_id_array.push(id.ref);
	});
	
	// we search on the lunr indexes
	req.db.products.find({ _id: { $in: lunr_id_array}}, function (err, results) {
		res.render('products', { 
			title: 'Results', 
			"results": results, 
            config: req.config.get('application'),
			session: req.session, 
			search_term: search_term,
			message: common.clear_session_value(req.session, "message"),
			message_type: common.clear_session_value(req.session, "message_type"),
			helpers: req.handlebars.helpers,
			show_footer: "show_footer"
		});
	});
});


// delete product
router.get('/product/delete/:id', common.restrict_penjual, function(req, res) {
    var rimraf = require('rimraf');
	var products_index = req.products_index;
	
	// remove the article
	req.db.products.remove({_id: req.params.id}, {}, function (err, numRemoved) {      
        // delete any images and folder
        rimraf("public/uploads/" + req.params.id, function(err) {
            
            // create lunr doc
            var lunr_doc = { 
                product_title: req.body.frm_product_title,
                product_description: req.body.frm_product_description,
                id: req.body.frm_product_id
            };
            
            // remove the index
            products_index.remove(lunr_doc, false);
            
            // redirect home
            req.session.message = "Product successfully deleted";
            req.session.message_type = "success";
            res.redirect('/penjual/products');
        });
  	});
});

// users
router.get('/users', common.restrict_penjual, function(req, res) {
	model.users.where(true).fetchAll().then(function (users) {
		users=JSON.stringify(users);
		users=JSON.parse(users);
		
		res.render('users', { 
		  	title: 'Users',
			users: users,
			config: req.config.get('application'),
			is_penjual: req.session.is_penjual,
			helpers: req.handlebars.helpers,
			session: req.session,
			message: common.clear_session_value(req.session, "message"),
			message_type: common.clear_session_value(req.session, "message_type"),
		});
	});
});


// update a user
router.post('/user/update', common.restrict_penjual, function(req, res) {
  	var db = req.db;
	var bcrypt = req.bcrypt;
    
    var is_penjual = req.body.user_penjual == 'on' ? "true" : "false";
    
    // get the user we want to update
    req.db.users.findOne({_id: req.body.user_id}, function (err, user) {
        // if the user we want to edit is not the current logged in user and the current user is not
        // an penjual we render an access denied message
        if(user.user_email != req.session.user && req.session.is_penjual == "false"){
            req.session.message = "Access denied";
            req.session.message_type = "danger";
            res.redirect('/penjual/users/');
            return;
        }
        
        // create the update doc
        var update_doc = {};
        update_doc.is_penjual = is_penjual;
        update_doc.users_name = req.body.users_name;
        if(req.body.user_password){
            update_doc.user_password = bcrypt.hashSync(req.body.user_password);
        }
        
        db.users.update({ _id: req.body.user_id }, 
            { 
                $set:  update_doc 
            }, { multi: false }, function (err, numReplaced) {
            if(err){
                console.error("Failed updating user: " + err);
                req.session.message = "Failed to update user";
                req.session.message_type = "danger";
                res.redirect('/penjual/user/edit/' + req.body.user_id);
            }else{
                // show the view
                req.session.message = "User account updated.";
                req.session.message_type = "success";
                res.redirect('/penjual/user/edit/' + req.body.user_id);
            }
        });
    });
});

// insert a user
router.post('/user/insert', common.restrict_penjual, function(req, res) {
	var bcrypt = req.bcrypt;
	var url = require('url');
	
	// set the account to penjual if using the setup form. Eg: First user account
	var url_parts = url.parse(req.header('Referer'));

	var is_penjual = "false";
	if(url_parts.path == "/setup"){
		is_penjual = "true";
	}
	
	var doc = { 
        users_name: req.body.users_name,
        user_email: req.body.user_email,
		user_password: bcrypt.hashSync(req.body.user_password),
		is_penjual: is_penjual
	};
	
    // check for existing user
	model.users.where('username',req.body.user_email).count().then(function (count) {  
		if(count>0){
			console.error("Failed to insert user, possibly already exists: " + err);
            req.session.message = "A user with that email address already exists";
            req.session.message_type = "danger";
            res.redirect('/penjual/user/new');
            return;
		}
		else{
			var doc={
				username:req.body.users_name,
				email:req.body.user_email
			};
			new model.users(doc).save(null,{method:'insert'}).then(function (user) {
				req.session.message = "User account inserted";
                req.session.message_type = "success";
                // if from setup we add user to session and redirect to login.
                // Otherwise we show users screen
                if(url_parts.path == "/setup"){
                    req.session.user = req.body.user_email;
                    res.redirect('/login');
                    return;
                }else{
                    res.redirect('/penjual/users');
                    return;
                }
			}).catch(function (err) {  
				console.error("Failed to insert user: " + err);
                req.session.message = "User exists";
                req.session.message_type = "danger";
				res.redirect('/penjual/user/edit/' + doc.username);
			});
		}
	});
});

// users
router.get('/user/new', common.restrict_penjual, function(req, res) {
    req.db.users.findOne({_id: req.params.id}, function (err, user) {
		res.render('user_new', { 
		  	title: 'User - New',
			user: user,
			session: req.session,
            helpers: req.handlebars.helpers,
            message: common.clear_session_value(req.session, "message"),
			message_type: common.clear_session_value(req.session, "message_type"),
			config: req.config.get('application')
		});
	});
});

// delete user
router.get('/user/delete/:id', common.restrict_penjual, function(req, res) {
	// remove the article
	if(req.session.is_penjual == "true"){
		req.db.users.remove({_id: req.params.id}, {}, function (err, numRemoved) {			
			req.session.message = "User deleted.";
			req.session.message_type = "success";
			res.redirect("/penjual/users");
	  	});
	}else{
		req.session.message = "Access denied.";
		req.session.message_type = "danger";
		res.redirect("/penjual/users");
	}
});

// update the published state based on an ajax call from the frontend
router.post('/product/published_state', common.restrict_penjual, function(req, res) {
	new model.products({ id: req.body.id,product_published: req.body.state}).save(null,{method:'update'}).then(function (numReplaced) {
			res.writeHead(200, { 'Content-Type': 'application/text' }); 
			res.end('Published state updated');
	}).catch(function (err) {  
		console.error("Failed to update the published state: " + err);
			res.writeHead(400, { 'Content-Type': 'application/text' }); 
			res.end('Published state not updated');
	});
});	




// delete a file via ajax request
router.post('/file/delete', common.restrict_penjual, function(req, res) {
	var fs = require('fs');
	
	req.session.message = null;
	req.session.message_type = null;

	fs.unlink("public/" + req.body.img, function (err) {
		if(err){
			console.error("File delete error: "+ err);
			res.writeHead(400, { 'Content-Type': 'application/text' }); 
            res.end('Failed to delete file: ' + err);
		}else{
			
			res.writeHead(200, { 'Content-Type': 'application/text' }); 
            res.end('File deleted successfully');
		}
	});
});

router.get('/files', common.restrict_penjual, function(req, res) {
	var glob = require("glob");
	var fs = require("fs");
	
	// loop files in /public/uploads/
	glob("public/uploads/**", {nosort: true}, function (er, files) {
		
		// sort array
		files.sort();
		
		// declare the array of objects
		var file_list = [];
		var dir_list = [];
		
		// loop these files
		for (var i = 0; i < files.length; i++) {
			
			// only want files
			if(fs.lstatSync(files[i]).isDirectory() == false){
				// declare the file object and set its values
				var file = {
					id: i,
					path: files[i].substring(6)
				};
				
				// push the file object into the array
				file_list.push(file);
			}else{
				var dir = {
					id: i,
					path: files[i].substring(6)
				};
				
				// push the dir object into the array
				dir_list.push(dir);
			}
		}
		
		// render the files route
		res.render('files', {
			title: 'Files', 
			files: file_list,
			dirs: dir_list,
			session: req.session,
			config: req.config.get('application'),
			message: clear_session_value(req.session, "message"),
			message_type: clear_session_value(req.session, "message_type"),
		});
	});
});

module.exports = router;