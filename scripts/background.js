'use strict';
(function () {
  var Background = function() {
    var self = this;
    this.volume = 50;
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        switch (request.type) {
          case 'updateTime': {
            break;
          }
        }
      });
  };
  window.bg = new Background();
})();