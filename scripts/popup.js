'use strict';

(function () {
  // constructor
  var Popup = function() {
    var self = this;
    this.isOn = false;
    this.isPlay = true;
    this.bg = null;

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      self.bg = backgroundPage.bg;
      $('#volume-range').val(self.bg.volume);
    });
  };
  // create instance
  var popup = new Popup();

  // Event Listeners
  $('#on-off-slider').on('click', function () {
    var input = $('#on-off-input');
    input.prop('checked', !input.prop('checked'));
    if (popup.isOn) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'off'});
      });
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'on'});
      });
    }
    popup.isOn = !popup.isOn;
  });
  $('#play-btn').on('click', function () {
    if (popup.isPlay) {
      $('#play-btn-svg').css('display', 'inline');
      $('#pause-btn-svg').css('display', 'none');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'pause'});
      });
    } else {
      $('#play-btn-svg').css('display', 'none');
      $('#pause-btn-svg').css('display', 'inline');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'play'});
      });
    }
    popup.isPlay = !popup.isPlay;
  });
  $('#replay-five-btn').on('click', function () {
    console.log('replay-five-btn-clicked');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 5});
    });
  });
  $('#replay-ten-btn').on('click', function () {
    console.log('replay-ten-btn-clicked');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 10});
    });
  });
  $('#replay-fifteen-btn').on('click', function () {
    console.log('replay-fifteen-btn-clicked');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 30});
    });
  });
  $('#volume-range').on('input', function () {
    var val = $(this).val();
    var volume = Number(val) / 100;
    $("#volumen-num").text(val);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeVolume', volume: volume});
    });
    console.log(popup.bg);
    popup.bg.volume = val;
  });
  $('#speed-range').on('input', function () {
    var val = $(this).val();
    var speed = Number(val) / 100;
    $("#speed-num").text('x' + speed);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeSpeed', speed: speed});
    });
  });
  $('#pitch-range').on('input', function () {
    var val = $(this).val();
    var pitch = Number(val);
    $("#pitch-num").text(val);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changePitch', pitch: pitch});
    });
  });
})();