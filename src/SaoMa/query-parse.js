export const stringify = (data, skipProps = []) => {
  let r = []
  for (let key in data) {
    if (skipProps.includes(key)) continue
    r.push(`${key}=${data[key]}`)
  }
  return r.join('&')
}

export const isEmptyObj = data => Object.keys(data).length === 0
