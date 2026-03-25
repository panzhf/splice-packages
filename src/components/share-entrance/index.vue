<template>
  <view class="md-share">
    <template v-if="info.isenableentrance">
      <!-- 分享有礼 -->
      <image
        v-if="info.isenableshareaward"
        :src="info.entranceiconurl"
        mode="scaleToFill"
        :style="customStyle"
        class="entrance-icon"
        @tap="handleNavigate"
      />
      <!-- 常规分享，根据组件所在页面的『onShareAppMessage』 -->
      <button v-else open-type="share" hover-class="none" class="share" :style="shareBtnStyle"></button>
    </template>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { apiGetShareAwardLink } from 'packages/api/share-activity'
export default {
  name: 'MdShare',
  props: {
    info: {
      type: Object,
      required: true,
      default: () => ({
        actId: '',
        actType: '',
        isenableentrance: '',
        isenableshareaward: '',
        entranceiconurl: ''
      }) // 基础信息
    },
    sharePage: {
      type: Object,
      required: true,
      default: () => {} // 组件所在页面的分享数据
    },
    customStyle: {
      type: String,
      required: true,
      default: '' // 图片布局和尺寸
    }
  },
  data() {
    return {
      btnLoading: false
    }
  },
  computed: {
    shareBtnStyle() {
      let s = [this.customStyle]
      s.push(`background-image: url(${this.info.entranceiconurl})`)
      return s.join(';')
    },
    ...mapState(['NickName', 'HeadPath'])
  },
  methods: {
    handleNavigate() {
      if (this.NickName && this.HeadPath) {
        if (this.btnLoading) return
        this.btnLoading = true
        // 需要头像和昵称
        apiGetShareAwardLink({
          aid: this.info.actId,
          actType: this.info.actType
        })
          .then(res => {
            this.btnLoading = false
            uni.setStorageSync('sharePage', this.sharePage)
            const d = this.$toLowerKey(res, true)
            let url = d.return_data.mplink
            if (url && !url.startsWith('/')) url = `/${url}`
            uni.navigateTo({
              url
            })
          })
          .catch(err => {
            this.btnLoading = false
            this.$msg(err.return_msg)
          })
      } else {
        uni.navigateTo({
          url: '/pages/login/index'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: md-share;
.#{$prefix} {
  .entrance-icon,
  .share {
    position: absolute;
    z-index: 10;
  }
  .share {
    background-size: cover;
    background-color: transparent;
  }
}
</style>
