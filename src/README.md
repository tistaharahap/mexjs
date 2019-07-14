# MexJS

`MexJS` is a `BitMex` trading bot with custom strategies.

## Env Vars

| Name | Description |
| :--- | :--- |
| `API_KEY` | Bitmex API Key, defaults to `*blank*` |
| `API_SECRET` | Bitmex API Secret, defaults to `*blank*` |
| `CANDLE_INTERVAL_IN_SECONDS` | Interval to fetch new candles, defaults to `10` |
| `TF` | Timeframe for candles, defaults to `5m`, valid choices are `1m | 5m | 1h | 1d` |
| `SYMBOL` | The symbol in Bitmex we're trading for, defaults to `XBTUSD` |
| `TP_IN_PERCENTAGE` | Take profit in percentage, defaults to `0.4` |
| `SL_IN_PERCENTAGE` | Stop loss in percentage, defaults to `0.5` |
| `USE_TESTNET` | Use testnet or not, defaults to `0`, valid choices are `0 | 1` |
| `ORDER_QUANTITY` | Order quantity for each order, defaults to `50` |
| `MARGIN` | Leverage to be used, defaults to `50` |
| `STRATEGY` | Strategy to be used, defaults to `nektrabar-short`, valid options are `nektrabar-long | nektrabar-short | vmwa-long` |

## Running

Docker is recommended.

```shell
$ docker run -d --name mexjs -e API_KEY=your_api_key -e API_SECRET=your_api_secret -e TP_IN_PERCENTAGE=0.4 -e SL_IN_PERCENTAGE=0.5 -e USE_TESTNET=0 -e MARGIN=50 -e STRATEGY=nektrabar-short tistaharahap/mexjs:latest
```
