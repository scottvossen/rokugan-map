function getJson(url, async) {
  var json = null;
  $.ajax({
      'async': async || false,
      'global': false,
      'url': url,
      'dataType': "json",
      'success': function (data) {
        json = data;
      },
      'error' : function(jqXHR, status, error) {
      	console.log("ajax get " + url + " failed: ", error);
      }
  });
  return json;
};