var fs = require('fs');

eval(fs.readFileSync('util.js')+'');
eval(fs.readFileSync('Constants.js')+'');
eval(fs.readFileSync('Color.js')+'');

Color.addStyle = function(style) {
  fs.writeFile('color.css', style, function(err) {
    if (err) console.log(err);
  });
}
Color.initialize(Color.colorCode);
