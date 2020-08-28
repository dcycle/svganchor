var builder = {
  config: {},

  config_file: '',

  start: function() {
    this.prompt("Please insert a YML file", "yml/car/car.yml", "builder.loadConfig()");
  },

  prompt: function(message, example, callback) {
    $("#instructions").html(message);
    $("#instructions_after").html('<input class="prompt" value="' + example + '" type="text" name="prompt"><br><br><button onClick="' + callback + '">OK</button>')
  },

  loadConfig: function() {
    this.config_file = $("#instructions_after input.prompt").val();
    this.clear();
    $.get(this.config_file, function(response, status) {
      config = jsyaml.load(response);
      $('#path .desc').append("object: " + config.object + "\n");
      $('#path .desc').append("version: " + config.version + "\n");
      console.log(status);
    }).fail(function() {
      alert('woops'); // or whatever
    });
  },

  clear: function() {
    $("#instructions").html("");
    $("#instructions_after").html("");
  }

}

$(document).ready(function(){
  builder.start();
});
