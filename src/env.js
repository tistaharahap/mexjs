import packageJson from '../package.json'

const env = {
  apiKey: process.env.API_KEY || 'aK-fz1BnkySpjH1hUh3eIKva',
  apiSecret: process.env.API_SECRET || '2wOWrzZZQXn9HcbBS5G7xS42bw3OCA1ectCzrA9TcWt5ABek',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
  tpInPercentage: parseFloat(process.env.TP_IN_PERCENTAGE || 0.5),
  slInPercentage: parseFloat(process.env.SL_IN_PERCENTAGE || 0.5),
  useTestnet: process.env.USE_TESTNET || 0,
  orderQuantity: process.env.ORDER_QUANTITY || 50,
  margin: process.env.MARGIN || 50,
  version: packageJson.version,
}

export default env
