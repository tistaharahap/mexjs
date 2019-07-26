# MexJS

`MexJS` is a `BitMex` trading bot with custom strategies.

## Indicators

We can calculate our own indicators or use the excellent [technicalindicators](https://github.com/anandanand84/technicalindicators) library.

Use [candlestream.js](src/candlestream.js) to plug your indicator to candles. Strategies will look for indicators from candlesticks.

## Strategies

All strategy classes must extend the base `Strategy` class [here](src/strategies/base.js). The constructor accepts 2 arguments which are `candlesticks` and `feed`.

Append `-long` and `-short` suffixes for your strategy name to be loaded [here](src/strategies/index.js). If you don't do this, you will not be able to trade.

All strategy classes must implement a `filter()` method returnin `true` or `false` for conditions met or unmet for the strategy.

## Env Vars

| Name | Description |
| :--- | :--- |
| `API_KEY` | Bitmex API Key, defaults to `*blank*` |
| `API_SECRET` | Bitmex API Secret, defaults to `*blank*` |
| `CANDLE_INTERVAL_IN_SECONDS` | Interval to fetch new candles, defaults to `10` |
| `TF` | Timeframe for candles, defaults to `5m`, valid choices are `1m  5m  1h  1d` |
| `SYMBOL` | The symbol in Bitmex we're trading for, defaults to `XBTUSD` |
| `TP_STRATEGY` | Take profit strategy, defaults to `PERCENTAGE PIP OTHERS` |
| `TP_IN_PERCENTAGE` | Take profit in percentage, defaults to `0.4` |
| `TP_IN_PIP` | Take profit in pip, defaults to `25.0` |
| `SL_STRATEGY` | Stop profit strategy, defaults to `PERCENTAGE PIP OTHERS` |
| `SL_IN_PERCENTAGE` | Stop loss in percentage, defaults to `0.5` |
| `SL_IN_PIP` | Stop loss in pip, defaults to `25.0` |
| `USE_TESTNET` | Use testnet or not, defaults to `0`, valid choices are `0  1` |
| `ORDER_QUANTITY` | Order quantity for each order, defaults to `50` |
| `MARGIN` | Leverage to be used, defaults to `50` |
| `STRATEGY` | Strategy to be used, defaults to `nektrabar-short`, valid options are `nektrabar-long  nektrabar-short  vwma-long` |
| `TRADE_ON_CLOSE` | When to trade, defaults to `1`, valid options are `0 1` |
| `ORDER_RETRIES` | Max retries when order fails to submit, defaults to `3` |
| `IDEAL_FRACTALS_ONLY` | Only calculate ideal fractals as last fractals, defaults to `0` |
| `VWMA_SL_BUFFER` | Buffer to be added to VWMA SL when `TRADE_ON_CLOSE=0`, defaults to `0` |

## Running

Docker is recommended.

```shell
$ docker run -d --name mexjs -e IDEAL_FRACTALS_ONLY=0 -e API_KEY=your_api_key -e API_SECRET=your_api_secret -e TP_IN_PERCENTAGE=0.125 -e SL_IN_PERCENTAGE=0.5 -e USE_TESTNET=0 -e MARGIN=50 -e TRADE_ON_CLOSE=0 -e STRATEGY=fractalligator-long -e ORDER_QUANTITY=10000 -e NAME=name_your_container -e VWMA_SL_BUFFER=10.0 --restart unless-stopped tistaharahap/mexjs:latest
```
