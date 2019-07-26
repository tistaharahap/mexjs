import NektrabarLong from './nektrabarlong'
import NektrabarShort from './nektrabarshort'
import VMWALong from './vwmalong'
import VWMAShort from './vwmashort'
import FractalBreakoutLong from './fractalbreakout-long'
import FractalBreakoutShort from './fractalbreakout-short'
import Fractal3BreakoutLong from './fractal3breakout-long'
import FractalligatorLong from './fractalligator-long'
import FractalligatorShort from './fractalligator-short'
import PengenOpitLong from './pengenopit-long'
import PengenOpitShort from './pengenopit-short'
import Wisemen3Long from './wisemen3-long'
import Wisemen3Short from './wisemen3-short'


const getStrategyByName = (name, candlesticks, feed) => {
  switch (name) {
    case 'nektrabar-long':
      return new NektrabarLong(candlesticks, feed)
    case 'nektrabar-short':
      return new NektrabarShort(candlesticks, feed)
    case 'vwma-long':
      return new VMWALong(candlesticks, feed)
    case 'vwma-short':
      return new VWMAShort(candlesticks, feed)
    case 'fractalbreakout-long':
      return new FractalBreakoutLong(candlesticks, feed)
    case 'fractalbreakout-short':
      return new FractalBreakoutShort(candlesticks, feed)
    case 'fractal3breakout-long':
      return new Fractal3BreakoutLong(candlesticks, feed)
    case 'fractalligator-long':
      return new FractalligatorLong(candlesticks, feed)
    case 'fractalligator-short':
      return new FractalligatorShort(candlesticks, feed)
    case 'wisemen3-long':
      return new Wisemen3Long(candlesticks, feed)
    case 'wisemen3-short':
      return new Wisemen3Short(candlesticks, feed)
    case 'pengenopit-long':
      return new PengenOpitLong(candlesticks, feed)
    case 'pengenopit-short':
      return new PengenOpitShort(candlesticks, feed)
    default:
      return null
  }
}

export {
  NektrabarLong,
  NektrabarShort,
  VMWALong,
  VWMAShort,
  getStrategyByName,
}