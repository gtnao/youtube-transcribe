'use strict';

(function() {
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
    // For Vocal Canceller
    this.nonVocalCancelMode = this.audioCtx.createGain();
    this.vocalCancelMode= this.audioCtx.createGain();
    this.dest = this.audioCtx.createGain();
    this.splitter = this.audioCtx.createChannelSplitter(2);
    this.merger = this.audioCtx.createChannelMerger(2);
    this.postMerger = this.audioCtx.createChannelMerger(2);
    this.gainNodeL = this.audioCtx.createGain();
    this.gainNodeR = this.audioCtx.createGain();
    this.reverseGainNode = this.audioCtx.createGain();
    // parameter
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 1;
    this.pitch = 0;
    this.vocalCancel = false;
    // other
    this.alreadyLoaded = false;
    this.hasVideo = false;

    connectNode(this);

    // default settings
    this.input.gain.value = 1;
    this.output.gain.value = 1;
    this.reverseGainNode.gain.value = -1;
    this.dest.gain.value = 1;
    this.gainNodeL.gain.value = 1;
    this.gainNodeR.gain.value = 1;
    this.vocalCancelMode.gain.value = 0;
    this.nonVocalCancelMode.gain.value = 1;
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
    setVocalCancel: function(isEnabled) {
      this.vocalCancel = isEnabled;
      if(this.vocalCancel === true){
        this.vocalCancelMode.gain.value = 1;
        this.nonVocalCancelMode.gain.value = 0;
      }else{
        this.vocalCancelMode.gain.value = 0;
        this.nonVocalCancelMode.gain.value = 1;
      }
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
  that.output.connect(that.vocalCancelMode);
  that.output.connect(that.nonVocalCancelMode);
  // start vocal cancel mode
  that.vocalCancelMode.connect(that.splitter);
  // phase inverse
  that.splitter.connect(that.reverseGainNode, 0);
  // merge into monoral (off vocal)
  that.reverseGainNode.connect(that.merger, 0, 0);
  that.output.connect(that.merger);
  // duplicate monoral audio
  that.merger.connect(that.gainNodeL);
  that.merger.connect(that.gainNodeR);
  that.gainNodeL.connect(that.postMerger, 0, 0);
  that.gainNodeR.connect(that.postMerger, 0, 1);
  that.postMerger.connect(that.dest); 
  that.dest.connect(that.audioCtx.destination); 
  // start non vocal cancel mode
  that.nonVocalCancelMode.connect(that.audioCtx.destination);
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
  if (video !== undefined && video.src !== '') {
    that.alreadyLoaded = true;
    that.hasVideo = true;
    that.source = that.audioCtx.createMediaElementSource(video);
    that.videoEl = that.source.mediaElement;
    that.source.connect(that.input);
    video.addEventListener('loadeddata', function() {
      that.loopEnd = video.duration;
    });
    return true;
  } else {
    return false;
  }
}

function assignEvent(that) {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
      case 'init': {
        if (!that.alreadyLoaded) {
          if (!loadVideo(that)) {
            return true;
          }
        }
        if (that.videoEl.src === '') {
          that.hasVideo = false;
          return true;
        } else {
          that.hasVideo = true;
        }
        sendResponse({
          currentTime: that.videoEl.currentTime,
          duration: that.videoEl.duration,
          loop: that.loop,
          loopStart: that.loopStart,
          loopEnd: that.loopEnd,
          vocalCancel: that.vocalCancel,
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
          chrome.runtime.sendMessage({
            type: 'timeupdate',
            tabId: message.tabId,
            currentTime: that.videoEl.currentTime,
            duration: that.videoEl.duration},
            function(response) {
          });
          // Loop setting
          if (that.loop && that.loopEnd <= that.videoEl.currentTime) {
            that.videoEl.currentTime = that.loopStart;
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
        if (!that.hasVideo) {break;}
        that.play();
        break;
      }
      case 'pause': {
        if (!that.hasVideo) {break;}
        that.pause();
        break;
      }
      case 'back': {
        if (!that.hasVideo) {break;}
        that.back(message.seconds);
        break;
      }
      case 'changeTime': {
        if (!that.hasVideo) {break;}
        that.changeTime(message.seconds);
        break;
      }
      case 'changeVolume': {
        if (!that.hasVideo) {break;}
        that.changeVolume(message.volume);
        break;
      }
      case 'changeSpeed': {
        if (!that.hasVideo) {break;}
        that.changeSpeed(message.speed);
        break;
      }
      case 'changePitch': {
        if (!that.hasVideo) {break;}
        that.changePitch(message.pitch);
        break;
      }
      case 'enableLoop': {
        if (!that.hasVideo) {break;}
        that.enableLoop(message.isEnabled);
        break;
      }
      case 'setLoopStart': {
        if (!that.hasVideo) {break;}
        that.setLoopStart(message.seconds);
        break;
      }
      case 'setLoopEnd': {
        if (!that.hasVideo) {break;}
        that.setLoopEnd(message.seconds);
        break;
      }
      case 'setVocalCancel': {
        if (!that.hasVideo) {break;}
        that.setVocalCancel(message.isEnabled);
        break;
      }
      case 'changeEq': {
        if (!that.hasVideo) {break;}
        that.changeEq(message.zoneIdx, message.gain);
        break;
      }
      case 'resetEq': {
        if (!that.hasVideo) {break;}
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
