import Strategy from './base'
import Decimal from 'decimal.js'

class VMWALong extends Strategy {
  filter() {
    return this.vwmaHigherThanLow()
      && this.newTradesWithPricesAboveTheLastFractal()
  }

  /**
   * The last candle's low price must be lower than VMWA
   * 
   * @return {boolean}
   */
  vwmaHigherThanLow() {
    return this.candlesticks[this.candlesticks.length - 1].vmwa &&
      new Decimal(this.candlesticks[this.candlesticks.length - 1].vmwa)
        .greaterThanOrEqualTo(this.candlesticks[this.candlesticks.length - 1].low)
  }

  /**
   * The last trade prices must be above the last fractal
   * 
   * @return {boolean}
   */
  newTradesWithPricesAboveTheLastFractal() {
    return this.feed.data[0].price && 
      this.candlesticks[this.candlesticks.length - 1].lastUpFractal &&
      new Decimal(this.feed.data[0].price)
        .greaterThanOrEqualTo(this.candlesticks[this.candlesticks.length - 1].lastUpFractal)
  }
}

export default VMWALong
