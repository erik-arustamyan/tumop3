var jsonServer = require('json-server');
var server = jsonServer.create();
var router = jsonServer.router('db.json');
var middlewares = jsonServer.defaults();
var fs = require('fs');
var port = process.env.PORT || 3000;const express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();
var f = "db.json";
var JSON_info = '';

setInterval(function() {
    {
        //Scrapping CoountOfPeoplesInTheSpace list
        var url1 = "http://www.howmanypeopleareinspacerightnow.com/peopleinspace.json";
        var arr = {};
        request({
            url: url1,
            json: true
        }, function(error, response, body) {
            if (!error) {
                JSON_info = '{';
                JSON_info += '"peoplesinnspace":';
                JSON_info += '{"number":"' + JSON.stringify(body.number) + '"}';
                JSON_info += ',';
                console.log('Received count of peoples in space.');
                //Scrapping ImportantNews
                var url2 = "http://themostimportantnews.com/archives/category/world";
                var body2 = '';
                request(url2, function(error, response, html) {
                    if (!error) {
                        var $ = cheerio.load(html);
                        body2 = '"news":{"html": "' + $('#main-content').html().replace(/"/g, "'").replace(/\n/g, "").replace(/	/g, '').replace(/			/g, '') + '"},';
                        JSON_info += body2;
                        console.log('News was received.');
                        //Scrapping Population data
                        var url3 = "https://www.census.gov/popclock/world";
                        var arr3 = [];
                        var body3 = '';
                        var counter3 = 0;
                        request(url3, function(error, response, html) {
                            if (!error) {
                                var $ = cheerio.load(html);
                                $("#most-populous2 > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > span").each(function() {
                                    arr3.push($(this).text());
                                });
                                body3 += '"population":[';
                                for (var i = 0; i < arr3.length; i++) {
                                    if (i % 2 == 0) {
                                        body3 += '{"id":' + ++counter3 + ', "name":"' + arr3[i] + '","count":"' + arr3[i + 1] + '"},';
                                    }
                                }
                                body3 += '{}],';
                                JSON_info += body3;
                                console.log('Population data recieved.');
                                ///Scrapping Earthquakes list
                                var eq4 = '"earthquakes": [';
                                var url4 = "http://quakes.globalincidentmap.com/";
                                var arr4 = [];
                                var idCounter4 = 0;
                                request(url4, function(error, response, html) {
                                    if (!error) {
                                        var $ = cheerio.load(html);
                                        $("table:nth-child(10) > tbody > tr > td").each(function() {
                                            arr4.push($(this).text());
                                        });
                                        for (var i = 15; i < arr4.length; i++) {
                                            if (i % 8 == 0) {
                                                eq4 += '\n{ "id": ' + ++idCounter4 + ', "region": "' + arr4[i] + '", "date": "' + arr4[i - 2] + '","magnitude": "' + arr4[i + 2] + '" },';
                                            }
                                        }
                                        console.log('Received Earthquakes data.');
                                        eq4 += '\n {}\n]';
                                        JSON_info += eq4;
                                        JSON_info += '}';
                                        fs.writeFile(f, JSON_info);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}, 5000);


server.use(middlewares);
server.use(router);

server.listen(port, function () {
  console.log('\x1b[36mjson-server is running in port'+port+'!');
});


