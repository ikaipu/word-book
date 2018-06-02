chrome.extension.onMessage.addListener(function (request, sender) {
  switch (request.type) {
    case 'FETCH_DICTIONARY_DATA': {
      console.log('FETCH_DICTIONARY_DATA');
      const sel = getClipboardText();

      if (sel.length) {
        const words = encodeURI(sel);
        const jax = new XMLHttpRequest();

        jax.open("GET", "http://jisho.org/api/v1/search/words?keyword=" + words);
        jax.send();
        jax.onreadystatechange = function () {
          if (jax.readyState === 4) {
            const responseText = jax.responseText;
            const responseObject = JSON.parse(responseText);
            const data = responseObject.data;
            const record = data[0];
            const word = record.japanese[0].word || record.japanese[0].reading;
            const readings = record.japanese.map(j => j.reading);
            const senses = record.senses.map(sense => ({
              meanings: sense.english_definitions,
              partOfSpeech: sense.parts_of_speech,
            }));

            const obj = {[word]: {word, readings, senses}};

            storeWord(obj);
            returnMessage(record);
          }
        };
      }
      return;
    }
    default:{
      return;
    }
  }
});

function getClipboardText() {
  const helperdiv = document.createElement("div");
  document.body.appendChild(helperdiv);
  helperdiv.contentEditable = true;

  // focus the helper div's content
  const range = document.createRange();
  range.selectNode(helperdiv);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  helperdiv.focus();

  // trigger the paste action
  document.execCommand("Paste");

  // read the clipboard contents from the helperdiv
  const clipboardText = helperdiv.innerText;
  return clipboardText;
}


function storeWord(wordObj) {
  chrome.storage.sync.get(['dictionary'], function (items) {
    const next = {...items.dictionary, ...wordObj};
    chrome.storage.sync.set({dictionary: next});
  });

}

function returnMessage(current) {
  const japanese = current.japanese[0];
  const tags = current.tags[0];
  const senses = current.senses[0];
  const english_definitions = senses.english_definitions;
  const parts_of_speech = senses.parts_of_speech;

  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_DICTIONARY',
      word: japanese.word,
      reading: japanese.reading,
      tags: tags,
      english_definitions: english_definitions,
      parts_of_speech: parts_of_speech,
    });
  });
}

window.onload = function() {
  chrome.storage.sync.clear();
}
