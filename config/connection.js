const  MongoClient = require('mongodb').MongoClient
// or as an es module:
// import { MongoClient } from 'mongodb'
const state={
    db:null
}
// Connection URL
module.exports.connect=function(done){


    
const url='mongodb+srv://Adhars:Adhars1998@cluster0.fjkxciz.mongodb.net/'
//const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'walmart';

MongoClient.connect(url,(err,data)=>{
    if(err) return done(err)
    state.db=data.db(dbName)
    done()

})
}
module.exports.get=function(){
    return state.db
}