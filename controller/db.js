var model=require('.././model/model');
var knexfile=require('../knexfile');
var common = require('../routes/common');
var knex=knexfile.knex;
var util={
    setJSONParse : function(data){
        return JSON.parse(JSON.stringify(data));
    },
     singleSelect : function(table,where,select){
        return knex(table).where(where).select(select);
    },
     singleInsert : function(table,doc){
        return knex.transaction(function(trx) {
            knex(table).transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },
    singleUpdate : function(table,doc,where){
        return knex.transaction(function(trx) {
            knex(table).transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },

};
var admin={
    getAllUsers:function(){
        return knex('users')
        .join(
            'user_account',
            'users.username',
            'user_account.username'
        )
        .select(
            'users.id',
            'users.username',
            'users.email',
            'users.fullname',
            'user_account.id as uid',
            'user_account.confirmation',
            'user_account.confirm_token'
        );
    },
    singleInsert : function(table,doc){
        return knex.transaction(function(trx) {
            knex(table).transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },
    
    getUnverifiedUsers : function(){
     return knex('users')
        .join(
            'user_account',
            'users.username',
            'user_account.username'
        )
        .where('confirmation',null)
        .select(
            'users.id',
            'users.username',
            'users.email',
            'users.fullname',
            'user_account.id as uid',
            'user_account.confirmation',
            'user_account.confirm_token'
        );
    },
    
    getActiveUsers : function(){
        return knex('users')
        .join(
            'user_account',
            'users.username',
            'user_account.username'
        )
        .where('confirmation',true)
        .select(
            'users.id',
            'users.username',
            'users.email',
            'users.fullname',
            'user_account.id as uid',
            'user_account.confirmation',
            'user_account.confirm_token'
        );
    },
    getCancelUsers : function(){
          return knex('users')
        .join(
            'user_account',
            'users.username',
            'user_account.username'
        )
        .where('confirmation',false)
        .select(
            'users.id',
            'users.username',
            'users.email',
            'users.fullname',
            'user_account.id as uid',
            'user_account.confirmation',
            'user_account.confirm_token'
        );
    },
    singleSelect : function(table,where,select){
        return knex(table).where(where).select(select);
    },
    getUser : function(id){
        return knex('users')
        .join(
            'user_account',
            'users.username',
            'user_account.username'
        )
        .select(
            'users.id',
            'users.username',
            'users.email',
            'users.fullname',
            'user_account.confirmation',
            'user_account.confirm_token'
        ).where('users.id',id);
    },
    setJSONParse : function(data){
        return JSON.parse(JSON.stringify(data));
    },
    singleInsert : function(table,doc){
        return knex.transaction(function(trx) {
            knex(table).transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);});
    },
    singleUpdate : function(table,doc,where){
     return knex.transaction(function(trx) {
        knex(table).transacting(trx).update(doc).where(where)
        .then(trx.commit)
        .catch(trx.rollback);});
    },
    authLogin:function(username,password){
       return model.admin_account.query(function(q){
        q.where('username',username).andWhere('password',password);
       }).fetch();
    }
}
var penjual={   


    //#region users
        registerUser:function(doc){
            return knex.transaction(function(trx) {
                return knex('users')
                .transacting(trx)
                .insert({
                    id:doc.id,
                    username:doc.username,
                    email:doc.email,
                    fullname:doc.fullname
                })
                .then(function(){
                        return knex('user_account')
                        .transacting(trx)
                        .insert(
                            {
                                id:common.generateId(),
                                username:doc.username,
                                password:doc.password,
                                confirm_token:'',
                                confirmation:doc.confirmation
                        }
                        ).then(function(){
                            return knex('penjual')
                            .transacting(trx)
                            .insert({
                                            id:common.generateId(),
                                            username:doc.username,
                                            gender:doc.gender,
                                            photo:doc.photo,
                                            province:doc.province,
                                            district:doc.district,
                                            postal_code:doc.postal_code,
                                            sub_district:doc.sub_district,
                                            address:doc.address,
                                            phone:doc.phone,
                                            company_name:doc.company_name,
                                            company_desc:doc.company_desc,
                                            // account_number:doc.account_number,
                                            // bank_name:doc.bank_name,
                                            // bank_branch:doc.bank_branch,
                                            // account_name:doc.account_name
                                })
                            .then(function(){
                                return knex('bank')
                                .transacting(trx)
                                .insert({
                                    id:common.generateId(),
                                    username:doc.username
                                }).then(trx.commit);
                            })
                        })
                    
                })
                .catch(trx.rollback);
            })
        
            
        },
        meProfile:function(username){
            return knex('users')
            .join('user_account', 'users.username', '=', 'user_account.username')
            .join('penjual', 'users.username', '=', 'penjual.username')
            .select('*')
            .where('users.username','=',username);
            
        },
        editProfile:function(username,users,penjual,bank){
            return knex.transaction(function(trx) {
                return knex('users')
                .transacting(trx)
                .update(users).where({username:username})
                .then(function(){
                        return knex('penjual')
                        .transacting(trx).update(penjual)
                        .where({username:username})
                        .then(function(){
                            var cek =false;
                           return knex('bank')
                            .transacting(trx)
                            .del()
                            .then(function(){
                                return knex('bank')
                                .transacting(trx)
                                .insert(bank)
                                .then(trx.commit)
                            })
                            // .where({username:username})
                            // .insert(bank)
                            
                        })
                })
                .catch(trx.rollback);
            })
        },
    //#endregion

    getProductsAll:function(user){
        return knex('products')
        // .join('variasi','products.id','variasi.product_id')
        // .select('products.*','variasi.id as variasi_id','variasi.nama as variasi_name','variasi.harga','variasi.stok')
        .select('*').where('product_by',user).orderBy('products.created_at');
    },
    getProdukById:function(where){
        return knex('products').select('*').where(where).first();
    },
    setAsAnImage:function(table,doc,where){
        return knex.transaction(function(trx) {
            knex(table).transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },
    getAllDemands:function(){
         return knex('permintaan').select('*');
    },
    getProductById:function(id){
        return knex('products').where(id).select('*');
    },
    //#region marked
   
    

    //#endregion
    verifikasiPassword :function(username,passwordBaru,passwordSekarang){
        return knex.transaction(function(trx) {
            return knex('user_account')
            .transacting(trx)
            .where({username:username,password:passwordSekarang})
            .update({password:passwordBaru})
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    updatePassword :function(username,passwordBaru,passwordSekarang){
        return knex.transaction(function(trx) {
            return knex('user_account')
            .transacting(trx)
            .where({username:username,password:passwordSekarang})
            .update({password:passwordBaru})
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    addDiscount:function(doc){
        return knex.transaction(function(trx) {
            knex('promosi')
            .transacting(trx)
            .insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },
    updateProduct:function(doc,where){
        return knex.transaction(function(trx) {
            knex('products')
            .transacting(trx)
            .update(doc)
            .where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        });
    },
    updateStatusOrder:function(doc){
        return knex.transaction(function(trx) {
            knex('order_details').transacting(trx).update(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    productInsert:function(doc){
         return knex.transaction(function(trx) {
            knex('products').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    editProductById:function(doc,where){
         return knex.transaction(function(trx) {
            knex('products').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    addVariasi:function(doc){
        return knex.transaction(function(trx) {
            knex('variasi').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    updateVariasi:function(doc,where){
        return knex.transaction(function(trx) {
            knex('variasi').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })
    },
    removeVariasi:function(where){
        return knex('variasi').where(where).del()
    },
    getVariasiById:function(id){
        return knex('variasi').where(id).select('*');
    },
    
    addHargaGrosir:function(doc){
        return knex.transaction(function(trx) {
            knex('grosir').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    updateHargaGrosir:function(doc,where){
        return knex.transaction(function(trx) {
            knex('grosir').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    uploadGambarProduk:function(doc){
        return knex.transaction(function(trx) {
            knex('gambar_produk').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    deleteGambarProduk:function(where){
        return knex('gambar_produk').where(where).del();
    },
    getGambarProduk:function(where){
        return knex('gambar_produk').where(where).select('*');
    },
    editProduk:function(doc,where){
        return knex.transaction(function(trx) {
            knex('products').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    editVariasi:function(doc){
        return knex.transaction(function(trx) {
            knex('variasi').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    editGrosir:function(doc){
        return knex.transaction(function(trx) {
            knex('grosir').transacting(trx)
            .update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })  
    },
    removeGrosir:function(where){
        return knex('grosir').where(where).del();
    },
    getHargaGrosirById:function(id){
        return knex('grosir').join('variasi','grosir.variasi_id','variasi.id')
        .select('grosir.*','variasi.nama as variasi_name').where('grosir.product_id','=',id);
    },
    getOrderList:function(){
        return knex('orders')
        .join('order_details','orders.id',
        'order_details.order_id')
        .select('*');  
    },
    getNewOrdersId:function(where){
        return knex('orders')
        .join('order_details','orders.id','order_details.order_id')
        .where(where)
        .select('*')  
    },
    getNewOrders:function(where){
        return knex('orders')
        .where(where)
        .select('*');  
    },
    getOrderDetails:function(where){
        return knex('order_details').where(where)
        .select('*');
    },
    getListKatalog:function(username){
        return knex('users')
        .join('katalog', 'users.username', '=', 'katalog.upload_by')
         .join('penjual','users.username', '=', 'penjual.username')
         .select('users.username','users.email',
         'users.fullname',
         'katalog.id as katalogId','katalog.title','katalog.upload_by'
         ,'katalog.file'
         ,'katalog.created_at',
         'katalog.desc','penjual.*')
         .where('users.username','=',username)
     },
    deleteKatalogById:function(id){
        return knex.transaction(function(trx) {
            return knex('katalog').transacting(trx).del().where({id:id})
            .then(trx.commit).catch(trx.rollback);
        })
    },
    getOrderDetailsTotal:function(where){
        return knex('order_details')
        .where(where)
        .columns([
            knex.raw('sum(qty * price) as total')
        ]).first();
    },
    prosesPengemasan:function(doc,where){
        return knex.transaction(function(trx) {
            knex('order_details').transacting(trx).update(doc).where(where)
            .then(trx.commit)
            .catch(trx.rollback);
        })   
    },
    
    addBankPenjual:function(doc){
        return knex.transaction(function(trx) {
            knex('bank').transacting(trx).insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        }) 
    }
    
    
}
var pembeli={  

    //#region users
        registerUser:function(doc){
            var _doc = {
                id:doc.id,
                username:doc.username,
                email : doc.email,
                fullname:doc.fullname,
            }
            var ua = {
                id:common.generateId(),
                username:doc.username,
                password:doc.password
            }
            var pembeli = {
                id:common.generateId(),
                username:doc.username,
                gender:doc.gender,
                birth:doc.birth,
                phone:doc.phone,
                photo:doc.phone,
                address:doc.address,
                province:doc.province,
                district:doc.district,
                postal_code:doc.postal_code,
                sub_district:doc.subDistrict
            }
            return knex.transaction(function(trx) {
                return knex('users')
                .transacting(trx)
                .insert(_doc)
                .then(function(){
                    return knex('user_account').transacting(trx).insert(ua)
                    .then(function(){
                        return knex('pembeli').transacting(trx).insert(pembeli)
                        .then(trx.commit)
                    })
                })
                .catch(trx.rollback);
            })
        
        },
        registerUserByFB:function(body,id){
            body=util.setJSONParse(body);
            var users={
                id:common.generateId(),
                username:body.username,
                email:body.email,
                fullname:body.fullname
            }
            var fb ={
                id:common.generateId(),
                facebook_id:id,
                username:body.username
            }
            var pembeli={
                 id:common.generateId(),
                 username:body.username,
                 gender:body.gender,
                 birth:body.birth,
                 phone:body.phone,
                 photo:body.photo,
                 province:body.province,
                 district:body.district,
                 sub_district:body.sub_district,
                 address:body.address,
                 postal_code:body.postal_code,
            }
            return knex.transaction(function(trx) {
                return knex('users')
                .transacting(trx)
                .insert(users)
                .then(function(){
                    return knex('facebook_account')
                    .transacting(trx)
                    .insert(fb)
                    .then(function(){
                        return knex('pembeli')
                        .transacting(trx)
                        .insert(pembeli)
                        .then(trx.commit)
                    })
                })
                .catch(trx.rollback);
            })

        },
        getProfilePembeliById:function(username){
            return knex('pembeli as a')
            .join('users as b','a.username','b.username')
            .where({'a.username':username})
            .select('*');
        },
        getProfileAllMe:function(username){
            return knex('users').where('users.username','=',username)
            .join('pembeli','users.username','pembeli.username').select('*');
        },
        checkUserExist:function(username){
            return knex('users').count().where({username:username});
        },
        checkEmailExist:function(email){
            return knex('users').count().where({email:email});
        },
        meProfile:function(username){
            return knex('users')
            .join('pembeli','users.username','pembeli.username')
            .select('pembeli.*','users.fullname','users.email')
            .where('pembeli.username','=',username.username);
        },
        meFacebookProfile:function(username){
            return knex('users')
            .join('facebook_account','facebook_account.username','users.username')
            .join('pembeli','facebook_account.username','pembeli.username')
            .select('pembeli.*','users.fullname','users.email')
            .where('users.username','=',username);
        },
        
        updateProfile :function(doc){
            var username=doc.username;
            var _doc = {
                email : doc.email,
                fullname:doc.fullname,
            }
            
            var pembeli = {
                gender:doc.gender,
                birth:doc.birth,
                phone:doc.phone,
                photo:doc.photo,
                address:doc.address,
                province:doc.province,
                city:doc.city,
                district:doc.district,
                postal_code:doc.postal_code,
                sub_district:doc.sub_district
            }
    
            return knex.transaction(function(trx) {
                return knex('users')
                .transacting(trx)
                .update(_doc).where({username:username})
                .then(function(){
                        return knex('pembeli').transacting(trx).update(pembeli)
                        .where({username:username})
                        .then(trx.commit)
                })
                 .catch(trx.rollback);
            })
        },
        verifikasiPassword :function(username,password){
            return knex('user_account')
            .select('password')
            .where({username:username});
        },
        updatePassword :function(username,passwordBaru,passwordSekarang){
            return knex.transaction(function(trx) {
                return knex('user_account')
                .transacting(trx)
                .where({username:username,password:passwordSekarang})
                .update({password:passwordBaru})
                .then(trx.commit)
                .catch(trx.rollback);
            })
        },
        getProfilePenjual:function(where){
            return knex('penjual').where(where).select('*');
        },
 
    //#endregion
    
    //#region orders
        updateOrder:function(id,status,bank){
            return knex.transaction(function(trx) {
                knex('orders').transacting(trx)
                .update({bank_account:bank,payment_status:status})
                .where({id:id})
                .then(trx.commit)
                .catch(trx.rollback);
            });  
        },
        addOrder:function(doc,det){
            return knex.transaction(function(trx) {
                knex('orders').transacting(trx).insert(doc)
                .then(function(){
                    return knex('order_details')
                    .transacting(trx).insert(det)
                    .then(trx.commit)
                })
                .catch(trx.rollback);
            });
        },
        addOrderDetails:function(doc){
            return knex.transaction(function(trx) {
                knex('order_details').transacting(trx).insert(doc)
                .then(trx.commit)
                .catch(trx.rollback);});
        },
      
        getOrderById:function(id){
            return knex('orders').where({id:id}).select('*');
        },
        myorders:function(buyer){
            return knex('orders')
            .where({buyer:buyer}).select('*');
        },
        myOrderDetails:function(where){
            return knex('order_details').where(where).select('*');
        },
        
    //#endregion
    
    //#region 
        getProductImageById:function(id){
            return knex('products').select('gambar').where({id:id});
        },
    //#endregion
        
    //#region company
        getAllCompany:function(){
            return knex('users')
            .join('penjual','users.username','penjual.username')
            .select('penjual.*','users.fullname','users.email');
        },
        getListKatalogByusers:function(username){
            return knex('users')
            .join('katalog', 'users.username', '=', 'katalog.upload_by')
             .join('penjual','users.username', '=', 'penjual.username')
             .select('users.username','users.email',
             'users.fullname',
             'katalog.id as katalogId','katalog.title','katalog.upload_by'
             ,'katalog.file'
             ,'katalog.created_at',
             'katalog.desc','penjual.*')
             .where('users.username','=',username)
        },
        //#endregion

    //#region timeline
    addPost:function(doc){
        return knex.transaction(function(trx) {
            knex('post').transacting(trx)
            .insert(doc)
            .then(trx.commit)
            .catch(trx.rollback);
        }); 
    },
    //#endregion
    getAllProvinces:function(){
        return knex('province').select('*');  
    },
    getProvinceById:function(id){
        return knex('province').select('*').where({id:id});  
    },
    getDistrictByProvinceId:function(province_id){
        return knex('district').select('*').where({province_id:province_id});
    },
    getDistrictById:function (id) {  
        return knex('district').select('*').where({id:id});
    },
    getSubDistrictByDistrictId:function(district_id){
        return knex('sub_district')
        .select('*').where({district_id:district_id});
    },
    getSubDistrictById:function(id){
        return knex('sub_district')
        .select('*').where({id:id});
    },
    getAllProducts:function(){
       return knex('products').select('*');   
    },
    getPromosi:function(where){
        return knex('promosi').where(where).select('*');
    },
    getProductById:function(id){
        return knex('products').select('*').where({id:id});
    },
    getProductsByCategory2:function(cat,where){
        if(cat=='UKM'){
            return knex('users').join('penjual','users.username','penjual.username')
            .where('penjual.company_name','like','%'+where+'%').select('*');
        }
        else if(cat=='Produk'){
            return knex('products').where('nama','like','%'+where+'%')
            .select('*');
        }
    },
   
    getProductByUser:function(where){
        return knex('products as a')
        .join('penjual as b','a.product_by','b.username')
        .join('users as c','b.username','c.username')
        .select('a.*','b.*','c.*','a.id as product_id').where('b.username','=',where);
    },  
    getHargaGrosirByProductId:function(id){
        return knex('grosir').select('*').where({product_id:id}).orderBy('min');
    },
    getHargaGrosirByVariasiId:function(id){
        return knex('grosir').select('*').where({variasi_id:id});
    },
    getMaxHargaGrosir:function(id){
        return knex('grosir').max('satuan as max').where({product_id:id});
    },
    getMinHargaGrosir:function(id){
        return knex('grosir').min('satuan as min').where({product_id:id});
    },
    getProductsByCategory:function(category){
        return knex('products').where(category).select('*');
    },
    getVariasiHargaByProductId:function(id){
        return knex('variasi').where({product_id:id}).select('*');
    },
    getVariasiHarga:function(id){
        return knex('variasi').where(id).select('harga');
    },
    getVariasiNameById:function(id){
        return knex('variasi').where(id).select('nama');
    },
   
    
    
    getPromosi:function(where){
        return knex('promosi').where(where).select('*');
    },
    getStatusPembayaran:function(id){
        return knex('orders').where({id:id}).select('*');
    },
    
    getPromosiByKode:function(kode){
        return knex('promosi').where({kode_promosi:kode}).select('*');
    }
    
 

   

}
var api ={
    admin:admin,
    penjual:penjual,
    util:util,
    pembeli:pembeli

}

module.exports=api;