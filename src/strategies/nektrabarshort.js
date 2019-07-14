import Strategy from './base'
import Decimal from 'decimal.js';

class NektrabarShort extends Strategy {
  filter() {
    return this.olcUnder() &&
      this.redCandle() &&
      this.newTradesWithPricesLowerTheLastFractal()
  }

  /**
   * The last trade prices must be below the last fractal
   * 
   * @return {boolean}
   */
  newTradesWithPricesLowerTheLastFractal() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(this.feed.data[0].price)
      .lessThan(lastCandle.lastDownFractal)
  }

  /**
   * The last candles OLC3 must be lower than the last fractal
   * 
   * @return {boolean}
   */
  olcUnder() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const olc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.low)
        .add(lastCandle.close)
    ).dividedBy(3)

    return olc3
      .lessThan(lastCandle.lastDownFractal)
  }

  /**
   * The last candle must be red
   * 
   * @return {boolean}
   */
  redCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.close)
      .lessThan(lastCandle.open)
  }
}

export default NektrabarShort
