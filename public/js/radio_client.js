function RadioClient (config) {
  if (! (this instanceof arguments.callee)){
    return new arguments.callee(arguments);
  }
  
  var self = this;
  
  self.config = config;
  
  this.init = function(){
    self.currentTrack = false;
    self.setupBayeuxHandlers();
    self.setupDOMHandlers();
    self.startRadio();
  };
  
  this.setupBayeuxHandlers = function(){
    self.config.fayeClient.subscribe('/radio', function (message) {
      var track = message.track;
      var listeners = message.listeners;
      $('#listeners').html(listeners);
      if (track == 'offline'){
        self.goOffline();
      }else{
        if (track && track != ''){
          self.nextTrack(track);
        }
      }
    });
  }
  
  this.startRadio = function(){
    if (self.config.dj == 'false'){
      self.goOffline();
    }else{
      self.goOnline();
    }
  };
  
  this.goOnline = function(){
    self.startPlayer();
  };
  
  this.goOffline = function(){
    $('.offline').show();
    $('.online').hide();
    self.stopPlayer();
    self.currentTrack = false;
    self.config.dj = 'false';
    window.location.reload();
  };
  
  this.loadPlayer = function(){
    $("#jplayer").jPlayer("setMedia",{
      mp3: "/stream.mp3",
      oga: "/stream.ogg"
    }).jPlayer("play");
  }
  
  this.startPlayer = function(){
    $("#jplayer").jPlayer({
      ready: function (event) {
        self.loadPlayer();
      },
      swfPath: "../",
      supplied: "mp3, oga",
      loadstart: function(event){
        $('.stream-loading').show();
      },
      playing: function(event){
        $('.stream-loading').hide();
      },
      error: function(event){
        if (event.jPlayer.error.type == $.jPlayer.error.URL){
          self.loadPlayer();
        }
        $('.stream-loading').hide();
      },
    });
  };
  
  this.stopPlayer = function(){
    $("#jplayer").jPlayer("clearMedia");
  };
  
  this.reloadPlayer = function(){
    self.stopPlayer();
    self.loadPlayer();
  }
  
  this.nextTrack = function(track){
    if (self.config.dj == 'false'){
      window.location.reload();
    }
    // Don't show the next track immediately since the stream delay is about 15 seconds, so we don't want to spoil out 
    // what the next track is gonna be 15 seconds before it actually starts. It's ok to show it immediately if 
    // there was nothing playing (or if you just connected to the stream).
    var current = $('#track').text();
    var time = self.currentTrack ? 10 : 1;
    setTimeout(function() {
      if (current != track){
        $('#track').html(track);
        $('#recent').click();
      }
    }, time * 1000)
    self.currentTrack = track;
    console.log(track);
  };
  
  this.setupDOMHandlers = function(){
    
    $('#reload').click(self.reloadPlayer);

    $('.jp-stop').click(self.stopPlayer);
    $('.jp-pause').click(self.stopPlayer);
    $('.jp-mute').click(self.stopPlayer);

    $('.jp-play').click(self.loadPlayer);
    $('.jp-unmute').click(self.loadPlayer);
  }  
  
  this.init();
}