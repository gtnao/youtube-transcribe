'use strict';

(function () {

  chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.get(details.tabId, function(tab) {
      if (details.url === tab.url) {
        var regExp = /https:\/\/www.youtube.com\/watch/;
        if (regExp.test(tab.url)) {
          chrome.tabs.sendMessage(tab.id, {type: 'reloadVideo'});
        }
      }
    })
  });

})();