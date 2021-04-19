var global={
	version:'',
	staticValues:{},
	pages:{},
	menu:[],
	databases:[],
	dbId:'',
	dbName:'',
	sessionId:'',
	token:'',
	ispiyonServiceUrl:'',
	settings:{},
	formOptionsLink:''
}

function initGlobals(){
	try{
		if(localStorage.getItem('global')){
			global=Object.assign({},global,JSON.parse(localStorage.getItem('global')))
		}
	}catch(e){
		localStorage.removeItem('global')
	}
}

initGlobals()
initIspiyonService()

var hashObj=getHashObject()


function getHashObject(){
	if(window.location.hash=='')
		return {}

	var hash=window.location.hash.substr(1)
	var queryString=hash.split('?')[1]?hash.split('?')[1]:''
	var dizi=hash.split('?')[0].split('/')
	dizi.splice(0,1)

	var h={
		path:dizi.length>1?`/${dizi[0]}/${dizi[1]}`:'',
		pathKey:dizi.length>1?`${dizi[0]}.${dizi[1]}`:'',
		func:dizi.length>2?dizi[2]:'',
		id:dizi.length>3?dizi[3]:'',
		param1:dizi.length>4?dizi[4]:'',
		param2:dizi.length>5?dizi[5]:'',
		param3:dizi.length>6?dizi[6]:'',
		query:{},
		queryString:queryString,
		module:'',
		icon:'',
		title:'',
		funcTitle:'',
		breadCrumbs:'',
		breadCrumbsHtml:'',
		settings:{}
	}
	if(h.path && h.func==''){
		h.func='index'
	}

	if(queryString){

		h.query=getAllUrlParams(queryString)
	}
	var p=getPageInfos(h)
	h=Object.assign({},h,p)
	h['settings']=getPageSettings(h.module)

	return h
}

function setHashObject(h){
	var hashString=h.path || ''

	if(h.func!='' && h.func!='index'){
		hashString+='/' + h.func
		if(h.id){
			hashString+='/' + h.id
			if(h.param1){
				hashString+='/' + h.param1
				if(h.param2){
					hashString+='/' + h.param2
					if(h.param3){
						h+='/' + h.param3
					}
				}
			}
		}
	}

	if(h.query){
		var filterString=''
		Object.keys(h.query).forEach((key)=>{
			if(filterString!='')
				filterString+='&'
			filterString+=`${key}=${encodeURIComponent2(h.query[key])}`
		})
		if(filterString!=''){
			hashString+=`?${filterString}`
		}
	}

	window.location.hash=hashString
}

function getPageInfos(h=null){
	var p={
		module:'',
		icon:'',
		title:'',
		funcTitle:'',
		breadCrumbs:'',
		breadCrumbsHtml:''

	}
	if(h==null){
		h=hashObj
	}
	var breadCrumbs=[]
	if((h.query.mid || '')==''){
		breadCrumbs=getBreadCrumbsFromPath(global.menu,(h.path)) || []
	}else{
		breadCrumbs=getBreadCrumbs(global.menu,(h.query.mid)) || []
	}
	

	if(breadCrumbs.length>0){
		p.icon=breadCrumbs[breadCrumbs.length-1].icon || ''
		p.title=breadCrumbs[breadCrumbs.length-1].text || ''
		p.module=breadCrumbs[breadCrumbs.length-1].module || ''

		if(h.func!='' && h.func!='index'){
			switch(h.func){
				case 'edit':
				p.funcTitle='Düzenle'
				break
				case 'addnew':
				p.funcTitle='Yeni'
				break
				case 'view':
				p.funcTitle='İzleme'
				break
				case 'print':
				p.funcTitle='Yazdır'
				break
				default:
				p.funcTitle=h.func
				break
			}
			breadCrumbs.push({icon:'',text:p.funcTitle})
		}
		var sbuf=''
		sbuf=breadCrumbs.length>0?breadCrumbs[0].text:''
		p.breadCrumbs+=sbuf
		p.breadCrumbsHtml+=breadCrumbs.length==1?`<span class="font-weight-bold text-orange">${breadCrumbs[0].text}</span>`:sbuf

		sbuf=breadCrumbs.length>1?' \\ ' + breadCrumbs[1].text:''
		p.breadCrumbs+=sbuf
		p.breadCrumbsHtml+=breadCrumbs.length==2?` \\ <span class="font-weight-bold text-orange">${breadCrumbs[1].text}</span>`:sbuf

		sbuf=breadCrumbs.length>2?' \\ ' + breadCrumbs[2].text:''
		p.breadCrumbs+=sbuf
		p.breadCrumbsHtml+=breadCrumbs.length==3?` \\ <span class="font-weight-bold text-orange">${breadCrumbs[2].text}</span>`:sbuf

		sbuf=breadCrumbs.length>3?' \\ ' + breadCrumbs[3].text:''
		p.breadCrumbs+=sbuf
		p.breadCrumbsHtml+=breadCrumbs.length==4?` \\ <span class="font-weight-bold text-orange">${breadCrumbs[3].text}</span>`:sbuf

		sbuf=breadCrumbs.length>4?' \\ ' + breadCrumbs[4].text:''
		p.breadCrumbs+=sbuf
		p.breadCrumbsHtml+=breadCrumbs.length==5?` \\ <span class="font-weight-bold text-orange">${breadCrumbs[4].text}</span>`:sbuf
		
	}
	return p
}

function getModulePageName(){
	var pageName='page'
	var dizi=hashObj.path.split('/')
	var c=0
	dizi.forEach((e)=>{
		if(e!=''){
			if(c==2){
				return
			}else{
				pageName+='_' + e
				c++
			}
		}
	})

	return pageName
}


var pageSettings={
	setItem:function(param,value){
		try{
			var obj=JSON.parse(localStorage.getItem(`${getModulePageName()}`) || '{}')
			obj[param]=value
			localStorage.setItem(`${getModulePageName()}`,JSON.stringify(obj))
		}catch(err){
			showError(err)
		}
	},
	getItem:function(param){
		try{
			var obj=JSON.parse(localStorage.getItem(`${getModulePageName()}`) || '{}')
			if(obj[param]==undefined)
				obj[param]=null

			return obj[param]
		}catch(err){
			showError(err)
			return null
		}

	}
}

function helpButton(item){
	if((item.help || '')!=''){
		var helpUrl=item.help 
		//manipulateUrl(item.help)

		return `<a href="javascript:openInNewTab('${helpUrl}')" class="skip-enter-next text-primary bold ms-2" title="Yardım ve açıklama için tıklayınız"><i class="far fa-question-circle"></i></a>`
	}else{
		return ''
	}
}

function maxLookupLength(lookup){
	var max=0
	Object.keys(lookup).forEach((key)=>{
		if(lookup[key].length>max)
			max=lookup[key].length
	})
	return max
}

function generateFormName(name){ 
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

function generateFormId(name) { 
	if(typeof name=='string')
		return name.replaceAll('.','_')
	else
		return ''
}

function loadCardCollapses(){
	var kartlar=document.getElementsByClassName('card-collapse')
	var i=0
	while(i<kartlar.length){
		if(pageSettings.getItem(`collapse_${kartlar[i].id}`)){
			$(`#${kartlar[i].id}`).collapse(pageSettings.getItem(`collapse_${kartlar[i].id}`))			
		}
		i++
	}

	$('.card-collapse').on('show.bs.collapse',(e)=>{
		pageSettings.setItem(`collapse_${e.target.id}`,e.type)

	})
	$('.card-collapse').on('hide.bs.collapse',(e)=>{
		pageSettings.setItem(`collapse_${e.target.id}`,e.type)

	})

	$('.modal .card-collapse').on('show.bs.collapse',(e)=>{
		pageSettings.setItem(`collapse_${e.target.id}`,e.type)
	})
	$('.modal .card-collapse').on('hide.bs.collapse',(e)=>{
		pageSettings.setItem(`collapse_${e.target.id}`,e.type)
	})
}


function getAjax(url,labelStr='{name}',exceptId='',cb){

	$.ajax({
		url:url,
		type:'GET',
		dataType: 'json',
		success: function(result) {
			if(result.success){
				var dizi=[]

				if(result.data.docs!=undefined){
					result.data.docs.forEach((e)=>{

						var text=replaceUrlCurlyBracket(labelStr, e)
						dizi.push({label:text,value:text,obj:e})
					})
				}else{
					if(Array.isArray(result.data)){
						result.data.forEach((e)=>{
							var text=replaceUrlCurlyBracket(labelStr, e)
							dizi.push({label:text,value:text,obj:e})
						})
					}else{
						var text=replaceUrlCurlyBracket(labelStr, result.data)
						dizi.push({label:text,value:text,obj:result.data})
					}
				}

				if(cb)
					cb(null,dizi)
			}else{
				if(cb)
					cb(result.error)
			}
		},
		error:function(err){
			if(cb)
				cb(err)
		}
	})
}


function remoteLookupAutocomplete(locals){
	
	if(locals.dataSource==undefined)
		return

	var searchUrl=''
	if((locals.dataSource.search || '')!=''){
		searchUrl=replaceUrlCurlyBracket(locals.dataSource.search, {_id:locals.value})

	}else if((locals.dataSource.url || '')!=''){
		searchUrl=replaceUrlCurlyBracket(locals.dataSource.url, {_id:locals.value})
		if(searchUrl.indexOf('?')<0){
			searchUrl+='?search={search}'
		}else{
			searchUrl+='&search={search}'
		}
	}
	var idUrl=''
	if(locals.dataSource.id || locals.dataSource.idUrl){
		idUrl=replaceUrlCurlyBracket(locals.dataSource.id  || locals.dataSource.idUrl, {_id:locals.value})

	}else if(locals.dataSource.url){
		idUrl=replaceUrlCurlyBracket(locals.dataSource.url, {_id:locals.value})
		if(idUrl.indexOf('?')<0){
			idUrl+=`/${locals.value}`
		}else{
			idUrl+=`&id=${locals.value}`
		}
	}


	if(searchUrl=='' || idUrl==''){
		return
	}

	var labelStr=(locals.dataSource.label || '{name}')
	var valueText=locals.valueText || ''


	$(`#${locals.id}-autocomplete-text`).autocomplete({
		source:function(request,response){
			var typedText=encodeURIComponent2(request.term)
			var url=searchUrl.replace('{search}',typedText).replace('{search}',typedText).replace('{mid}',q.mid)

			getAjax(url,`${labelStr}`,``,(err,result)=>{
				if(!err){
					response(result)
				}else{
					console.error(err)
					response([])
				}
			})
		},
		select: function (event, ui) {
			$(`#${locals.id}-autocomplete-text`).val((ui.item.label || ''))
			$(`input[name="${locals.name}"]`).val(ui.item.obj._id.toString())
			$(`#${locals.id}-obj`).val(encodeURIComponent2(JSON.stringify(ui.item.obj)))
			if(locals.lookupTextField){
				$(`input[name="${locals.lookupTextFieldName}"]`).val((ui.item.label || ''))
				$(`#${locals.id}-original-text`).html((ui.item.label || ''))
				$(`#${locals.id}-original-text`).attr('title',(ui.item.label || ''))
			}
			if(locals.onchange){
				eval(`${locals.onchange}`)
			}
			return false
		}
	})


	$(`#${locals.id}-autocomplete-text`).on('change',()=>{

		if($(`#${locals.id}-autocomplete-text`).val()==''){
			$(`input[name="${locals.name}"]`).val('')
			$(`#${locals.id}-obj`).val('')
			if(locals.lookupTextField){
				$(`#${locals.id}-original-text`).html('')
				$(`#${locals.id}-original-text`).attr('title','')
			}
		}
		if(locals.lookupTextField){
			$(`input[name="${locals.lookupTextFieldName}"]`).val($(`#${locals.id}-autocomplete-text`).val())
		}
	})


	if((locals.value || '')!=''){
		var url=idUrl.replace('{mid}',q.mid)
		getAjax(url,`${labelStr}`,``,(err,result)=>{
			if(!err){
				if(result.length>0){
					if(valueText==''){
						$(`#${locals.id}-autocomplete-text`).val((result[0].label || ''))
					}

					$(`input[name="${locals.name}"]`).val(result[0].obj._id.toString())
					$(`#${locals.id}-obj`).val(encodeURIComponent2(JSON.stringify(result[0].obj)))

					if(locals.lookupTextField){
						$(`#${locals.id}-original-text`).html((result[0].label || ''))
						$(`#${locals.id}-original-text`).attr('title',(result[0].label || ''))
					}

				}else{
					if(valueText=='')
						$(`#${locals.id}-autocomplete-text`).val('')
					$(`input[name="${locals.name}"]`).val('')
					$(`#${locals.id}-obj`).val('')
					$(`#${locals.id}-original-text`).html('')
					$(`#${locals.id}-original-text`).attr('title','')
				}

			}else{
				$(`#${locals.id}-autocomplete-text`).val('')
				$(`#${locals.id}-autocomplete-text`).attr('placeholder',`Hata:${err.message}`)
			}
		})

	}
}



function cboEasyDateChange(value){

	var date1=new Date()
	var date2=new Date()
	date1.setHours(0, 0, 0, 0)
	date1.setMinutes(-1*(new Date()).getTimezoneOffset())
	date2.setHours(0, 0, 0, 0)
	date2.setMinutes(-1*(new Date()).getTimezoneOffset())

	switch(value){
		case 'today':
		break
		case 'thisWeek':
		date1=date1.addDays(-1 * (date1.getDay()-1))
		date2=date2.addDays(7- date2.getDay())
		break
		case 'thisMonth': 
		date1=date1.addDays(-1 * (date1.getDate()-1))
		date2=date2.lastThisMonth()
		break
		case 'lastMonth': 
		date1=new Date((new Date(date1.setMonth(date1.getMonth()-1))).setDate(1))
		date2=date1.lastThisMonth()
		break
		case 'last1Week':
		date1=date1.addDays(-7)
		break

		case 'last1Month':
		date1=new Date(date1.setMonth(date1.getMonth()-1))
		break
		case 'last3Months':
		date1=new Date(date1.setMonth(date1.getMonth()-3))
		break
		case 'last6Months':
		date1=new Date(date1.setMonth(date1.getMonth()-6))
		break
		case 'thisYear':
		date1=new Date(date1.getFullYear(),0,1)
		date2=new Date(date2.getFullYear(),11,31)
		break
		case 'last1Year':
		date1=new Date(date1.setMonth(date1.getMonth()-12))
		break
		default:
		break
	}
	return {
		date1:date1.yyyymmdd(),
		date2:date2.yyyymmdd()
	}
}


function replaceUrlCurlyBracket(url,item){
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
		var e2=e.replace('.toLowerCase()','').replace('.toUpperCase()','')
		var value=getPropertyByKeyPath(item,e2)
		
		if(value){
			if(e.indexOf('.toLowerCase()')>-1){
				value=value.toLowerCase()
			}
			if(e.indexOf('.toUpperCase()')>-1){
				value=value.toUpperCase()
			}
		}
		
		url=url.replaceAll(`{${e}}`,value)
	})

	return url
}


function getPropertyByKeyPath(targetObj, keyPath, defaultValue) {
	if(targetObj==undefined || targetObj==null || !keyPath)
		return defaultPropertyValue(targetObj,defaultValue)

	if(keyPath.substr(0,1)=='/')
		keyPath=keyPath.substr(1)
	if(keyPath.substr(0,2)=='./')
		keyPath=keyPath.substr(2)
	keyPath=keyPath.replaceAll('/','.')

	var keys = keyPath.split('.')
	if(keys.length == 0) 
		return defaultPropertyValue(undefined,defaultValue)
	keys = keys.reverse()
	var subObject = targetObj
	while(keys.length) {
		var k = keys.pop()
		if(typeof subObject[k]=='undefined' || subObject[k]==null) {
			return defaultPropertyValue(undefined,defaultValue)
		} else {
			subObject = subObject[k]
		}
	}


	

	return defaultPropertyValue(subObject,defaultValue)
}

function defaultPropertyValue(subObject,defaultValue){
	if(!subObject && defaultValue!=undefined){
		if(typeof defaultValue=='string'){
			let s1=defaultValue.indexOf('${')
			let s2=defaultValue.indexOf('}',s1)
			if(s1>-1 && s2>-1){
				let s=eval('`'+defaultValue + '`')
				subObject=s
			}else{
				subObject=defaultValue
			}
		}else{
			subObject=defaultValue
		}
	}
	return subObject
}

function getFormData(divId){
	var obj=listObjectToObject($(`${divId}`).serializeArray().reduce((obj, item) => ({ ...obj, ...{ [item.name.replaceAll('[','.').replaceAll(']','')]: item.value } }), {}))
	$(`${divId} input[type=checkbox]`).each(function(){
		if(this.name){
			var key=this.name
			key=key.replaceAll('[','').replaceAll(']','.')
			if(key.substr(-1)=='.'){
				key=key.substr(0,key.length-1)
			}
			obj[key] = this.checked
		}
	})
	return obj
}

function getRemoteData(item,cb){
	
	var data=item.value || ''

	if(item.value==undefined){
		switch(item.type){
			case 'grid':
			data=[]
			break
			case 'form':
			data={}
			break
			case 'filter':
			data={}
			break

			case 'number':
			case 'money':
			data=0
			break
			case 'boolean':
			data=false
			break
			default:
			data=''
			break
		}
	}

	if(item.dataSource==undefined){
		return cb(null,data)
	}

	var url=''
	if(hashObj.func=='print'){
		url=item.dataSource.printUrl || item.dataSource.url
	}else{
		url=item.dataSource.url
	}

	var bHashParamsEkle=false
	if(hashObj.func=='addnew'){
		return cb(null,item)
	}else{
		if(hashObj.id){
			url=`${url.split('?')[0]}/${hashObj.id}`
			if(url.split('?')[1]){
				url+='?' + url.split('?')[1]
			}
		}
	}
	var filterString=''
	Object.keys(hashObj.query).forEach((key)=>{
		if(key!='mid'){
			if(filterString!='')
				filterString+='&'
			filterString+=`${key}=${encodeURIComponent2(hashObj.query[key])}`
		}
	})
	if(filterString!=''){
		url+=`${url.indexOf('?')>-1?'&':'?'}${filterString}`
	}
	
	$.ajax({
		url:url,
		type:item.dataSource.method || 'GET',
		dataType: 'json',
		success: function(result) {
			if(result.success==undefined){
				if(Array.isArray(result)){
					data.docs=result
					data.paging={
						page:1,
						pageCount:1,
						pageSize:10,
						recordCount:result.length
					}
				}else{
					data=result
				}
				cb(null,data)
			}else if(result.success){
				data=result.data
				cb(null,data)
			}else{
				cb(result.error)
			}
		},
		error:function(err){
			cb(err)
		}
	})

}

function silinecek___getRemoteData_eski(item,cb){
	
	var data={
		value:item.value || ''
	}
	if(item.value==undefined){
		switch(item.type){
			case 'grid':
			data.value=[]
			break
			case 'form':
			data.value={}
			break
			case 'filter':
			data.value={}
			break

			case 'number':
			case 'money':
			data.value=0
			break

			default:
			data.value=''
			break
		}
	}

	if(item.dataSource==undefined){
		return cb(null,data)
	}

	var url=''
	if(hashObj.func=='print'){
		url=item.dataSource.printUrl || item.dataSource.url
	}else{
		url=item.dataSource.url
	}

	var bHashParamsEkle=false
	if(hashObj.func=='addnew'){
		return cb(null,item)
	}else{
		if(hashObj.id){
			url=`${url.split('?')[0]}/${hashObj.id}`
			if(url.split('?')[1]){
				url+='?' + url.split('?')[1]
			}
		}
	}
	var filterString=''
	Object.keys(hashObj.query).forEach((key)=>{
		if(key!='mid'){
			if(filterString!='')
				filterString+='&'
			filterString+=`${key}=${encodeURIComponent2(hashObj.query[key])}`
		}
	})
	if(filterString!=''){
		url+=`${url.indexOf('?')>-1?'&':'?'}${filterString}`
	}
	
	$.ajax({
		url:url,
		type:item.dataSource.method || 'GET',
		dataType: 'json',
		success: function(result) {
			
			if(result.success==undefined){
				data.value=result
				if(Array.isArray(result)){
					data.paging={
						page:1,
						pageCount:1,
						pageSize:10,
						recordCount:result.length
					}
				}
				cb(null,data)
			}else if(result.success){
				if(result.data.docs){
					data.value=result.data.docs
					data.paging={
						page:result.data.page,
						pageCount:result.data.pageCount,
						pageSize:result.data.pageSize,
						recordCount:result.data.recordCount
					}
				}else{
					data.value=result.data
				}

				cb(null,data)
			}else{
				cb(result.error)
			}
		},
		error:function(err){
			cb(err)
		}
	})

}

function cariKart_changed(prefix){
	var fieldList=[
	"person.firstName.value",
	"person.familyName.value",
	"partyIdentification.0.ID.value",
	"partyIdentification.0.ID.attr.schemeID",
	"partyTaxScheme.taxScheme.name.value",
	"postalAddress.streetName.value",
	"postalAddress.buildingNumber.value",
	"postalAddress.buildingName.value",
	"postalAddress.blockName.value",
	"postalAddress.room.value",
	"postalAddress.citySubdivisionName.value",
	"postalAddress.district.value",
	"postalAddress.cityName.value",
	"postalAddress.region.value",
	"postalAddress.country.identificationCode.value",
	"postalAddress.country.name.value",
	"postalAddress.postalZone.value",
	"contact.telephone.value",
	"contact.telefax.value",
	"contact.electronicMail.value",
	"websiteURI.value"
	]

	var cari=$(`#${generateFormId(prefix+'.party._id')}-obj`).val()
	if(cari==undefined)
		return
	var obj=JSON.parse(decodeURIComponent(cari))

	
	fieldList.forEach((e)=>{
		var componentFieldName=`${prefix}.party.${e}`

		var value=getPropertyByKeyPath(obj,e)
		if(value!=undefined){
			if($(`#${generateFormId(componentFieldName)}`).val()!=undefined){
				$(`#${generateFormId(componentFieldName)}`).val(value)
			}
		}
	})

	if(($(`#${generateFormId(prefix + '.party.postalAddress.country.identificationCode.value')}`).val() || '')==''){
		$(`#${generateFormId(prefix + '.party.postalAddress.country.identificationCode.value')}`).val('TR')

	}
}

function countryCode_changed(prefix){
	var fieldName=`${prefix}postalAddress.country.identificationCode.value`
	var fieldNameCountryName=`${prefix}postalAddress.country.name.value`
	var countryCode=$(`#${generateFormId(fieldName)}`).val() || ''
	var countryText=$(`#${generateFormId(fieldName)} option:selected`).text() || ''

	if(countryCode!=''){
		$(`#${generateFormId(fieldNameCountryName)}`).val(countryText)

	}
}

function formSave(dataSource,formData){
	var url=dataSource.url
	var method='GET'
	if(hashObj.func=='addnew'){
		method='POST'
	}else if(hashObj.func=='edit' && hashObj.id){
		method='PUT'
		url=`${url.split('?')[0]}/${hashObj.id}`
		if(url.split('?')[1]){
			url+='?' + url.split[1]
		}
	}else{
		method='PUT'
	}

	if(method=='POST'){
		pageSettings.setItem('lastRecord',formData)
	}
	
	$.ajax({
		url:url,
		type:method,
		data:formData,
		dataType: 'json',
		success: function(result) {
			if(result.success){
				if(hashObj.func=='index'){
					alertX('Kayıt başarılı :-)')
				}else{
					var h=Object.assign({},hashObj,{func:'index',query:{page:1}})
					setHashObject(h)
				}
				
			}else{
				showError(result.error)
			}
		},
		error:function(err){
			showError(err)
		}
	})
}

function collectFieldList(item){
	var fieldList={}
	if(item.tabs){
		item.tabs.forEach((tab)=>{
			if(tab.fields){
				var f=collectFieldList(tab.fields)
				fieldList=Object.assign({},fieldList,f)
			}
		})

	}else if(item.fields){

		Object.keys(item.fields).forEach((key)=>{
			if(item.fields[key].fields){
				var f=collectFieldList(item.fields[key])

				if(item.fields[key].type=='grid'){

					Object.keys(f).forEach((k)=>{
						f[k].id=f[k].id || generateFormId(key + '.' + k)
						f[k].name=f[k].name || generateFormName(key + '.' + k)
					})
					var f2={}
					f2[key]=f
					fieldList=Object.assign({},fieldList,f2)
				}else{
					Object.keys(f).forEach((k)=>{
						f[k].id=f[k].id || generateFormId(k)
						f[k].name=f[k].name || generateFormName(k)
					})
					fieldList=Object.assign({},fieldList,f)
				}

			}else{
				fieldList[key]=item.fields[key]
				fieldList[key].id=fieldList[key].id || generateFormId(key)
				fieldList[key].name=fieldList[key].name || generateFormName(key)
			}
		})
	}
	return fieldList
}


function refreshRemoteList(remoteList){

	Object.keys(remoteList).forEach((e)=>{
		var idList=[]
		Object.keys(remoteList[e].list).forEach((key)=>{
			idList.push(key)
		})

		var url=`${remoteList[e].dataSource.url.split('?')[0]}/${idList.join(',')}`
		getAjax(url, remoteList[e].dataSource.label || '{name}','',(err,dizi)=>{
			if(!err){

				Object.keys(remoteList[e].list).forEach((key)=>{
					dizi.forEach((d)=>{
						if(d.obj._id==key){
							$(remoteList[e].list[key].cellId).html(replaceUrlCurlyBracket((remoteList[e].dataSource.label || '{name}'),d.obj))
							if(remoteList[e].list[key].lookupTextField){

								$(`input[name="${remoteList[e].list[key].lookupTextField}"]`).val(d.value)
							}
						}
					})
				})

			}else{
				console.error('getAjax err:',err)
			}
		})
	})
}

var keyupTimer=0

function runTimer(selector,prefix=''){
	if(keyupTimer==0)
		return

	if(keyupTimer>=2){
		keyupTimer=0
		runFilter(selector,prefix)
	}else{
		keyupTimer++
		setTimeout(()=>{
			runTimer(selector,prefix)
		},1000)
	}
}

function runFilter(selector,prefix=''){
	let h=getHashObject()
	let obj=getDivData(selector,prefix)
	if(obj){
		obj=objectToListObject(obj)
	}

	Object.keys(obj).forEach((key)=>{
		if(h.query[key]!=undefined && obj[key]==''){
			h.query[key]=undefined
			delete h.query[key]
		}else{
			if(obj[key]!=''){
				h.query[key]=obj[key]
			}
		}
	})
	if(h.query.page){
		h.query.page=1
	}

	let bFarkli=false
	if(Object.keys(h.query).length!=Object.keys(hashObj.query).length){
		bFarkli=true
	}else{
		Object.keys(h.query).forEach((key)=>{
			if(h.query[key]!=hashObj.query[key]){
				bFarkli=true
				return
			}
		})
	}


	if(!bFarkli){
		window.onhashchange()
	}else{
		setHashObject(h)
	}
}




function menuLink(path,filter){
	var s=`#${path}`

	if(!filter){
		filter={}
	}
	if(filter){
		var filterString=''
		Object.keys(filter).forEach((key)=>{
			if(filterString!='')
				filterString+='&'
			filterString+=`${key}=${encodeURIComponent2(filter[key])}`
		})
		s+='?' + filterString
	}
	return s
}

function openPage(url,title){
	history.pushState('', 'New Page Title', '${s}')
}

var q=getAllUrlParams()

function getAllUrlParams(query=null){
	var q={}
	var queryString=query || window.location.search
	if(queryString.substr(0,1)!='?'){
		queryString='?' + queryString
	}
	var dizi=queryString.split('&')
	dizi.forEach((d)=>{
		var key=d.split('=')[0]
		if(key[0]=='?')
			key=key.substr(1)

		var value=getUrlParameter(key,queryString)

		if(value!=''){

			q[key]=value
		}
	})
	return q
}

function getUrlParameter(name,query=null) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
	var results=regex.exec(query || location.search)

	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

function generateLeftMenu(leftMenu){
	var mid=hashObj.query.mid || '0'

	var s=``
	leftMenu.forEach((item,index)=>{
		s+=generateMenu(item,mid)
	})
	return s
}

function generateMenu(menu,mid,parent){
	var s=``
	var bActive=false
	if(menu.visible===false)
		return ''
	
	if(typeof menu.nodes!='undefined'){
		if(menu.nodes.length>0){
			bActive=false
			menu.nodes.forEach((e)=>{
				if(e.mId==mid){
					bActive=true
					return
				}
				if(typeof e.nodes!='undefined'){
					e.nodes.forEach((e2)=>{
						if(e2.mId==mid){
							bActive=true
							return
						}
					})
				}
			})
			s=`\n`
			if(bActive){
				s+=`<a class="nav-link ${(parent || '')!=''?'ms-4':''} " href="#" data-bs-toggle="collapse" data-bs-target="#pagesCollapse${menu.mId.replaceAll('.','-')}" aria-expanded="false" aria-controls="pagesCollapse${menu.mId.replaceAll('.','-')}">\n`
			}else{
				s+=`<a class="nav-link ${(parent || '')!=''?'ms-4':''} collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#pagesCollapse${menu.mId.replaceAll('.','-')}" aria-expanded="false" aria-controls="pagesCollapse${menu.mId.replaceAll('.','-')}">\n`
			}

			s+=`<i class="${menu.icon || 'fas fa-table'}"></i>${menu.text} <i class="fas fa-angle-down float-end"></i>
			</a>`

			if(bActive){
				s+=`<div class="collapse show" `
			}else{
				s+=`<div class="collapse" `
			}
			if(parent){
				s+=`id="pagesCollapse${menu.mId.replaceAll('.','-')}" data-bs-parent="#pagesCollapse${parent.mId.replaceAll('.','-')}">`
				s+=`<nav class="nav ms-4 accordion" id="navId${menu.mId.replaceAll('.','-')}">
				`
			}else{
				s+=`id="pagesCollapse${menu.mId.replaceAll('.','-')}" data-bs-parent="#sidenavAccordion">`
				s+=`<nav class="nav accordion" id="navId${menu.mId.replaceAll('.','-')}">
				`
			}

			
			menu.nodes.forEach((e)=>{
				s+=generateMenu(e,mid,menu)
			})
			s+=`
			</nav>
			</div>`
		}
		return s
	}else{
		if(menu.mId==mid){
			bActive=true
		}
		s=`\n`

		var link=menuLink(menu.path,{mid:menu.mId})
		if(menu.path=='/settings/form-options'){
			global.formOptionsLink=link

		}
		s+=`<a id="menu${menu.mId.replaceAll('.','-')}" class="nav-link ${(parent || '')!=''?'ms-4':''} navigation ${bActive?'active':''}" href="${link}">`

		s+=`<i class="${menu.icon || 'fas fa-table'}"></i>${menu.text}
		</a>
		`
		return s

	}
}

function getBreadCrumbs(leftMenu,mid){
	var menuItem=[]

	leftMenu.forEach((m1)=>{
		if(menuItem.length>0)
			return
		if(m1.mId==mid){
			menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
			return
		}

		if(m1.nodes){
			m1.nodes.forEach((m2)=>{

				if(m2.mId==mid){
					menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
					menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
					return
				}
				if(m2.nodes){
					m2.nodes.forEach((m3)=>{
						if(m3.mId==mid){
							menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
							menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
							menuItem.push({text:m3.text,icon:m3.icon, mId:m3.mId, module:m3.module || ''})
							return
						}
						if(m3.nodes){
							m3.nodes.forEach((m4)=>{
								if(m4.mId==mid){
									menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
									menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
									menuItem.push({text:m3.text,icon:m3.icon, mId:m3.mId, module:m3.module || ''})
									menuItem.push({text:m4.text,icon:m4.icon, mId:m4.mId, module:m4.module || ''})
									return
								}
							})
						}
					})
				}
			})
		}
	})

	return menuItem
}

function getBreadCrumbsFromPath(leftMenu,path){
	var menuItem=[]

	leftMenu.forEach((m1)=>{
		if(menuItem.length>0)
			return
		if(m1.path==path){
			menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
			return
		}

		if(m1.nodes){
			m1.nodes.forEach((m2)=>{

				if(m2.path==path){
					menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
					menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
					return
				}
				if(m2.nodes){
					m2.nodes.forEach((m3)=>{
						if(m3.path==path){
							menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
							menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
							menuItem.push({text:m3.text,icon:m3.icon, mId:m3.mId, module:m3.module || ''})
							return
						}
						if(m3.nodes){
							m3.nodes.forEach((m4)=>{
								if(m4.path==path){
									menuItem.push({text:m1.text,icon:m1.icon, mId:m1.mId, module:m1.module || ''})
									menuItem.push({text:m2.text,icon:m2.icon, mId:m2.mId, module:m2.module || ''})
									menuItem.push({text:m3.text,icon:m3.icon, mId:m3.mId, module:m3.module || ''})
									menuItem.push({text:m4.text,icon:m4.icon, mId:m4.mId, module:m4.module || ''})
									return
								}
							})
						}
					})
				}
			})
		}
	})

	return menuItem
}


function changedb(dbId){
	window.location.href=`/changedb?db=${dbId}&r=${window.location.href}`
}

function windowPathToFieldName(path=''){
	if(path=='')
		path=hashObj.path
	if(path.substr(0,1)=='/')
		path=path.substr(1)
	path=path.replaceAll('/','_')
	path=path.replaceAll('-','_')

	return path
}


function programButtons1111(panelButtons=''){
	var prgButtons=[]
	if(hashObj.settings){
		prgButtons=hashObj.settings.programButtons || []
	}
	
	
	if(prgButtons.length==0 && panelButtons=='')
		return ''

	var sbuf=`<div class="button-bar mt-0 p-1 rounded justify-content-start" role="toolbar" aria-label="Toolbar with button groups">\n`
	if(panelButtons!='')
		sbuf +=panelButtons

	if(prgButtons.length>0){
		prgButtons.forEach((e)=>{
			if(e.passive==false){
				var icon=''
				var text=e.text || ''
				if((e.icon || '')!=''){
					icon=e.icon
				}else{
					switch(e.program.type){
						case 'file-importer':
						icon='fas fa-file-import'
						break
						case 'file-exporter':
						icon='fas fa-file-export'
						break
						case 'connector-importer':
						icon='fas fa-cloud-upload-alt'
						break

						case 'connector-exporter':
						icon='fas fa-cloud-download-alt'
						break

						case 'email':
						icon='fas fa-envelope-square'
						break

						case 'sms':
						icon='fas fa-sms'
						break
					}
				}
				sbuf +=`<a class="${e.class || 'btn btn-primary'} me-2" href="javascript:runProgram('${e.program._id}','${e.program.type}')" title="${text}">${icon!=''?'<i class="' + icon + '"></i>':''} ${text}</a>\n`
			}
		})
	}
	sbuf+=`
	<input type="file" name="fileUpload" id="fileUpload" style="visibility:hidden;" accept="*.*" multiple>
	</div>
	`
	return sbuf
}

function programFileUploaderChangeEvent(){
	$("#fileUpload").change(function() {
		var reader  = new FileReader()
		var fileIndex=0
		var files=this.files
		var uploadFiles=[]
		reader.addEventListener("load", function(){

			if(reader.result){
				uploadFiles[uploadFiles.length-1].data=reader.result.split('base64,')[1]
			}
			fileIndex++
			runReader()
		})

		function runReader(){
			if(fileIndex>=files.length){
				document.dispatchEvent(new CustomEvent("file-upload-finished", {detail:uploadFiles}))
				return
			}
			var file=files[fileIndex]
			uploadFiles.push({name:file.name,modifiedDate:file.lastModifiedDate,size:file.size,data:''})

			reader.readAsDataURL(file)
		}

		runReader()
	})
}

var programId=''
var programType=''

document.addEventListener('file-upload-finished', function(event) {
	var data={files:event.detail}
	runProgramAjax(data)
})

function runProgram(_id,type){
	programId=_id
	programType=type
	if(type=='file-importer'){
		$('#fileUpload').trigger('click')
		return
	}
	var list=[]

	$(".checkSingle").each(function() {
		if(this.checked){
			list.push({_id:this.value})
		}
	})
	if(list.length==0)
		return alertX('Hiç kayıt seçilmemiş')
	var data={list:list}
	runProgramAjax(data)
}

function runProgramAjax(data){
	$.ajax({
		url:`/dbapi/programs/run/${programId}`,
		data:data,
		type:'POST',
		dataType: "json",
		success:function(result){
			if(result.success){
				if(typeof result.data=='string'){
					if(programType=='file-exporter'){
						download(`data:application/file;base64,${btoa2(result.data)}`,`export_${(new Date()).yyyymmddhhmmss()}.csv`,'application/file')
						return
					}else if(programType=='connector-exporter'){
						alertX(result.data,(answer)=>{
							
							window.onhashchange()
							
						})
					}else{
						alertX(result.data,(answer)=>{
							window.onhashchange()
							
						})
					}
				}
				
				
			}else{
				showError(result.error)
			}
		},
		error:function(err){
			showError(err)
		}
	})
}

function runPanelButtons(url,method){
	
	var list=[]

	$(".checkSingle").each(function() {
		if(this.checked){
			list.push({_id:this.value})
		}
	})
	if(list.length==0)
		return alertX('Hiç kayıt seçilmemiş')
	var data={list:list}
	$.ajax({
		url:url,
		data:data,
		type:'POST',
		dataType: "json",
		success:function(result){
			if(result.success){
				alertX(result.data,()=>{
					window.onhashchange()
					
				})
				
			}else{
				showError(result.error)
			}
		},
		error:function(err){
			showError(err)
		}
	})
}



function frameYazdir(frameId){
	var mainCtrl=document.getElementById(frameId)
	var iframe = mainCtrl.contentWindow || ( mainCtrl.contentDocument.document || mainCtrl.contentDocument)

	iframe.focus()
	iframe.print()
}

function pencereyiKapat(){
	window.open('','_parent',''); 
	window.close()
}

function anotherViewStyle(divId){
	switch(hashObj.query.view || ''){
		case 'print':
		viewStylePrint(divId)
		break
		case 'plain':
		viewStylePlain(divId)
		break
	}
}

function viewStylePlain(divId){

	$('body').hide()
	$('#title-panel').hide()
	$('.navtop').hide()
	$('#layoutSidenav_nav').hide()
	$('.footer').hide()
	$('#layoutSidenav_content').css('margin-top','0px')
	$('#main-container').removeClass('cerceve1')
	$('#main-container').removeClass('p1')

	$('body').show()
}

function viewStylePrint(divId){

	$('body').hide()
	$('#title-panel').hide()
	$('.navtop').hide()
	$('#layoutSidenav_nav').hide()
	$('.footer').hide()
	$('#layoutSidenav_content').css('margin-top','0px')
	$('#main-container').removeClass('cerceve1')
	$('#main-container').removeClass('p1')
	$(`body #${divId}`).remove()

	var ifrm = document.createElement('iframe')
	ifrm.setAttribute('id', divId)
	ifrm.style.display='block'
	ifrm.style.border='none'
	ifrm.style.height='90vh'
	ifrm.style.width='100vw'
	
	$('body').css('margin',0)

	document.getElementById('main-container').appendChild(ifrm)
	document.getElementById('main-container').innerHTML+=`
	<div class="row m-0 border">
	<div class="col-12 p-2">
	<a class="btn btn-primary ms-3 mt-2" href="javascript:frameYazdir('${divId}')"><i class="fas fa-print"></i> Yazdır</a>
	<a class="btn btn-dark ms-3 mt-2" href="javascript:pencereyiKapat()"><i class="fas fa-times"></i> Kapat</a>
	</div>
	</div>
	`
	$('body').show()
}

function getPageSettings(module){
	if(!global.settings)
		return {}
	var obj=global.settings.find((e)=>{
		if(e.module==module){
			return true
		}else{
			return false
		}
	})

	return obj || {}
}

moment.updateLocale('en', {
	relativeTime : {
		future: "in %s",
		past:   "%s önce",
		s  : 'birkaç saniye',
		ss : '%d saniye',
		m:  "bir dakika",
		mm: "%d dakika",
		h:  "bir saat",
		hh: "%d saat",
		d:  "bir gün",
		dd: "%d gün",
		w:  "bir hafta",
		ww: "%d hafta",
		M:  "bir ay",
		MM: "%d ay",
		y:  "bir yıl",
		yy: "%d yıl"
	}
})


function initIspiyonService(){
	if(!global.ispiyonServiceUrl)
		return
	var socket = io(global.ispiyonServiceUrl,{
		reconnectionDelayMax: 10000
	})
	socket.on('connect', () => {
		socket.emit('I_AM_HERE', global.token,global.dbId)

	})

	socket.on('TOTAL_UNREAD', (count,lastNotifications) => {
		
		if(Number(count)>0){
			$('#unread-notification-count').html(count)
			global.lastNotifications=lastNotifications
		}else{
			$('#unread-notification-count').html('')
			global.lastNotifications=[]
		}
	})

	socket.on('NOTIFY', (text,status,icon) => {
		var message = SnackBar({
			message: (text || '').substr(0,500),
			status: status || 'orange',
			dismissible:true,
			timeout:3000
		})
	})
	socket.on('message', data => {
		console.log('serverdan gelen mesaj:',data)
	})

	$(document).ready(()=>{
		
		$('#alertsDropdown').on('shown.bs.dropdown',()=>{
			
			var s=``
			if(global.lastNotifications){
				global.lastNotifications.forEach((e,index)=>{
					s+=notificationItem(e._id,e.createdDate,e.text,e.status,e.icon)
				})
			}
			$('#last-notifications').html(s)
			$('#unread-notification-count').html('')
			global.lastNotifications=[]
			socket.emit('READ_ALL') //, global.token,global.dbId)

		})

		$('#alertsDropdown').on('hidden.bs.dropdown',()=>{

		})

	})
}

function notificationItem(id,notifyDate,text,status,icon){
	var bgClass='bg-primary'
	switch(status || ''){
		case 'success':
		bgClass='bg-primary'
		icon=icon || 'fas fa-bell'
		break
		case 'error':
		bgClass='bg-danger'
		icon=icon || 'fas fa-times'
		break
		case 'warning':
		bgClass='bg-warning'
		icon=icon || 'fas fa-exclamation-triangle'
		break
	}
	var s=`
	<a id='${id}' class="notification-dropdown-item dropdown-item d-flex align-items-center" href="#">
	<div class="me-3">
	<div class="icon-circle ${bgClass}">
	<i class="${icon?icon:'fas fa-bell'} text-white"></i>
	</div>
	</div>
	<div  class="text-truncate" style="max-width:300px" >
	<div class="small text-gray-500">${moment(notifyDate).fromNow()}</div>
	<span>${text}</span>
	</div>
	</a>
	`
	return s
}

function notifyMe(text,status) {
	var message = SnackBar({
		message: text,
		status: status || 'orange',
		dismissible:true,
		timeout:3000
	})
	
}

