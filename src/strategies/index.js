import NektrabarLong from './nektrabarlong'
import NektrabarShort from './nektrabarshort'
import VMWALong from './vwmalong'

const getStrategyByName = (name, candlesticks, feed) => {
  switch (name) {
    case 'nektrabar-long':
      return new NektrabarLong(candlesticks, feed)
    case 'nektrabar-short':
        return new NektrabarShort(candlesticks, feed)
    case 'vwma-long':
        return new VMWALong(candlesticks, feed)
    default:
      return null
  }
}

export {
  NektrabarLong,
  NektrabarShort,
  VMWALong,
  getStrategyByName
}