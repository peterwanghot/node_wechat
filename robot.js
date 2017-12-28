let coins = '{"BTC": "bitcoin", "ETH": "ethereum", "BCH": "bitcoin-cash", "XRP": "ripple", "DASH": "dash", "LTC": "litecoin", "NEM": "nem", "MIOTA": "iota", "XMR": "monero", "ETC": "ethereum-classic", "NEO": "neo", "OMG": "omisego", "BCC": "bitconnect", "LSK": "lisk", "USDT": "tether", "QTUM": "qtum", "ZEC": "zcash", "STRAT": "stratis", "WAVES": "waves", "ARK": "ark", "STEEM": "steem", "MAID": "maidsafecoin", "BCN": "bytecoin-bcn", "EOS": "eos", "GNT": "golem-network-tokens", "BAT": "basic-attention-token", "DCR": "decred", "REP": "augur", "BTS": "bitshares", "XLM": "stellar", "PAY": "tenx", "HSR": "hshare", "KMD": "komodo", "VERI": "veritaseum", "MTL": "metal", "PIVX": "pivx", "ICN": "iconomi", "FCT": "factom", "NXS": "nexus", "DGD": "digixdao", "GBYTE": "byteball", "ARDR": "ardor", "CVC": "civic", "SC": "siacoin", "PPT": "populous", "DGB": "digibyte", "SNGLS": "singulardtv", "GAS": "gas", "GNO": "gnosis-gno", "BTCD": "bitcoindark", "GAME": "gamecredits", "GXS": "gxshares", "LKK": "lykke", "ZRX": "0x", "BLOCK": "blocknet", "DOGE": "dogecoin", "BNT": "bancor", "FUN": "funfair", "AE": "aeternity", "DCN": "dentacoin", "SNT": "status", "XVG": "verge", "SYS": "syscoin", "MCO": "monaco", "BNB": "binance-coin", "BTM": "bytom", "BQX": "bitquence", "FRST": "firstcoin", "NXT": "nxt", "IOC": "iocoin", "EDG": "edgeless", "LINK": "chainlink", "ANT": "aragon", "UBQ": "ubiq", "PART": "particl", "WINGS": "wings", "NAV": "nav-coin", "RISE": "rise", "MGO": "mobilego", "VTC": "vertcoin", "STORJ": "storj", "CFI": "cofound-it", "TNT": "tierion", "BDL": "bitdeal", "RLC": "rlc", "ETP": "metaverse", "NLG": "gulden", "XZC": "zcoin", "FAIR": "faircoin", "CLOAK": "cloakcoin", "PLR": "pillar", "MLN": "melon", "XEL": "elastic", "TRIG": "triggers", "NLC2": "nolimitcoin", "MTH": "monetha", "WTC": "walton", "PPC": "peercoin", "XRL": "rialto", "LRC": "loopring"}';
let coins_obj = JSON.parse(coins)
let CoinMarketCap = require("node-coinmarketcap");
let options = {
    events: false, // Enable event system
    refresh: 60, // Refresh time in seconds (Default: 60)
    convert: "CNY" // Convert price to different currencies. (Default USD)
}
let coinmarketcap = new CoinMarketCap(options);

let wechat = require('wechat');
let express = require('express');
let https = require("https");
let xpath = require('xpath');
let dom = require('xmldom').DOMParser;

let app = express();
let config = {
    token: 'BCA80106119EE5BDAAF22CC94094E56C',
    appid: 'wx42e47dd72cb138dc',
    encodingAESKey: 'GFzRo4lusQBWrMhWksVRErbCHy0x2AHZq5noavNBABU',
    checkSignature: true // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

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

function convert_sort_desc(x, y) {
    return (x.convert_count < y.convert_count) ? 1 : -1
}

let market_output = "";

app.use(express.query());
app.use('/wechat', wechat(config, function (req, res, next) {
    // 微信输入信息都在req.weixin上
    let message = req.weixin;

    msg = message.Content.trim();
    msg = msg.toUpperCase();
    let coin_id = coins_obj[msg]
    //console.log(coin_id);
    if (coin_id !== undefined) {
        coinmarketcap.get(coin_id, coin => {
            //console.log(coin); // Prints the price in USD of BTC at the moment.
            //console.log(JSON.stringify(coin));
            let result = "";

            result = result + "名称: " + coin.name + " | " + coin.symbol + " | #" + coin.rank + "\n";
            result = result + "现有总量: " + coin.available_supply + "\n";
            result = result + "市值(美金): $" + coin.market_cap_usd + "\n";
            result = result + "市值(人民币): ¥" + coin.market_cap_cny + "\n";
            result = result + "24小时成交额(美金): $" + coin['24h_volume_usd'] + "\n";
            result = result + "24小时成交额(人民币): ¥" + coin['24h_volume_cny'] + "\n";
            result = result + coin.symbol + " 价格: $" + coin.price_usd + " | ¥" + coin.price_cny + " | ฿"+ coin.price_btc +"\n";
            result = result + "涨幅 1小时|24小时|7天: " + coin.percent_change_1h + " | " + coin.percent_change_24h + " | " + coin.percent_change_7d + "\n";
            result = result + "查看更多行情: http://m.feixiaohao.com/currencies/" + coin_id + "/";

            // name := fmt.Sprintf("名称: %s | %s | #%d\n", coin.Name, coin.Symbol, coin.Rank)
            // supply := fmt.Sprintf("现有总量: %d\n", int(coin.AvailableSupply))
            // mcap := fmt.Sprintf("市值(美金): %d\n", int(coin.MarketCapUsd))
            // mcap_cny := fmt.Sprintf("市值(人民币): %d\n", int(coin.MarketCapCny))
            // volume := fmt.Sprintf("24小时成交额(美金): %d\n", int(coin.Two4HVolumeUsd))
            // volume_cny := fmt.Sprintf("24小时成交额(人民币): %d\n", int(coin.Two4HVolumeCny))
            // price := fmt.Sprintf("BTC 价格: %f\n美元价格: %.2f\n人民币价格: %.2f\n", coin.PriceBtc, coin.PriceUsd, coin.PriceCny)
            // change := fmt.Sprintf("涨幅 1小时/24小时/7天: %.2f | %.2f | %.2f\n", coin.PercentChange1H, coin.PercentChange24H, coin.PercentChange7D)
            // chinese_url := fmt.Sprintf("\n查看更多行情: http://m.feixiaohao.com/currencies/%s/",coin_id)
            res.reply({
                content: result,
                type: 'text'
            });
            // res.reply(JSON.stringify(coin));
        });
    } else {
        let cmd_taoli = "taoli";
        let cmd_list = msg.split(" ");

        if (cmd_list.length >= 2) {
            if (cmd_list[1].toUpperCase() === cmd_taoli.toUpperCase()) {

                if (cmd_list[0].toUpperCase() === "BTC") {
                    res.reply('BTC无法显示搬砖套利信息, 请输入其他币种,如ltc eos...');
                } else {
                    let base_market = "";
                    let coin_symbol_convert = "";
                    if (cmd_list.length > 2) {
                        base_market = cmd_list[2];
                        if (cmd_list.length >= 4) {
                            coin_symbol_convert = cmd_list[3];
                            if (coins_obj[coin_symbol_convert.toUpperCase()] !== undefined) {
                                coin_symbol_convert = coin_symbol_convert.toUpperCase();
                            }
                        }
                    }
                    coin_id = coins_obj[cmd_list[0].toUpperCase()];
                    console.log(coin_id);
                    if (coin_id !== undefined) {
                        let coin_symbol = cmd_list[0].toUpperCase();
                        spiderHttpsMarket(coin_id, coin_symbol, base_market, coin_symbol_convert, function (data) {
                                if (data) {
                                    console.log(coin_symbol_convert);
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
                                            market_output = market_output + "市场\t[BTC/" + coin_symbol + "个数]\t交易对\tBTC价格\tUSD价格\tUSD交易量(24h)\n";

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
                                                res.reply({
                                                    content: market_output,
                                                    type: 'text'
                                                });
                                                market_output = "";
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
                                                        if (count_taoli_max === 1) {
                                                            taoli_market_name = market_name;
                                                            taoli_market_convert = array_markets[i].convert_count;
                                                            taoli_count_max_market = taoli_count;
                                                        }

                                                    }
                                                }

                                                market_output = market_output + "\n最佳套利市场: " + taoli_market_name + " [" + taoli_count_max_market + "] " + coin_symbol;

                                                //console.log(market_output);
                                                res.reply({
                                                    content: market_output,
                                                    type: 'text'
                                                });
                                            }
                                        }

                                    }

                                    // console.log("done");
                                } else {
                                    console.log("parse error");
                                    res.reply("数据处理出错,请稍后再试:(");
                                }
                            }
                        );
                    } else {
                        res.reply('请输入你要了解的行情,如btc ltc...');
                    }
                }
            } else {
                res.reply('请输入你要了解的行情,如btc ltc...');
            }

        } else {
            res.reply('请输入你要了解的行情,如btc ltc...');
        }
    }
    // if (message.Content === 'diaosi') {
    //   // 回复屌丝(普通回复)
    //   res.reply('hehe');
    // } else if (message.Content === 'text') {
    //   //你也可以这样回复text类型的信息
    //   res.reply({
    //     content: 'text object',
    //     type: 'text'
    //   });
    // } else if (message.Content === 'hehe') {
    //   // 回复一段音乐
    //   res.reply({
    //     type: "music",
    //     content: {
    //       title: "来段音乐吧",
    //       description: "一无所有",
    //       musicUrl: "http://mp3.com/xx.mp3",
    //       hqMusicUrl: "http://mp3.com/xx.mp3",
    //       thumbMediaId: "thisThumbMediaId"
    //     }
    //   });
    // }
}));

// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(8080);

// 如果你不想让 node 应用直接监听 80 端口
// 可以尝试用 nginx 或 apache 自己做一层 proxy
app.listen(process.env.PORT);
app.enable('trust proxy');
