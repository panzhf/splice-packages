<template>
  <view class="page-redact bg-white">
    <title-bar title="上传" type="detail" show-nav-title show-placeholder bgcolor="#fff" />
    <view class="content">
      <view class="update-box">
        <view v-for="(item, index) in fileList" :key="index" class="item">
          <u-icon name="close" size="32" class="close" @click="handRemove(index)" />
          <view class="box flex flex-middle flex-center overflow-h">
            <image :src="item.url" class="imgs" mode="aspectFit" />
          </view>
        </view>
        <view v-if="fileList.length < 9" class="item">
          <view class="box flex flex-middle flex-center" @tap.stop="hanleGetphoto">
            <view class="iconfont iconshangchuan camera-icon" />
          </view>
        </view>
      </view>
      <view class="input-b">
        <textarea
          v-model="content"
          placeholder-style="color:#aaaaaa"
          placeholder="请输入您要种草的内容"
          :maxlength="1000"
          class="input"
        />
        <span class="count fs-24">{{ content.length }}/1000</span>
      </view>
      <view class="tag-box flex-wrap">
        <tag
          v-for="(item, index) in topics"
          :key="index"
          :text="item.topicname"
          :checked="item.checked"
          @click.native="handleCheck(item)"
        />
      </view>
    </view>
    <view style="height: 130rpx" />
    <view class="btn-submit text-center" @tap="handleUpdate">
      <template v-if="!busy">上传</template>
      <template v-else>
        <u-loading mode="circle" />
      </template>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getExtConfig } from '@/config/index'
import { chooseImg, uploadImg } from '@/utils/upload'
import { apiGetTopicList, apiCreateContent } from 'packages/api/community'
import TitleBar from 'packages/components/title-bar/title-bar'
import Tag from './components/tag.vue'
export default {
  components: {
    TitleBar,
    Tag
  },
  data() {
    return {
      busy: false,
      fileList: [],
      content: '',
      topics: []
    }
  },
  onLoad() {
    this.getTagList()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  methods: {
    handleUpdate() {
      if (!this.fileList.length) return this.$msg('请上传图文')
      if (this.busy) return
      this.busy = true
      let topicids = []
      this.topics.forEach(item => {
        if (item.checked) {
          topicids.push(item.id)
        }
      })
      apiCreateContent({
        pictures: this.fileList,
        m: this.$toLowerKey(getExtConfig()).memberlogin,
        content: this.content,
        topicids
      })
        .then(res => {
          this.busy = false
          this.$msg('上传成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        })
        .catch(err => {
          this.$msg(err.return_msg)
          this.busy = false
        })
    },
    handRemove(index) {
      this.fileList.splice(index, 1)
    },
    handleCheck(item) {
      item.checked = !item.checked
    },
    getTagList() {
      apiGetTopicList({
        m: this.$toLowerKey(getExtConfig()).memberlogin
      }).then(res => {
        if (this.$ck(res)) {
          let { return_data: data } = res
          data.forEach(item => {
            item.checked = false
          })
          this.topics = data
          this.showTab = true
        }
      })
    },
    async hanleGetphoto() {
      const pathArr = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
        count: 9 - this.fileList.length
      })
      if (pathArr?.length) {
        this.$loading.show()
        Promise.all(pathArr.map(item => uploadImg(item, true))).then(res => {
          this.$loading.hide()

          if (res.every(item => this.$ck(item))) {
            let arr = res.map(item => {
              return {
                url: item.return_data[0].imgurl
              }
            })
            this.fileList = [...this.fileList, ...arr]
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
@import './styles/list.scss';
.page-redact {
  min-height: 100%;
}
.update-box {
  margin-top: 30rpx;
  padding: 0 30rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 每行三个网格，宽度平分
  grid-auto-rows: minmax(100rpx, auto); // 自动行高，最小值为100px
  grid-gap: 24rpx; // 网格间距为20px
  .item {
    position: relative;
    @include wh(210rpx, 280rpx);
    background: #f0f0f0;
    border: 1rpx solid #e5e5e5;
    border-radius: 10rpx;
    .box {
      @include wh(100%);
    }
    .close {
      position: absolute;
      right: 0;
      top: 0;
      background: $community-theme;
      color: #fff;
      z-index: 9;
    }
    .img {
      @include wh(202rpx, 350rpx);
    }
  }
}
.camera-icon {
  font-size: 60rpx;
  color: #aaa;
}
.input-b {
  padding: 0 30rpx;
  margin-top: 50rpx;
  position: relative;
  .input {
    width: 100%;
    margin: 0 auto;
    padding-bottom: 70rpx;
    border-bottom: 1rpx solid #e5e5e5;
  }
  .count {
    position: absolute;
    bottom: 20rpx;
    right: 42rpx;
    font-weight: 500;
    color: #aaa;
  }
}
.tag-box {
  padding: 0 30rpx 30rpx;
}
.btn-submit {
  position: fixed;
  bottom: 30rpx;
  background: $community-theme;
  border-radius: 40rpx;
  color: #fff;
  @include whl(690rpx, 80rpx);
  @include h-cen;
}

.imgs {
  width: 100%;
}
</style>
