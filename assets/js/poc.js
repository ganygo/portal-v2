var rootGridId=0
var remoteList={}

function generatePage(divId,pageJson){
	$(divId).html('')
	$(divId).hide()
	try{
		let dizi=[]
		if(Array.isArray(pageJson)){
			dizi=pageJson
		}else{
			dizi.push(pageJson)
		}

		let index=0
		rootGridId=0
		remoteList={}

		function calistir(cb){
			if(index>=dizi.length){
				return cb()
			}

			let pageSubObj=clone(dizi[index])
			poc_headerButtons(divId,pageSubObj)
			if(pageSubObj.script){
				let scrt=''
				if(Array.isArray(pageSubObj.script)){
					pageSubObj.script.forEach((e)=>{
						scrt+=e + '\r\n'
					})
				}else{
					scrt=pageSubObj.script
				}
				$(divId).append(`<script type="text/javascript">${scrt}<\/script>`)
			}
			getRemoteData(pageSubObj,(err,data)=>{
				if(!err){
					switch((pageSubObj.type || '')){
						case 'filter':
						poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
							if(!err){
								document.querySelector(`${divId} #filterForm`).insertAdjacentHTML('beforeend',`${filterFormButton('#filterForm')}`)
							}
							index++
							setTimeout(calistir,0,cb)
						})
						break

						case 'form':
						poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
							index++
							setTimeout(calistir,0,cb)
						})
						break

						case 'grid':
						poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
							index++
							setTimeout(calistir,0,cb)
						})
						break

						default:
						index++
						setTimeout(calistir,0,cb)
						break
					}
				}else{
					cb(err)
				}
			})
		}


		calistir((err)=>{
			if(err){
				$(divId).html(`Hata:${err.code || err.name || ''} ${err.message || ''}`)
				if(err.code=='SESSION_NOT_FOUND'){
					confirmX('Oturum sonlandırılmış. Yeniden giriş yapmak istiyor musunuz?',(answer)=>{
						if(answer){
							window.location.href=`/login?ret=${window.location.href}`
						}
					})
					//window.location.href=`/changedb?sid=${global.sessionId}&r=${window.location.href}`
				}
			}
			loadCardCollapses()
			$(document).trigger('loaded')
			$(divId).show()
		})
	}catch(tryErr){
		$(divId).html(`Hata:${tryErr.name || ''} ${tryErr.message || ''}`)
		$(divId).show()
	}
}

function poc_headerButtons(divId,pageSubObj){
	let hbtn=``
	if(pageSubObj.type=='form'){
		hbtn=`
		<button id="headerButtonSave" class="btn btn-primary btn-form-header" title="Kaydet"><i class="fas fa-save"></i></button>
		<a href="javascript:history.back(-1)" class="btn btn-dark  btn-form-header ms-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
		if(pageSubObj.options){
			if(pageSubObj.options.mode=='view'){
				hbtn=`<a href="javascript:history.back(-1)" class="btn btn-dark  btn-form-header ms-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
			}
		}
	}

	$('#headerButtons').html(hbtn)

	$('#headerButtonSave').on('click',()=>{
		var formData=getFormData(`${divId}`)

		formSave(pageSubObj.dataSource,formData)
	})
}

function poc_pageFilter(divId, pageSubObj, cb){
	getRemoteData(pageSubObj,(err,data)=>{
		if(!err){
			poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
				if(!err){
					document.querySelector(`${divId} #filterForm`).insertAdjacentHTML('beforeend',`${filterFormButton('#filterForm')}`)
				}
				cb(err)
			})
		}else{
			cb(err)
		}
	})
}

function poc_pageGrid(divId, pageSubObj, cb){
	getRemoteData(pageSubObj,(err,data)=>{
		if(!err){
			poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
				cb(err)
			})

		}else{
			cb(err)
		}
	})
}

function poc_pageForm(divId, pageSubObj, cb){

	getRemoteData(pageSubObj,(err,data)=>{
		if(!err){
			poc_generateControl(divId,pageSubObj,data,true,false,(err)=>{
				cb(err)
			})
		}else{
			cb(err)
		}
	})
}


function poc_generateControl(divId,item,data,bRoot,insideOfModal,cb){

	var autocol=item.options?(item.options.autocol===true?true:false):false
	var queryValues=item.options?(item.options.queryValues===true?true:false):false
	if(item.fields){
		Object.keys(item.fields).forEach((key)=>{

			item.fields[key].field=key
			item.fields[key]=itemDefaultValues(item.fields[key],autocol,insideOfModal,queryValues)
			if(item.fields[key].type=='grid'){
				item.fields[key].parentField=key

			}
		})
	}else if(item.tabs){
		item.tabs.forEach((tab)=>{
			if(tab.fields){
				Object.keys(tab.fields).forEach((key)=>{
					tab.fields[key].field=key
					tab.fields[key]=itemDefaultValues(tab.fields[key],autocol,insideOfModal,queryValues)
					if(tab.fields[key].type=='grid'){
						tab.fields[key].parentField=key

					}
				})
			}
		})
	}

	item.insideOfModal=insideOfModal

	switch((item.type || '').toLowerCase()){
		case 'hidden' :
		item.value=getPropertyByKeyPath(data,item.field, item.value)
		poc_InputHidden(divId,item,cb)
		break
		case 'string' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TextBox(divId,item,cb)
		break
		case 'number' :
		item.value=getPropertyByKeyPath(data,item.field, item.value)
		if(item.value==undefined){
			item.value=0
		}
		poc_NumberBox(divId,item,cb)
		break

		case 'money' :
		if(item.readonly){
			let buf=getPropertyByKeyPath(data,item.field, item.value)
			if(buf==undefined){
				buf=0
			}
			item.value=Number(buf) //.formatMoney()
			item.class+=' text-end'

			poc_MoneyBox(divId,item,cb)
		}else{
			item.value=getPropertyByKeyPath(data,item.field, item.value)
			if(item.value==undefined){
				item.value=0
			}

			poc_MoneyBox(divId,item,cb)
		}
		break

		case 'identity' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || 0
		item.readonly=true
		poc_NumberBox(divId,item,cb)
		break
		case 'date' : 
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_DateBox(divId,item,cb)
		break
		case 'time' : 
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TimeBox(divId,item,cb)
		break
		case 'filebase64image' :
		case 'image' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_ImageBox(divId,item,cb)
		break
		case 'filebase64' :
		case 'file' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_FileBox(divId,item,cb)
		break
		case 'strings':
		case 'textarea':
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TextareaBox(divId,item,cb)
		break
		case 'code':
		item.rows=item.rows || 40
		item.encoding=item.encoding || 'base64'
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TextareaBox(divId,item,cb)
		break
		case 'json':
		item.rows=item.rows || 40
		item.encoding=item.encoding || 'base64'
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TextareaBox(divId,item,cb)
		break
		case 'button' : 
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_Button(divId,item,cb)
		break
		case 'lookup' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_Lookup(divId,item,cb)
		break
		case 'html' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_FormHtml(divId,item,cb)

		break
		case 'label' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_Label(divId,item,cb)
		break
		case 'remotelookup' : 
		item.value=getPropertyByKeyPath(data,item.field, item.value)
		if(item.lookupTextField){
			item.valueText=getPropertyByKeyPath(data,item.lookupTextField) || item.valueText || ''
		}
		poc_RemoteLookup(divId,item,cb)
		break
		case 'boolean' :
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_CheckBox(divId,item,cb)
		break
		case 'daterange' : 
		poc_DateRangeBox(divId,item,cb)
		break
		case 'w-100': 
		case 'w100': 
		case 'divisor': 
		document.querySelector(divId).insertAdjacentHTML('beforeend',`<div class="w-100"></div>`)
		cb()
		break
		case 'grid':

		if(bRoot){
			item.value=data
			poc_Grid(divId,item, bRoot,insideOfModal,cb)
		}else{
			let orjinalId=item.id
			item.id=`card-${item.id}`
			poc_Card(divId,item,()=>{
				item.value=getPropertyByKeyPath(data,item.field,[])
				item.id=orjinalId
				poc_Grid(`${divId} #card-${item.id}`,item, bRoot,insideOfModal,cb)
			})
		}



		break
		case 'filter':

		if(item.fields){
			document.querySelector(divId).insertAdjacentHTML('beforeend',`<div class="col-12 p-0"><div id="filterForm" class="row m-0"></div></div>`)

			let dizi=Object.keys(item.fields)
			let index=0

			function calistir1(cb1){
				if(index>=dizi.length){
					cb1()
				}else{
					let key=dizi[index]
					item.fields[key].value=hashObj.query[key] || item.fields[key].value || ''
					item.fields[key].showAll=true
					item.fields[key].class='my-0'

					poc_generateControl('#filterForm',item.fields[key],data,false,insideOfModal,()=>{
						index++
						setTimeout(calistir1,0,cb1)
					})
				}
			}

			calistir1(cb)

		}else{
			cb()
		}

		break
		case 'tab':
		case 'form':
		case 'group':
		case 'modal':
		let dizi=[]
		let index=0

		function calistir2(fields,connDivId,cb1){
			if(index>=dizi.length){
				return cb1()
			}
			let key=dizi[index]

			poc_generateControl(connDivId,fields[key],data,false,insideOfModal,()=>{
				index++
				setTimeout(()=>{
					calistir2(fields,connDivId,cb1)
				},0)
			})
		}

		if(item.fields){
			dizi=Object.keys(item.fields)
			index=0
			if(bRoot || item.type=='modal'){
				document.querySelector(divId).insertAdjacentHTML('beforeend',`<div class="row m-0"></div>`)
				calistir2(item.fields,`${divId} .row`,cb)
			}else{
				poc_Card(divId,item,()=>{
					calistir2(item.fields,`${divId} #${item.id}`,cb)
				})
			}
		}else if(item.tabs){
			item.id=item.id || 'tabForm'
			item.tabs.forEach((tab,tabIndex)=>{
				tab.id=tab.id || `${item.id}_tab${tabIndex}`
			})

			poc_Tab(divId,item,()=>{
				let tabIndex=0
				function calistirTab(cb1){
					if(tabIndex>=item.tabs.length){
						return cb1()
					}
					let tab=item.tabs[tabIndex]
					if(tab.fields){
						dizi=Object.keys(tab.fields)
						index=0
						calistir2(tab.fields,`${divId} #${tab.id}`,()=>{
							tabIndex++
							setTimeout(calistirTab,0,cb1)
						})
					}else{
						tabIndex++
						setTimeout(calistirTab,0,cb1)
					}
				}

				calistirTab(cb)
			})
		}


		break

		default:
		item.value=getPropertyByKeyPath(data,item.field, item.value) || ''
		poc_TextBox(divId,item,cb)
		break
	}

}


function filterFormButton(divId){
	var s=`
	<div class="ms-auto col text-end pt-2 pt-md-4">
	<a href="javascript:runFilter('${divId}')" class="btn btn-primary text-nowrap" title="Filtrele" ><i class="fas fa-sync-alt"><i class="fas fa-filter ms-2"></i></i></a>
	</div>
	`

	return s
}

function itemDefaultValues(item,autocol=false,insideOfModal=false,queryValues=false){
	var field=item.field || ''
	var lookupTextField=item.lookupTextField || ''
	if(item.parentField){
		field=`${item.parentField}.${field}`
	}
	if(item.lookupTextField){
		var lookupTextField=item.lookupTextField
		if(item.parentField){
			lookupTextField=`${item.parentField}.${item.lookupTextField}`
		}
		item.lookupTextFieldId=generateFormId(lookupTextField)
		item.lookupTextFieldName=generateFormName(lookupTextField)

	}
	item.id=generateFormId(field)

	item.name=generateFormName(field)
	item.title=item.title || ''
	item.icon=item.icon || ''

	item.type=item.type || ''

	if(item.type=='' && item.fields){
		item.type='group'
	}
	if(item.type=='' && item.tabs){
		item.type='tab'
	}

	if(!isNaN(item.col)){
		item.col='col-md-' + item.col
	}else{
		if(autocol){
			switch(item.type.toLowerCase()){
				case 'identity':
				item.col='col-md-1'
				break
				case 'number':
				case 'money':
				item.col='col-md-2'
				break
				case 'remotelookup':
				item.col='col-md-6'
				break
				case 'lookup':
				item.col='col-md-2'
				if(maxLookupLength(item.lookup || {})>30){
					item.col='col-md-4'
				}
				break
				case 'boolean':
				item.col='col-md-2'
				break
				case 'grid':
				item.col='col-md-12'
				break
				default:
				item.col='col-md-4'
				break
			}
		}else{
			if(item.type.toLowerCase()=='daterange'){
				item.col=item.col || 'col-md-6'
			}else{
				item.col=item.col || 'col-md-12'
			}

		}
	}


	item.required=item.required==undefined?false:item.required
	item.visible=item.visible==undefined?true:item.visible
	item.collapsed=item.collapsed==undefined?false:item.collapsed


	item.lookup=item.lookup || {}

	if(item.staticValues){
		item.lookup=global.staticValues[item.staticValues] || {}
	}
	item.class=item.class || ''
	item.readonly=item.readonly || false

	if(item.required){
		if(item.title.substr(0,1)!='*'){
			item.title=`*${item.title}`
		}
	}

	item.insideOfModal=insideOfModal
	if(!item.value){

		if(queryValues){
			item.value=hashObj.query[item.field] || ''
		}else if(item.type=='date'){
			item.value=(new Date()).yyyymmdd()
		}else if(item.type=='time'){
			item.value=(new Date()).hhmmss()
		}else if(item.lastRecord===true){
			var lastRecord=pageSettings.getItem('lastRecord')
			if(lastRecord){
				item.value=getPropertyByKeyPath(lastRecord,item.field,item.value)
			}

		}
	}


	return item
}

function formKaydet(dataSource, divId){
	var formData=getFormData(`${divId}`)
	formSave(dataSource,formData)
}

// $('#${divId} input,select').on('change',(e)=>{
// 	var fields=${JSON.stringify(fieldList)}
// 	var valueObj=getDivData('#${divId}')
// 	Object.keys(fields).forEach((key)=>{
// 		if(fields[key].id!=e.target.id && fields[key].calc){
// 			try{
// 				$(\`#\${fields[key].id}\`).val(eval(replaceUrlCurlyBracket(fields[key].calc,valueObj)))
// 			}catch(tryErr){
// 				$(\`#\${fields[key].id}\`).val(replaceUrlCurlyBracket(fields[key].calc,valueObj))
// 			}

// 		}
// 	})
// })

