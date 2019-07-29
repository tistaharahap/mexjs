import Rx from '@reactivex/rxjs'
import { BitmexAPI } from 'bitmex-node'
import Wisemen3Long from '../strategies/wisemen3-long'
import Wisemen3Short from '../strategies/wisemen3-short'
import env from '../env'

const client = new BitmexAPI({
  apiKeyID: env.apiKey,
  apiKeySecret: env.apiSecret,
  testnet: env.testnet === 1,
})
const opts = {
  symbol: 'XBTUSD',
  binSize: '5m',
  count: 750,
  reverse: true,
  partial: env.tradeOnClose === 1 ? false : true,
}
const strategyTest = Rx.Observable.fromPromise(client.Trade.getBucketed(opts))
  .map((klines) => {
    const feed = {}

    const strategy = new Wisemen3Short(klines, feed)

    return strategy.candlesticks
  })

strategyTest.subscribe(
  (res) => console.log(res)
)
