

global.db={}
global.repoDb={}




global.mongoose = require('mongoose')
global.mongoosePaginate = require('mongoose-paginate-v2')
global.mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
mongoosePaginate.paginate.options = { 
    lean:  true,
    limit: 10
}


mongoose.Types.ObjectId.prototype.toShortId=function(){
	return this.toHexString().toShortId()
}

global.ObjectId = mongoose.Types.ObjectId

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

global.dbconn = mongoose.createConnection(config.mongodb.address,{ useNewUrlParser: true ,useUnifiedTopology:true, autoIndex: true  })
var adminConn= mongoose.createConnection(`mongodb://localhost:27017/admin`,{ useNewUrlParser: true ,useUnifiedTopology:true, autoIndex: true  })

adminConn.on('connected', ()=>{
		//eventLog(`adminConn connected.`.cyan)
    adminConn.db.command({ setParameter : 1, "internalQueryExecMaxBlockingSortBytes" : 335544320 } ,(err,result1)=>{
    	if(!err){
    		adminConn.close(()=>{
    			//eventLog(`adminConn disconnected.`.cyan.bold)
    		})
    	}else{
    		errorLog(`mongoose admin db error:`,err)
    	}
    })
}) 


global.sendToTrash=(conn,collectionName,member,filter,cb)=>{
    conn.model(collectionName).findOne(filter,(err,doc)=>{
        if(!err){
            function silelim(cb1){
                conn.model('recycle').insertMany([{collectionName:collectionName,documentId:doc._id,document:doc,deletedBy:member.username}],(err)=>{
                    if(!err){
                        conn.model(collectionName).deleteOne(filter,(err,doc)=>{
                            cb1(err,doc)
                        })
                    }else{
                        cb1(err)
                    }
                })
            }

            if(conn.model(collectionName).relations){
                var keys=Object.keys(conn.model(collectionName).relations)
                var index=0

                function kontrolEt(cb2){
                    if(index>=keys.length){
                        cb2(null)
                    }else{
                        var relationFilter={}
                        var k=keys[index]

                        relationFilter[conn.model(collectionName).relations[k]]=doc._id
                        conn.model(k).countDocuments(relationFilter,(err,c)=>{
                            if(!err){
                                if(c>0){
                                    cb2({name:'RELATION_ERROR',message:"Bu kayit '" + k + "' tablosuna baglidir. Silemezsiniz!"})

                                }else{
                                    index++
                                    setTimeout(kontrolEt,0,cb2)
                                }
                            }else{
                                cb2(err)
                            }
                        })
                    }
                }

                kontrolEt((err)=>{
                    if(!err){
                        silelim(cb)
                    }else{

                        cb(err)
                    }
                })
            }else{
                silelim(cb)
            }
            
        }else{
            cb(err)
        }
    })
}


global.dberr=(err,cb)=>{
    if(!err){
        return true
    }else{
        cb({success: false, error: {code: err.name, message: err.message}})
        return false
    }
}

global.dbnull=(doc,cb)=>{
    if(doc!=null){
        return true
    }else{
        cb({success: false, error: {code: 'RECORD_NOT_FOUND', message: 'Kayit bulunamadi'}})
        return false
    }
}


mongoose.set('debug', false)

process.on('SIGINT', ()=>{ 
  dbconn.close(()=>{ 
    eventLog('Mongoose default connection disconnected through app termination') 
    process.exit(0)
  })
})


global.epValidateSync=(doc)=>{
    var err = doc.validateSync()
    if(err){
        var keys=Object.keys(err.errors)
        var returnError={name:'VALIDATION_ERROR',message:''}

        Object.keys(err.errors).forEach((key,index)=>{

        	returnError.message +=`${(returnError.message!=''?' | ':'')}Hata ${(index+1)}: ${err.errors[key].message}`
        })
        
        
        return returnError
    }else{
        return err
    }
}

var tryConnectionCount=0

module.exports=(cb)=>{

    dbconn.on('connected', function () { 
        eventLog('Mongoose default connection open to ' + config.mongodb.address)
        
        moduleLoader(path.join(__dirname, '../db'),'.collection.js','db yukleme', (err,holder)=>{
            if(err){
                eventLog('ERROR db loading.')
                cb(err)
            }else{
                db=holder
                cb(null)
            }
        })
        
    }) 

    dbconn.on('error', (err)=>{  
        if(tryConnectionCount<5){
            setTimeout(()=>{
                tryConnectionCount++
                global.dbconn = mongoose.createConnection(config.mongodb.address,{ useNewUrlParser: true ,useUnifiedTopology:true, autoIndex: true  })
            },3000)
        }else{
            eventLog('Mongoose default connection error: ' + err)
            cb(err)
        }
    }) 

    dbconn.on('disconnected', (err)=>{    
        if(tryConnectionCount<5){
            setTimeout(()=>{
                tryConnectionCount++
                global.dbconn = mongoose.createConnection(config.mongodb.address,{ useNewUrlParser: true ,useUnifiedTopology:true, autoIndex: true  })
            },3000)
        }else{
            eventLog('Mongoose default connection disconnected') 
            cb(err)
        }
      

    })
}
