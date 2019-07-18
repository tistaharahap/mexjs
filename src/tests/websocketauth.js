import { signatureForWebsocketAuth } from '../utils'
import Rx from '@reactivex/rxjs'
import WebSocket from 'ws'

const apiKey = '-9xx_XEcnO1nC2DhA4W-YgNU'
const apiSecret = '7iRpLObkNT26lPdVzas2-XyN6enQGzgM3wOt3abWcEAYAZXg'

const opts = {
  url: 'wss://testnet.bitmex.com/realtime',
  WebSocketCtor: WebSocket,
}

let AUTHORIZED = false
const socket$ = Rx.Observable.webSocket(opts)
  .do((res) => {
    const request = res.request
    if (!request) {
      return
    }

    const { op } = request
    if (op && op === 'authKeyExpires' && res.success === true) {
      AUTHORIZED = true
    }
  })
  .filter(() => AUTHORIZED)
  .do(() => timer$.take(1))
  .switchMap()

const timer$ = Rx.Observable.timer(5000)
  .do(() => {
    console.log('Going to retry connecting to the websocket server')
    socket$.retry(1)
  })

socket$.subscribe(
  res => console.log(res),
  (err) => console.error(err)
)
const signature = signatureForWebsocketAuth(apiSecret)
console.log(signature)
const authOpts = JSON.stringify({ 
  op: 'authKeyExpires', 
  args: [
    apiKey, 
    signature.expires, 
    signature.signature,
  ] 
})
console.log(authOpts)
socket$.next(authOpts)

const tradeOpts = JSON.stringify({ 
  op: 'subscribe', 
  args: 'trade:XBTUSD'
})
socket$.next(tradeOpts)
