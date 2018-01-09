var model=require('.././model/model');
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' });
var common = require('.././routes/common');
var fs = require('fs');
var path = require('path');
var requestify = require('requestify');
var knexfile=require('../knexfile');
var knex=knexfile.knex;
var db=require('../controller/db').penjual;
var util=require('../controller/db').util;
function gender(options){
    if(options==='male'){
        return true;
    }
    return false;
}

module.exports={
    index:function (req,res) {  
        res.redirect('/penjual/orders');   
    },
    register:function (req,res,next) {  
        var body = req.body;
        db.registerUser(body)
        .then(function(){
            res.send(200);
        }).catch(function(err){ 
            console.log(err);       
            res.send(409)

        })
        
    },
    editUserById:function (req,res) {  
        model.users.where('username',req.params.id).fetch().then(function (user) {  
            if(user.get('email')!=req.session.user && req.session.is_penjual==false){
                req.session.message = "Access denied";
                req.session.message_type = "danger";
                res.redirect('/Users/');
                return;
            }
            res.render('user_edit', { 
                title: 'User edit',
                user: user,
                session: req.session,
                message: common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers: req.handlebars.helpers,
                config: req.config.get('application')
            }).catch(function (err) {  
                console.log(err);
            });
	    });
    },
    addUsers:function(req,res){
        if(req.method==='GET'){
            res.render('penjual/adduser', { 
                title: 'Add User',
                // user: user,
                session: req.session,
                message: common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers: req.handlebars.helpers,
                config: req.config.get('application')
            })
        }
    },
    apiValidatePermalink:function (req,res) {  
        var query = {};
		query = {'permalink': req.body.permalink};
        model.products.where(query).count().then(function (products) {
            if(products > 0){
                res.writeHead(400, { 'Content-Type': 'application/text' }); 
                res.end('Permalink already exists');
            }else{
                res.writeHead(200, { 'Content-Type': 'application/text' }); 
                res.end('Permalink validated successfully');
            }
        }).catch(function (err) {  
            console.log(err);
        });
    },
    productInsert:function (req,res) {  
        var products_index = req.products_index;
        var body=req.body;
        var doc = { 
           id:body.id,
           permalink: body.permalink,
           nama: body.nama,
           kategori:body.kategori,
           deskripsi: body.deskripsi,
           berat:body.berat,
           posting:body.posting,
           ongkos_kirim:body.ongkos_kirim,
           product_by :req.session.users_name,
           pre_order:body.pre_order,
           kondisi:body.kondisi,
           gambar:body.gambar,
           fitur_umum:JSON.parse(JSON.stringify(body.fitur_umum)),
           spesifikasi:JSON.parse(JSON.stringify(body.spesifikasi))
        };
        model.products
        .where('permalink',req.body.permalink)
        .count().then(function(product){
            if(product > 0 && req.body.permalink != ""){
                req.session.message = "Permalink already exists. Pick a new one.";
                req.session.message_type = "danger";
                req.session.title = req.body.title;
                req.session.description = req.body.description;
                req.session.price = req.body.price;
                req.session.permalink = req.body.permalink;
                res.redirect('/penjual/product/new');
            }else{

                db.productInsert(doc)
                .then(function(data){
                    var lunr_doc = { 
                        title: req.body.title,
                        description: req.body.description,
                        id: doc.id
                    };
                    products_index.add(lunr_doc);
                    req.session.message = "New product successfully created";
                    req.session.message_type = "success";
                    res.redirect('/penjual/product/new');
                }).catch(function (err) {  
                    console.error("Error inserting document: " + err);
                    req.session.title = req.body.title;
                    req.session.description = req.body.description;
                    req.session.price = req.body.price;
                    req.session.permalink = req.body.permalink;
                    req.session.message = "Error: " + err;
                    req.session.message_type = "danger";
                    res.redirect('/penjual/product/new');
                });
                
            }
        }).catch(function (err) {  
            console.log(err);
        });
    },
    products:function (req,res,next) {  
        res.render('penjual/products', { 
            title: 'Products', 
            // "top_results": top_results, 
            session: req.session,
            config: req.config.get('application'),
            message: common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            helpers: req.handlebars.helpers,
            show_footer: "show_footer"
        });
    },
    getProductsAll:function(req,res){
        db.getProductsAll(req.session.users_name).then(function(data){
            data = util.setJSONParse(data);
            res.send(data);
        }).catch(function (err) {  
            console.log(err);
        });
    },
    updatePassword:function(req,res){
            var username = req.body.username;
            var passwordBaru = req.body.passwordBaru;
            var passwordSekarang = req.body.passwordSekarang;
            db.updatePassword(username,passwordBaru,passwordSekarang) 
            .then(function(){
                res.send(200);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            })
            
    },
    viewOrderById:function (req,res) { 
        model.orders.where({id: req.params.id})
        .fetch().then(function (result) {
		result=JSON.stringify(result);
        result=JSON.parse(result);
        req.session.order_id=result.id;
		if(result!==null){
			res.render('order', { 
				title: 'View order', 
				"result": result,    
				config: req.config.get('application'),      
				session: req.session,
				message: common.clear_session_value(req.session, "message"),
				message_type: common.clear_session_value(req.session, "message_type"),
				editor: true,
				helpers: req.handlebars.helpers
			});
		}
		else{	
			req.session.message = "Order not found";
			req.session.message_type = "danger";
			res.redirect('/penjual/orders');
		}
	    });
    },
    viewOrderDetailsById:function(req,res){
        model.order_details.query(function(q){
            q.where({order_id: req.params.id}).andWhere('by',req.session.users_name);
        })
        .fetchAll().then(function (result) {
		result=JSON.stringify(result);
        result=JSON.parse(result);
        req.session.order_id=result[0].order_id;
		if(result!==null){
			res.render('order_details', { 
				title: 'View order', 
				result: result,    
				config: req.config.get('application'),      
				session: req.session,
				message: common.clear_session_value(req.session, "message"),
				message_type: common.clear_session_value(req.session, "message_type"),
				editor: true,
				helpers: req.handlebars.helpers
			});
		}
		else{	
			req.session.message = "Order not found";
			req.session.message_type = "danger";
			res.redirect('/penjual/orders');
		}
	    });
    },
    getProdukById:function(req,res){
        db.getProdukById({id:req.params.id})
        .then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    getProdukByKategori :function(req,res){
        var kategori =req.params.kat;
        knex('products').select('*')
        .where({kategori:kategori,product_by:req.session.users_name})
        .then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    getNewOrdersId:function(req,res){
        db.getNewOrdersId(
            {product_by:req.session.users_name,
                payment_status:true})
        .then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    getOrdersById:function(req,res){
        knex('orders').select('*').where({id:req.params.id})
        .then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
        
    },
    
    // getOrdersIdKemas:function(req,res){
    //     db.getNewOrdersId({product_by:req.session.users_name,status:"Sedang Dikemas"})
    //     .then(function(data){
    //         data = util.setJSONParse(data);
    //        res.send(data);
    //     }).catch(function(err){
    //         console.log(err);
    //         res.send(409);
    //     });
    // },
    // getOrderDetailsKemas:function(req,res){
    //     db.getOrderDetails({order_id:req.params.id, status:'Sedang Dikemas'})
    //     .then(function(data){
    //         data = util.setJSONParse(data);
    //        res.send(data);
    //     }).catch(function(err){
    //         console.log(err);
    //         res.send(409);
    //     });
    // },
    getNewOrders:function(req,res){
        db.getNewOrders({id:req.params.id}).then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    getOrderDetails:function(req,res){
        db.getOrderDetails({order_id:req.params.id, status:'Dikirim Ke Penjual'}).then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    getOrderDetailsTotal:function(req,res){
        db.getOrderDetailsTotal({order_id:req.params.id}).then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    // pengemasan:function(req,res){
    //     var body = req.body;
    //     var id = body.id;
    //     delete body.id;
    //     db.prosesPengemasan(req.body,{order_id:id}).then(function(){
    //         res.send(200);
    //     }).catch(function(err){
    //         console.log(err);
    //         res.send(409);
    //     })
    // },
    updateOrderDetails:function(req,res){
       var id = req.body.id;
        knex.transaction(function(trx){
            knex('order_details').transacting(trx)
            .update({status:req.body.status})
            .where({id:id})
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .then(function(){
            res.send(200);
        })
        .catch(function(err){
            console.log(err);
            res.send(409);
        })
    },
    addtocart:function (req,res,next) {  
         var _ = require('underscore');
        var quantity = req.body.quantity ? parseInt(req.body.quantity): 1;
        if(!req.session.cart){
            req.session.cart = {};
        }

        model.products.where({id: req.body.id}).fetch().then(
            function (product) {
                product=JSON.stringify(product);
                product=JSON.parse(product);
            if(product){
                var price = parseFloat(product.price).toFixed(2);
                // if exists we add to the existing value
                if(req.session.cart[req.body.id]){
                    req.session.cart[req.body.id]["quantity"] = req.session.cart[req.body.id]["quantity"] + quantity;
                    req.session.cart[req.body.id]["total_item_price"] = price * req.session.cart[req.body.id]["quantity"];
                }
                else{
                    // Doesnt exist so we add to the cart session
                    req.session.cart_total_items = req.session.cart_total_items + quantity;
                    
                    // new product deets
                    var obj = {};
                    obj.title = product.title;
                    obj.quantity = quantity;
                    obj.item_price = price;

                    if(product.permalink){
                        obj.link = product.permalink;
                    }else{
                        obj.link = product.id;
                    }
                    obj.by=product.by;
                    obj.id=product.id;
                    // new product id
                    var cart_obj = {};
                    cart_obj[product.id] = obj;
                    
                    // merge into the current cart
                    _.extend(req.session.cart, cart_obj);
                }
                
                // update total cart amount
                common.update_total_cart_amount(req, res);
                
                // update how many products in the shopping cart
                req.session.cart_total_items = Object.keys(req.session.cart).length;
                res.status(200).json({message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length});
            }else{
                res.status(400).json({message: 'Error updating cart. Please try again.'});
            }
        });
    },
    newProduct:function (req,res) {  
        res.render('penjual/product_new', {
            title: 'New product', 
            session: req.session,
            title: common.clear_session_value(req.session, "title"),
            description: common.clear_session_value(req.session, "description"),
            price: common.clear_session_value(req.session, "price"),
            permalink: common.clear_session_value(req.session, "permalink"),
            message: common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            editor: true,
            helpers: req.handlebars.helpers,
            config: req.config.get('application')
	    });
    },
    editProductById:function (req,res) {  
        if(req.method==='GET'){
            var classy = require("markdown-it-classy");
            var markdownit = req.markdownit;
            markdownit.use(classy);
            common.get_images(req.params.id, req, res, function (images){
                model.products.where({id: req.params.id}).fetch().then(function (result) {
                    result=JSON.stringify(result);
                    result=JSON.parse(result);
                    res.render('penjual/upload_gambar_produk', { 
                        title: 'Upload Gambar', 
                        "result": result,
                        images: images,          
                        session: req.session,
                        message: common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config: req.config.get('application'),
                        editor: true,
                        helpers: req.handlebars.helpers
                    });
                });
            });
        }
        else if(req.method==='POST'){
            common.get_images(req.body.frm_id, req, res, function (images){
                var doc = {
                    title: req.body.frm_title,
                    description: req.body.frm_description,
                    published: req.body.frm_published,
                    price: req.body.frm_price,
                    featured: req.body.frm_featured||''
                }
                // if no featured image
                if(!doc.image){
                    if(images.length > 0){
                        doc["image"] = images[0].path;
                    }else{
                        doc["image"] = "/uploads/placeholder.png";
                    }
                }
                db.editProductById(doc,{ permalink: req.body.frm_permalink})
                .then(function(resp) {
                    console.log('Transaction complete.');
                    req.session.message = "Edit product complete.";
                    req.session.message_type = "success";
                    res.redirect('/penjual/product/edit/'+req.body.frm_id);
                })
                .catch(function(err) {
                    console.error("Failed to save product: " + err)
                    req.session.message = "Failed to save. Please try again";
                    req.session.message_type = "danger";
                    res.redirect('/penjual/product/edit/' + req.body.frm_id);
                });
            });
        }
    },
    postingProduct:function(req,res){
        var id = req.body.id;
        db.editProductById({posting:true},{id:id})
        .then(function(data){
            res.send(200);
        }).catch(function(){
            res.send(409);
        })
    },
    unposting:function(req,res){
        var id = req.body.id;
        db.editProductById({posting:false},{id:id})
        .then(function(data){
            res.send(200);
        }).catch(function(){
            res.send(409);
        })
    },
    addDiscount:function(req,res){
        var body = req.body;
        var doc ={
            id:body.id,
            kode_promosi:body.kode_promosi,
            product_id:body.product_id,
            persen:body.persen,
            min:body.min,
            max:body.max,
            max_diskon:body.max_diskon
        }
        db.addDiscount(doc).then(function(){
            res.send(200);
        }).catch(function(err){
            console.log(err)
            res.send(409);
        })
    },
    
    fileUpload:function (req,res,next) {  
        	var fs = require('fs');
            var path = require('path');
            if(req.file){
                // check for upload select
                var upload_dir = path.join("public/uploads", req.body.directory);
                // Check directory and create (if needed)
                common.check_directory_sync(upload_dir);
                var file = req.file;
                var source = fs.createReadStream(file.path);
                var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));

                // save the new file
                source.pipe(dest);
                source.on("end", function() {});

                // delete the temp file.
                fs.unlink(file.path, function (err) {});
            
                // get the product form the DB
                model.products.where({id: req.body.directory}).fetch().then(function (product) {
                    product=JSON.stringify(product);
                    product=JSON.parse(product);
                    var image_path = path.join("/uploads", req.body.directory, file.originalname.replace(/ /g,"_"));
                    // if there isn't a product featured image, set this one
                    if(!product.image){
                        new model.products({id: req.body.directory,gambar: image_path})
                        .save(null,{method:'update'})	
                        .then(function (numReplaced) {
                            req.session.message = "File uploaded successfully";
                            req.session.message_type = "success";
                            res.redirect('/penjual/product/edit/' + req.body.directory);
                        });
                    }else{
                        req.session.message = "File uploaded successfully";
                        req.session.message_type = "success";
                        res.redirect('/penjual/product/edit/' + req.body.directory);
                    }
                });
            }else{
                req.session.message = "File upload error. Please select a file.";
                req.session.message_type = "danger";
                res.redirect('/penjual/product/edit/' + req.body.directory);
            }
    },
    deleteImage:function (req,res) {  
        db.getProductById({id: req.body.product_id}).then(function (product) {
            if(req.body.image == product.image){
                var doc ={
                    gambar:null
                }
                db.updateProduct(doc,{id: req.body.product_id})
                .then(function (numReplaced) {
                    fs.unlink(path.join("public", req.body.product_image), function(err){
                        if(err){
                            res.status(400).json({message: 'Image not removed, please try again.'});
                        }else{
                            res.status(200).json({message: 'Image successfully deleted'});
                        }
                    });
                });
            }
            else{
                fs.unlink(path.join("public", req.body.product_image), function(err){
                    if(err){
                        res.status(400).json({message: 'Image not removed, please try again.'});
                    }else{
                        res.status(200).json({message: 'Image successfully deleted'});
                    }
                });
            }
        });
    },
    setAsMainImage:function (req,res) {  
        var doc={
            gambar: req.body.product_image
        }
        db.setAsAnImage('products',doc,{id:req.body.product_id})
        .then(function (data) {
            res.status(200).json({message: 'Main image successfully set'});
        }).catch(function (err) {  
            res.status(400).json({message: 'Unable to set as main image. Please try again.'});
        });
    },
    permintaan:function (req,res) {  
         db.getAllDemands()
         .then(function(data){
            data=util.setJSONParse(data);
            res.render('pages/permintaan', { 
                title: 'Permintaan', 
                demands: data, 
                config: req.config.get('application'),
                session: req.session,
                message: common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers: req.handlebars.helpers,
                show_footer: "show_footer"
            });
        })
    },
    updateStatusOrder:function(req,res){
        var orders_index = req.orders_index;
        var doc={
            id:req.session.order_id,
            order_status:req.body.status
        };
        db.updateStatusOrder(doc)
        .then(function(resp) {
            console.log('Change Order Status complete.');
            req.session.message = "Change Order Status complete.";
            req.session.message_type = "success";
            res.redirect('/penjual/order/view/'+doc.id);
        })
        .catch(function(err) {
            console.error(err);
        });
   
    },
    pageOrders:function(req,res){
        res.render('penjual/orders', { 
            title: 'List Orders', 
            config: req.config.get('application'),
            session: req.session,
            message: common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            helpers: req.handlebars.helpers,
            show_footer: "show_footer"
        });
    },
    getOrderList:function(req,res){
        db.getOrderList().then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    timeline:function(req,res){
        if(req.method==='GET'){
            //#region get
                knex('users')
                .join('post', 'users.username', '=', 'post.author')
                .join('penjual', 'users.username', '=', 'penjual.username')
                // .join('pembeli', 'users.username', '=', 'pembeli.username')
                .select('users.*','post.*','penjual.*')
                .where('users.username','=',req.session.users_name)
                .then(function (data) { 
                    data = JSON.stringify(data);
                    data = JSON.parse(data);
                    res.render('pages/timeline-seller', { 
                        title       : 'Timeline',
                        user        : data[0],
                        session     : req.session,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config      : req.config.get('application'),
                        helpers     : req.handlebars.helpers,
                        page_url    : req.config.get('application').base_url,
                        show_footer : "show_footer"
                    });
                });
            //#endregion
            }
            else if(req.method==='POST'){
                var doc={
                    id:common.generateId(),
                    image:req.body.image,
                    title:req.body.title,
                    content:req.body.content,
                    author:req.session.users_name
                };
                var  photo=req.body.photo; 
                knex.transaction(function(trx) {
                    knex('post').transacting(trx).insert(doc)
                    .then(trx.commit)
                    .catch(trx.rollback);
                })
                .then(function(resp) {
                    console.log('Transaction complete.');
                    var boss    = req.boss;
                    boss.on('error', onError);
                    boss.start()
                    .then(ready)
                    .catch(onError);
                    function ready() {
                        doc.photo=photo;
                        doc.created_at=Date.now();
                        boss.publish('timeline-news', {data:doc})
                        .catch(onError);
                    }
                    function onError(error) {
                        console.error(error);
                    }
                    res.redirect('/penjual/timeline');
                })
                .catch(function(err) {
                    console.error(err);
                });
        }
    },
    timelineList:function(req,res){
         knex('users')
        .join('post', 'users.username', '=', 'post.author')
        .join('penjual', 'users.username', '=', 'penjual.username')
        .select('users.*','post.*','post.id as postid','penjual.*').orderBy('post.created_at','desc')
        .then(function (data) { 
            data = util.setJSONParse(data);
            res.send(data);
        });
    },
    contacts:function(req,res){
        knex('user_follow')
        .join('users','user_follow.follower','users.username')
        .join('pembeli','users.username','pembeli.username')
        .where({following:req.session.users_name})
        
        .select('*')
        .then(function(data){
            data = util.setJSONParse(data);
            res.send(data)
        }).catch(function(err){
            console.log(err)
            res.send(409);
        })
    },
    setStatusOrder:function(req,res){

        var doc={
            status:req.body.order_status
        }   
        
         knex.transaction(function(trx) {
            knex('order_details').transacting(trx).update(doc).where('id','=',req.body.detail_id)
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            console.log('Transaction complete.');
            res.redirect('/penjual/orders');
        })
        .catch(function(err) {
            console.error(err);
        });
    },
    katalog:function(req,res){
       if(req.method==='GET'){ 
            res.render('penjual/katalog', { 
                title       : 'Katalog',
                // user        : data[0],
                session     : req.session,
                message     : common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                config      : req.config.get('application'),
                helpers     : req.handlebars.helpers,
                page_url    : req.config.get('application').base_url,
                show_footer : "show_footer"
            });
        }
        else if(req.method==='POST'){
                var body= req.body;
                // console.log(body);
                knex.transaction(function(trx) {
                    knex('katalog')
                    .transacting(trx).insert(body)
                    .then(trx.commit)
                    .catch(trx.rollback);
                })
                .then(function(resp) {
                    console.log('Transaction complete.');
                    res.send(200);
                })
                .catch(function(err) {
                    console.log(err);
                    res.send(409);
                });
        }
    },
    getListKatalog:function(req,res){
        db.getListKatalog(req.session.users_name)
        .then(function(data){
            data = util.setJSONParse(data);
           res.send(data);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        });
    },
    katalogList:function(req,res){
        res.render('penjual/katalog_list', { 
            title: 'Katalog', 
            // katalog: katalog, 
            config: req.config.get('application'),
            session: req.session,
            message: common.clear_session_value(req.session, "message"),
            message_type: common.clear_session_value(req.session, "message_type"),
            helpers: req.handlebars.helpers,
            show_footer: "show_footer"
        });
    },
    deleteKatalogById:function(req,res){
        var id = req.body.id;
        db.deleteKatalogById(id).then(function(){
            res.send(200);
        }).catch(function(err){
            console.log(err);
            res.send(409);
        })
    },
    penawaran:function(req,res){
        var id=req.params.id;
        var kategori =req.params.kategori;
         res.render('penjual/penawaran_baru', { 
                title: 'Penawaran', 
                id_permintaan: id, 
                kategori:kategori,
                config: req.config.get('application'),
                session: req.session,
                message: common.clear_session_value(req.session, "message"),
                message_type: common.clear_session_value(req.session, "message_type"),
                helpers: req.handlebars.helpers,
                show_footer: "show_footer"
            });
    },
    buatPenawaran:function(req,res){
        var body = req.body;
        var doc = {
            id:common.generateId(),
            id_permintaan:body.id_permintaan,
            jenis_produk:body.jenis_produk,
            nama_produk:body.nama_produk,
            desc:body.desc,
            kuantitas:body.kuantitas,
            satuan:body.satuan,
            harga:body.harga,
            status:body.status,
            product_id:body.product_id,
            create_by:req.session.users_name,
        }
        knex.transaction(function(trx) {
            knex('penawaran').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            console.log('Transaction complete.');
            res.send(200);
        })
        .catch(function(err) {
            console.error(err);
        });

    },
    getFollowers:function(req,res){
        knex('user_follow')
        .where('following','=',req.session.users_name)
        .orWhere('follower','=',req.session.users_name)
        .select('*')
        .then(function (follow) { 
            follow=JSON.stringify(follow);
            follow=JSON.parse(follow);
            res.send(follow);
        });
    },
    getMessage:function(req,res){
        var follower=req.params.follower;
        var following =req.params.following;
        knex('chat_room')
        .join('messages','chat_room.id','messages.chat_room_id')
        .where('chat_room.user1',follower).andWhere('chat_room.user2',following)
        .orWhere('chat_room.user1',following).andWhere('chat_room.user2',follower)
        .select('*').then(function(data){
             data=JSON.stringify(data);
            data=JSON.parse(data);
            res.send(data);
        })
    },
    sendMessage:function(req,res){
        var body=req.body;
        
         knex.transaction(function(trx) {
            knex('messages').transacting(trx).insert(body)
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            res.send(200);
        })
        .catch(function(err) {
            console.error(err);
        });
        
    },
    createChatRoom:function(req,res){
        var body=req.body;
         knex.transaction(function(trx) {
            knex('chat_room').transacting(trx).insert(body)
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            res.send(200);
        })
        .catch(function(err) {
            console.error(err);
        });
    },
    getUserFollow:function(req,res){
        var id = req.params.id;
         knex('user_follow')
        .select('*')
        .where('user_follow.id',id)
        .first()
        .then(function(data){
            data=JSON.stringify(data);
            data=JSON.parse(data);
            res.send(data);
        });
            

    },

    //#region users
        profile:function(req,res){
                db.meProfile(req.session.users_name)
                .then(function (data) { 
                    data = util.setJSONParse(data);
                    res.render('penjual/profile', { 
                        title       : 'Profile',
                        user        : data[0],
                        session     : req.session,
                        message     : common.clear_session_value(req.session, "message"),
                        message_type: common.clear_session_value(req.session, "message_type"),
                        config      : req.config.get('application'),
                        helpers     : req.handlebars.helpers,
                        page_url    : req.config.get('application').base_url,
                        show_footer : "show_footer"
                    });
                }).catch(function(err){
                    console.log(err);
                    res.send(409);
                });
        },
        getProfile:function(req,res){
            db.meProfile(req.session.users_name)
            .then(function (data) { 
                data = util.setJSONParse(data);
                res.send(data);
            }).catch(function(err){
                console.log(err);
                res.send(409);
            });
        },
        editProfile:function(req,res){
            var users = JSON.parse(req.body.users);
            var username = users.username;
            delete users.username;
            var penjual=JSON.parse(req.body.penjual);
            var bank=JSON.parse(req.body.bank);

            db.editProfile(username,users,penjual,bank) 
            .then(function (data) { 
                res.send(200);
            })
            .catch(function(err){
                console.log(err);
                res.send(409);
            });  
        },
    //#endregion
    //#region bank
        getBankAccount:function(req,res){
            knex('bank').select('*').where({username:req.params.username})
            .then(function (data) { 
                res.send(util.setJSONParse(data));
            }).catch(function(err){
                console.log(err);
                res.send(409);
            });  
        },
        
    //#endregion
    uploadProfileImage:function(req,res){
        
        var upload_dir ="public/uploads/profile/"+req.session.users_name;
        common.check_directory_sync(upload_dir);
        var file = req.file;
        var source = fs.createReadStream(file.path);
        var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
        source.pipe(dest);
        source.on("end", function() {
            res.send(200);
        });
        fs.unlink(file.path, function (err) {});
    },
    uploadGambarVariasi:function(req,res){
        var directory=req.params.id; 
        var upload_dir = path.join("public/uploads/variasi/", directory);
        common.check_directory_sync(upload_dir);
        var file = req.file;
        var source = fs.createReadStream(file.path);
        var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
        source.pipe(dest);
        source.on("end", function() {
            res.send(200);
        });
        fs.unlink(file.path, function (err) {});
    },
    uploadGambarProduk:function(req,res){
        var directory=req.params.id; 
        var upload_dir = path.join("public/uploads/product_image/", directory);
        common.check_directory_sync(upload_dir);
        var file = req.file;
        var source = fs.createReadStream(file.path);
        var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
        source.pipe(dest);
        source.on("end", function() {
            res.send(200);
        });
        fs.unlink(file.path, function (err) {});
    },
    uploadFile:function(req,res){
        var users = req.params.users;
        var folder = req.params.folder;
        var upload_dir = path.join("public/uploads/files/",users);
        common.check_directory_sync(upload_dir);
        upload_dir=path.join(upload_dir,folder);
        common.check_directory_sync(upload_dir);
        var file = req.file;
        var source = fs.createReadStream(file.path);
        var dest = fs.createWriteStream(path.join(upload_dir, file.originalname.replace(/ /g,"_")));
        source.pipe(dest);
        source.on("end", function() {
            res.send(200);
        });
        fs.unlink(file.path, function (err) {});
    },
    deleteGambarProduk:function(req,res){
        db.deleteGambarProduk({id:req.body.id})
        .then(function(data){
            res.send(200);
        }).catch(function(err){
            res.send(409);
        });
    },
    getGambarProduk:function(req,res){
        db.getGambarProduk({product_id:req.params.id})
        .then(function(data){
            res.send(data);
        }).catch(function(err){
            res.send(409);
        });
    },
    variasi:function(req,res){
        var body= req.body;
        var data;
        if(body.length){
            data =[];
            var k=0;
            for(var i=0; i<body.length; i++){
                data.push(
                    {
                        id:body['data['+k+'][id]'],
                        product_id:body['data['+i+'][product_id]'],
                        nama:body['data['+k+'][nama]'],
                        harga:body['data['+k+'][harga]'],
                        stok:body['data['+k+'][stok]']
                    }
                );
                k++;
            }
           
        }else{
            data=body;
        }
        db.addVariasi(data)
        .then(function(){
            res.send(200);
        }).catch(function(err){
            res.send(409);
        });
    },
    updateVariasi:function(req,res){
       var body = req.body;
       data = {
            product_id:body.product_id,
            nama:body.nama,
            harga:body.harga,
            stok:body.stok
       }
       db.updateVariasi(data,{id:req.body.id}).then(function(){
           res.send(200);
       }).catch(function(err){
           res.send(409);
       })
    },
    removeVariasi:function(req,res){
        var body=req.body;
        console.log(body.id)
        db.removeVariasi({id:body.id})
        .then(function(){
            res.send(200);
        }).catch(function(err){
            console.log(err)
        })

    },
    getVariasiById:function(req,res){
        db.getVariasiById({id:req.params.id}).then(function(data){
            data = util.setJSONParse(data);
            res.send(data);
        }).catch(function(err){
            console.log(err)
            res.send(409);
        })
    },
    getVariasiByProductId:function(req,res){
        db.getVariasiById({product_id:req.params.id}).then(function(data){
            data = util.setJSONParse(data);
            res.send(data);
        }).catch(function(err){
            console.log(err)
            res.send(409);
        })
    },
    deleteImageByPath:function(req,res){
        fs.unlink(path.join("public", req.body.path), function(err){
            if(err){
                res.status(400).json({message: 'Image not removed, please try again.'});
            }else{
                res.status(200).json({message: 'Image successfully deleted'});
            }
        });
    },
    grosir:function(req,res){
        var body=req.body;
        var data =[];
        if(typeof (body.length)!='undefined'){
            var k=0;
            for(var i=0; i<body.length; i++){
                data.push(
                    {
                        id:body['data['+k+'][id]'],
                        product_id:body['data['+i+'][product_id]'],
                        min:body['data['+k+'][min]'],
                        max:body['data['+k+'][max]'],
                        satuan:body['data['+k+'][hargaSatuan]'],
                        variasi_id:body['data['+k+'][variasi_id]']
                    }
                );
                k++;
            }
        }else{
            data=body;
            delete data.variasi_name;
        }
        db.addHargaGrosir(data)
        .then(function(){
            res.send(200);
        }).catch(function(err){
            res.send(409);
        });
        
    },
    removeGrosir:function(req,res){
        var body= req.body;
        db.removeGrosir({id:body.id})
        .then(function(){
            res.send(200);
        }).catch(function(err){
            res.send(409);
        })

    },
    updateHargaGrosir:function(req,res){
        var body=req.body;
        var id = req.body.id;
        var doc={
            product_id:body.product_id,
            variasi_id:body.variasi_id,
            min:body.min,
            max:body.max,
            satuan:body.satuan,
        }
        db.updateHargaGrosir(doc,{id:id}) 
        .then(function(){
            res.send(200);
        }).catch(function(err){
            console.log(err);
        });
    },
    getHargaGrosir:function(req,res){
        db.getHargaGrosirById(req.params.id).then(function(data){
            data=util.setJSONParse(data);
            res.send(data);
        }).catch(function(err){
            res.send(409);
        });
    },
  
    uploadGambar:function(req,res){
        var body=req.body;
        var data =[];
        var k=0;
        if(body.length){
            for(var i=0; i<body.length; i++){
                data.push(
                    {
                        id:body['data['+k+'][id]'],
                        product_id:body['data['+i+'][product_id]'],
                        gambar:body['data['+k+'][gambar]']
                    }
                );
                k++;
            }
        }else{
            data=req.body
        }
        
        db.uploadGambarProduk(data)
        .then(function(){
            res.send(200);
        }).catch(function(err){
            console.log(err);
        });
    },
    updateProduk:function(req,res){
        var body=req.body;
        var id = req.body.id;
        var doc = body;
        delete doc.id;
        db.updateProduct(doc,{id:id}).then(function(){
            res.send(200);            
        }).catch(function(err){
            res.send(409)
        })
    },
    db:function(req,res){
        
        var users=[];
       users[0]= {
            username:'herris',
            email :'a@a.com',
            fullname:'aa'
        }
        users[1]= {
            username:'herris1',
            email :'b@a.com',
            fullname:'aa'
        }
        users[2]= {
            username:'herris2',
            email :'c@a.com',
            fullname:'aa'
        }
        var user_account=[];
        user_account[0]={
            username:'herris',
            password:'1',
            confirmation:true
        }
        user_account[1]={
            username:'herris1',
            password:'1',
            confirmation:true
        }
        user_account[2]={
            username:'herris2',
            password:'1',
            confirmation:true
        }
        var pembeli;
        var penjual=[];
        pembeli={
            username:'herris',
            gender:true,
            phone:'',
            address:'',
            province:'',
            district:'',
            postal_code:'',
            sub_district:''
        }
        penjual[0]={
            username:'herris1',
            gender:true,
            phone:'',
            address:'',
            province:'',
            district:'',
            postal_code:'',
            sub_district:''
        }
        penjual[1]={
            username:'herris2',
            gender:true,
            phone:'',
            address:'',
            province:'',
            district:'',
            postal_code:'',
            sub_district:'',
            account_number:'624-528-6448',
            bank_name:'BCA',
            bank_branch:'Asia Megamas Medan',
            account_name:'Herris Suhendra'
        }
 
        knex.transaction(function(trx) {
        knex('users').transacting(trx).insert(users)
            .then(function(resp) {
                return knex('user_account').transacting(trx).insert(user_account)
            })
            .then(function(resp) {
                return knex('pembeli').transacting(trx).insert(pembeli)
            })
            .then(function(resp) {
                return knex('penjual').transacting(trx).insert(penjual)
            })
            .then(function(resp){
                return knex('admin_account').transacting(trx).insert({username:'herris',email:'herris@gmail.com',fullname:'Herris Suhendra',password:'123'});
            })
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .then(function(resp) {
            console.log('Transaction complete.');
            res.redirect('/')
        })
        .catch(function(err) {
        console.error(err);
        });
    }   
    
}