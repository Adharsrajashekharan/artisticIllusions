var db=require('../config/connection')
var collection=require("../config/collections")
const bcrypt= require('bcrypt')
var objectId=require('mongodb').ObjectId

const { reject } = require('lodash')
const fast2sms=require('fast-two-sms')
const { response } = require('../app')
const collections = require('../config/collections')
const { resolve } = require('promise')
const { ObjectID } = require('bson')
const { Logger } = require('mongodb')
const Razorpay = require('razorpay');


var instance = new Razorpay({
  key_id: 'rzp_test_rzmE7CIvYaE5kq',
  key_secret: 'lM8xUdpxdsTkChstF0HCBkLh',
})
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(collection.USER_COLLECTION)
            userData.Password = await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(
              userData={
                firstname:userData.firstname,
                Email:userData.Email,
                Password:userData.Password,
                Phone:userData.Phone,
                Access:true

              }
            
            
              )
              
              
              
              .then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    doLogin:(userData)=>{
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){

                        console.log(" login sucess");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('login failed') 
                        resolve({status:false})
                    }
                })

            }else{
                console.log('login failed')
                resolve({status:false})

            }
        })
    },
    obj: {
        OTP: 1,
      },
    sendMessage: (Phone) => {
        let randomOTP = Math.floor(Math.random() * 10000);
        const options = {
          authorization:'jGMpbHuHOq35AFV26oha2gX3IoLfW2WaS8urwhDQkr1ihpkhKOsMrwAYDzES',
          sender_id: "EXPOSTORE",
          message: `Your OTP e-commerce is ${randomOTP}`,
          numbers: [Phone],
        };
    
        fast2sms
          .sendMessage(options)
          .then((response) => {
            console.log("OTP send successfully");
          })
          .catch((err) => {
            console.log("Some error happened");
          });
          return randomOTP;
    },
   doOtp: (req, res) => {
        const mobile = req.session.mobile;
        const enteredOTP = req.body.OTP;
        const sentOTP = otpHelper.obj.OTP;
        console.log(enteredOTP, sentOTP);
        if (enteredOTP == sentOTP) {
          req.session.loggedIn = true;
          req.session.user = req.session.tempUser;
          req.session.tempUser = null;
          res.redirect("/");
        } else {
          const errMsg = "Enter a valid OTP";
          res.render("users/loginOTP", { mobile, errMsg });
        }
      },
      addToCart:(proid,userId)=>{
        let proObj={
          item:objectId(proid),
          quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                   let proExist=userCart.products.findIndex(product=>product.item==proid)
                   console.log(proExist)
                   if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proid)},
                       {
                         $inc:{'products.$.quantity':1}
                       }
                    ).then(()=>{
                        resolve()
                    })

                   }else{
                  
                  db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                 {
                  
                    $push:{products:proObj}
                  
                 }
                 ).then((response)=>{
                  resolve(response)
                 })
                }
            }else{
              let cartObj={
                user:objectId(userId),
                products:[proObj]
              }
              db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve(response)
              })
            }

        })
      },

      



      





      getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
                let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                  {
                     $match:{user:objectId(userId)}
                },
                {
                  $unwind:'$products'

                },
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                  }
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                  }
                },
                {
                  $project:{
                    item:1,quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                  }
                }
         
              ]).toArray()
              console.log(cartItems)
              resolve(cartItems)

        })
        
      },
      getCartCount:(userId)=>{
        let count=0
        return new Promise(async(resolve,reject)=>{
          let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
          if(cart){
              count=cart.products.length
          }
          resolve(count)
        })
      },
         changeProductQuantity:(details)=>{
      //    console.log("dghgfhg");
       //   console.log(details);
          details.count=parseInt(details.count)
          details.quantity=parseInt(details.quantity)
           // console.log("hjvjhvjjgjggjhj")
          return new Promise((resolve,reject)=>{
          if(details.count==-1 && details.quantity==1){
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
               {
                 $pull:{products:{item:objectId(details.product)}}
               }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
          }else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
              $inc:{'products.$.quantity':details.count}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
          }
          })
         },

         
        //delete product quantity
         deleteProductQuantity:(details)=>{
         
              return new Promise((resolve,reject)=>{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                  {
                    $pull:{products:{item:objectId(details.product)}}
                  }
                ).then((response)=>{
                    resolve(response)
                })
            })
              },    
              emptyCart:(details)=>{
                console.log(details)
                return new Promise((resolve,reject)=>{
                  db.get().collection(collection.CART_COLLECTION)
                  .deleteOne({_id:objectId(details.cart)}
                    //  {
                    //    $pull:{products:{item:objectId(details.product)}}
                    //  }
                  ).then((response)=>{
                      resolve(response)
                  })
              })
                },                
        


         getTotalAmount:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                  {
                      $match:{user:objectId(userId)}
                  },
                  {
                      $unwind:'$products'
                  },
                  {
                      $project:{
                          item:'$products.item',
                          quantity:'$products.quantity'
                      }
                  },
                  {
                      $lookup:{
                          from:collection.PRODUCT_COLLECTION,
                          localField:'item',
                          foreignField:'_id',
                          as:'product'
                      }
                  },
                  {
                      $project:{
     item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                      }
                  },
                  {
                      $group:{
                          _id:null,
                          total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
                      }
                  }
  
              ]).toArray() 
              try{
                console.log(total[0].total)
                resolve(total[0].total)
              }catch(err){
                resolve(0)
              }  
              
          })
      },

      placeOrder:(order,products,total)=>{
        return new Promise((resolve, reject) => {
          console.log(order,products,total);
          let status=order.payment==='COD'?'placed':'pending'
          let orderObj={
            deliveryDetails:{
              mobile:order.mobile,
              adress:order.adress,
              pincode:order.pincode
              
            },
            userId:objectId(order.userId),
            paymentMethod:order.payment,
            products:products,
            totalAmount:total,
            status:status,
            date:new Date()
          }
          db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
            resolve(response.insertedId)
          })
        })
      },
        getCartProductList:(userId)=>{
          return new Promise(async (resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);
            resolve(cart.products)
            

          })
        },
      getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          console.log(userId);
          let orders =await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
          console.log(orders);
          resolve(orders)
        })
      },
      getOrderProducts:(orderId)=>{
        return new Promise(async(resolve, reject) => {
          let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match:{_id:objectId(orderId)}
              },
              {
                $unwind:'$products'
              },
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                  }
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                  }
                },
                {
                  $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                  }
                }

          ]).toArray()
          console.log(orderItems);
          resolve(orderItems)
        })
      },
      generateRazorpay:(orderId,total)=>{
        console.log(orderId);
        return new Promise((resolve, reject) => {
          console.log(typeof total)
          console.log("jhfjhfhfhgfhghgf")
           var options={
            amount: total*100,
            currency:"INR",
            receipt:""+orderId
           };
           instance.orders.create(options,function(err,order){
            if(err){
              console.log(err);
            }else{
              console.log("New order:",order);
              resolve(order)
            }
            
           })
          // instance.orders.create({
          //   amount: 50000,
          //   currency: "INR",
          //   receipt: "receipt#1",
          //   notes: {
          //     key1: "value3",
          //     key2: "value2"
          //   }
          // })
        })
      },
      verifyPayment:(details)=>{
        return new Promise((resolve, reject) => {
          const crypto = require("crypto");
          let hmac = crypto.createHmac('sha256', 'lM8xUdpxdsTkChstF0HCBkLh');
          hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
           hmac=hmac.digest('hex')
           if(hmac==details['payment[razorpay_signature]']){


            resolve()
           }else{
            reject()
           }
          
          
        })
      

      },
changePaymentStatus:(orderId)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
   {
    $set:{
      status:'placed'
    }
   }
    ).then(()=>{
      resolve()
    })
  })
},

// wishlist
addToWishlist:(proid,userId)=>{
  let proObj={
    item:objectId(proid),
    quantity:1
  }
  return new Promise(async(resolve,reject)=>{
      let userCart=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
      if(userCart){
             let proExist=userCart.products.findIndex(product=>product.item==proid)
             console.log(proExist)
             if(proExist!=-1){
              db.get().collection(collection.WISHLIST_COLLECTION)
              .updateOne({user:objectId(userId),'products.item':objectId(proid)},
                 {
                   $inc:{'products.$.quantity':1}
                 }
              ).then(()=>{
                  resolve()
              })

             }else{
            
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
           {
            
              $push:{products:proObj}
            
           }
           ).then((response)=>{
            resolve(response)
           })
          }
      }else{
        let cartObj={
          user:objectId(userId),
          products:[proObj]
        }
        db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then((response)=>{
          resolve(response)
        })
      }

  })
},
getWishlistProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
                let cartItems=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                  {
                     $match:{user:objectId(userId)}
                },
                {
                  $unwind:'$products'

                },
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                  }
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                  }
                },
                {
                  $project:{
                    item:1,quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                  }
                }
         
              ]).toArray()
              console.log(cartItems)
              resolve(cartItems)

        })
        
      },

      getWishCount:(userId)=>{
        let count=0
        return new Promise(async(resolve,reject)=>{
          let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
          if(wishlist){
              count=wishlist.products.length
          }
          resolve(count)
        })
      },
      deleteWishQuantity:(details)=>{
         
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.WISHLIST_COLLECTION)
          .updateOne({_id:objectId(details.wishlist)},
            {
              $pull:{products:{item:objectId(details.product)}}
            }
          ).then((response)=>{
              resolve(response)
          })
      })
        }
        
    }
