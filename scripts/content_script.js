'use strict';

(function() {
  // constructor
  var Content = function() {
    this.audioCtx = new AudioContext();
    this.video = null;
    this.gainNode= this.audioCtx.createGain();
    this.nonPitchChangeMode = this.audioCtx.createGain();
    this.pitchChangeMode= this.audioCtx.createGain();
    this.jungle = new Jungle(this.audioCtx);

    this.gainNode.connect(this.pitchChangeMode);
    this.gainNode.connect(this.nonPitchChangeMode);
    this.pitchChangeMode.connect(this.jungle.input);
    this.nonPitchChangeMode.connect(this.audioCtx.destination);
    this.jungle.output.connect(this.audioCtx.destination);
    this.gainNode.gain.value = 0.5;
    this.jungle.setPitchOffset(0, false);
    this.pitchChangeMode.gain.value = 0;
    this.nonPitchChangeMode.gain.value = 1;

    assignEvent(this);
  };

  // add methods
  Content.prototype = {
    on: function() {
      var video = document.getElementsByClassName("video-stream")[0];
      if (video.length === 0) {
        console.log('not found video');
      } else {
        this.video = this.audioCtx.createMediaElementSource(video);
        this.video.connect(this.gainNode);
      }
    },
    off: function() {
      this.video = null;
    },
    play: function() {
      this.video.mediaElement.play();
    },
    pause: function() {
      this.video.mediaElement.pause();
    },
    back: function(seconds) {
      this.video.mediaElement.currentTime = this.video.mediaElement.currentTime - seconds;
    },
    changeVolume: function(volume) {
      this.gainNode.gain.value = volume;
    },
    changeSpeed: function(speed) {
      this.video.mediaElement.playbackRate = speed;
    },
    changePitch: function(pitch) {
      if (pitch === 0){
        this.nonPitchChangeMode.gain.value = 1;
        this.pitchChangeMode.gain.value = 0;
      } else {
        this.nonPitchChangeMode.gain.value = 0;
        this.pitchChangeMode.gain.value = 1;
      }
      this.jungle.setPitchOffset(pitchConvert(pitch), false);
    }
  };

  // functions
  function assignEvent(self) {
    chrome.runtime.onMessage.addListener(function(message) {
      switch (message.type) {
        case 'on': {
          self.on();
          break;
        }
        case 'off': {
          self.off();
          break;
        }
        case 'play': {
          self.play();
          break;
        }
        case 'pause': {
          self.pause();
          break;
        }
        case 'changeTime': {
          self.changeTime(message.seconds);
          break;
        }
        case 'enableLoop': {
          self.enableLoop();
          break;
        }
        case 'setLoopStart': {
          self.setLoopStart(message.seconds);
          break;
        }
        case 'setLoopEnd': {
          self.setLoopEnd(message.seconds);
          break;
        }
        case 'back': {
          self.back(message.seconds);
          break;
        }
        case 'changeVolume': {
          self.changeVolume(message.volume);
          break;
        }
        case 'changeSpeed': {
          self.changeSpeed(message.speed);
          break;
        }
        case 'changePitch': {
          self.changePitch(message.pitch);
          break;
        }
      }
    });
  }
  function pitchConvert(originPitchNum) {
    if (originPitchNum > 0) {
      return (Math.pow(Math.pow(2, 1/ 12), originPitchNum) - 1) * 2;
    } else if (originPitchNum < 0) {
      return - Math.pow(Math.pow(2, 1/ 12), originPitchNum);
    } else {
      return 0;
    }
  }

  // create instance
  new Content();
})();