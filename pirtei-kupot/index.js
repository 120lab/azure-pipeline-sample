var rp = require('request-promise');
var fs = require('fs');
var jsonexport = require('jsonexport');


var data = {
    resource_id: 'b5223cbc-e1b2-4503-a499-97cdcd7190d2', // the resource id
    limit: 50
};


var options = {
    uri: 'https://data.gov.il/api/action/datastore_search',
    qs: data,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    jsonp: true // Automatically parses the JSON string in the response
};

rp(options)
    .then(function (parsedBody) {
        // console.log("Source:" + parsedBody.help);
        // console.log("Success: " + parsedBody.success);
        // console.log(JSON.stringify(parsedBody.result.fields));
        // console.log(JSON.stringify(parsedBody.result.records));
        //console.log(parsedBody);

        var now = new Date().toISOString().replace(':', '').replace(':', '').replace('.', '');;
        var fileName = "\pireti-kupot-" + now + ".csv";
        // fs.writeFile(fileName, JSON.stringify(parsedBody), function (err) {
        //     if (err) return console.log(err);
        //     //console.log(parsedBody);
        //     console.log('File wroted');
        // });
        console.log(fileName);
        var jsonObj = JSON.parse(parsedBody);

        /*
        console.log(jsonObj.help);
        console.log(jsonObj.success);
        console.log(jsonObj.result);
        console.log(jsonObj.result.fields);
        console.log(jsonObj.result.records);
        */

        jsonexport(jsonObj.result.records, function (err, csv) {
            if (err) {
                return console.log(err);
            }

            //console.log(csv);
            try {
                fs.writeFileSync(fileName, csv, { mode: 0o755 });

            } catch (err) {
                console.error('Error When Write file');
                console.error('*********************');
                console.error(err);
            }
        });


    })
    .catch(function (err) {
        console.error('Error When Call API');
        console.error('*********************');
        console.log(err);
    });