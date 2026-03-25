let eventList = {}
export default {
  clearAll() {
    eventList = {}
  },
  register(key, fn) {
    if (!eventList[key]) {
      eventList[key] = []
    }
    eventList[key].push(fn)
  },
  dispatch(...args) {
    let key = Array.prototype.shift.call(args)
    let fns = eventList[key]
    if (!fns || fns.length === 0) {
      return false
    }
    for (let i = 0; i < fns.length; i++) {
      fns[i].apply(this, args)
    }
  }
}
