const trigger_key = 74; //ASCII key code for the letter 'J'
let positionX = 0;
let positionY = 0;

if (window === top) {
    window.addEventListener('keyup', doKeyPress, false);
    window.addEventListener('mouseup',createPopupWindow, false);
}

function doKeyPress(e) {
	if (e.keyCode === trigger_key) {
	  chrome.extension.sendMessage({type: 'FETCH_DICTIONARY_DATA'});}
}

function createPopupWindow(event) {
	positionX = event.pageX;
	positionY = event.pageY;
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  switch (request.type) {
    case 'SHOW_DICTIONARY': {
      $("#jhint_newDiv").remove();

      const $newDiv = $('<div>');
      const $contentDiv = $('<div>');

      $contentDiv.attr("id", "jhint_contentDiv");
      $newDiv.attr("id", "jhint_newDiv");

      const english_definitions = request.english_definitions ? request.english_definitions.join(', ') : '';
      const reading = request.reading || '';
      const word = request.word || '';
      const parts_of_speech = request.parts_of_speech || [];

      const $character = $('<ruby>').text(word).append($('<rt>').text(reading));
      const $parts_of_speech = parts_of_speech.length && $('<p>');

      parts_of_speech.map(function (item) {
        $parts_of_speech.append($('<span class="jhint_partOfSpeech">').text(item));
      });

      $contentDiv
        .append($('<a>').addClass("jhint_boxclose").attr("id", "jhint_boxclose"))
        .append($('<p>').append($character))
        .append($('<p>').text(english_definitions))
        .append($parts_of_speech)
        .append($('<p>')
          .append($('<a>')
            .attr("target", "_blank")
            .attr("href", "http://jisho.org/search/" + word)
            .text('search from jisho.org')
          )
        );

      $newDiv.append($contentDiv);

      $('body').append($newDiv);

      $boxclose = $("#jhint_boxclose");

      const width = $("#jhint_newDiv").innerWidth();
      const height = $("#jhint_newDiv").innerHeight();
      const currentY = positionY + 25;
      const currentX = positionX - 25;

      $newDiv.css("top", currentY + "px");
      $newDiv.css("left", currentX + "px");

      $boxclose.click(function(event) {
        $newDiv.remove();
      });
    }
    default: {
      return ;
    }
  }
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    const storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
    console.log(storageChange.newValue);
  }
});
