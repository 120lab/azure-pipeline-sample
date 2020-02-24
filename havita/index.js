var fs = require('fs')
var XmlStream = require('xml-stream');
var stream = fs.createReadStream('test\\205000513765347EMPONG000002201804081302050002.DAT');
var xml = new XmlStream(stream);
xml.preserve('PirteiHaavaratKsafim', true);
xml.collect('subitem');
xml.on('endElement: MISPAR-ZIHUY-MAASIK', function (item) {
    //console.log(item);
    console.log(item);
    if(item['$text'] == '0000000580352334'){
        console.log('ALUFFFFFF');
        xml.pause();
    }
        
});
