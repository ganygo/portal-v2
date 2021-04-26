
let lastRecordRow={}

function poc_Grid(parentId,item,bRoot,insideOfModal,cb){
	item=gridDefaults(item,bRoot,insideOfModal)

	let s=``
	s+=`<div id="buttonPanel${item.id}" class="button-bar mt-4 mt-md-0 p-1 rounded justify-content-start" role="toolbar" aria-label="Toolbar with button groups"></div>`
	if(item.options.show.infoRow){
		s+=`
		<div class="border p-1">
		<div class="d-md-flex pt-1 px-1">
		<div class="d-md-flex flex-fill m-0 p-0 mt-1 mb-1">
		${item.options.show.filter?'<a class="btn btn-secondary btn-sm me-md-3" style="max-height:28px;" data-bs-toggle="collapse" href="#filterRow" role="button" aria-expanded="false" aria-controls="filterRow" title="Filtre satırını göster/gizle"><i class="fas fa-filter"></i></a>':''}
		${item.options.show.pageSize?gridPageSize(item,bRoot):''}
		${item.options.show.pageCount?gridPageCount(item,bRoot):''}
		</div>
		${item.options.show.pagerButtons?'<div class="float-right">' + gridPagerButtons(item,bRoot) + '</div>':''}
		</div>
		</div>
		`
	}
	s+=`
	<div id="${item.id}" class="table-responsive p-0 ${item.options.show.infoRow?'mt-1':''}">
	<table id="table${item.id}" class="table table-striped border m-0 ${!bRoot?'table-bordered':''}"  cellspacing="0">
	<tbody>
	</tbody>
	</table>
	</div>
	`

	if(item.options.show.infoRow){
		s+=`
		<div class="border p-1">
		<div class="d-md-flex pt-1 px-1">
		<div class="d-md-flex flex-fill m-0 p-0 mt-1 mb-1">
		<div class="">
		<a class="btn btn-success btn-sm" href="javascript:gridCSVExport('${item.id}')" title="CSV indir"><i class="far fa-file-excel"></i><i class="ms-2 fas fa-download"></i></a>
		</div>
		${item.options.show.pageCount?gridPageCount(item,bRoot):''}
		</div>
		${item.options.show.pagerButtons?'<div class="float-right">' + gridPagerButtons(item,bRoot) + '</div>':''}
		</div>
		</div>
		`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	document.querySelector(`${parentId} #${item.id}`).item=item

	if(bRoot){
		programFileUploaderChangeEvent()
	}

	gridButtonPanel(`${parentId} #buttonPanel${item.id}`,item,bRoot,insideOfModal,()=>{
		gridHeader(`${parentId} #${item.id}`,item,bRoot,insideOfModal,()=>{
			gridBody(`${parentId} #${item.id}`,item,bRoot,insideOfModal,()=>{
				
				$(`#pageSize${item.id}`).on('change',()=>{
					hashObj.query.pageSize=$(`#pageSize${item.id}`).val()
					hashObj.query.page=1
					pageSettings.setItem(`pageSize`,$(`#pageSize${item.id}`).val())
					setHashObject(hashObj)
				})

				$(`#selectAll${item.id}`).on(`change`,(e)=>{
					$(`input:checkbox`).not($(`#selectAll${item.id}`)).prop(`checked`, $(`#selectAll${item.id}`).prop(`checked`))
				})

				if(pageSettings.getItem(`filterButton`)==true){
					$(`#filterRow`).collapse('show');
				}else{
					$(`#filterRow`).collapse('hide');
				}

				$(`#filterRow`).on(`hidden.bs.collapse`, function () {
					pageSettings.setItem(`filterButton`,false)
				})
				$(`#filterRow`).on(`shown.bs.collapse`, function () {
					pageSettings.setItem(`filterButton`,true)
				})


				$(document).on('loaded',function(){
					grid_onchange(item)
				})

				cb()
			})
		})
	})
	
}


function gridButtonPanel(parentId,item,bRoot,insideOfModal,cb){
	var prgButtons=[]
	if(hashObj.settings){
		prgButtons=hashObj.settings.programButtons || []
	}

	if((prgButtons.length==0 && !item.panelButtons) || !bRoot){
		$(parentId).hide()
		return cb()
	}
	$(parentId).show()
	var s=``
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
				s +=`<a class="${e.class || 'btn btn-primary'} me-2" href="javascript:runProgram('${e.program._id}','${e.program.type}')" title="${text}">${icon!=''?'<i class="' + icon + '"></i>':''} ${text}</a>`
			}
		})
	}
	s+=`<input type="file" name="fileUpload" id="fileUpload" style="visibility:hidden;display:none;" accept="*.*" multiple>`
	if(item.panelButtons){
		let dizi=Object.keys(item.panelButtons)
		let index=0
		function calistir(cb1){
			if(index>=dizi.length){
				return cb1()
			}
			let key=dizi[index]
			item.panelButtons[key].noGroup=true
			item.panelButtons[key].class=item.panelButtons[key].class || 'btn btn-primary'
			item.panelButtons[key].class+=' me-2'
			item.panelButtons[key].type='button'
			if(!item.panelButtons[key].href && item.panelButtons[key].dataSource){
				item.panelButtons[key].href=`javascript:runPanelButtons('${item.panelButtons[key].dataSource.url}','${item.panelButtons[key].dataSource.method}')`
			}

			poc_Button(parentId,item.panelButtons[key],()=>{
				index++
				setTimeout(calistir,0,cb1)
			})
		}
		
		calistir(()=>{
			document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
			cb()
		})

	}else{
		document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
		cb()
	}
}


function gridBody(parentId,item,bRoot,insideOfModal,cb){
	
	document.querySelector(`${parentId} table tbody`).innerHTML=''

	if(item.value){
		let list=[]
		if(Array.isArray(item.value)){
			list=item.value
		}else if(item.value.docs){
			list=item.value.docs
		}
		let nextIdentity=list.length+1

		let fieldList=clone(item.fields)
		let s=``

		list.forEach((listItem,rowIndex)=>{
			listItem.rowIndex=rowIndex
			s+=`<tr>`
			if(item.options.selection){
				s+=`<td><input class="grid-checkbox checkSingle" type="checkbox" value="${listItem._id || ''}" /></td>`
			}
			Object.keys(fieldList).forEach((key)=>{
				var field=fieldList[key]
				field.field=key
				field.parentField=item.parentField || ''
				field.class=replaceUrlCurlyBracket(field.class,listItem)
				s+=gridBody_Cell(field,listItem,bRoot,insideOfModal)
			})
			s+=`<td class="text-center text-nowrap">${buttonRowCell(listItem,rowIndex,item,bRoot)}</td>`
			s+=`</tr>`
		})

		document.querySelector(`${parentId} table tbody`).insertAdjacentHTML('beforeend', s)

		
		refreshRemoteList(remoteList)
	}

	grid_onchange(item)

	if(!bRoot){
		if(item.options.buttons.add[0]){
			gridYeniSatir(`${parentId}`,insideOfModal)
		}
	}

	if(cb)
		cb()
}

function gridYeniSatir(parentId,insideOfModal){
	let table=document.querySelector(parentId)
	let tbody=document.querySelector(`${parentId} table tbody`)
	let item=table.item
	let rowIndex=-1
	let newRow=tbody.insertRow()
	let fieldList=clone(item.fields)
	newRow.id=`${table.id}-gridSatir-edit-${rowIndex}`

	Object.keys(fieldList).forEach((key,cellIndex)=>{
		var field=fieldList[key]
		field.field=`${item.field}.${rowIndex}.${key}`
		field.id=generateFormId(field.field)
		field.name=generateFormName(field.field)
		field.noGroup=true
		field.value=''
		field.valueText=''
		var td=newRow.insertCell()
		td.id=field.id


		if(field.lastRecord){
			if(table.item.value.length>0){
				field.value=getPropertyByKeyPath(table.item.value[table.item.value.length-1],key)
			}
		}

		if(field.type=='identity'){
			field.value=tbody.rows.length-1
		}
		if(field.visible===false){
			td.classList.add('hidden')
		}else{
			poc_generateControl(`${parentId} table #${td.id}`,field,{},false,insideOfModal,()=>{})
		}
	})

	let td=newRow.insertCell()
	td.classList.add('text-center')
	td.innerHTML=`<a href="javascript:gridSatirOK('${parentId}','${newRow.id}',${rowIndex},${insideOfModal})" class="btn btn-primary btn-grid-row" title="Tamam"><i class="fas fa-check"></i></a>
	<a href="javascript:gridSatirVazgec('${parentId}','${newRow.id}',${rowIndex},${insideOfModal}) "class="btn btn-dark btn-grid-row" title="Vazgeç"><i class="fas fa-reply"></i></a>
	`
	ilkElemanaFocuslan(`${parentId} #${newRow.id}`)

	editRowCalculation(`${parentId} tbody #${newRow.id}`, `${table.item.parentField}.${rowIndex}`, table.item.fields)
}

function editRowCalculation(selector, prefix, fields){
	
	$(`${selector} input, ${selector} select`).on('change',function(e){
		let valueObj=getDivData(selector,prefix)
		let listObj=objectToListObject(valueObj)
		Object.keys(fields).forEach((key)=>{
			if(fields[key].type=='money' || fields[key].type=='number'){
				if((listObj[key] || '').trim()=='' || isNaN(listObj[key])){
					listObj[key]=0
				}
				listObj[key]=Number(listObj[key])
			}
		})
		valueObj=listObjectToObject(listObj)

		Object.keys(fields).forEach((key)=>{
			if(fields[key].id!=e.target.id && fields[key].calc){
				let id=generateFormId(`${key}`)
				if(prefix!=''){
					id=generateFormId(`${prefix}_${key}`)
				}
				
				try{
					//$(`${selector} #${id}`).attr('type','text')

					let deger=eval(replaceUrlCurlyBracket(fields[key].calc,valueObj))
					if(fields[key].type=='money'){
						$(`${selector} #${id}`).val(Math.round(deger*100)/100)
					}else 	if(fields[key].type=='number'){
						$(`${selector} #${id}`).val(Math.round(deger*1000)/1000)
					}else{
						$(`${selector} #${id}`).val(deger)
					}
					
				}catch(tryErr){
					console.log(`tryErr:`,tryErr)
					$(`${selector} #${id}`).val(0)
					// $(`${selector} #${id}`).val(replaceUrlCurlyBracket(fields[key].calc,valueObj))
				}
			}
		})
	})
}

function gridSatirOK(tableId,rowId,rowIndex,insideOfModal){
	var table=document.querySelector(tableId)
	var satirObj=getDivData(`${tableId} #${rowId}`,`${table.item.field}.${rowIndex}`)
	
	if(rowIndex>-1){
		
		table.item.value[rowIndex]=Object.assign({},table.item.value[rowIndex],satirObj)
	}else{
		table.item.value.push(satirObj)
	}
	
	gridBody(`${tableId}`,table.item,false,insideOfModal,()=>{})
}

function gridSatirVazgec(tableId,rowId,rowIndex,insideOfModal){
	let table=document.querySelector(tableId)
	gridBody(`${tableId}`,table.item,false,insideOfModal,()=>{})
}


function gridSatirDuzenle(tableId,rowIndex, insideOfModal){
	let table=document.querySelector(tableId)
	let thead=document.querySelector(`${tableId} thead`)
	let tbody=document.querySelector(`${tableId} tbody`)
	
	if(rowIndex>-1){
		let trYedek=tbody.rows[rowIndex].cloneNode(true)
		tbody.deleteRow(rowIndex)
		let editRow=tbody.insertRow(rowIndex)
		editRow.id=`${table.id}-gridSatir-edit-${rowIndex}`
		editRow.detail=trYedek

		editRowSekillendir(table.item,editRow,tableId,rowIndex)
		//let fieldList=clone(table.item.fields)

		editRowCalculation(`${tableId} tbody #${editRow.id}`, `${table.item.parentField}.${rowIndex}`, table.item.fields)
		// ilkElemanaFocuslan(`#${tableId} tbody #${editRow.id}`)
	}

	function editRowSekillendir(item,editRow,tableId,rowIndex){
		Object.keys(item.fields).forEach((key,cellIndex)=>{
			var field=item.fields[key]
			field.field=`${item.field}.${rowIndex}.${key}`
			field.id=generateFormId(field.field)
			field.name=generateFormName(field.field)
			field.noGroup=true
			field.value=''
			var td=editRow.insertCell()
			td.id=field.id
			if(field.visible===false){
				td.innerHTML=editRow.detail.cells[cellIndex].innerHTML
				td.classList.add('hidden')


			}else{
				if(editRow.detail.cells[cellIndex].querySelector(`input`)){
					field.value=editRow.detail.cells[cellIndex].querySelector(`input`).value
				}
				if(field.type=='boolean'){
					field.class='grid-checkbox'
					field.value=field.value.toString()==='true'?true:false
				}

				field.valueText=editRow.detail.cells[cellIndex].innerText
				var data={value:{}}
				data.value[field.field]=field.value
				if(field.lookupTextField){
					data.value[field.lookupTextField]=field.valueText
				}
				data.value=listObjectToObject(data.value)

				poc_generateControl(`${tableId} #${td.id}`,field,data.value,false,insideOfModal,()=>{})
			}
		})

		let td=editRow.insertCell()
		td.classList.add('text-center')
		td.innerHTML=`<a href="javascript:gridSatirOK('${tableId}','${editRow.id}',${rowIndex},${insideOfModal})" class="btn btn-primary btn-grid-row" title="Tamam"><i class="fas fa-check"></i></a>
		<a href="javascript:gridSatirVazgec('${tableId}','${editRow.id}',${rowIndex},${insideOfModal}) "class="btn btn-dark btn-grid-row" title="Vazgeç"><i class="fas fa-reply"></i></a>
		`
	}
}



function gridBody_Cell(field,listItem,bRoot,insideOfModal){
	let s=''
	let td=''
	let tdClass=`${field.class || 'ms-1'} `
	let itemValue=''
	if(field.type.toLowerCase()=='identity' || field.type.toLowerCase()=='autoincrement' || field.type.toLowerCase()=='autoinc'){
		itemValue=listItem.rowIndex+1
	}else{
		if(field.html && field.type!='lookup'){
			itemValue=replaceUrlCurlyBracket(field.html,listItem) || ''
		}else{
			itemValue=getPropertyByKeyPath(listItem,field.field,itemValue)
			if(itemValue==undefined){
				itemValue=''
				if(field.type=='number' || field.type=='money'){
					itemValue=0
				}else if(field.type=='boolean'){
					itemValue=false
				}
			}
		}
	}

	switch(field.type.toLowerCase()){
		case 'lookup':
		let valueText=''
		let o=Object.assign({},listItem)
		Object.keys(field.lookup || {}).forEach((key2)=>{
			if(key2===itemValue.toString()){
				td+= field.lookup[key2]
				valueText=field.lookup[key2]
				return
			}
		})
		if(td==''){
			td+=itemValue
		}

		if(field.lookupTextField){
			o[field.lookupTextField]=valueText
			if(!bRoot){
				td+=`<input type="hidden" name="${generateFormName((field.parentField?field.parentField + '.':'') + listItem.rowIndex + '.' + field.lookupTextField)}" value="${valueText}" />`
			}
		}
		if(field.html){

			o[field.field]=itemValue.toString()
			o['valueText']=valueText

			td=replaceUrlCurlyBracket(field.html,o) || ''
		}
		break

		case 'number':
		tdClass=field.class || 'text-end me-1'
		td=Number(itemValue).formatQuantity()
		break

		case 'money':
		tdClass=field.class || 'text-end me-1'
		td=Number(itemValue).formatMoney()
		break
		case 'date':
		td=(new Date(itemValue)).yyyymmdd()
		break
		case 'time':
		td=(new Date(itemValue)).hhmmss()
		break
		case 'datetime':
		td=(new Date(itemValue)).yyyymmddhhmmss()
		break
		case 'fromnow':
		td=moment((new Date(itemValue))).fromNow()
		break
		case 'boolean':
		tdClass=field.class || 'text-center'
		itemValue=(itemValue || '').toString()==='true'?true:false
		td=itemValue?'<i class="fas fa-check-square text-primary font-size-150"></i>':'<i class="far fa-square text-dark font-size-150"></i>'
		break
		case 'remotelookup':
		let bRemoteOlarakBulalim=true
		if(itemValue==undefined){
			itemValue=''
		}
		if(typeof itemValue=='object' && itemValue._id!=undefined){
			td=`<div class="">${replaceUrlCurlyBracket((field.dataSource.label || '{name}'), itemValue)}</div>`
			bRemoteOlarakBulalim=false
		}else	if(field.lookupTextField){
			let valueText=getPropertyByKeyPath(listItem,field.lookupTextField)
			td=`<div class="">${valueText}</div>`
			if(!bRoot){
				td+=`<input type="hidden" name="${generateFormName((field.parentField?field.parentField + '.':'') + listItem.rowIndex + '.' + field.lookupTextField)}" value="${valueText}" />`
			}

			if(valueText=='' && itemValue!=''){
				bRemoteOlarakBulalim=true
			}else{
				bRemoteOlarakBulalim=false
			}
		}

		if(bRemoteOlarakBulalim){
			let cellId=''
			if(itemValue!=''){
				cellId=`${field.id}-cell-${itemValue}`
				if(remoteList==undefined){
					remoteList={}
				}

				if(remoteList[field.field]==undefined){
					remoteList[field.field]={
						dataSource:field.dataSource,
						list:{
						}
					}
				}

				if(remoteList[field.field].list[itemValue]==undefined){
					remoteList[field.field].list[itemValue]={
						cellId:'.' + cellId,
						text:''
					}
					if(field.lookupTextField){
						remoteList[field.field].list[itemValue]['lookupTextField']=`${generateFormName((field.parentField?field.parentField + '.':'') + listItem.rowIndex + '.' + field.lookupTextField)}`
					}
				}
			}
			td+=`<div class="${cellId}">${itemValue?'<span class="text-danger bold">(bulunamadı)</span>':''}</div>`
		}
		break

		default:
		td=itemValue
		break
	}
	if(!field.html && !bRoot){
		var prefix=(field.parentField?field.parentField + '.':'') + listItem.rowIndex
		if(Array.isArray(itemValue)){

			itemValue.forEach((e,index)=>{
				if(typeof e=='object'){
					Object.keys(e).forEach((k)=>{
						td+=`<input type="hidden" name="${generateFormName(prefix + '.' + field.field + '.' + index + '.' + k)}" value="${e[k]}" />`
					})
				}else{
					td+=`<input type="hidden" name="${generateFormName(prefix + '.' + field.field + '.' + index)}" value="${e}" />`
				}
			})
		}else if(typeof itemValue=='object'){

			itemValue=objectToListObject(itemValue)
			Object.keys(itemValue).forEach((e)=>{
				td+=`<input type="hidden" name="${generateFormName(prefix + '.' + field.field + '.' + e)}" value="${itemValue[e]}" />`
			})

		}else{
			td+=`<input type="hidden" name="${generateFormName(prefix + '.' + field.field)}" value="${itemValue}" />`
		}
	}

	s+=`<td class="${tdClass || ''} ${field.visible===false?'hidden':''}">${td}</td>`

	return s
}

function gridButtonOptions(item,bRoot,insideOfModal){
	let options=item.options || {}
	let buttonCount=0
	let currentPath=window.location.pathname
	let defaultButtons={
		add:[false,''],
		copy:[false,''],
		view:[false,''],
		print:[false,''],
		edit:[false,''],
		delete:[false,'']
	}
	if(options.buttons==undefined){
		options.buttons=defaultButtons
	}else{
		options.buttons=Object.assign({},defaultButtons, options.buttons)
		Object.keys(options.buttons).forEach((key)=>{
			if(typeof options.buttons[key]=='boolean'){
				options.buttons[key]=[options.buttons[key],'']
			}else if(Array.isArray(options.buttons[key])){
				if(options.buttons[key].length<2)
					options.buttons[key].push('')
			}
		})
	}
	let q={}
	if(hashObj.query.mid)
		q={mid:hashObj.query.mid}
	if(options.queryValues){
		q=hashObj.query
	}else{

	}
	if(options.buttons.add[0]==true && options.buttons.add[1]==''){
		if(bRoot){
			options.buttons.add[1]=`<a href="${menuLink(hashObj.path + '/addnew',q)}" class="btn btn-primary  btn-sm far fa-plus-square" target="_self"  title="Yeni Ekle"></a>`
		}else{
			if(item.modal && !item.insideOfModal){
				options.buttons.add[1]=`<a href="javascript:gridModalAddRow('#${item.id}',${insideOfModal})" class="btn btn-primary  btn-sm far fa-plus-square" target="_self"  title="Yeni Ekle (modal)"></a>`
			}else{
				options.buttons.add[1]=``
			}
		}
	}

	if(options.buttons.copy[0]==true && options.buttons.copy[1]==''){
		options.buttons.copy[1]=`<a href="javascript:gridCopyItem({rowIndex},'#${item.id}')" class="btn btn-grid-row btn-success " title="Kopyala"><i class="fas fa-copy"></i></a>`
	}

	if(options.buttons.print[0]==true && options.buttons.print[1]==''){
		var q2=clone(q)
		q2['view']='print'

		if(hashObj.settings.print){
			if(hashObj.settings.print.form){
				q2['designId']=hashObj.settings.print.form._id 
			}
		}

		options.buttons.print[1]=`<a href="javascript:popupCenter('${menuLink(hashObj.path + '/print/{_id}',q2)}','Yazdır','900','600')" class="btn btn-grid-row btn-info " title="Yazdır"><i class="fas fa-print"></i></a>`
	}

	if(options.buttons.view[0]==true && options.buttons.view[1]==''){
		options.buttons.view[1]=`<a href="${menuLink(hashObj.path + '/view/{_id}',q)}" class="btn btn-info btn-grid-row fas fa-eye" title="İncele"></a>`
	}

	if(options.buttons.edit[0]==true && options.buttons.edit[1]==''){
		if(bRoot){
			options.buttons.edit[1]=`<a href="${menuLink(hashObj.path + '/edit/{_id}',q)}" class="btn btn-primary btn-grid-row fas fa-edit" target="_self"  title="Düzenle"></a>`
		}else{
			if(!insideOfModal){
				options.buttons.edit[1]=`<a href="javascript:gridSatirDuzenle('#${item.id}',{rowIndex},${insideOfModal})" class="btn btn-info btn-grid-row fas fa-edit" title="Satır Düzenle"></a>`
				if(item.modal){
					options.buttons.edit[1]+=`<a href="javascript:gridModalEditRow('#${item.id}',{rowIndex},${insideOfModal})" class="btn btn-success btn-grid-row fas fa-window-restore" title="Modal Düzenle"></a>`
				}
			}else{
				options.buttons.edit[1]=`<a href="javascript:gridSatirDuzenle('#modalRow #${item.id}',{rowIndex},${insideOfModal})" class="btn btn-info btn-grid-row fas fa-edit" title="Satır Düzenle"></a>`
			}
		}
	}

	if(options.buttons.delete[0]==true && options.buttons.delete[1]==''){
		if(bRoot){
			options.buttons.delete[1]=`<a href="javascript:gridDeleteItem({rowIndex},'#${item.id}')" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
		}else{
			if(!insideOfModal){
				options.buttons.delete[1]=`<a href="javascript:gridSatirSil('#${item.id}',{rowIndex},${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
			}else{
				options.buttons.delete[1]=`<a href="javascript:gridSatirSil('#modalRow #${item.id}',{rowIndex},${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
			}
		}
	}

	Object.keys(options.buttons).forEach((key)=>{
		buttonCount +=options.buttons[key][0]?1:0
	})
	if(buttonCount>1 && options.buttons.add[0])
		buttonCount--

	buttonCount=buttonCount>4?4:buttonCount

	if(bRoot){
		options.buttonWidth=`${buttonCount*45+10}px`
	}else{
		options.buttonWidth=`${3*45+10}px`
	}
	item.options=options

	return item
}


function gridHeader(parentId,item,bRoot,insideOfModal,cb){
	var s=`
	<thead>
	<tr class="text-nowrap">`
	if(item.options.selection===true){
		s+=`<th style="width: 30px;"><input class="grid-checkbox" type="checkbox" value="true" name="selectAll${item.id}" id="selectAll${item.id}" title="Tümünü seç"></th>`
	}
	
	Object.keys(item.fields).forEach((key)=>{
		var field=item.fields[key]
		var cls=''
		switch(item.fields[key].type ){
			case 'money':
			case 'number':
			cls='text-end me-1'
			break
			case 'boolean':
			cls='text-center'
			break
		}
		if(field.visible===false){
			cls+=' hidden'
		}
		s+=`<th class="${cls}" style="${field.width?'width:' + field.width + ';min-width:' + field.width + ';':''}">${field.icon?'<i class="' + field.icon + '"></i>':''} ${field.title || ''}</th>`
	})

	s+=`<th class="text-center" style="width:${item.options.buttonWidth}">
	${item.options.buttons.add[0]==true?item.options.buttons.add[1]:''}
	</th>
	</tr>
	</thead>
	`

	document.querySelector(`${parentId} table`).insertAdjacentHTML('afterbegin', s)

	gridFilterRow(`${parentId} table thead`,item,bRoot,insideOfModal,cb)

}

function gridFilterRow(parentId,item,bRoot,insideOfModal,cb){

	if(item.options.show.filterRow!==true){
		return cb()
	}
	document.querySelector(`${parentId}`).insertAdjacentHTML('beforeend', `<tr id="filterRow" class="text-nowrap collapse">${item.options.selection===true?'<th></th>':''}</tr>`)

	let dizi=Object.keys(item.fields)
	let index=0

	function calistir(cb1){
		if(index>=dizi.length){
			return cb1()
		}
		let field=Object.assign({},item.fields[dizi[index]])

		field.filter=field.filter==undefined?item.options.filter:field.filter
		document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend',`<th id="filterCol${index}" ${field.visible===false?'class="hidden"':''}></th>`)
		
		if(field.filter && field.visible!==false){
			field.filterField=field.filterField || dizi[index]
			field.id=generateFormId(`${item.id}_filter_${field.filterField}`)
			field.prefix=generateFormId(`${item.id}_filter`)
			field.name=generateFormName(`${item.id}_filter.${field.filterField}`)
			field.class='grid-filter'
			field.noGroup=true
			field.placeholder=' '
			field.showAll=true
			if((hashObj.query[field.filterField] || '')!=''){
				field.value=hashObj.query[field.filterField]
			}
			filterControl(`${parentId} #filterRow #filterCol${index}`,`${parentId} #filterRow`, field,()=>{
				index++
				setTimeout(calistir,0,cb1)
			})
		}else{
			index++
			setTimeout(calistir,0,cb1)
		}
	}
	
	calistir(()=>{
		document.querySelector(`${parentId} #filterRow`).insertAdjacentHTML('beforeend',`<th>bos kolon</th>`)
		cb()
	})
}

function filterControl(parentId,filterRowDivId,field,cb){
	switch(field.type.toLowerCase()){
		case 'lookup':
		poc_Lookup(parentId,field,()=>{
			$(`#${field.id}`).on('change',(e)=>{
				keyupTimer=0
				runFilter(filterRowDivId,field.prefix)
			})
			cb()
		})
		break
		case 'remotelookup':
		poc_RemoteLookup(parentId,field,()=>{
			$(`#${field.id}-autocomplete-text`).on('change',(e)=>{
				keyupTimer=0
				runFilter(filterRowDivId,field.prefix)
			})
			cb()
		})
		break
		case 'boolean':
		poc_CheckBoxLookup(parentId,field,()=>{
			$(`#${field.id}`).on('change',(e)=>{
				keyupTimer=0
				runFilter(filterRowDivId,field.prefix)
			})
			cb()
		})
		break
		case 'date':
		poc_DateBox(parentId,field,()=>{
			$(`#${field.id}`).on('change',(e)=>{
				keyupTimer=0
				runFilter(filterRowDivId,field.prefix)
			})
			cb()
		})
		break
		case 'time':
		poc_TimeBox(parentId,field,()=>{
			$(`#${field.id}`).on('change',(e)=>{
				keyupTimer=0
				runFilter(filterRowDivId,field.prefix)
			})
			cb()
		})
		break
		case 'number':
		poc_TextBox(parentId,field,()=>{
			$(`#${field.id}`).on('keyup',(e)=>{
				setTimeout(()=>{
					keyupTimer=1
					runFilter(filterRowDivId,field.prefix)
				},800)
			})
			cb()
		})
		break
		case 'money':
		poc_TextBox(parentId,field,()=>{
			$(`#${field.id}`).on('keyup',(e)=>{
				setTimeout(()=>{
					keyupTimer=1
					runFilter(filterRowDivId,field.prefix)
				},800)
			})
			cb()
		})
		break
		default:
		poc_TextBox(parentId,field,()=>{
			$(`#${field.id}`).on('keyup',(e)=>{
				setTimeout(()=>{
					keyupTimer=1
					runFilter(filterRowDivId,field.prefix)
				},800)
			})
			cb()
		})
		break
	}
}


function gridFooter(item){
	return ``
}



function filterFormButton(divId){
	var s=`
	<div class="ms-auto col text-end pt-2 pt-md-4">
	<a href="javascript:runFilter('#${divId}')" class="btn btn-primary text-nowrap" title="Filtrele" ><i class="fas fa-sync-alt"><i class="fas fa-filter ms-2"></i></i></a>
	</div>
	`

	return s
}

function buttonRowCell(listItem,rowIndex,item,bRoot){
	var s=``

	listItem['rowIndex']=rowIndex
	Object.keys(item.options.buttons).forEach((key)=>{
		if(key!='add'){
			s+=`${item.options.buttons[key][0]?replaceUrlCurlyBracket(item.options.buttons[key][1],listItem):''}`
		}
	})

	return s
}

function gridPageSize(item,bRoot){

	var s=`<div class="align-items-center" style="display: inline-flex">
	Sayfada
	<select class="form-control input-inline input-sm ms-1" id="pageSize${item.id}">
	<option value="10" ${item.value.pageSize==10?'selected':''}>10</option>
	<option value="20" ${item.value.pageSize==20?'selected':''}>20</option>
	<option value="50" ${item.value.pageSize==50?'selected':''}>50</option>
	<option value="100" ${item.value.pageSize==100?'selected':''}>100</option>
	<option value="250" ${item.value.pageSize==250?'selected':''}>250</option>
	<option value="500" ${item.value.pageSize==500?'selected':''}>500</option>
	</select>
	</div>`

	return s
}

function gridPageCount(item,bRoot){
	var s=`<div class="mt-1 ms-2" style="display: inline-block">`
	if(item.value.pageSize>0 && item.value.recordCount>0){
		s+=`${((item.value.page-1)*item.value.pageSize)+1} - ${(item.value.page*item.value.pageSize<item.value.recordCount)?item.value.page*item.value.pageSize:item.value.recordCount} arası, Toplam: ${item.value.recordCount} kayit, ${item.value.pageCount} sayfa`
	}else{
		s+=`Toplam: ${item.value.recordCount} kayit`
	}
	s+=`</div>`

	return s
}

function gridPagerButtons(item,bRoot){
	if(!item.value.page)
		return ''
	if((item.value.pageCount || 0)<=1)
		return ''

	var s=`
	<ul class="pagination mb-1">`
	if(item.value.page>1){
		s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(1))}">|&lt;</a></li>
		<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(item.value.page-1))}">&lt;</a></li>`
	}

	var sayfalar=pagination(item.value.page,item.value.pageCount)
	sayfalar.forEach((e)=>{
		if(e==item.value.page.toString()){
			s+=`<li class="page-item active"><span class="page-link">${item.value.page}</span></li>`
		}else if(e=='...'){
			s+=`<li class="page-item"><span class="page-link">...</span></li>`
		} else {
			s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(e))}">${e}</a></li>`
		}
	})

	if(item.value.page<item.value.pageCount){
		s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(item.value.page+1))}">&gt;</a></li>
		<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(item.value.pageCount))}">&gt;|</a></li>`
	}

	s+=`</ul>`
	return s

	function pageNo(page){
		var query=clone(hashObj.query)
		query['page']=page
		return query
	}
}



function gridDefaults(item,bRoot,insideOfModal){
	if(item.id==undefined && bRoot){
		rootGridId++
		item.id=`rootGrid${rootGridId}`
	}
	item=gridButtonOptions(item,bRoot,insideOfModal)
	let optShow={}

	if(!bRoot){
		optShow={
			filter:false,
			pageSize:false,
			pageCount:false,
			pagerButtons:false,
			header:true,
			footer:false
		}
	}else{
		optShow={
			filter:true,
			pageSize:true,
			pageCount:true,
			pagerButtons:true,
			header:true,
			footer:true
		}
	}
	item.options.show=Object.assign({},optShow,item.options.show)
	if(item.options.show.infoRow==undefined){
		if(item.options.show.filter || item.options.show.pageSize || item.options.show.pageCount || item.options.show.pagerButtons){
			item.options.show.infoRow=true
		}else{
			item.options.show.infoRow=false
		}
	}
	item.options.show.filterRow=item.options.filter || false


	if(bRoot===false)
		item.options.show.filterRow=false

	if(item.options.show.filterRow){
		var bFound=false
		Object.keys(item.fields).forEach((key)=>{
			if(item.fields[key].filter==undefined){
				item.fields[key].filter=true
			}
			
			if(item.fields[key].filter===true){
				bFound=true
				return
			}
		})
		if(bFound==false){
			item.options.show.filterRow=false
		}
	}

	item.value=objectArrayControl(item.value)

	return item
}


function gridModalAddRow(tableId,insideOfModal){
	gridModalEditRow(-1,tableId,insideOfModal)
}

function gridModalEditRow(tableId,rowIndex, insideOfModal){
	
	let table=document.querySelector(tableId)
	let item = table.item

	$(`#modalRow .modal-body`).html('')


	var gridLine={}

	if(item.modal){
		gridLine=clone(item.modal)
	}else{
		gridLine={
			fields:clone(item.fields || {})
		}
	}
	
	gridLine.id=item.id
	gridLine.type="modal"
	gridLine.options={autocol:true}

	if(rowIndex>=0){
		gridLine.value=table.item.value[rowIndex]
		$(`#modalRow .modal-title`).html(`<i class="fas fa-edit"></i> #${rowIndex+1} satırını düzenle`)
	}else{
		gridLine.value={}
		$(`#modalRow .modal-title`).html('<i class="far fa-plus-square"></i> Yeni satir')
		Object.keys(item.fields).forEach((key,cellIndex)=>{
			var field=item.fields[key]

			if(field.lastRecord){
				if(table.item.value.length>0){
					gridLine.value[key]=getPropertyByKeyPath(table.item.value[table.item.value.length-1],key)
				}
			}

			if(field.type=='identity'){
				gridLine.value[key]=item.value.length+1
			}
		})
	}
	

	poc_generateControl(`#modalRow .modal-body`,gridLine,gridLine.value,false,true,()=>{
		editRowCalculation(`#modalRow .modal-body`, '', table.item.fields)
	})

	$(`#modalRow .modal-footer`).html(`<a class="btn btn-primary" href="javascript:gridModalOK('${tableId}',${rowIndex},${insideOfModal})" title="Kaydet"><i class="fas fa-check"></i> Tamam</a><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Vazgeç</button>`)

	
	

	

	$(`#modalRow`).modal('show')
}



function gridModalOK(tableId,rowIndex,insideOfModal){
	var table=document.querySelector(tableId)
	
	var satirObj=getDivData(`#modalRow .modal-body`,'',false)
	
	if(rowIndex>-1){
		table.item.value[rowIndex]=satirObj
	}else{
		table.item.value.push(satirObj)
	}
	gridBody(`${tableId}`,table.item,false,insideOfModal,()=>{})

	$(`#modalRow`).modal('hide')
}



function grid_onchange(item){
	try{
		if(item.onchange){
			var onchange=item.onchange
			if(onchange.indexOf('this.value')>-1){
				onchange=onchange.replace('this.value',JSON.stringify(item.value))
				eval(onchange)
			}else if(onchange.indexOf('this')>-1){
				onchange=onchange.replace('this',JSON.stringify(item))
				eval(onchange)
			}else{
				eval(onchange)
			}
		}
	}catch(tryErr){
		alertX(`${tryErr.name || ''} - ${tryErr.message || ''}`,'Hata','danger')
	}
}

function gridSatirSil(tableId,rowIndex, insideOfModal){
	var table=document.querySelector(`${tableId}`)
	if(rowIndex>-1){
		if(table.item.options.confirmBeforeRemove){
			confirmX(`#${rowIndex+1} nolu Satiri silmek istiyor musunuz?`,(answer)=>{
				if(answer){
					table.item.value.splice(rowIndex,1)
					gridBody(`${tableId}`,table.item,false,insideOfModal,()=>{})
				}
			})
		}else{
			table.item.value.splice(rowIndex,1)
			gridBody(`${tableId}`,table.item,false,insideOfModal,()=>{})
		}
		
	}
	
}



function ilkElemanaFocuslan(selector){

	var ilkEleman=document.querySelector(`${selector}`).querySelector('input,select')
	if(ilkEleman){
		ilkEleman.focus()
		if(typeof ilkEleman.select === 'function'){
			if(ilkEleman.getAttribute('readonly')!=undefined || ilkEleman.getAttribute('disabled')!=undefined){
				enterNext(ilkEleman)
			}else{
				ilkEleman.select()
			}
		}
	}
}



function gridDeleteItem(rowIndex,tableId){
	var table=document.getElementById(tableId)
	var item=table.item
	if(!item.dataSource)
		return
	if(!item.value)
		return

	var row=table.querySelectorAll('tbody tr')[rowIndex]
	var listItem
	if(Array.isArray(item.value)){
		listItem=item.value[rowIndex]
	}else if(item.value.docs){
		listItem=item.value.docs[rowIndex]
	}
	
	if(!row)
		return


	var soru=`Belge/Nesne silinecektir! Onaylıyor musunuz?`
	var i=0
	soru+=`<br><hr class="hr-primary">`
	while(i<row.cells.length && i<4){
		if(row.cells[i].innerText.trim()!=''){
			soru+=`${row.cells[i].innerHTML.trim()}<br>`
		}
		i++
	}

	var url=''
	if(item.dataSource.deleteUrl){
		url=item.dataSource.deleteUrl.split('?')[0]
		if(url.indexOf('{_id}')<0){
			url+=`/{_id}`
		}
	}else{
		url=item.dataSource.url.split('?')[0]
		url+=`/{_id}`
	}
	url=replaceUrlCurlyBracket(url,listItem)

	confirmX(soru,'danger',(answer)=>{
		if(!answer)
			return
		$.ajax({
			url:url,
			type:'DELETE',
			success: function(result) {
				if(result.success){
					window.onhashchange()
				}else{
					showError(result.error)
				}
			},
			error:function(err){
				showError(err)
			}
		})
	})
}

function gridCopyItem(rowIndex,tableId){
	let table=document.querySelector(tableId)
	let item=table.item
	if(!item.dataSource)
		return
	if(!item.value)
		return

	
	let listItem
	if(Array.isArray(item.value)){
		listItem=item.value[rowIndex]
	}else if(item.value.docs){
		listItem=item.value.docs[rowIndex]
	}
	

	if(item.dataSource.copyUrl){
		url=item.dataSource.copyUrl.split('?')[0]
		if(url.indexOf('{_id}')<0){
			url+=`/{_id}`
		}
	}else{
		url=item.dataSource.url.split('?')[0]
		url+=`/copy/{_id}`
	}
	url=replaceUrlCurlyBracket(url,listItem)

	let name=''
	let nameTitle=''
	let key=''
	let placeholder=''
	if(item.fields['name']){
		key='name'
		name=listItem['name'] || ''
		nameTitle=item.fields['name'].title || ''
	}else if(item.fields['name.value']){
		key='name.value'
		name=getPropertyByKeyPath(listItem,'name.value') || ''
		nameTitle=item.fields['name.value'].title || ''
	}else if(item.fields['ID']){
		key='ID'
		name=listItem['ID'] || ''
		nameTitle=item.fields['ID'].title || ''
	}else if(item.fields['ID.value']){
		key='ID.value'
		name=getPropertyByKeyPath(listItem,'ID.value') || ''
		nameTitle=item.fields['ID.value'].title || ''
	}

	if(name==''){
		Object.keys(item.fields).forEach((k)=>{
			if(name=='' && item.fields[k].type=='string' && item.fields[k].readonly!==true && item.fields[k].visible!==false){
				key=k
				name=getPropertyByKeyPath(listItem,k)
				nameTitle=item.fields[key].title || ''
			}
		})
	}
	if(key=='ID' || key=='ID.value'){
		name=''
		placeholder='Boş ise otomatik verilir'
	}else{
		name+=' kopya'
	}

	copyX({
		newName:{title:`Yeni ${nameTitle}`,type:'string',value:`${name}`, placeholder:`${placeholder}`}
	},'Kopya oluştur',(answer,formData)=>{
		if(!answer)
			return
		$.ajax({
			url:url,
			data:formData,
			type:'POST',
			success: function(result) {
				if(result.success){
					if(result.data['newName']){
						alertX(`Yeni ad/kod:<br> <b>${result.data['newName']}</b>`,'Kopyalama başarılı',(answer)=>{
							window.onhashchange()
						})
					}else{
						window.onhashchange()
					}
					
				}else{
					showError(result.error)
				}
			},
			error:function(err){
				showError(err)
			}
		})
	})
}

function gridCSVExport(gridId){
	
	var grid=document.querySelector(`#${gridId}`)
	var thead=document.querySelector(`#${gridId} table thead`)
	var tbody=document.querySelector(`#${gridId} table tbody`)
	var item=grid.item
	var s=``
	var i=0,j=0
	while(j<thead.rows[0].cells.length){
		if(item.options.selection && j==0){

		}else{
			if(!thead.rows[0].cells[j].classList.contains('hidden')){
				s+='"' + thead.rows[0].cells[j].innerText + '";'
			}
			
		}
		
		j++
	}
	
	s+='\r\n'

	while(i<tbody.rows.length){
		j=0
		while(j<tbody.rows[i].cells.length){
			if(item.options.selection && j==0){

			}else{
				if(!tbody.rows[i].cells[j].classList.contains('hidden'))
					s+='"' + tbody.rows[i].cells[j].innerText.replaceAll('\r\n',' ').replaceAll('\n',' ') + '";'
			}
			
			j++
		}
		s+='\r\n'

		i++
	}
	var fileName=(document.title || '').split('-')[0].trim() + '.csv'

	var blob = new Blob([String.fromCharCode(0xFEFF),s], {type: "text/plain;charset=utf-8", autoBom:true})
	saveAs(blob, fileName)
}

