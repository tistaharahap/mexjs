# MexJS

`MexJS` is a `BitMex` trading bot with custom strategies.

## Indicators

We can calculate our own indicators or use the excellent [technicalindicators](https://github.com/anandanand84/technicalindicators) library.

Use [candlestream.js](src/candlestream.js) to plug your indicator to candles. Strategies will look for indicators from candlesticks.

You can develop your own or alias something from the `technicalindicators` library in [indicators.js](src/indicators.js).

## Strategies

All strategy classes must extend the base `Strategy` class [here](src/strategies/base.js). The constructor accepts 2 arguments which are `candlesticks` and `feed`.

Append `-long` and `-short` suffixes for your strategy name to be loaded [here](src/strategies/index.js). If you don't do this, you will not be able to trade.

All strategy classes must implement a `filter()` method returnin `true` or `false` for conditions met or unmet for the strategy.

Most of the strategies written by the first commiters are based on [Bill Williams' trading strategies](https://www.amazon.com/Trading-Chaos-Technical-Techniques-Marketplace-ebook/dp/B008NC0YIK). You can mix and match multiple strategies into a new strategy like so:

```javascript
import SuperLongStrategy from './super-long.js'
import DefinitelyLongStrategy from './definitely-long.js'

class MixedStrategy extends Strategy {
  filter() {
    return new SuperLongStrategy(this.candlesticks, this.feed).filter() &&
      new DefinitelyLongStrategy(this.candlesticks, this.feed).filter()
  }
}
```

Or you can mix other strategies with more new filters:

```javascript
import SuperLongStrategy from './super-long.js'
import DefinitelyLongStrategy from './definitely-long.js'

class MixedStrategy extends Strategy {
  filter() {
    return new SuperLongStrategy(this.candlesticks, this.feed).filter() &&
      new DefinitelyLongStrategy(this.candlesticks, this.feed).filter() &&
      this.getRidOfFakeSignals()
  }

  getRidOfFakeSignals() {
    // ...
  }
}
```

### VWMA Long (vwma-long)

Required env var values:

* `TRADE_ON_CLOSE=1`

### VWMA Short (vwma-short)

Required env var values:

* `TRADE_ON_CLOSE=1`

### Nektrabar Long (nektrabar-long)

Required env var values:

* `TRADE_ON_CLOSE=1`

### Nektrabar Short (nektrabar-short)

Required env var values:

* `TRADE_ON_CLOSE=1`

### Fractal Breakout Long (fractalbreakout-long)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Fractal Breakout Short (fractalbreakout-short)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Fractal3 Breakout Long (fractal3breakout-long)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Fractalligator Long (fractalligator-long)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Fractalligator Short (fractalligator-short)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Wisemen 3 Long (wisemen3-long)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Wisemen 3 Short (wisemen3-short)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Pengen Opit Long (pengenopit-long)

Required env var values:

* `TRADE_ON_CLOSE=0`

### Pengen Opit Short (pengenopit-short)

Required env var values:

* `TRADE_ON_CLOSE=0`

## Env Vars

| Name | Description |
| :--- | :--- |
| `API_KEY` | Bitmex API Key, defaults to `*blank*` |
| `API_SECRET` | Bitmex API Secret, defaults to `*blank*` |
| `CANDLE_INTERVAL_IN_SECONDS` | Interval to fetch new candles, defaults to `10` |
| `TF` | Timeframe for candles, defaults to `5m`, valid choices are `1m  5m  1h  1d` |
| `SYMBOL` | The symbol in Bitmex we're trading for, defaults to `XBTUSD` |
| `TP_STRATEGY` | Take profit strategy, defaults to `PERCENTAGE`, valid options are `PERCENTAGE PIP OTHERS` |
| `TP_IN_PERCENTAGE` | Take profit in percentage, defaults to `0.4` |
| `TP_IN_PIP` | Take profit in pip, defaults to `25.0` |
| `SL_STRATEGY` | Stop profit strategy, defaults to `PERCENTAGE`, valid options are `PERCENTAGE PIP OTHERS` |
| `SL_IN_PERCENTAGE` | Stop loss in percentage, defaults to `0.5` |
| `SL_IN_PIP` | Stop loss in pip, defaults to `25.0` |
| `USE_TESTNET` | Use testnet or not, defaults to `0`, valid choices are `0  1` |
| `ORDER_QUANTITY` | Order quantity for each order, defaults to `50` |
| `MARGIN` | Leverage to be used, defaults to `50` |
| `STRATEGY` | Strategy to be used, defaults to `nektrabar-short` |
| `TRADE_ON_CLOSE` | When to trade, defaults to `1`, valid options are `0 1` |
| `ORDER_RETRIES` | Max retries when order fails to submit, defaults to `3` |
| `IDEAL_FRACTALS_ONLY` | Only calculate ideal fractals as last fractals, defaults to `0` |
| `VWMA_SL_BUFFER` | Buffer to be added to VWMA SL when `TRADE_ON_CLOSE=0`, defaults to `0` |

## Running

Docker is recommended.

```shell
$ docker run -d --name mexjs -e API_KEY=your_api_key -e API_SECRET=your_api_secret -e NAME=name_your_container -e STRATEGY=wisemen3-long -e ORDER_QUANTITY=10000 -e MARGIN=50 -e TF=5m -e TP_STRATEGY=PERCENTAGE -e TP_IN_PERCENTAGE=0.25 -e TP_IN_PIP=25.0 -e SL_STRATEGY=PERCENTAGE -e SL_IN_PERCENTAGE=0.25 -e SL_IN_PIP=25.0 -e VWMA_SL_BUFFER=10.0 -e IDEAL_FRACTALS_ONLY=0 -e USE_TESTNET=0 -e TRADE_ON_CLOSE=0 --restart unless-stopped tistaharahap/mexjs:latest
```

## Contributors

Thank you for the people named here for their contributions.

* [Rifky Ali](https://github.com/rifkyali)
* [Gungde Yaya](https://github.com/gungde)

### Contributing

Please follow these guidelines to contribute:

* ES6 strictly unless there's a good reason not to
* All methods and functions should be documented with [JSDoc](https://devdocs.io/jsdoc/)

## License

Copyright (c) <2019> <TradeBro, represented by Batista Harahap>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
