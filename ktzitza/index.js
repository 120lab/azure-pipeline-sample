const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const formidable = require('formidable'),
    http = require('http'),
    util = require('util');
// const csv = require('csv-parser');
const fs = require('fs');
// const Json2csvParser = require('json2csv').Parser;
const request = require('request');
const path = require('path');
const format = require("string-template")
const read = require('read-file');
// const AutoDetectDecoderStream = require('autodetect-decoder-stream');
const log = require('./log/log.js');
const fetch = require("node-fetch");

var corsOptions = {
    origin: 'http://localhost:8083',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

var app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cors(corsOptions));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// var headersValid = false;
// var dataValid = false;
// var rowNumber = 0;
// var validations = [];
// var csvFileData = [];

// const validationFields = ['action', 'rowNumber', 'colName', 'err'];
const templatePath = './client/';
const datalayer_url = 'http://localhost:8082';
const convertor_url = 'http://localhost:8083';

log.logger.info(datalayer_url);

app.get('/', function (req, res) {

    var data = req.body;

    if (req.url == '/' && req.method.toLowerCase() == 'get') {
        // parse a file upload
        // show a file upload form    

        var responseClient = read.sync(templatePath + 'form-upload.tmpl', 'utf8');

        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(responseClient);
    };
})

app.post('/upload', function (req, res) {


    var form = new formidable.IncomingForm();
    var fileName = "";
    var misparZihuyMaasik = "";

    form.parse(req, function (err, fields, files) {
        console.log(err);
        console.log(fields);

        fileName = fields.fileName;
        misparZihuyMaasik = fields.misparZihuyMaasik;

        console.log(fileName);
        console.log(misparZihuyMaasik);

    }).on('data', function (data) {
        console.log(data);
    }).on('end', function () {
        console.log('end');
    })

    var fs = require('fs')

    var i=0;
    var startDate = new Date();
    var XmlStream = require('xml-stream');
    var stream = fs.createReadStream('test\\KG_IAI_Agent_Monthly_Full_Data_100_190903.xml');
    var xml = new XmlStream(stream);
    // xml.preserve('PirteiHaavaratKsafim', true);
    xml.preserve('PirteiMevutach', true);
    xml.collect('subitem');

    // xml.on('endElement: MISPAR-ZIHUY-MAASIK', function (item) {
    xml.on('endElement: MISPAR-ZIHUY-LAKOACH', function (item) {
        //console.log('RECORD NUMBER :' + ++i);
        //console.log(item);
        //console.log(item);
        if (item['$text'] == misparZihuyMaasik) {
            console.log('ALUFFFFFF');

            fs.writeFile('test\\ouput.json', 'data:application/json;charset=utf-8,' + JSON.stringify(item), (err) => {
                if (err) throw err;

                // show a feedback download form    
                var responseClient = read.sync(templatePath + 'form-feedback.tmpl', 'utf8');
                responseClient = format(responseClient, {
                    csv: encodeURI('data:application/json;charset=utf-8,' + JSON.stringify(item)),
                    resultFileName: 'ouput.json'
                })

                res.writeHead(200, { 'content-type': 'text/html' });
                res.end(responseClient);
            });


            xml.pause();
            console.log('STARTED :' +  startDate);
            console.log('ENDED :' +  new Date());
        
            return;
        }


    });

    // show a feedback download form    
    console.log('STARTED :' +  startDate);
    console.log('ENDED :' +  new Date());
    var responseClient = read.sync(templatePath + 'form-xml.tmpl', 'utf8');
    responseClient = format(responseClient, {
        resultFileName: 'ouput.json'
    })

    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(responseClient);
    return;
})

app.post('/output', function (req, res) {

    var request = require("request");

    var options = {
        method: 'POST',
        url: datalayer_url + '/create-employerinterface',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/json'
        },
        body: { InputFileKey: null },
        json: true
    };

    request(options, function (error, response, body) {
        if (error || response.statusCode == 400)
            throw new Error((error == null ? body : error));

        //log.logger.info(body);

        fs.writeFile(body.InputFileName, 'data:text/xml;charset=utf-8,' + body.FileXml, (err) => {
            if (err) throw err;

            // show a feedback download form   
            var responseClient = read.sync(templatePath + 'form-xml.tmpl', 'utf8');
            responseClient = format(responseClient, {
                xml: encodeURI('data:text/csv;charset=utf-8,' + body.FileXml),
                resultFileName: body.InputFileName
            })
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(responseClient);
        });
    });


    return;
})

app.post('/return', function (req, res) {

    var options = {
        method: 'GET',
        url: convertor_url + '/',
        headers:
            { 'cache-control': 'no-cache' }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        res.send(body);
    });

    return;
})

var port = process.env.PORT || 8083;
var env = process.env.NODE_ENV

var server = app.listen(port, function () {
    var host = server.address().address
    console.log("App with env://%s listening at http://%s:%s", env, host, port)
})
