/**
 * Created by n.nakane on 2017/12/06.
 */
$(function() {

  var pianoAudioCtx = new AudioContext();
  var gainNode = pianoAudioCtx.createGain();
  var gain = 0.1;
  var octave = 4;
  var pressingNodeNum = null;
  var oscs = {};

  gainNode.connect(pianoAudioCtx.destination);
  gainNode.gain.value = gain;

  for (var i = 0; i < 13; i++) {
    var target = $(".key[data-note='" + ((octave + 1) * 12 + i) + "']");
    switch (i) {
      case 0: target.addClass('key--c'); break;
      case 1: target.addClass('key--cis'); break;
      case 2: target.addClass('key--d'); break;
      case 3: target.addClass('key--dis'); break;
      case 4: target.addClass('key--e'); break;
      case 5: target.addClass('key--f'); break;
      case 6: target.addClass('key--fis'); break;
      case 7: target.addClass('key--g'); break;
      case 8: target.addClass('key--gis'); break;
      case 9: target.addClass('key--a'); break;
      case 10: target.addClass('key--ais'); break;
      case 11: target.addClass('key--h'); break;
      case 12: target.addClass('key--hic'); break;
    }
  }

  /**
   * assign events
   */
  $('.key').on('mousedown', function(e) {
    var note = e.target.dataset.note;
    if (oscs['NOTE_' + note] !== null && oscs['NOTE_' + note] !== undefined) {
      return;
    }
    pressingNodeNum = note;
    $(this).addClass('key--active');
    var osc = pianoAudioCtx.createOscillator();
    osc.frequency.value = 440 * Math.pow(2, (1 / 12) * (parseInt(pressingNodeNum, 10) - 69));
    osc.connect(gainNode);
    osc.start();
    oscs['NOTE_' + pressingNodeNum] = osc;
  });
  $(document)
    .on('mouseup', function(e) {
      if (pressingNodeNum !== null) {
        $(".key[data-note='" + pressingNodeNum + "']").removeClass('key--active');
        if (oscs['NOTE_' + pressingNodeNum] !== null && oscs['NOTE_' + pressingNodeNum] !== undefined) {
          oscs['NOTE_' + pressingNodeNum].stop();
          oscs['NOTE_' + pressingNodeNum] = null;
        }
        pressingNodeNum = null;
      }
    })
    .on('keydown', function (e) {
      switch (e.key) {
        case 'a': pressChar((octave + 1) * 12); break;
        case 'w': pressChar((octave + 1) * 12 + 1); break;
        case 's': pressChar((octave + 1) * 12 + 2); break;
        case 'e': pressChar((octave + 1) * 12 + 3); break;
        case 'd': pressChar((octave + 1) * 12 + 4); break;
        case 'f': pressChar((octave + 1) * 12 + 5); break;
        case 't': pressChar((octave + 1) * 12 + 6); break;
        case 'g': pressChar((octave + 1) * 12 + 7); break;
        case 'y': pressChar((octave + 1) * 12 + 8); break;
        case 'h': pressChar((octave + 1) * 12 + 9); break;
        case 'u': pressChar((octave + 1) * 12 + 10); break;
        case 'j': pressChar((octave + 1) * 12 + 11); break;
        case 'k': pressChar((octave + 1) * 12 + 12); break;
      }
    })
    .on('keyup', function (e) {
      switch (e.key) {
        case 'a': releaseChar((octave + 1) * 12); break;
        case 'w': releaseChar((octave + 1) * 12 + 1); break;
        case 's': releaseChar((octave + 1) * 12 + 2); break;
        case 'e': releaseChar((octave + 1) * 12 + 3); break;
        case 'd': releaseChar((octave + 1) * 12 + 4); break;
        case 'f': releaseChar((octave + 1) * 12 + 5); break;
        case 't': releaseChar((octave + 1) * 12 + 6); break;
        case 'g': releaseChar((octave + 1) * 12 + 7); break;
        case 'y': releaseChar((octave + 1) * 12 + 8); break;
        case 'h': releaseChar((octave + 1) * 12 + 9); break;
        case 'u': releaseChar((octave + 1) * 12 + 10); break;
        case 'j': releaseChar((octave + 1) * 12 + 11); break;
        case 'k': releaseChar((octave + 1) * 12 + 12); break;
      }
    });
  $('.octave-selector__block').on('click', function(e) {
    for (var o of Object.keys(oscs)) {
      if (oscs[o] !== null && oscs[o] !== undefined) {
        oscs[o].stop();
        oscs[o] = null;
        $('.key.key--active').removeClass('key--active');
      }
    }
    console.log($('.octave-selector__block--active'), $(this));
    $('.octave-selector__block--active').removeClass('octave-selector__block--active');
    $(this).addClass('octave-selector__block--active');
    for (var i = 0; i < 13; i++) {
      var target = $(".key[data-note='" + ((octave + 1) * 12 + i) + "']");
      switch (i) {
        case 0: target.removeClass('key--c'); break;
        case 1: target.removeClass('key--cis'); break;
        case 2: target.removeClass('key--d'); break;
        case 3: target.removeClass('key--dis'); break;
        case 4: target.removeClass('key--e'); break;
        case 5: target.removeClass('key--f'); break;
        case 6: target.removeClass('key--fis'); break;
        case 7: target.removeClass('key--g'); break;
        case 8: target.removeClass('key--gis'); break;
        case 9: target.removeClass('key--a'); break;
        case 10: target.removeClass('key--ais'); break;
        case 11: target.removeClass('key--h'); break;
        case 12: target.removeClass('key--hic'); break;
      }
    }
    octave = parseInt(e.target.dataset.octave, 16);
    for (i = 0; i < 13; i++) {
      target = $(".key[data-note='" + ((octave + 1) * 12 + i) + "']");
      switch (i) {
        case 0: target.addClass('key--c'); break;
        case 1: target.addClass('key--cis'); break;
        case 2: target.addClass('key--d'); break;
        case 3: target.addClass('key--dis'); break;
        case 4: target.addClass('key--e'); break;
        case 5: target.addClass('key--f'); break;
        case 6: target.addClass('key--fis'); break;
        case 7: target.addClass('key--g'); break;
        case 8: target.addClass('key--gis'); break;
        case 9: target.addClass('key--a'); break;
        case 10: target.addClass('key--ais'); break;
        case 11: target.addClass('key--h'); break;
        case 12: target.addClass('key--hic'); break;
      }
    }
  });
  $('#piano-volume').on('change', function(e) {
    gain = $(this).val() / 100;
    gainNode.gain.value = gain;
    $('#piano-volume-num').text($(this).val());
  });

  function pressChar(noteNum) {
    if (noteNum == pressingNodeNum) {
      return;
    }
    if (oscs['NOTE_' + noteNum] !== null && oscs['NOTE_' + noteNum] !== undefined) {
      return;
    }
    $(".key[data-note='" + noteNum + "']").addClass('key--active');
    var osc = pianoAudioCtx.createOscillator();
    osc.frequency.value = 440 * Math.pow(2, (1 / 12) * (parseInt(noteNum, 10) - 69));
    osc.connect(gainNode);
    osc.start();
    oscs['NOTE_' + noteNum] = osc;

  }
  function releaseChar(noteNum) {
    if (noteNum == pressingNodeNum) {
      return;
    }
    $(".key[data-note='" + noteNum + "']").removeClass('key--active');
    if (oscs['NOTE_' + noteNum] !== null && oscs['NOTE_' + noteNum] !== undefined) {
      oscs['NOTE_' + noteNum].stop();
      oscs['NOTE_' + noteNum] = null;
    }
  }
});