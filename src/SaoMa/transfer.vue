<template>
  <view />
</template>

<script>
import config from './config'
import { stringify } from './query-parse'
export default {
  onLoad(options) {
    const page = config[decodeURIComponent(options.page)]
    let query = stringify(options, ['page'])
    uni.reLaunch({ url: `${page}?${query}` })
  }
}
</script>
