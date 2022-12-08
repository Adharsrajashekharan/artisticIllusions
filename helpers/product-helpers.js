var db=require('../config/connection')
var collection=require('../config/collections')
const { reject } = require('lodash')
const { response } = require('../app')
const { resolve } = require('promise')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:(pro,callback)=>{
        let Discount = pro.price*((100-pro.ProductOffer)/100)
    const product ={
      name : pro.name ,
      category : pro.category,
      price : pro.price,
      ProductOffer : pro.ProductOffer,
      DiscountPrice :  Math.round(Discount),
      Stocks : parseInt(pro.Stocks) ,
      description : pro.description
    }
        console.log(product)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(product._id)
            //callback(data.insertedId)
    })
},
getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
    })
},

getAntiqueProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Antique"}).toArray()
        resolve(products)
    })
},
getFestiveProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Festive"}).toArray()
        resolve(products)
    })
},
getLightsProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Lights"}).toArray()
        resolve(products)
    })
},
//user -profile
getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
        resolve(users)
    })
},
getUserDetails:(proid)=>{
    
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(proid)}).then((user)=>{
            console.log(user);
            resolve(user)
        })
    })
},
updateUser:(proid,proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(proid)},{
            $set:{
                firstname:proDetails.firstname,
                lastname:proDetails.lastname,
                Email:proDetails.Email,
                Phone:proDetails.Phone,
                gender:proDetails.gender,
                birthday:proDetails.birthday,

                //price:proDetails.price,
                //category:proDetails.category
            }
        
        
        }).then((response)=>{
            resolve()
        })

    })
},





deleteProduct:(proid)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proid)}).then((response)=>{
            console.log();
            resolve(response)
        })
    })
},





getProductDetails:(proid)=>{
    
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proid)}).then((product)=>{
            console.log(product);
            resolve(product)
        })
    })
},
updateProduct:(proid,proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proid)},{
            $set:{
                name:proDetails.name,
                description:proDetails.description,
                price:proDetails.price,
                category:proDetails.category
            }
        
        
        }).then((response)=>{
            resolve()
        })

    })
},

getSingleProducts:(proId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
            resolve(product);
        })
    })
},
blockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
               Access:false 
            }
        }).then((response)=>{
            resolve()
        })
    })
},
unBlockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                Access:true
            }
        }).then((response)=>{
            resolve()
        })
    })
},

//category 


getCategory:()=>{
    return new Promise(async(resolve,reject)=>{
        let categories = await db.get().collection(collection.CATEGORY_COLLECTION)
        .find().toArray()
        resolve(categories)
    })
},

addCategory:(categoryData)=>{
    return new Promise(async(resolve,reject)=>{
         db.get().collection(collection.CATEGORY_COLLECTION)
        .insertOne(
            categoryData={
                Category:categoryData.Category,
                Description:categoryData.Description
            }
        ).then((data)=>{
            categoryData._id=data.insertedId
            resolve(categoryData)
        })
    })
},

deleteCategory:(catId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION)
        .deleteOne({_id:objectId(catId)}).then((response)=>{
            resolve(response)
        })
    })
},

getCategoryDetails:(catId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION)
        .findOne({_id:objectId(catId)}).then((category)=>{
            resolve(category)
        })
    })
},

updateCategory:(catId,catDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION)
        .updateOne({_id:objectId(catId)},{
            $set:{
                Category:catDetails.Category,
                Description:catDetails.Description
            }
        }).then((response)=>{
            resolve()
        })
    })
},

//coupon

addCoupon:(coupon,callback)=>{
    console.log(coupon)
    db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((data)=>{
        callback(data.insertedId)
})
},
getCoupon:(couponDetails)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).findOne({name:couponDetails.coupon})
        .then((getCoupon)=>{
            resolve(getCoupon)
    })
    })
},
// getCoupon:()=>{
//     return new Promise((resolve,reject)=>{
//    let couponDetails=   db.get().collection(collection.COUPON_COLLECTION).findOne({name:couponDetails.coupon})
//         .then((couponDetails)=>{
//             resolve(couponDetails)
//     })
//     })
// },






getAllcoupons:()=>{
    return new Promise(async(resolve,reject)=>{
        
        let coupons = await db.get().collection(collection.COUPON_COLLECTION)
        .find().toArray()
        resolve(coupons)
    })
},

deleteCoupon:(catId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION)
        .deleteOne({_id:objectId(catId)}).then((response)=>{
            resolve(response)
        })
    })
},








getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(userId);
      let orders =await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      console.log(orders);
      resolve(orders)
    })
  },

  cancelOrder:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                status:"cancelled" 
            }
        }).then((response)=>{
            resolve()
        })
    })
},
placeOrder:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                status:"placed"
            }
        }).then((response)=>{
            resolve()
        })
    })
},

getAllOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
    let totalorders=await db.get().collection(collection.ORDER_COLLECTION)
        .aggregate([
            {
                $group:{_id:"",count:{$sum:1}}
            }
        ]).toArray()
           
            resolve(totalorders[0].count)
            console.log(totalorders[0].count);
        })
    },
    getTotalAmount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalAmount =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"placed"}
                },
                // {
                //     $project:{_id:0,status:1,totalAmount:1}
                // },
                {
                    $group:{_id:"status",total:{$sum:"$totalAmount"}}
                }
            ]).toArray()
            console.log(totalAmount)
            resolve(totalAmount[0].total)
           
        })
    },
}











