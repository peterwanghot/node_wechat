// let cheerio = require("cheerio");
let http = require("http");
let https = require("https");
let xpath = require('xpath');
let dom = require('xmldom').DOMParser;

function spiderHttpsMarket(coin_name, coin_symbol, base_market, coin_symbol_convert, callback) {
    let url = "https://coinmarketcap.com/zh/currencies/" + coin_name + "/#markets"
    https.get(url, function (res) {
        let data = "";
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

let coin_name = "eos";
let coin_symbol = "EOS";
let coin_symbol_convert = "ETH";
let base_market = "";
let market_output = "";

function convert_sort_desc(x, y) {
    return (x.convert_count < y.convert_count) ? 1 : -1
}

spiderHttpsMarket(coin_name, coin_symbol, base_market, coin_symbol_convert, function (data) {
        if (data) {
            // console.log(data);
            let doc = new dom().parseFromString(data);
            let nodes_market_name = xpath.select("//*[@id=\"markets-table\"]/tbody/tr/td[2]/a/text()", doc);
            let nodes_btc_price = xpath.select("//*[@id=\"markets-table\"]/tbody/tr/td[5]/span/@data-btc", doc);
            let nodes_usd_price = xpath.select("//*[@id=\"markets-table\"]/tbody/tr/td[5]/span/@data-usd", doc);
            let nodes_market_volume = xpath.select("//*[@id=\"markets-table\"]/tbody/tr/td[4]/span/@data-usd", doc);
            let nodes_pair = xpath.select("//*[@id=\"markets-table\"]/tbody/tr/td[3]/a/text()", doc);

            let curSpecConvertVal = -1;
            let curSpecMarketName = "";


            if (nodes_market_name) {
                let array_markets = [];
                let count = nodes_market_name.length;
                if (count > 0) {
                    let convert_count = 0;

                    for (let i = 0; i < count; i++) {
                        convert_count = Math.floor(1 / parseFloat(nodes_btc_price[i].nodeValue));

                        if (base_market.toUpperCase() === nodes_market_name[i].nodeValue.toUpperCase()) {
                            curSpecConvertVal = convert_count;
                            curSpecMarketName = nodes_market_name[i].nodeValue;
                        }

                        let market_name = nodes_market_name[i].nodeValue;
                        let pair = nodes_pair[i].nodeValue;
                        let price_btc = parseFloat(nodes_btc_price[i].nodeValue);
                        let price_usd = parseFloat(nodes_usd_price[i].nodeValue);
                        let market_volume = parseFloat(nodes_market_volume[i].nodeValue);
                        if (coin_symbol_convert.length === 0) {
                            array_markets.push({
                                name: market_name,
                                pair: pair,
                                price_btc: price_btc,
                                price_usd: price_usd,
                                convert_count: convert_count,
                                volume: market_volume
                            });
                        } else {
                            if (nodes_pair[i].nodeValue === coin_symbol + "/" + coin_symbol_convert) {
                                array_markets.push({
                                    name: market_name,
                                    pair: pair,
                                    price_btc: price_btc,
                                    price_usd: price_usd,
                                    convert_count: convert_count,
                                    volume: market_volume
                                });
                            }
                        }

                    }

                    array_markets.sort(convert_sort_desc)

                    let count_market_filter = array_markets.length;

                    let display_max_count = count > 10 ? 10 : count_market_filter;

                    market_output = "";
                    market_output = market_output + "Top" + display_max_count + " 最贵交易市场\n";
                    market_output = market_output + "市场\t[BTC/" + coin_symbol + "个数]\t交易对\tBTC价格\tUSD价格\tUSD交易量(24h)\n";

                    for (let i = 0; i < display_max_count; i++) {
                        let market = array_markets[i];
                        if (market) {
                            market_output = market_output + market.name + "\t";
                            market_output = market_output + "[" + market.convert_count + "]\t";
                            market_output = market_output + market.pair + "\t";
                            market_output = market_output + "฿" + market.price_btc + "\t";
                            market_output = market_output + "$" + market.price_usd.toLocaleString() + "\t";
                            market_output = market_output + "$" + market.volume.toLocaleString() + "\n";
                        }
                    }

                    market_output = market_output + "\nTop" + display_max_count + " 最便宜交易市场\n";
                    market_output = market_output + "市场\t[BTC/" + coin_symbol + "个数]\t交易对\tBTC价格\tUSD价格\tUSD交易量(24小时)\n";

                    for (let i = count - 1; i >= count_market_filter - display_max_count; i--) {
                        let market = array_markets[i];
                        if (market) {
                            market_output = market_output + market.name + "\t";
                            market_output = market_output + "[" + market.convert_count + "]\t";
                            market_output = market_output + market.pair + "\t";
                            market_output = market_output + "฿" + market.price_btc + "\t";
                            market_output = market_output + "$" + market.price_usd.toLocaleString() + "\t";
                            market_output = market_output + "$" + market.volume.toLocaleString() + "\n";
                        }
                    }

                    market_output = market_output + "\n最贵: " + array_markets[0].name + " [" + array_markets[0].convert_count + "]";
                    market_output = market_output + " 最便宜: " + array_markets[count_market_filter - 1].name + " [" + array_markets[count_market_filter - 1].convert_count + "]";
                    market_output = market_output + "\n套利空间: " + (array_markets[0].convert_count - array_markets[count_market_filter - 1].convert_count) + " " + coin_symbol;


                    // console.log(market_output);
                    if (base_market.length === 0) {
                        console.log(market_output);
                    }

                    if (base_market.length > 0) {
                        // console.log(nodes_market_name);
                        market_output = "";
                        market_output = market_output + "基准交易市场: " + curSpecMarketName + " [" + curSpecConvertVal + "] " + coin_symbol;
                        market_output = market_output + "\n市场\t[BTC/" + coin_symbol + "个数]\t套利空间\t交易对\n";
                        let taoli_count = 0;
                        let taoli_market_name = "";
                        let taoli_market_convert = "";
                        let taoli_count_max_market = "";

                        let count_taoli_max = 0;

                        for (let i = 0; i < count_market_filter; i++) {

                            if (base_market.toUpperCase() !== array_markets[i].name.toUpperCase()) {
                                market_name = array_markets[i].name;
                                taoli_count = array_markets[i].convert_count - curSpecConvertVal;

                                market_output = market_output + market_name + "\t";
                                market_output = market_output + "[" + array_markets[i].convert_count + "]\t";
                                market_output = market_output + taoli_count + "\t";
                                market_output = market_output + array_markets[i].pair + "\n";

                                count_taoli_max++;
                                if(count_taoli_max === 1){
                                    taoli_market_name = market_name;
                                    taoli_market_convert = array_markets[i].convert_count;
                                    taoli_count_max_market = taoli_count;
                                }

                            }
                        }

                        market_output = market_output + "\n最佳套利市场: " + taoli_market_name + " [" + taoli_count_max_market + "] " + coin_symbol;

                        console.log(market_output);
                    }
                }

            }

            // console.log("done");
        }
        else {
            console.log("parse error");
            return "搬砖数据处理出错,请稍后再试:("
        }
    }
);



