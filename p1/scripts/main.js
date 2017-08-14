var xAdvert = document.registerElement('x-advert')
var currentJSON = {
    data: {
        adverts: []
    }
}

function loadProduction() {
    loadURL('https://api.p1.com/v2/ads/ad-data?t=' + (new Date()).getTime())

}

function loadDebug() {
    loadURL('https://api.testing.p1staff.com/v2/ads/ad-data?t=' + (new Date()).getTime())
}


function loadFile() {
    var input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    _URL = window.URL || window.webkitURL;
    input.onchange = function() {
        var file = input.files[0]
        var url = _URL.createObjectURL(file);
        loadURL(url)
    }
    input.click()
}

function loadURL(url) {
    var request = new XMLHttpRequest()
    request.responseType = 'json'
    request.onload = function() {
        currentJSON = request.response
        showCurrentAdverts()
    }
    request.open('GET', url)
    request.send()
}

function showCurrentAdverts() {
    console.log(currentJSON)
    var elements = document.getElementsByTagName('x-advert')
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0])
    }
    var adverts = currentJSON['data']['adverts']
    adverts.forEach(function(advert) {
         addAdvert(advert)
    });
}

function addAdvert(data) {
    var advert = document.createElement('x-advert')
    var table = document.createElement('table')
    table.style = 'width:100%;table-layout:fixed'
    var row = document.createElement('tr')

    var imageCol = document.createElement('td')
    imageCol.style = 'width:25%'
    var image = document.createElement('div')
    image.classList.add('imageContainer')
    var picture = data['pictures'][0]
    image.style.backgroundImage = picture != null ? 'url(\'' + picture['url'] + '\')' : null
    imageCol.appendChild(image)
    row.appendChild(imageCol)

    var labelCol = document.createElement('td')
    labelCol.style = 'width:20%;padding-right:30px'
    var dataCol = document.createElement('td')
    dataCol.style = 'width:55%'

    appendLabel('ID', labelCol, data['id'], dataCol)
    appendLabel('Name', labelCol, data['name'] || '-', dataCol)
    appendLabel('Start', labelCol, formatDate(data['start_date']), dataCol)
    appendLabel('End', labelCol, formatDate(data['end_date']), dataCol)
    appendLabel('Count', labelCol, data['max_view_count'], dataCol)
    appendLabel('Delay', labelCol, formatDuration(data['min_view_delay']), dataCol)
    appendLabel('Display', labelCol, formatDuration(data['display_time']), dataCol)
    appendLabel('Link', labelCol, data['link'], dataCol)
    row.appendChild(labelCol)
    row.appendChild(dataCol)

    table.appendChild(row)
    advert.appendChild(table)
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))

    var identifier = data['id']
    var center = document.createElement('center')
    var editButton = document.createElement('button')
    editButton.textContent = 'Edit'
    editButton.classList.add('edit');
    editButton.onclick = function() {
        var advert = currentJSON['data']['adverts'].filter(function(advert) {
               return advert['id'] == identifier
        })[0]
        editAdvert(JSON.parse(JSON.stringify(advert)))
    }
    var deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete'
    deleteButton.classList.add('delete');
    deleteButton.onclick = function() { deleteAdvert(identifier) }
    center.appendChild(editButton)
    center.appendChild(deleteButton)
    advert.appendChild(center)

    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    advert.appendChild(document.createElement('br'))
    document.querySelector('body').appendChild(advert)
}

function appendLabel(label, labelElement, data, dataElement) {
    var l = document.createElement('p')
    l.classList.add('label')
    l.textContent = label
    labelElement.appendChild(l)

    var d = document.createElement('p')
    d.classList.add('data')
    if (label == 'Link') {
        var link = document.createElement('a')
        link.href = data
        link.textContent = data
        d.appendChild(link)
    } else {
        d.textContent = data
    }
    dataElement.appendChild(d)
}

function formatDuration(duration) {
    if (duration < 60) {
        return '' + duration + ' seconds'
    } else if (duration < 60 * 60) {
        return '' + (duration / 60) + ' minutes'
    } else if (duration < 60 * 60 * 24) {
        return '' + (duration / (60 * 60)) + ' hours'
    } else if (duration < 60 * 60 * 24 * 7) {
        return '' + (duration / (60 * 60 * 24)) + ' days'
    } else {
        return '' + (duration / (60 * 60 * 24 * 7)) + ' weeks'
    }
}

function formatDate(date) {
    var d = new Date(date)
    return '' + d.toLocaleDateString() + ' (' + d.toDateString() + ')'
}

function saveAdverts() {
    currentJSON['pagination'] = {
        offset: 0,
        limit: 100,
        total: currentJSON['data']['adverts'].length
    }

    var error = validateJSON(currentJSON)
    if (error != null) { alert(error); return }

    var a = document.createElement('a');
    var data = JSON.stringify(currentJSON, null, 2)
    var file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'adverts.json';
    a.click();
}

function deleteAdvert(advertID) {
    if (confirm("Are you sure you want to delete the advert?") == false) { return }
    var adverts = currentJSON['data']['adverts']
    var filtered = adverts.filter(function(advert) {
        return advert['id'] != advertID
    })
    currentJSON['data']['adverts'] = filtered
    showCurrentAdverts()
}

function simpleISOFormat(date) {
    return [
        date.getFullYear(),
        ('0' + (date.getMonth() + 1)).slice(-2),
        ('0' + date.getDate()).slice(-2)
    ].join('-');
}

function editAdvert(advert) {
    var picture = advert['pictures'][0]
    document.getElementById('editImage').style.backgroundImage = picture != null ? 'url(\'' + picture['url'] + '\')' : null
    document.getElementById('editImage').onclick = function() {
        selectImage(advert)
    }
    document.getElementById('editID').textContent = advert['id']
    configureTextInput(document.getElementById('editName'), 'name', advert)
    configureDateInput(document.getElementById('editStart'), 'start_date', advert)
    configureDateInput(document.getElementById('editEnd'), 'end_date', advert)
    configureNumberInput(document.getElementById('editCount'), 'max_view_count', advert)
    configureNumberInput(document.getElementById('editDelay'), 'min_view_delay', advert)
    configureNumberInput(document.getElementById('editDisplay'), 'display_time', advert)
    document.getElementById('editLink').value = advert['link']
    document.getElementById('editLink').onchange = function() {
        advert['link'] = document.getElementById('editLink').value
    }
    document.getElementById('editSaveButton').onclick = function() {
        saveEdit(advert)
    }
    var modal = document.getElementById('editModal')
    modal.style.display = 'block'
}

function configureTextInput(input, field, advert) {
    input.value = advert['name'] || ''
    input.onchange = function() {
        advert[field] = input.value
    }
}

function configureDateInput(input, field, advert) {
    input.value = simpleISOFormat(new Date(advert[field]))
    input.onchange = function() {
        advert[field] = simpleISOFormat(new Date(input.value))
    }
}

function configureNumberInput(input, field, advert) {
    input.value = advert[field]
    input.onchange = function() {
        advert[field] = input.value
    }
}

function selectImage(advert) {
    var input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jpg,.jpeg,.png'
    input.onchange = function() {
        var file = input.files[0]
        uploadImage(file, advert)
    }
    input.click()
}

function uploadImage(image, advert) {
    console.log('UPLOAD IMAGE')

    var formData = new FormData();
    formData.append('image0', image);
    var request = new XMLHttpRequest();

    request.onload = function() {
        console.log('ON LOAD')
        response = request.response
        data = response['data']['media'][0]
        imageURL = data['url']
        imageURL += imageURL.endsWith('.jpg') ? '' : '.jpg'
        imageURL += '?format=max_960xX'
        advert.pictures = [{
           width: data['size'][0],
           height: data['size'][1],
           url: imageURL
        }]
        console.log(response)
        editAdvert(advert)
    }
    request.responseType = 'json'
    request.onreadystatechange = function() {
        console.log('ON READY STATE CHANGE (' + request.readyState +')')
        if (request.readyState == 1) {
            document.getElementById('editImage').classList.add('pulse')
        } else if (request.readyState == 4) {
            document.getElementById('editImage').classList.remove('pulse')
        }
    }
    request.open('POST', 'https://cloud.tantanapp.com/v1/upload/image')
    request.send(formData)
}

function cancelEdit() {
    console.log("Cancel edit")
    var modal = document.getElementById('editModal')
    modal.style.display = 'none'
}

function saveEdit(advert) {
    var error = validateAdvert(advert)
    if (error != null) { alert(error); return }

    var adverts = currentJSON['data']['adverts']
    var index = indexOfAdvert(advert)
    if (index == null) {
        adverts.splice(0, 0, advert)
    } else {
        adverts[index] = advert
    }

    var modal = document.getElementById('editModal')
    modal.style.display = 'none'
    showCurrentAdverts()
}

function indexOfAdvert(advert) {
    var adverts = currentJSON['data']['adverts']
    for(var i = 0, len = adverts.length; i < len; i++) {
        if (adverts[i]['id'] == advert['id']) {
            return i
        }
    }
    return null
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function dateWithOffset(offset) {
    var date = new Date()
    date.setDate(date.getDate() + offset)
    return date
}

function addNewAdvert() {
    var advert = {
        id: uuid(),
        type: 'advert',
        advert_type: 'splash',
        start_date: simpleISOFormat(dateWithOffset(7)),
        end_date: simpleISOFormat(dateWithOffset(14)),
        max_view_count: 10,
        min_view_delay: 86400,
        display_time: 5,
        link: '',
        pictures: []
    }
    editAdvert(advert)
}

function validateJSON(jsonData) {
    if (jsonData == null) { return 'Adverts data is empty' }
    var data = jsonData['data']
    if (data == null) { return '\"data\" object is missing' }
    var adverts = data['adverts']
    if (adverts == null) { return '\"adverts\" object is missing' }
    var pagination = jsonData['pagination']
    if (pagination == null) { return '\"pagination\" object is missing' }
    if (pagination['limit'] != 100) { return 'Pagination has faulty \"limit\"' }
    if (pagination['offset'] != 0) { return 'Pagination has faulty \"offset\"' }
    if (pagination['total'] != adverts.length) { return 'Pagination has faulty \"total\"' }

    for (var i = 0; i < adverts.length; i++) {
        var error = validateAdvert(adverts[i])
        if (error != null) { return error }
    }
    return null
}

function validateAdvert(advert) {
    var identifier = advert['id']
    if (identifier == null || identifier.length == 0) { return 'Missing \"id\"' }
    var type = advert['type']
    if (type == null || type != 'advert') { return 'Missing \"type\"' }
    var name = advert['name']
    if (name == null || name.length == 0) { return 'Missing \"name\"' }
    var start = advert['start_date']
    if (start == null || isNaN(Date.parse(start))) { return 'Missing \"start_date\"' }
    var end = advert['end_date']
    if (end == null || isNaN(Date.parse(end))) { return 'Missing \"end_date\"' }
    var count = advert['max_view_count']
    if (count == null || count < 0) { return 'Faulty \"max_view_count\"' }
    var delay = advert['min_view_delay']
    if (delay == null || delay < 0) { return 'Faulty \"min_view_delay\"' }
    var display = advert['display_time']
    if (display == null || display < 0) { return 'Faulty \"display_time"' }
    var link = advert['link']
    if (link == null || !isValidURL(link)) { return 'Faulty \"link\"' }
    var pictures = advert['pictures']
    if (pictures == null || pictures.length == 0) { return 'Missing \"pictures\"' }
    var advertType = advert['advert_type']
    if (advertType == null || advertType != 'splash') { return 'Missing \"advert_type\"' }
    return null
}

function isValidURL(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch (_) {
        return false;  
    }
}
