export default {
  _listeners: [],
  subscribe(listener) {
    this._listeners.push(listener)
  },
  notify(res) {
    this._listeners.forEach(listener => listener(res))
    this._listeners = []
  }
}
