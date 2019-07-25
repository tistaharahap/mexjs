import Strategy from './base'
import Decimal from 'decimal.js'

class Wisemen3Long extends Strategy {
  filter() {
    return this.breakoutCandle()
      && this.candleAboveAlligatorMouth()
  }

  /**
   * The current price must be breakout fractal
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const currentPrice = new Decimal(this.feed.data[0].price)
    const currentPriceAboveFractal = currentPrice
      .greaterThan(lastCandle.lastUpFractal)

    return currentPriceAboveFractal
  }

  /**
   * The current price must be above alligator mouth
   * 
   * @return {boolean}
   */
  candleAboveAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleLow = new Decimal(lastCandle.low)
    const lowAboveJaw = lastCandleLow
      .greaterThan(lastCandle.jaw)
    const lowAboveTeeth = lastCandleLow
      .greaterThan(lastCandle.teeth)
    const lowAboveLips = lastCandleLow
      .greaterThan(lastCandle.lips)

    return lowAboveJaw && lowAboveTeeth && lowAboveLips
  }
}

export default Wisemen3Long