import packageJson from '../package.json'

const env = {
  apiKey: process.env.API_KEY || '',
  apiSecret: process.env.API_SECRET || '',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
  tpInPercentage: parseFloat(process.env.TP_IN_PERCENTAGE || 0.4),
  slInPercentage: parseFloat(process.env.SL_IN_PERCENTAGE || 0.5),
  useTestnet: process.env.USE_TESTNET || 0,
  orderQuantity: process.env.ORDER_QUANTITY || 50,
  margin: process.env.MARGIN || 50,
  version: packageJson.version,
  strategy: process.env.STRATEGY || 'nektrabar-short',
  tradeOnClose: process.env.TRADE_ON_CLOSE || 1,
}

export default env
