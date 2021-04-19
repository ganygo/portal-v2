
function poc_Card(parentId, item,cb){
	var s=`
	<div class="${item.col || ''} p-1 ${item.visible===false?'hidden':''}">
	<div class="card cerceve1">
	<div class="card-header">
	<a class="btn btn-collapse ${item.collapsed?'collapsed':''}" data-bs-toggle="collapse" data-bs-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}" href="#"><i class="far fa-caret-square-up fa-2x"></i></a>
	${item.title}${helpButton(item)}
	</div>
	<div  id="cardCollapse${item.id}" class="card-body p-2 card-collapse collapse ${item.collapsed?'collapsed':'show'}">
	<div class="row" id="${item.id}">
	${item.html || item.controls || ''}
	</div>
	</div>
	</div>
	</div>
	`
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_Tab(parentId, item,cb){
	let bActive=false
	item.tabs.forEach((tab)=>{
		if(tab.active===true){
			bActive=true
			return
		}
	})
	if(!bActive && item.tabs.length>0){
		item.tabs[0].active=true
	}

	let s=`
	<div class="col-12">
	<ul class="nav nav-tabs" role="tablist">`
	item.tabs.forEach((tab,tabIndex)=>{
		s+=`<li class="nav-item">
		<a class="nav-link ${tab.active?'active':''}" href="#formTab${item.id}${tabIndex}" role="tab" data-bs-toggle="tab" id="IDformTab${item.id}${tabIndex}" aria-controls="formTab${item.id}${tabIndex}" aria-selected="${tab.active?'true':'false'}">
		${tab.icon?'<i class="' + tab.icon + '"></i>':''} ${tab.title || ''}
		</a>
		</li>`
	}) 
	s+=`</ul>
	<div class="tab-content" style="min-height: 60vh;overflow: auto;">`
	item.tabs.forEach((tab,tabIndex)=>{
		s+=`<div class="tab-pane ${tab.active?'show active':''}" id="formTab${item.id}${tabIndex}" role="tabpanel" aria-labelledby="IDformTab${item.id}${tabIndex}">
		<div class="row" id="${tab.id}" >
		</div>
		</div>`
	})
	s+=`</div>
	</div>
	`
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_Group(input,item){
	if(item.noGroup===true){
		return input
	}else{
		return `
		<div class="${item.col || ''} p-1">
		<div class="form-group  ${item.visible===false?'hidden':''}">
		<label class="m-0 p-0 ellipsis w-100 ${item.required?'form-required':''}">${item.title || ''}${helpButton(item)}</label>
		${input}
		</div>
		</div>
		`
	}
}

function poc_FormHtml(parentId, item,cb){
	var html=''
	if(item.html){
		html=replaceUrlCurlyBracket(item.html, item) || ''
	}else{
		html=item.value
	}
	
	var s= group(html,item)
	
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_Label(parentId, item,cb){

	let s=poc_Group(`<label  id="${item.id}" class="m-0 p-0 ${item.class || ''}">${item.value || item.title  || item.label || item.text || ''}</label>`,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #${item.id}`).val(item.value!=undefined?item.value:'')

	cb()
}


function poc_TextBox(parentId, item,cb){
	let s=poc_Group(`<input type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value!=undefined?item.value:''}">`,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #${item.id}`).val(item.value!=undefined?item.value:'')
	cb()
}


function poc_InputHidden(parentId, item,cb){

	let s=`<input type="hidden" id="${item.id}" name="${item.name}" onchange="${item.onchange || ''}" value="${item.value!=undefined?item.value:''}">`

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #${item.id}`).val(item.value!=undefined?item.value:'')
	cb()
}


function poc_Button(parentId, item,cb){
	var label=`${item.text || ''}`
	var titleText=`${item.title || item.text || ''}`
	if(item.icon){
		label=`<i class="${item.icon}"></i> ${label}`
	}
	
	var s= poc_Group(`<a class="${item.class || 'btn btn-info'}" id="${item.id || ''}" href="${item.href || (item.value || '')}" target="${item.target || ''}" title="${titleText}">${label}</a>`,item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_TextareaBox(parentId, item,cb){
	let s=`
	<textarea class="form-control text-nowrap ${item.class || ''}" style="font-family: courier new"  id="${item.id}-textarea" rows="${item.rows || 4}"  placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocorrect="off" spellcheck="false"></textarea>
	<input type="hidden" id="${item.id}" name="${item.name}" >
	`
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	
	let textAreaValue=item.value!=undefined?item.value:''
	if(item.encoding=='base64'){
		textAreaValue=b64DecodeUnicode(item.value!=undefined?item.value:'')
	}

	$(`${parentId} #${item.id}-textarea`).val(textAreaValue)
	$(`${parentId} #${item.id}`).val(item.value!=undefined?item.value:'')

	$(`${parentId} #${item.id}-textarea`).change(()=>{
		if(item.encoding=='base64'){
			$(`${parentId} #${item.id}`).val(b64EncodeUnicode($(`${parentId} #${item.id}-textarea`).val()))
		}else{
			$(`${parentId} #${item.id}`).val($(`${parentId} #${item.id}-textarea`).val())
		}
	})

	cb()
}

function poc_ImageBox(parentId, item,cb){
	let s=`
	<div>
	<label for="fileUpload_${item.id}" class="btn btn-primary btn-image-edit"><i class="fas fa-edit"></i></label>
	<img id="${item.id}-img" class="imageBox-img" src="${item.value.data || '/img/placehold-place.jpg'}" download="${item.value.fileName || ''}">
	</div>
	<input type="file" id="fileUpload_${item.id}" style="visibility:hidden;" accept="" >
	<input type="hidden" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	
	`

	s=poc_Group(s,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #fileUpload_${item.id}`).change(()=>{
		let files= $(`${parentId} #fileUpload_${item.id}`).prop('files')
		if(files.length>0){
			let file =files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`,file.name)

			let reader  = new FileReader()
			reader.addEventListener("load", function () {
				$(`${parentId} #${item.id}-img`).attr('src',reader.result)
				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if(file){
				reader.readAsDataURL(file)
			}
		}
	})

	cb()
}


function poc_FileBox(parentId, item,cb){
	let s=`
	<div>
	<label for="fileUpload_${item.id}" class="btn btn-primary"><i class="fas fa-file-alt"></i> Dosya seçiniz</label><br>
	<a id="fileDownload_${item.id}" class="" href="${item.value.data || '#'}" download="${item.value.fileName || ''}">${item.value.fileName?'<i class="fas fa-file-download"></i> ' + item.value.fileName:''}</a>
	</div>
	<input type="file" id="fileUpload_${item.id}" style="visibility:hidden;" accept="" >
	<input type="hidden" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	
	`
	s=poc_Group(s,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #fileUpload_${item.id}`).change(()=>{
		let files= $(`${parentId} #fileUpload_${item.id}`).prop('files')
		if(files.length>0){
			let file =files[0]
			$(`${parentId} #${item.id}-img`).attr(`download`,file.name)

			let reader  = new FileReader()
			reader.addEventListener("load", function () {
				$(`${parentId} #fileDownload_${item.id}`).attr('href',reader.result)
				$(`${parentId} #fileDownload_${item.id}`).attr('download',file.name)
				$(`${parentId} #fileDownload_${item.id}`).html(`<i class="fas fa-file-download"></i> ${file.name}`)

				$(`${parentId} input[name="${item.name}[data]"]`).val(reader.result)
				$(`${parentId} input[name="${item.name}[type]"]`).val(file.type)
				$(`${parentId} input[name="${item.name}[fileName]"]`).val(file.name)
			}, false)
			if(file){
				reader.readAsDataURL(file)
			}
		}
	})

	cb()

}


function poc_NumberBox(parentId, item,cb){
	let s=poc_Group(`<input type="number" class="form-control text-end ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value!=undefined?item.value:0}">`,item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_MoneyBox(parentId, item,cb){
	let s=poc_Group(`<input type="number" class="form-control text-end ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value!=undefined?item.value:0}">`,item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_DateBox(parentId, item,cb){
	let s=poc_Group(`<input type="date" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value!=undefined?item.value:''}">`,item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_TimeBox(parentId, item,cb){
	let s=poc_Group(`<input type="time" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" step="1" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${(item.value!=undefined?item.value:'').substr(0,8)}">`,item)
	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_Lookup(parentId, item,cb){
	let s=`<select type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" autocomplete="chrome-off" ${item.required?'required="required"':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}">
	<option value="" ${item.value==''?'selected':''}>${item.showAll===true?'*':'-- Seç --'}</option>`
	if(item.lookup){
		if(Array.isArray(item.lookup)){
			item.lookup.forEach((e)=>{
				s+=`<option value="${e}" ${e==item.value?'selected':''}>${e}</option>`
			})
		}else{
			Object.keys(item.lookup).forEach((key)=>{
				s+=`<option value="${key}" ${key==item.value?'selected':''}>${item.lookup[key]}</option>`
			})
		}
		
	}
	s+=`</select>`

	if(item.lookupTextField){
		s+=`<input type="hidden" name="${item.lookupTextFieldName || ''}" value="">`
	}

	s=poc_Group(s,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	if(item.lookupTextField){
		$(`${parentId} #${item.id}`).on('change',()=>{
			if($(`${parentId} #${item.id}`).val()!=''){
				$(`${parentId} input[name="${item.lookupTextFieldName || ''}"]`).val($(`${parentId} #${item.id} option:selected`).text())
			}else{
				$(`${parentId} input[name="${item.lookupTextFieldName || ''}"]`).val('')
			}
		})
	}

	cb()
}


function poc_CheckBoxLookup(parentId, item,cb){

	var s=``
	
	var input=`
	<select name="${item.name}" id="${item.id}" class="form-control p-0 m-0 ${item.class || ''}">
	<option value="">*</option>
	<option value="true" ${(item.value!=undefined?item.value:'').toString()=='true'?'selected':''}><i class="fas fa-check-square text-primary"></i> Evet</option>
	<option value="false" ${(item.value!=undefined?item.value:'').toString()=='false'?'selected':''}><i class="far fa-square text-dark"></i> Hayır</option>
	</select>
	`
	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="${item.col || ''} p-1 ${item.visible===false?'hidden':''}">
		<div class="form-group">
		<label>
		<span class="mb-1" style="display:block;">${item.title || ''}${helpButton(item)}</span>
		${input}
		</label>
		</div>
		</div>`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_RemoteLookup(parentId, item,cb){
	
	var s=``

	var input=`
	<div class="input-group">
	<input type="search" class="form-control ${item.class || ''}" id="${item.id}-autocomplete-text"  placeholder="${item.placeholder || item.title || ''}" value="${item.valueText || ''}" autocomplete="off" autofill="off" spellcheck="false" ${item.required?'required="required"':''} ${item.readonly?'readonly':''} title="${item.title || ''}: Tümünü listelemek için boşluk tuşuna basabilirsiniz." >
	<div class="input-group-text"><i class="fas fa-ellipsis-v"></i></div>
	</div>
	<input type="hidden" name="${item.name}" value="${item.value!=undefined?item.value:''}">
	<input type="hidden" id="${item.id}-obj"  value="">
	`
	if(item.lookupTextField){
		input+=`<input type="hidden" name="${item.lookupTextFieldName || ''}" value="${item.valueText || ''}">`
	}


	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="${item.col || ''} p-1 ${item.visible===false?'hidden':''}">
		<div class="form-group">
		<label class="m-0 p-0 ellipsis w-100 ${item.required?'form-required':''}">${item.title || ''}${helpButton(item)} ${item.lookupTextField?'<span class="ms-1 bold small text-success" id="' + item.id + '-original-text" title=""></span>':''}</label>
		${input}
		</div>
		</div>
		`
	}


	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	remoteLookupAutocomplete(item)
	cb()
}


function poc_CheckBox(parentId, item,cb){
	let s=``
	let input=`<input type="checkbox" class="${item.class || 'form-checkbox'}" id="${item.id}" name="${item.name}" value="true" ${item.value?'checked':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}" />`
	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="${item.col || ''} p-1 ${item.visible===false?'hidden':''}">
		<div class="form-group">
		<label>
		<span class="mb-1" style="display:block;">${item.title || ''}${helpButton(item)}</span>
		${input}
		</label>
		</div>
		</div>`
	}

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)
	cb()
}

function poc_DateRangeBox(parentId, item,cb){
	let s=`<div id="${item.id}" class="d-md-flex m-0 p-0">
	<select class="form-control ${item.class || ''}" name="cbDate" id="cbDate" style="min-width:110px;">
	<option value="">Tarih</option>
	<option value="today">Bugün</option>
	<option value="thisWeek">Bu Hafta</option>
	<option value="thisMonth">Bu Ay</option>
	<option value="lastMonth">Geçen Ay</option>
	<option value="last1Week">Son 1 Hafta</option>
	<option value="last1Month">Son 1 Ay</option>
	<option value="last3Months">Son 3 Ay</option>
	<option value="last6Months">Son 6 Ay</option>
	<option value="thisYear">Bu yıl</option>
	<option value="last1Year">Son 1 yıl</option>
	</select>
	<div class="d-flex" style="min-width:280px;">
	<input type="date" name="date1" id="date1" class="form-control" value="${moment().format('YYYY-MM-DD')}">
	<input type="date" name="date2" id="date2" class="form-control" value="${moment().format('YYYY-MM-DD')}">
	</div>
	</div>`


	s=poc_Group(s,item)

	document.querySelector(parentId).insertAdjacentHTML('beforeend', s)

	$(`${parentId} #${item.id} #cbDate`).on('change',()=>{
		cbDate_onchange()
		if(document.querySelector('#filterForm')){
			runFilter('#filterForm')
		}
	})


	if((hashObj.query.cbDate || '')!='' ){
		$(`${parentId} #${item.id} #cbDate`).val(hashObj.query.cbDate)
		if(hashObj.query.date1 || ''!=''){
			$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		}
		if(hashObj.query.date2 || ''!=''){
			$(`${parentId} #${item.id} #date2`).val(hashObj.query.date2)
		}
	}else if((hashObj.query.cbDate || '')=='' && hashObj.query.date1 && hashObj.query.date2){
		$(`${parentId} #${item.id} #cbDate`).val('')
		$(`${parentId} #${item.id} #date1`).val(hashObj.query.date1)
		$(`#${item.id} #date2`).val(hashObj.query.date2)
		
		pageSettings.setItem('cbDate','')

	}else if(pageSettings.getItem('cbDate')){
		$(`${parentId} #${item.id} #cbDate`).val(pageSettings.getItem('cbDate'))
		cbDate_onchange()

	}else{
		if($(`${parentId} #${item.id} #cbDate`).val()==''){
			$(`${parentId} #${item.id} #cbDate`).val('thisMonth')
		}
	}




	function cbDate_onchange(){
		var obj=cboEasyDateChange($(`${parentId} #${item.id} #cbDate`).val())
		$(`${parentId} #${item.id} #date1`).val(obj.date1)
		$(`${parentId} #${item.id} #date2`).val(obj.date2)
		pageSettings.setItem('cbDate',$(`${parentId} #${item.id} #cbDate`).val())
	}

	cb()
}
