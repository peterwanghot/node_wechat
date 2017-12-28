exports.spider = spider;

var http = require("http");
var https = require("https");

// Utility function that downloads a URL and invokes
// callback with the data.
function spider(coin_name,coin_symbol,coin_symbol_convert,callback){
    var spiderHttps = function (coin_name,coin_symbol,coin_symbol_convert, callback) {
        var url = "https://coinmarketcap.com/zh/currencies/" + coin_name +  "/#markets"
        https.get(url, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data);
            });
        }).on("error", function () {
            callback(null);
        });
    }
    return {
        spiderHttps: spiderHttps
    }
}
// function spiderHttps(coin_name,coin_symbol,coin_symbol_convert, callback) {
//     var url = "https://coinmarketcap.com/zh/currencies/" + coin_name +  "/#markets"
//     https.get(url, function (res) {
//         var data = "";
//         res.on('data', function (chunk) {
//             data += chunk;
//         });
//         res.on("end", function () {
//             callback(data);
//         });
//     }).on("error", function () {
//         callback(null);
//     });
// };