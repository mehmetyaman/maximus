function populateTargetComboBox (target, value) {

  if (value === '-1') {
    return false
  } else {
    // using the function:
    removeOptions(target)

    var opt = document.createElement('option')
    opt.value = '-1'
    opt.innerHTML = 'Choose'
    target.appendChild(opt)

    for (var i = 0; i < data.length; i++) {
      if (value === data[i].lang_short) {  // don't put same language to the target dropdown
        continue
      }
      var opt = document.createElement('option')
      opt.value = data[i].lang_short
      opt.innerHTML = data[i].lang_desc
      target.appendChild(opt)

    }

  }
}

function removeOptions (selectbox) {
  var i
  for (i = selectbox.options.length - 1; i >= 0; i--) {
    selectbox.remove(i)
  }
}

function addLanguagePair (langArray) {
  langArray.push('dsfsdf')
  alert(langArray)
}
