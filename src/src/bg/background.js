chrome.extension.onRequest.addListener(function (request, sender) {
  const words = request.message;
  const jax = new XMLHttpRequest();

  jax.open("GET", "http://jisho.org/api/v1/search/words?keyword=" + words);
  jax.send();
  jax.onreadystatechange = function () {
    if (jax.readyState === 4) {
      const responseText = jax.responseText;
      const responseObject = JSON.parse(responseText);
      const data = responseObject.data;
      const record = data[0];
      const word = record.japanese[0].word;
      const readings = record.japanese.map(j => j.reading);
      const senses = record.sences.map(sense => ({
        meanings: sense.english_definitions,
        partOfSpeech: sense.parts_of_speech,
      }));

      const obj = {[word]: {word, readings, senses}};

      storeWord(obj);
      returnMessage(record);
    }
  };
});

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
      word: japanese.word,
      reading: japanese.reading,
      tags: tags,
      english_definitions: english_definitions,
      parts_of_speech: parts_of_speech,
    });
  });
}
