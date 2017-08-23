'use strict';

(function () {
  // constructor
  var Popup = function() {
    var that = this;
    // fields
    this.seeking = false;
    this.isValid = false;
    this.currentTime = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.isPaused = true;
    this.volume = 50;
    this.speed = 100;
    this.pitch = 0;
    this.eqVals = new Array(10);
    this.eqVals.forEach(function(val) {
      val = 0;
    });
    this.slider = document.getElementById('slider');
    noUiSlider.create(this.slider, {
      start: [0, 100],
      connect: true,
      behaviour: 'none',
      range: {
        'min': 0,
        'max': 100
      }
    });
  };
  // methods
  // Popup.prototype = {
  // };

  // create instance
  var popup = new Popup();

  // send initialization message to content script
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'init', tabId: tabs[0].id}, function(response) {
      console.log(response);
      if (response.isValid) {
        popup.currentTime = response.currentTime;
        $('#seek-bar-range').val(response.currentTime);
        $('#current-time').text(convertSeconds(response.currentTime));
        popup.duration = response.duration;
        $('#seek-bar-range').attr('max', response.duration);
        $('#duration').text(convertSeconds(response.duration));
        popup.slider.noUiSlider.updateOptions({
          range: {
            'min': 0,
            'max': response.duration
          }
        });
        popup.loop = response.loop;
        $('#loop-switch').attr('checked', response.loop);
        popup.loopStart = response.loopStart;
        $("#loop-start-num").text(convertSeconds(response.loopStart));
        popup.loopEnd = response.loopEnd;
        $("#loop-end-num").text(convertSeconds(response.loopEnd));
        popup.slider.noUiSlider.set([response.loopStart, response.loopEnd]);
        popup.isPaused = response.isPaused;
        if (response.isPaused) {
          $('#play-btn-svg').css('display', 'inline');
          $('#pause-btn-svg').css('display', 'none');
        } else {
          $('#play-btn-svg').css('display', 'none');
          $('#pause-btn-svg').css('display', 'inline');
        }
        popup.volume = response.volume * 100;
        $('#volume-range').val(response.volume * 100);
        $("#volume-num").text(Math.floor(response.volume * 100));
        popup.speed = response.speed * 100;
        $('#speed-range').val(response.speed * 100);
        $("#speed-num").text('x' + response.speed);
        popup.pitch = response.pitch;
        $('#pitch-range').val(response.pitch);
        $("#pitch-num").text(response.pitch);
        response.eqVals.forEach(function (val, idx) {
          popup.eqVals[idx] = val;
          $('#eq' + (idx + 1)).val(val);
          $('#eq' + (idx + 1) + '-value').text(val + 'db');
        });
      }
    });
  });

  // Event Listeners
  $('#loop-slider').on('click', function() {
    if(popup.loop) {
      $('#loop-switch').attr('checked', false);
      popup.loop  = false;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'enableLoop', isEnabled: false});
      });
    } else {
      $('#loop-switch').attr('checked', true);
      popup.loop  = true;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'enableLoop', isEnabled: true});
      });
    }
  });
  $('#seek-bar-range').on('change', function() {
    var val = Number($(this).val());
    popup.seeking = false;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeTime', seconds: val});
    });
  });
  $('#seek-bar-range').on('input', function() {
    var val = Number($(this).val());
    popup.seeking = true;
    $('#current-time').text(convertSeconds(val));
  });
  $('#play-btn').on('click', function () {
    if (popup.isPaused) {
      $('#play-btn-svg').css('display', 'none');
      $('#pause-btn-svg').css('display', 'inline');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'play'});
      });
    } else {
      $('#play-btn-svg').css('display', 'inline');
      $('#pause-btn-svg').css('display', 'none');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'pause'});
      });
    }
    popup.isPaused = !popup.isPaused;
  });
  $('#replay-five-btn').on('click', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 5});
    });
  });
  $('#replay-ten-btn').on('click', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 10});
    });
  });
  $('#replay-fifteen-btn').on('click', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'back', seconds: 30});
    });
  });
  $('#volume-range').on('input', function () {
    var val = Number($(this).val());
    $("#volume-num").text(val);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeVolume', volume: val / 100});
    });
  });
  $('#speed-range').on('input', function () {
    var val = Number($(this).val());
    $("#speed-num").text('x' + val / 100);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeSpeed', speed: val / 100});
    });
  });
  $('#pitch-range').on('input', function () {
    var val = Number($(this).val());
    $("#pitch-num").text(val);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changePitch', pitch: val});
    });
  });
  $('#volume-reset-btn').on('click', function () {
    $("#volume-num").text(50);
    $('#volume-range').val(50);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeVolume', volume: 50 / 100});
    });
  });
  $('#speed-reset-btn').on('click', function () {
    $("#speed-num").text('x' + 100 / 100);
    $('#speed-range').val(100);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeSpeed', speed: 100 / 100});
    });
  });
  $('#pitch-reset-btn').on('click', function () {
    $("#pitch-num").text(0);
    $('#pitch-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changePitch', pitch: 0});
    });
  });
  $('#eq1').on('input', function () {
    var val = Number($(this).val());
    $('#eq1-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 0, gain: val});
    });
  });
  $('#eq2').on('input', function () {
    var val = Number($(this).val());
    $('#eq2-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 1, gain: val});
    });
  });
  $('#eq3').on('input', function () {
    var val = Number($(this).val());
    $('#eq3-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 2, gain: val});
    });
  });
  $('#eq4').on('input', function () {
    var val = Number($(this).val());
    $('#eq4-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 3, gain: val});
    });
  });
  $('#eq5').on('input', function () {
    var val = Number($(this).val());
    $('#eq5-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 4, gain: val});
    });
  });
  $('#eq6').on('input', function () {
    var val = Number($(this).val());
    $('#eq6-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 5, gain: val});
    });
  });
  $('#eq7').on('input', function () {
    var val = Number($(this).val());
    $('#eq7-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 6, gain: val});
    });
  });
  $('#eq8').on('input', function () {
    var val = Number($(this).val());
    $('#eq8-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 7, gain: val});
    });
  });
  $('#eq9').on('input', function () {
    var val = Number($(this).val());
    $('#eq9-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 8, gain: val});
    });
  });
  $('#eq10').on('input', function () {
    var val = Number($(this).val());
    $('#eq10-value').text(val + 'db');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeEq', zoneIdx: 9, gain: val});
    });
  });
  $('#eq-reset-btn').on('click', function () {
    for (var i = 0; i < 10; i++) {
      $('#eq' + (i + 1)).val(0);
      $('#eq' + (i + 1) + '-value').text(0 + 'db');
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'resetEq'});
    });
  });
  popup.slider.noUiSlider.on('end', function(values, handle){
    if (handle === 0) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopStart', seconds: Number(values[0])});
      });
    } else if (handle === 1) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopEnd', seconds: Number(values[1])});
      });
    }
  });
  popup.slider.noUiSlider.on('update', function(values, handle){
    if (handle === 0) {
      $("#loop-start-num").text(convertSeconds(values[0]));
    } else if (handle === 1) {
      $("#loop-end-num").text(convertSeconds(values[1]));
    }
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(tabs[0].id === request.tabId) {
          if (request.type === 'every_seconds') {
            console.log(request);
            if (!popup.seeking) {
              $('#seek-bar-range').val(request.currentTime);
              $('#current-time').text(convertSeconds(request.currentTime));
              if (request.duration !== popup.duration) {
                popup.duration = request.duration;
                $('#seek-bar-range').attr('max', request.duration);
                $('#duration').text(convertSeconds(request.duration));
                popup.slider.noUiSlider.updateOptions({
                  range: {
                    'min': 0,
                    'max': request.duration
                  }
                });
                popup.slider.noUiSlider.set([0, request.duration]);
                popup.loopStart = 0;
                popup.loopStart = request.duration;
                $('#loop-start-num').text(convertSeconds(0));
                $('#loop-end-num').text(convertSeconds(request.duration));
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopStart', seconds: popup.loopStart});
                });
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopEnd', seconds: popup.loopEnd});
                });
              }
            }
          }
        }
      });
    }
  );

})();


/* functions */

function convertSeconds(rawSeconds) {
  var minutes = Math.floor(rawSeconds / 60);
  var seconds = Math.floor(rawSeconds % 60);
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return minutes + ':' + seconds;
}
