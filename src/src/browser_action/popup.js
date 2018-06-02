window.addEventListener('click',function(e){
  if(e.target.href){
    chrome.tabs.create({url:e.target.href})
  }
})

const initialRecord = {
  word: '',
  readings: [],
  senses: [],
}

const initialSense = {
  partOfSpeech: [],
  meanings: [],
}

function renderDictionary(dictionary = {}) {
  $('.list').remove();
  $('#mainPopup').append(getDictionaryDom(dictionary));
}

function getDictionaryDom (dictionary = {}) {
  const $list = $('<ul>').addClass('list');
  const $listContent = Object.keys(dictionary).map(key => {
    const record = {...initialRecord, ...dictionary[key]};

    const $element =$('<li>').addClass('element');

    const $row = $('<div>').addClass('row');

    const $wordRow = $row.clone().addClass('word-row');
    const $rowContent = $('<div>').addClass('row-content');

    const $word = $rowContent.clone().addClass('word').append(record.word);
    const $reading = $rowContent.clone().addClass('reading').append(record.readings.join('/'));
    $wordRow.append($word).append($reading);

    const $senses = record.senses.map(s => {
      const sense = {...initialSense, ...s}
      const $partOfSpeechRow = $row.clone().addClass('part-of-speech-row');
      const $partOfSpeech = $rowContent.clone().addClass('part-of-speech').append(`${sense.partOfSpeech.join('/')}`);
      $partOfSpeechRow.append($partOfSpeech);

      const $descriptionRow = $row.clone().addClass('description-row');
      const $description = $rowContent.clone().addClass('description').append(sense.meanings.join(', '));
      $descriptionRow.append($description);

      return $('<div>').append($partOfSpeechRow).append($descriptionRow);
    });

    return $element.append($wordRow).append($senses);

  })

  return $list.append($listContent);
}


window.onload = function() {
  chrome.storage.sync.get(['dictionary'], function (items) {
    console.log(items.dictionary);
    renderDictionary(items.dictionary);
  });
}
