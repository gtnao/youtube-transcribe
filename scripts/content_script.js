'use strict';

(function() {
  console.log('contents script is loading'); // debug

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // constructor
  var Content = function() {
    // Fields
    // Audio
    this.audioCtx = new AudioContext();
    this.source = null;
    this.videoEl = null;
    this.input = this.audioCtx.createGain();
    this.peakings = new Array(10);
    this.nonPitchChangeMode = this.audioCtx.createGain();
    this.pitchChangeMode= this.audioCtx.createGain();
    this.jungle = new Jungle(this.audioCtx);
    this.output = this.audioCtx.createGain();
    // parameter
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.pitch = 0;
    // other
    this.alreadyLoaded = false;

    connectNode(this);

    // default settings
    this.input.gain.value = 1;
    this.output.gain.value = 1;
    this.jungle.setPitchOffset(0, false);
    this.pitchChangeMode.gain.value = 0;
    this.nonPitchChangeMode.gain.value = 1;

    assignEvent(this);

    loadVideo(this);
  };

  // methods
  Content.prototype = {
    play: function() {
      this.videoEl.play();
    },
    pause: function() {
      this.videoEl.pause();
    },
    back: function(seconds) {
      this.videoEl.currentTime = this.videoEl.currentTime - seconds;
    },
    changeTime: function(seconds) {
      this.videoEl.currentTime = seconds;
    },
    changeVolume: function(volume) {
      this.videoEl.volume = volume;
    },
    changeSpeed: function(speed) {
      this.videoEl.playbackRate = speed;
    },
    changePitch: function(pitch) {
      this.pitch = pitch;
      if (pitch === 0){
        this.nonPitchChangeMode.gain.value = 1;
        this.pitchChangeMode.gain.value = 0;
      } else {
        this.nonPitchChangeMode.gain.value = 0;
        this.pitchChangeMode.gain.value = 1;
      }
      this.jungle.setPitchOffset(pitchConvert(pitch), false);
    },
    enableLoop: function(isEnabled) {
      this.loop = isEnabled;
    },
    setLoopStart: function(seconds) {
      this.loopStart = seconds;
    },
    setLoopEnd: function(seconds) {
      this.loopEnd = seconds;
    },
    changeEq: function(zoneIdx, gain) {
      this.peakings[zoneIdx].gain.value = gain;
    },
    resetEq: function() {
      this.peakings.forEach(function (peaking) {
        peaking.gain.value = 0;
      });
    }
  };
  // create instance
  new Content();
})();


/**
 * functions
 */

function connectNode(that) {
  eqSet(that);
  that.input.connect(that.peakings[0]);
  that.peakings[9].connect(that.pitchChangeMode);
  that.peakings[9].connect(that.nonPitchChangeMode);
  that.pitchChangeMode.connect(that.jungle.input);
  that.nonPitchChangeMode.connect(that.output);
  that.jungle.output.connect(that.output);
  that.output.connect(that.audioCtx.destination);
}
function eqSet(that) {
  var frequency = 31.25;
  for (var i = 0; i < 10; i++) {
    var peaking = that.audioCtx.createBiquadFilter();
    if (i !== 0) {
      frequency *= 2;
    }
    peaking.type = (typeof peaking.type === 'string') ? 'peaking' : 5;
    peaking.frequency.value = frequency;
    peaking.Q.value = 2;
    peaking.gain.value = 0;
    that.peakings[i] = peaking;
  }
  that.peakings.forEach(function(peaking, index, ps) {
    if (index < 9) {
      peaking.connect(ps[index + 1]);
    }
  });
}

function loadVideo(that) {
  var video = document.getElementsByTagName('video')[0];
  if (video === undefined) {
    console.log('not found video');
  } else {
    console.log(video);
    that.alreadyLoaded = true;
    that.source = that.audioCtx.createMediaElementSource(video);
    that.videoEl = that.source.mediaElement;
    that.source.connect(that.input);
    console.log(that.source);
    video.addEventListener('loadeddata', function() {
      console.log('loadeddata');
      that.loopEnd = video.duration;
      // 動画が変化したときなどのイベント
    });
    // video.addEventListener('timeupdate', function() {
    //   // update current time
    //   chrome.runtime.sendMessage({type: 'every_seconds', currentTime: that.source.mediaElement.currentTime, duration: that.source.mediaElement.duration}, function(response) {
    //   });
    //   // Loop setting
    //   if (that.loop && that.loopEnd <= that.source.mediaElement.currentTime) {
    //     that.source.mediaElement.currentTime = that.loopStart;
    //   }
    // });
  }
}

function assignEvent(that) {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
      case 'init': {
        sendResponse({
          isValid: true,
          currentTime: that.videoEl.currentTime,
          duration: that.videoEl.duration,
          loop: that.loop,
          loopStart: that.loopStart,
          loopEnd: that.loopEnd,
          isPaused: that.videoEl.paused,
          volume: that.videoEl.volume,
          speed: that.videoEl.playbackRate,
          pitch: that.pitch,
          eqVals: that.peakings.map(function(peaking) {
            return peaking.gain.value;
          })
        });
        that.videoEl.addEventListener('timeupdate', function() {
          // update current time
          chrome.runtime.sendMessage({type: 'every_seconds', tabId: message.tabId, currentTime: that.source.mediaElement.currentTime, duration: that.source.mediaElement.duration}, function(response) {
          });
          // Loop setting
          if (that.loop && that.loopEnd <= that.source.mediaElement.currentTime) {
            that.source.mediaElement.currentTime = that.loopStart;
            if (that.videoEl.paused) {
              that.videoEl.play();
            }
          }
        });
        return true;
      }
      case 'reloadVideo': {
        if (!that.alreadyLoaded) {
          setTimeout(function () {
            loadVideo(that);
          }, 500);
        }
        break;
      }
      case 'play': {
        that.play();
        break;
      }
      case 'pause': {
        that.pause();
        break;
      }
      case 'back': {
        that.back(message.seconds);
        break;
      }
      case 'changeTime': {
        that.changeTime(message.seconds);
        break;
      }
      case 'changeVolume': {
        that.changeVolume(message.volume);
        break;
      }
      case 'changeSpeed': {
        that.changeSpeed(message.speed);
        break;
      }
      case 'changePitch': {
        that.changePitch(message.pitch);
        break;
      }
      case 'enableLoop': {
        that.enableLoop(message.isEnabled);
        break;
      }
      case 'setLoopStart': {
        that.setLoopStart(message.seconds);
        break;
      }
      case 'setLoopEnd': {
        that.setLoopEnd(message.seconds);
        break;
      }
      case 'changeEq': {
        that.changeEq(message.zoneIdx, message.gain);
        break;
      }
      case 'resetEq': {
        that.resetEq();
        break;
      }
    }
  });
}

function pitchConvert(originPitchNum) {
  if (originPitchNum > 0) {
    return (Math.pow(Math.pow(2, 1/ 12), originPitchNum) - 1) * 2;
  } else if (originPitchNum < 0) {
    return -1 + (Math.pow(Math.pow(2, 1/ 12), (12 + originPitchNum)) - 1);
  } else {
    return 0;
  }
}
