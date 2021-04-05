
var request=require('request');
var htmlToText = require('html-to-text');
var emailvalidator = require("email-validator");
var bcrypt = require('bcrypt-nodejs');
var url  = require('url');
require('colors');
global.os=require('os');
global.uuid=require('uuid');
global.atob=require('atob')
global.btoa=require('btoa')
global.uuid=require('uuid')

Date.prototype.yyyymmdd = function () {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString(); 
	var dd = this.getDate().toString();
	var HH = this.getHours().toString();
	var min = this.getMinutes().toString();
	var sec = this.getSeconds().toString();
	return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]); 
};

Date.prototype.yyyymmddhhmmss = function () {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	var HH = this.getHours().toString();
	var min = this.getMinutes().toString();
	var sec = this.getSeconds().toString();
	return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]) + ' ' + (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0]); 
};

Date.prototype.hhmmss = function () {

	var HH = this.getHours().toString();
	var min = this.getMinutes().toString();
	var sec = this.getSeconds().toString();
	return (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0]); 
};

Date.prototype.yyyymmddmilisecond = function () {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString(); 
	var dd = this.getDate().toString();
	var HH = this.getHours().toString();
	var min = this.getMinutes().toString();
	var sec = this.getSeconds().toString();
	var msec = this.getMilliseconds().toString();
	return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]) + ' ' + (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0]) + ':' + msec; 
};

Date.prototype.addDays = function(days)
{
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
}

exports.timeStamp = function () { return (new Date).yyyymmddhhmmss() }; 

exports.wait = function (milisecond) {
	var t = new Date().getTime();
	while (t + milisecond > new Date().getTime()) {
		setTimeout('', 5);
	};

	return;
};



var nodemailer = require('nodemailer');


exports.sendadminmail = function (subject, body,callback){
	try {
		eventLog('sendadminmail...');
		var smtpTransport = require('nodemailer-smtp-transport');

		var transporter = nodemailer.createTransport(smtpTransport({
			host: 'smtp.yandex.com',
			port: 587,
			secure:false,
			auth: {
				user: 'bilgi@fil.gen.tr',
				pass: 'atabar18'
			},
			tls: { rejectUnauthorized: false }
		}));
        // setup e-mail data with unicode symbols
        var mailOptions = {
        	from: "Fil <bilgi@fil.gen.tr>", 
        	to: 'alitek@gmail.com',  

            subject: subject + '', // Subject line
            text: body + '', // plaintext body
            html: body + '' // html body
          };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
        	transporter.close();
        	if (error) {
        		eventLog('error:' + JSON.stringify(error));
        		callback({success:false,error:{code:'SEND_ADMIN_EMAIL',message:error}});
        	}else{
        		exports.console('Mailer // Message sent: ' + info.response);
        		callback({success:true,error:null});
        	}

        });
      } catch ( err ) {
      	eventLog("sendadminmail error:" + err);
      	callback({success:false,error:{code:'SEND_ADMIN_EMAIL',message:err}});
      }
    }

    exports.sendmail = function (mailto,subject, body,callback){
    	try {
    		if(!emailvalidator.validate(mailto)){
    			callback({success:true,error:null});
    			return;
    		}
    		var smtpTransport = require('nodemailer-smtp-transport');
    		mailto = htmlToText.fromString(subject, {wordwrap: 130});
    		subject = htmlToText.fromString(subject, {wordwrap: 130});
    		body = htmlToText.fromString(body, {wordwrap: 130});

    		var transporter = nodemailer.createTransport(smtpTransport({
    			host: 'smtp.yandex.com',
    			port: 587,
    			secure:false,
    			auth: {
    				user: 'bilgi@fil.gen.tr',
    				pass: 'atabar18'
    			},
    			tls: { rejectUnauthorized: false }
    		}));

        // setup e-mail data with unicode symbols
        var mailOptions = {
        	from: "Fil <bilgi@fil.gen.tr>", 
        	to: mailto,  

            subject: subject + '', // Subject line
            text: body + '', // plaintext body
            html: body + '' // html body
          };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
        	transporter.close();
        	if (error) {
        		eventLog('error:' + JSON.stringify(error));
        		callback({success:false,error:{code:'SEND_ADMIN_EMAIL',message:error}});
        	}else{
        		exports.console('Mailer // Message sent: ' + info.response);
        		callback({success:true,error:null});
        	}

        });
      } catch ( err ) {
      	eventLog("sendadminmail error:" + err);
      	callback({success:false,error:{code:'SEND_ADMIN_EMAIL',message:err}});
      }
    }


    String.prototype.replaceAll = function (search, replacement) {
    	var target = this;
    	return target.split(search).join(replacement);
    // var target = this;
    // return target.replace(new RegExp(search, 'g'), replacement);
  };


  exports.replaceAll= function (search, replacement) {
  	var target = this;
  	return target.replace(new RegExp(search, 'g'), replacement);
  };

  exports.sayMerhaba = function () {
  	return  new Date().getTime().toString();
  };



  var crypto = require('crypto'),
  algorithm = 'aes-256-cbc',
  password = 'metinalifeyyaz',
  key = crypto.createHash('md5').update(password, 'utf-8').digest('hex').toUpperCase();

  exports.encrypt=function(text){
  //var cipher = crypto.createCipheriv(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

    //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var cipher = crypto.createCipheriv(algorithm, key, iv);

    var crypted = cipher.update(text.toString(),'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  }

  exports.decrypt=function(text){

  //var decipher = crypto.createDecipher(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const decipher = crypto.createDecipher('aes-128-cbc', key, iv);
    //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var decipher = crypto.createDecipheriv(algorithm, key, iv);

    var dec = decipher.update(text.toString(),'hex','utf8')
    dec += decipher.final('utf8');
    return dec;

  }


  exports.encryptbuffer=function(buffer){
  //var cipher = crypto.createCipheriv(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

   //var key = Buffer.from(password,'utf8');
   var iv = Buffer.alloc(16);
   var cipher = crypto.createCipheriv(algorithm, key, iv);

   var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
   return crypted;
 }

 exports.decryptBuffer=function(buffer){
  //var decipher = crypto.createDecipher(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const decipher = crypto.createDecipher('aes-128-cbc', key, iv);

   //var key = Buffer.from(password,'utf8');
   var iv = Buffer.alloc(16);
   var decipher = crypto.createDecipheriv(algorithm, key, iv);
   var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
   return dec;
 }




// exports.reqPackage=function(id,password,command, params,requestid) {
//     requestid=requestid || uuid.v4();
//     return JSON.stringify({ id:id,password:password, type : 'REQUEST', requestid:requestid, command: command || '', params:params || ''});
// };

// exports.resPackage=function(id,password,command, data,requestid) {
//     requestid=requestid || uuid.v4();
//     return JSON.stringify({ id:id,password:password, type : 'RESPONSE',requestid:requestid, command: command || '', data:data || ''});
// };


exports.reqPackage=function(connectinfo, command, params,requestid) {
	requestid=requestid || uuid.v4();
	return JSON.stringify({ connectinfo:connectinfo, type : 'REQUEST', requestid:requestid, command: command || '', params:params || ''});
};

exports.resPackage=function(connectinfo, command, data,requestid) {
	requestid=requestid || uuid.v4();
	return JSON.stringify({ connectinfo:connectinfo, type : 'RESPONSE',requestid:requestid, command: command || '', data:data || ''});
};



exports.socketwrite=function(socket,data,callback){
	socket.write(exports.encrypt(data) + '\0',callback);
}

exports.socketread=function(data){
	return exports.decrypt(data.toString('utf-8'));
}

exports.datefromyyyymmdd = function (text) {
	var yyyy = Number(text.substring(0,4));
	var mm = Number(text.substring(5,7));
	var dd = Number(text.substring(8,10));
	var tarih=new Date(yyyy,mm-1,dd,5,0,0);
    //tarih.setDate(tarih.getDate() + 1);
    return tarih;
  };


  exports.getParameters=function(callback){
  	var dbHelper = require('./dbhelper_mysql.js');
  	var sql="SELECT * FROM `parameters` WHERE 1=1 "; 
    // ParamName Like 'SMTP_%' OR  ParamName Like 'EMAIL_%'  OR  ParamName Like 'SQLSERVER_%'   OR  ParamName Like 'RESONANCE_%' ";
    dbHelper.query(sql, null, function (result) {
    	if(!result.success){
    		callback(null); 
    	}else{
    		var parameters={};
    		for(var i=0;i<result.data.rows.length;i++){
    			parameters[result.data.rows[i]["ParamName"]]=result.data.rows[i]["ParamValue"];
    		}
    		callback(parameters);
    	}
    });
  }


  Date.prototype.monthName = function (language) {


  	language = language || 'TR';  

  	var monthNames =[];
  	switch(language){
  		case 'TR':
  		case 'tr':
  		monthNames= ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  		break;
  		default:
  		monthNames= ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  		break;
  	}

  	return monthNames[this.getMonth()];
  }

// exports.trimNumbers=function(text){
//     return text.replace( /^\D+/g, '');
// }


exports.trimNumbers=function(text){
	var buf='';
	for(var i=0;i<text.length;i++){
		if(text[i]>='0' && text[i]<='9'){
			buf +=text[i];
		}
	}

	return buf;
}

exports.namecode=function(text){
	text=text.toLowerCase();
	text=text.replaceAll('İ','i');
	text=text.replaceAll('ı','i');
	text=text.replaceAll('Ğ','g');
	text=text.replaceAll('ğ','g');
	text=text.replaceAll('Ü','u');
	text=text.replaceAll('ü','u');
	text=text.replaceAll('Ö','o');
	text=text.replaceAll('ö','o');
	text=text.replaceAll('Ş','s');
	text=text.replaceAll('ş','s');
	text=text.replaceAll('Ç','c');
	text=text.replaceAll('ç','c');
	text=text.replaceAll('  ',' ');
	text=text.replaceAll('  ',' ');
	text=text.replaceAll('  ',' ');
	text=text.replaceAll('  ',' ');
	text=text.replaceAll('  ',' ');
	text=text.replaceAll('.','');
	text=text.replaceAll(',','');
	text=text.replaceAll('-','');
	text=text.replaceAll('_','');
	text=text.replaceAll('+','');
	text=text.replaceAll('#','');
	text=text.replaceAll('$','');
	text=text.replaceAll('%','');
	text=text.replaceAll('^','');
	text=text.replaceAll('&','');
	text=text.replaceAll('*','');
	text=text.replaceAll("'",'');

	for(i=20;i>1;i--){
		var buf='';
		for(j=0;j<i;j++) {
			buf=buf +' ';
		}
		text = text.replaceAll(buf,' ');
	}
	return text;
}

String.prototype.lcaseeng = function () {
	var text=this.toLowerCase();
	text=text.replaceAll('İ','i');
	text=text.replaceAll('ı','i');
	text=text.replaceAll('I','i');
	text=text.replaceAll('Ğ','g');
	text=text.replaceAll('ğ','g');
	text=text.replaceAll('Ü','u');
	text=text.replaceAll('ü','u');
	text=text.replaceAll('Ö','o');
	text=text.replaceAll('ö','o');
	text=text.replaceAll('Ş','s');
	text=text.replaceAll('ş','s');
	text=text.replaceAll('Ç','c');
	text=text.replaceAll('ç','c');


	return text;
};

String.prototype.ucaseeng = function () {
	var text=this.lcaseeng();
	text = text.toUpperCase();

	return text;
};

String.prototype.upcaseTr = function () {
	var text=this;
	text=text.replaceAll('i', 'İ');
	text=text.replaceAll('ı','I');
	text=text.replaceAll('ğ','Ğ');
	text=text.replaceAll('ü','Ü');
	text=text.replaceAll('ş','Ş');
	text=text.replaceAll('ö','Ö');
	text=text.replaceAll('ç','Ç');


	text=this.toUpperCase();

	return text;
};

String.prototype.lcaseTr = function () {
	var text=this;
	text=text.replaceAll('İ', 'i');
	text=text.replaceAll('I','ı');
	text=text.replaceAll('Ğ','ğ');
	text=text.replaceAll('Ü', 'ü');
	text=text.replaceAll('Ş' , 'ş');
	text=text.replaceAll('Ö' , 'ö');
	text=text.replaceAll('Ç', 'ç');


	text=this.toLowerCase();

	return text;
};

String.prototype.briefCase = function () {
	var text=this.lcaseTr().trim();
	var newtext='';
	for(var i=0;i<text.length;i++){
		if(i==0){
			newtext = newtext + text.substr(i,1).upcaseTr();
		}else{
			if(text.substr(i-1,1)==' ' && text.substr(i,1)!=' '){
				newtext = newtext + text.substr(i,1).upcaseTr();
			}else{
				newtext = newtext + text.substr(i,1);
			}
		}
	}

	return newtext;
};

String.prototype.lcaseTr2 = function () {
	var text=this.lcaseTr().trim();
	var newtext='';
	if(text.length>0){
		text = text[0].upcaseTr();
	}


	return text;
};

exports.repairText=function(text){
	text=text.replaceAll("&#8217;","'");
	text=text.replaceAll("&#8211;","-");
	return text;
}
exports.downloadImage=function(url,folder, filename,callback){
	request.head(url,function(err,res,body){
        // eventLog('content-type:', res.headers['content-type']);
        // eventLog('content-length:', res.headers['content-length']);
        // eventLog('err:' + JSON.stringify(err));
        if(res.headers['content-length']==undefined || res.headers['content-type'].split('/')[0]!='image' ){
        	callback({success:false,error:{code:'DOWNLOAD_URL_ERROR',message:'Content not found.'}});
        }else{
        	if(err!=null){
        		callback({success:false,error:{code:'DOWNLOAD_FILE_ERROR',message:err}});
        	}else{
        		switch(res.headers['content-type'].split('/')[1]){
        			case 'jpeg':
        			filename +='.jpg';
        			break;
        			case 'png':
        			filename +='.png';
        			break;
        			case 'bmp':
        			filename +='.bmp';
        			break;
        			case 'gif':
        			filename +='.gif';
        			break;
        			default:
        			filename +='.jpg';
        			break;
        		}
        		request(url).pipe(fs.createWriteStream(path.join(folder,filename))).on('close',function(){
        			callback({success:true,error:null,data:{filename:filename}});
        		});
        	}
        }
        

      });
}

exports.copyFile=function(source, target, callback) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cbCalled = true;
			if(err){
				callback({success:false,error:{code:'COPY_FILE_ERROR',message:err}});
			}else{
				callback({success:true,error:null});
			}

		}
	}
}

exports.clearText=function(text) {
	return htmlToText.fromString(text,{wordwrap:255});
}


exports.randomNumber=function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.distance=function(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
  c(lat1 * p) * c(lat2 * p) * 
  (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

exports.distanceToCoords=function(lat, lon, distance) {
	var lat2,lon2;
	var birimfark_lat;
	var birimfark_lon;
	var result={minlat:0,maxlat:0,minlon:0,maxlon:0};
	var buf;
	var farklat=0,farklon=0;
	lat2=lat+1;
	lon2=lon+1;
	birimfark_lat=exports.distance(lat,lon,lat2,lon);
	birimfark_lon=exports.distance(lat,lon,lat,lon2);
	if(birimfark_lat!=0)farklat=Math.abs(distance/birimfark_lat);
	if(birimfark_lon!=0)farklon=Math.abs(distance/birimfark_lon);
	result.minlat=lat-farklat;
	result.maxlat=lat+farklat;
	result.minlon=lon-farklon;
	result.maxlon=lon+farklon;
	return result;
}

exports.nameMask=function(text){
	var buf='';
	if(text.length==0)return '';
    //buf=text;
    for(var i=0;i<text.length;i++){
    	if(i==0){
    		buf = buf + text[i];
    	}else{
    		if(text[i-1]==' ' && text[i]!=' '){
    			buf = buf + text[i];
    		}else{
    			if(text[i]==' '){
    				buf = buf + ' ';
    			}else{
    				buf = buf + '.';
    			}

    		}
    	}
    }

    return buf;
  }


  exports.dynamicSort=function(property) {
  	var sortOrder = 1;
  	if(property[0] === "-") {
  		sortOrder = -1;
  		property = property.substr(1);
  	}
  	return function (a,b) {
  		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
  		return result * sortOrder;
  	}
  }

  exports.base64ArrayBuffer=function(arrayBuffer) {
  	var base64    = ''
  	var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  	var bytes         = new Uint8Array(arrayBuffer)
  	var byteLength    = bytes.byteLength
  	var byteRemainder = byteLength % 3
  	var mainLength    = byteLength - byteRemainder

  	var a, b, c, d
  	var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
  	chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
  	chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}

exports.strToDate=function(text) {
    var gun = text.substr(0,2); //29.01.2007;
    var ay = text.substr(3,2);
    var yil = text.substr(6,4);

    return new Date(yil,ay,gun);

  }



  Number.prototype.formatMoney = function(){
  	var c=2;
  	var d=whatDecimalPointer();
  	var t=d==','?'.':',';

  	var s= _formatMoney(this,c,d,t);

  	return s;
  };

  Number.prototype.n2 = function(){
  	var sbuf=this.toString();
  	if(sbuf.length==1){
  		sbuf ='0' + sbuf;
  	}   

  	return sbuf;
  };


  Number.prototype.formatQuantity = function(c){

  	var d=whatDecimalPointer();
  	var t=d==','?'.':',';

  	var s= _formatQuantity(this,c,d,t);

  	return s;
  };

  function _formatQuantity(value,c,d,t){
  	var n = value, 

  	d = d == undefined ? "." : d, 
  	t = t == undefined ? "," : t, 
  	s = n < 0 ? "-" : "";


  	if(c==undefined){
  		i = parseInt(n = Math.abs(+n || 0)) + "";
  		j = (j = i.length) > 3 ? j % 3 : 0;
  		var kusurat=Math.round(Math.abs(n - i)*1000)/1000;

  		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (Math.abs(n - i)>0?d:'') + kusurat.toString().slice(2);
  	}else{
  		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
  		j = (j = i.length) > 3 ? j % 3 : 0;
  		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  	}

  }


  String.prototype.formatMoney = function(){
  	if(isNaN(this)) return this;
  	var c=2;
  	var d=whatDecimalPointer();
  	var t=d==','?'.':',';

  	var s= _formatMoney(this,c,d,t);

  	return s;
  };


  exports.formatCol=(value,field)=>{
  	if(field.format==undefined){
  		field.format='';
  	}
  	switch(field.format){
  		case 'n2':
  		return Number(value).formatMoney(2,',','.');
  		case 'n1':
  		return Number(value).formatMoney(1,',','.');
  		case 'n0':
  		return Number(value).formatMoney(0,',','.');
  		case 'TL':
  		case 'TL2':
  		return Number(value).formatMoney(2,',','.') + ' TL';
  		case 'EUR':
  		case 'EUR2':
  		return Number(value).formatMoney(2,',','.') + ' EUR';
  		case 'USD':
  		case 'USD2':
  		return Number(value).formatMoney(2,',','.') + ' USD';
  		case 'yyyy-mm-dd':
  		case 'YYYY-MM-DD':
  		case 'yyyy-MM-dd':
  		return (new Date(value)).yyyymmdd();
  		case 'yyyy-mm-dd hh:mm:ss':
  		return (new Date(value)).yyyymmddhhmmss();
  		default:
  		return value;
  	}

  }

  function whatDecimalPointer() {
  	var n = 1.1;
  	n = n.toLocaleString().substring(1, 2);
  	return n;
  }
  function _formatMoney(value,c,d,t){
  	var n = value, 
  	c = isNaN(c = Math.abs(c)) ? 2 : c, 
  	d = d == undefined ? "." : d, 
  	t = t == undefined ? "," : t, 
  	s = n < 0 ? "-" : "", 
  	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
  	j = (j = i.length) > 3 ? j % 3 : 0;
  	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  }

  Number.prototype.round = function(precision){
  	var t = this;
  	var rakam=1;
  	if(precision<=0) return Math.round(t);
  	for(var i=0;i<precision;i++){
  		rakam = rakam * 10;
  	}
  	var sonuc=Math.round(rakam*t)/rakam;

  	return sonuc;

  };


  exports.isValidPassword = function(normal_password, kriptolanmis_password){
  	return bcrypt.compareSync(normal_password, kriptolanmis_password);
  }



  exports.createHash = function(password){
  	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  }


  exports.encodeUrl= function(obj1, prefix) {
  	var str = []
  	var obj=objectToListObject(obj1)
  	for (p in obj) {
  		if (obj.hasOwnProperty(p)) {
  			var k = prefix ? prefix + "[" + p + "]" : p,
  			v = obj[p]
  			str.push((v !== null && typeof v === "object") ?
  			         encodeURIComponent2(k) + "=" + encodeURIComponent2(JSON.stringify(v)) :
  			         encodeURIComponent2(k) + "=" + encodeURIComponent2(v));
  		}
  	}
  	return str.join("&");
  }

  exports.encodeUrl111 = function(obj, prefix) {
  	var str = [],
  	p;
  	for (p in obj) {
  		if (obj.hasOwnProperty(p)) {
  			var k = prefix ? prefix + "[" + p + "]" : p,
  			v = obj[p]
  			str.push((v !== null && typeof v === "object") ?
  			         encodeURIComponent2(k) + "=" + encodeURIComponent2(JSON.stringify(v)) :
  			         encodeURIComponent2(k) + "=" + encodeURIComponent2(v));
  		}
  	}
  	return str.join("&");
  }

  global.pagination=(c, m)=>{
  	var current =Number(c),
  	last = Number(m),
  	delta = 2,
  	left = current - delta,
  	right = current + delta + 1,
  	range = [],
  	rangeWithDots = [],
  	l

  	var i=1
  	while(i<=last){
  		if (i == 1 || i == last || i >= left && i < right) {
  			range.push(i)
  		}
  		i++
  	}


  	for (let i of range) {
  		if (l) {
  			if (i - l == 2) {
  				rangeWithDots.push(l + 1)
  			} else if (i - l != 1) {
  				rangeWithDots.push('...')
  			}
  		}
  		rangeWithDots.push(i)


  		l = i
  	}

  	return rangeWithDots
  }
  
  exports.setGridData=(data,resp)=>{
  	if(resp.data==undefined) return data;
  	if(Array.isArray(resp.data)){
  		data.list=resp.data;
  		return data;
  	}

  	if(resp.data.docs!=undefined) data.list=resp.data.docs;
  	if(resp.data.page!=undefined) data.page=resp.data.page;
  	if(resp.data.pageSize!=undefined) data.pageSize=resp.data.pageSize;
  	if(resp.data.recordCount!=undefined) data.recordCount=resp.data.recordCount;
  	if(resp.data.pageCount!=undefined) data.pageCount=resp.data.pageCount;
  	return data;
  }

  var assetFileCacheList=[]
  global.assetVersion=(sourceFileName)=>{
  	var bFound=false
  	var fileName=''
  	assetFileCacheList.forEach((e)=>{
  		if(e.fileName==sourceFileName){
  			bFound=true;
  			fileName=e.fileName + '?v=' + e.version
  			return
  		}
  	})

  	if(bFound) 
  		return fileName

  	var dosyaVarMi=false;
  	var dosyaTamAdi=path.join(rootDir,'assets',sourceFileName);
  	try {
  		if(fs.existsSync(dosyaTamAdi))
  			dosyaVarMi=true
  	} catch(err) {}
  	if(dosyaVarMi==false)
  		return sourceFileName

  	var stats = fs.statSync(dosyaTamAdi);
  	var obj ={fileName:sourceFileName, version:(new Date(stats.mtime)).yyyymmddhhmmss().replaceAll('-','').replaceAll(' ','').replaceAll(':','')}

  	assetFileCacheList.push(obj);
  	return obj.fileName + '?v=' + obj.version;
  }

  global.getFilter=(filter,req,res)=>{
  	if(req.method=='POST'){
  		filter=Object.assign({},filter,req.query)
  		filter=Object.assign({}, filter,req.body)
  		filter['btnFilter']=undefined
  		delete filter['btnFilter']
  		filter['page']=1

  		var pathname=url.parse(req.url).pathname

  		res.redirect(`${pathname}?${exports.encodeUrl(filter)}`)
  		return false
  	}else{

  		filter=Object.assign(filter,req.query)


  		return filter;
  	}
  }

  global.clone=(obj)=>{
  	return JSON.parse(JSON.stringify(obj));
  }

  global.getUnitCodeText=(unitCode)=>{
  	var text='';
  	staticValues.unitCodeList.forEach((e)=>{
  		if(e.value==unitCode){
  			text=e.text;
  			return;
  		}
  	})
  	if(text=='')
  		return unitCode;
  	else
  		return text;
  }

  exports.dateTimeFromText=(dateStr)=>{
  	d=new Date(dateStr); 
  	d.setMinutes(d.getMinutes()+(new Date()).getTimezoneOffset()*1);

  	return d;
  };

  exports.haftaninGunu=(tarih)=>{
  	switch(exports.dateTimeFromText(tarih).getDay()){
  		case 0: return 'Pazar';
  		case 1: return 'Pazartesi';
  		case 2: return 'Salı';
  		case 3: return 'Çarşamba';
  		case 4: return 'Perşembe';
  		case 5: return 'Cuma';
  		case 6: return 'Cumartesi';
  	}
  	return '';
  }

  exports.haftaninGunuSm=(tarih)=>{
  	switch(exports.dateTimeFromText(tarih).getDay()){
  		case 0: return 'Pz';
  		case 1: return 'Pt';
  		case 2: return 'Sl';
  		case 3: return 'Çr';
  		case 4: return 'Pr';
  		case 5: return 'Cm';
  		case 6: return 'Ct';
  	}
  	return '';
  }


  global.runNodeJs=(fileName,cb)=>{
  	const cp = require('child_process')
  	const child = cp.spawn('node', [fileName,'-e']);

  	let buf = ''
  	child.stdout.on('data', (c) => {
  		buf += c
  	})

  	child.stderr.on('data', (data) => {
  		console.error('runNodeJs:',fileName);
  		console.error('Hata:',data.toString('UTF-8'));
  		if(cb){
  			return cb({name:'ERR_runNodeJs',message:data.toString('UTF-8')})
  		}
  	});

  	child.stdout.on('end', () => {
  		if(cb){
  			return cb(null,buf.toString('UTF-8'));
  		}
  	})
  }

  global.indent=(text, depth)=>{
  	var output='';
  	text.split("\n").forEach(function(line, num){
    // To avoid indenting the first line
    if(num>0){
    	for(var i=0;i<depth;i++){
    		line=line+' ';
    	}
    }
    output+=line + '\n';
  });
  	return output;
  }

  global.formError=(msj='')=>{
  	if(msj=='')
  		return ''
  	var sbuf=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
  	${msj}
  	<button type="button" class="close" data-dismiss="alert" aria-label="Close">
  	<span aria-hidden="true">&times;</span>
  	</button>
  	</div>`
  	return sbuf
  }

  global.formSuccess=(msj='')=>{
  	if(msj=='') 
  		return ''
  	var sbuf=`<div class="alert alert-primary alert-dismissible fade show" role="alert">
  	${msj}
  	<button type="button" class="close" data-dismiss="alert" aria-label="Close">
  	<span aria-hidden="true">&times;</span>
  	</button>
  	</div>`
  	return sbuf
  }


  global.iteration=(dizi, fonksiyon,interval=0, errContinue=true, callback)=>{

  	var index=0
  	var result=[]
  	var errors=''

  	function tekrar(cb){
  		if(index>=dizi.length)
  			return cb(null)
		// if(config.status=='development' && index>=3){
		// 	return cb(null)
		// }

		fonksiyon(dizi[index],(err,data)=>{
			if(!err){
				if(data)
					result.push(data)
				index++
				setTimeout(tekrar,interval,cb)
			}else{
				errorLog(`iteration Error: dizi[${index}]:`,dizi[index])
				if(errContinue){
					errors +=`iteration(): ${err.message}\n`
					index++
					setTimeout(tekrar,interval,cb)
				}else{
					cb(err)
				}
				
			}
		})
	}

	tekrar((err)=>{
		if(!err){
			
			if(errContinue==false && errors!=''){
				if(callback)
					callback({code:'IterationError',message:errors},result)
			}else{
				if(callback)
					callback(null,result)
			}
		}else{
			if(callback)
				callback(err,result)
		}
		
	})
}


global.moduleLoader=(folder,suffix,expression,callback)=>{
	try{
		var moduleHolder={}
		var files=fs.readdirSync(folder)
		var index=0

		function calistir(cb){
			if(index>=files.length){
				return cb(null)
			}
			let f = path.join(folder, files[index])
			if(!fs.statSync(f).isDirectory()){
				var fileName = path.basename(f)
				var apiName = fileName.substr(0, fileName.length - suffix.length)
				if (apiName != '' && (apiName + suffix) == fileName) {

					moduleHolder[apiName] = require(f)
					if(expression!='')
						eventLog(`${expression} ${apiName.cyan} loaded.`)
				}
				index++
				setTimeout(calistir,0,cb)
			}else{
				var folderName = path.basename(f)
				moduleHolder[folderName]={}

				moduleLoader(f,suffix,expression,(err,holder)=>{
					if(!err){
						moduleHolder[folderName]=holder
						index++
						setTimeout(calistir,0,cb)
					}else{
						cb(err)
					}
				})
			}
		}
		
		calistir((err)=>{
			callback(err,moduleHolder)
		})

		
	}catch(e){
		errorLog(
		         `moduleLoader Error:
		         folder:${folder} 
		         suffix:${suffix}
		         expression:${expression}
		         `)
		callback(e)
	}
}




global.b64EncodeUnicode=(str)=>{
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
	                                            function toSolidBytes(match, p1) {
	                                            	return String.fromCharCode('0x' + p1)
	                                            }))
}

global.b64DecodeUnicode=(str)=>{
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
	}).join(''))
}


global.encodeURIComponent2=(str)=>{
	return encodeURIComponent(str).replace(/[!'()*]/g, escape)
}

global.convertPathFieldName=(path)=>{
	if(path.substr(0,1)=='/')
		path=path.substr(1)
	path=path.replaceAll('/','_')

	return path
}


// global.programButtons=(session,urlPath,panelButtons='')=>{
	
// 	var prgButtons=[]
// 	var pathFieldName=convertPathFieldName(urlPath)

// 	try{
// 		prgButtons=session.settings.page[pathFieldName].programs
// 	}catch(err){

// 	}
// 	if(prgButtons.length==0 && panelButtons=='')
// 		return ''

// 	var sbuf=`<div class="button-bar mt-2 p-1 rounded justify-content-start" role="toolbar" aria-label="Toolbar with button groups">\n`
// 	if(panelButtons!='')
// 		sbuf +=panelButtons

// 	if(prgButtons.length>0){
// 		prgButtons.forEach((e)=>{
// 			var icon=''
			
// 			e.showButtonText=e.showButtonText || false
// 			if((e.icon || '')!=''){
// 				icon=e.icon
// 			}else{
// 				switch(e.type){
// 					case 'file-importer':
// 					icon='fas fa-file-import'
// 					break
// 					case 'file-exporter':
// 					icon='fas fa-file-export'
// 					break
// 					case 'connector-importer':
// 					icon='fas fa-cloud-upload-alt'
// 					break

// 					case 'connector-exporter':
// 					icon='fas fa-cloud-download-alt'
// 					break

// 					case 'email':
// 					icon='fas fa-envelope-square'
// 					break

// 					case 'sms':
// 					icon='fas fa-sms'
// 					break
// 				}
// 			}
// 			sbuf +=`<a class="btn btn-primary mr-2" href="javascript:runProgram('${e._id}','${e.type}')" title="${e.name}">${icon!=''?'<i class="' + icon + '"></i>':''} ${e.showButtonText?e.name:''}</a>\n`
// 		})
// 	}
// 	sbuf+=`</div>\n`
// 	return sbuf
// }


// String.prototype.toShortId = function(){
// 	var longID=this
// 	console.log(`longID:`,longID)
// 	var buffer = Buffer.from(longID, 'hex')
// 	console.log(`buffer:`,buffer)
// 	return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
// }
// String.prototype.toLongId = function(){
// 	var shortID=this
// 	shortID = shortID.replace(/-/g, '+').replace(/_/g, '/')
// 	var buffer = Buffer.from(shortID, 'base64')
// 	return buffer.toString('hex')
// }



global.replaceUrlCurlyBracket=function(url,item){
	if((url || '')=='')
		return ''
	if(!(url.indexOf('{')>-1 && url.indexOf('}')>-1))
		return url
	var fieldList=[]
	var dizi=url.split('}')
	dizi.forEach((e)=>{
		if(e.indexOf('{')>-1){
			fieldList.push(e.split('{')[1])
		}
	})


	fieldList.forEach((e)=>{
		url=url.replace(`{${e}}`,getPropertyByKeyPath(item,e))
	})

	return url
}



global.getPropertyByKeyPath=function(targetObj, keyPath) { 
	if(keyPath.substr(0,1)=='/')
		keyPath=keyPath.substr(1)
	if(keyPath.substr(0,2)=='./')
		keyPath=keyPath.substr(2)
	keyPath=keyPath.replaceAll('/','.')
	
	var keys = keyPath.split('.')
	if(keys.length == 0) return undefined
		keys = keys.reverse()
	var subObject = targetObj
	while(keys.length) {
		var k = keys.pop()
		if(typeof subObject[k]=='undefined' || subObject[k]==null) {
			return undefined
		} else {
			subObject = subObject[k]
		}
	}
	return subObject
}

global.listObjectToObject=function(listObj){
	if(typeof listObj!='object' || listObj==null )
		return listObj
	var obj={}
	
	Object.keys(listObj).forEach((mainKey)=>{
		if(mainKey.indexOf('.')>-1){
			var keys=mainKey.split('.')
			
			if(obj[keys[0]]==undefined)
				obj[keys[0]]={}


			if(obj[keys[0]][keys[1]]==undefined){
				if(keys.length==2)
					return obj[keys[0]][keys[1]]=listObj[`${keys[0]}.${keys[1]}`]
				else
					obj[keys[0]][keys[1]]={}
			}

			if(obj[keys[0]][keys[1]][keys[2]]==undefined){
				if(keys.length==3)
					return obj[keys[0]][keys[1]][keys[2]]=listObj[`${keys[0]}.${keys[1]}.${keys[2]}`]
				else
					obj[keys[0]][keys[1]][keys[2]]={}
			}

			if(obj[keys[0]][keys[1]][keys[2]][keys[3]]==undefined){
				if(keys.length==4)
					return obj[keys[0]][keys[1]][keys[2]][keys[3]]=listObj[`${keys[0]}.${keys[1]}.${keys[2]}.${keys[3]}`]
				else
					obj[keys[0]][keys[1]][keys[2]][keys[3]]={}
			}

			if(obj[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]]==undefined){
				if(keys.length==5)
					return obj[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]]=listObj[`${keys[0]}.${keys[1]}.${keys[2]}.${keys[3]}.${keys[4]}`]
				else
					obj[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]]={}
			}

		}else{
			obj[mainKey]=listObj[mainKey]
		}
	})
	return obj
}

global.objectToListObject=function(obj){
	var listObj={}
	Object.keys(obj).forEach((key)=>{
		if(typeof obj[key]=='object'){
			Object.keys(obj[key]).forEach((key2)=>{
				if(typeof obj[key][key2]=='object'){
					Object.keys(obj[key][key2]).forEach((key3)=>{
						if(typeof obj[key][key2][key3]=='object'){
							Object.keys(obj[key][key2][key3]).forEach((key4)=>{
								if(typeof obj[key][key2][key3][key4]=='object'){
									Object.keys(obj[key][key2][key3][key4]).forEach((key5)=>{
										listObj[`${key}.${key2}.${key3}.${key4}.${key5}`]=obj[key][key2][key3][key4][key5]
									})
								}else{
									listObj[`${key}.${key2}.${key3}.${key4}`]=obj[key][key2][key3][key4]
								}
							})
						}else{
							listObj[`${key}.${key2}.${key3}`]=obj[key][key2][key3]
						}
					})
				}else{
					listObj[`${key}.${key2}`]=obj[key][key2]
				}
			})
		}else{
			listObj[key]=obj[key]
		}
		
	})
	return listObj
}


global.getAllUrlParams=function(queryString){
	var q={}
	var dizi=queryString.split('&')
	dizi.forEach((e)=>{
		var key=e.split('=')[0]
		var value=decodeURIComponent(e.split('=')[1].replace(/\+/g, ' '))
		if(value!=''){
			if(key[0]=='?')
				key=key.substr(1)
			q[key]=value
		}
	})
	
	return q
}


global.generateFormName=function(name){ 
	
	var keys = name.toString().split('.')
	if(keys.length<=1){
		return name
	}else{
		var s=''
		keys.forEach((k,index)=>{
			if(index==0)
				s=k
			else
				s+=`[${k}]`
		})
		return s
	}
}

global.generateFormId=function(name) { 
	if(typeof name=='string')
		return name.replaceAll('.','_')
	else
		return ''
}

global.ifNull=function(item,defaultValue){
	if(typeof item=='undefined'){
		if(typeof defaultValue!='undefined'){
			return defaultValue
		}else{
			return ''
		}
	}else{
		if(item==null){
			if(typeof defaultValue!='undefined'){
				return defaultValue
			}else{
				return ''
			}
		}else{
			return item
		}
	}
}

global.tempLog=(fileName,text)=>{
	if(config.status!='development')
		return
	var tmpDir=os.tmpdir()
	if(config){
		if(config.tmpDir){
			tmpDir=config.tmpDir
		}
	}
	fs.writeFileSync(path.join(tmpDir,fileName),text,'utf8')
}

global.t=(new Date()).getTime()

global.time=(text='t')=>{
	var fark=(((new Date()).getTime())-t)/1000
	console.log(`${text}:`,fark)
	
}

global.timeReset=()=>{
	t=(new Date()).getTime()
}

global.helpButton=(locals)=>{

	if((locals.help || '')!=''){
		var helpUrl=locals.help
		if(helpUrl.indexOf('?')>-1){
			if(helpUrl.split('?')[1].indexOf('sid=')<0){
				helpUrl+=`&mid=${locals.mid}`
			}
		}else{
			helpUrl+=`?mid=${locals.mid}`
		}
		return `<a href="javascript:openInNewTab('${helpUrl}')" class="skip-enter-next text-primary bold ml-2" title="Yardım ve açıklama için tıklayınız"><i class="far fa-question-circle"></i></a>`
	}else{
		return ''
	}
}