import Telegraf from 'telegraf'
import Rx from '@reactivex/rxjs'

const sendTelegramMessage = (message) => {
  const chatId = '-1001351609280'
  const extra = {
    parse_mode: 'Markdown',
  }
  const { telegram } = new Telegraf('472836801:AAGQgDhB0dg471Nvqc9RjqiXZJ4K2qnieHQ')
  return Rx.Observable.fromPromise(telegram.sendMessage(chatId, message, extra))
    .observeOn(Rx.Scheduler.asap)
    .catch((err) => {
      console.log(err.stack)
      return Rx.Observable.empty()
    })
}

export default sendTelegramMessage