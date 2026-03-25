<template>
  <view class="people-picker fs-28">
    <u-popup v-model="showDialog" mode="bottom" border-radius="30" @close="$emit('input', false)">
      <view class="pupup-title fs-30 fw-bold">选择活动</view>
      <view class="search-box">
        <input
          v-model="filter.keyword"
          :maxlength="20"
          type="text"
          placeholder="请输入"
          class="search-input"
          @confirm="handleChange"
        />
        <view class="search-button fs-30" @click="handleChange">搜索</view>
      </view>
      <scroll-view class="list" scroll-y="true" scroll-left="120" :show-scrollbar="false">
        <view v-for="(item, index) in list.items" :key="index" class="item flex fs-24" @click="handleSelect(item)">
          <image class="img" :src="item.activityimg" mode="scaleToFill" />
          <view class="right ml-20">
            <view class="act-title ellipsis">
              {{ item.activityname }}
            </view>
            <view class="time mt-20">活动时间：{{ item.showTime }}</view>
          </view>
          <view class="icon iconfont fs-26 iconjiantou primary-color" />
        </view>
        <load-more v-if="!list.loading && list.items.length" :has-more="list.hasMore" />
        <none-data v-if="!list.items.length" class="noda" :show-icon="false" :view-height="560" :msg="msg" />
      </scroll-view>
    </u-popup>
  </view>
</template>

<script>
import { apiGetActivities } from 'packages/api/group-buy'
import LoadMore from '@/components/load-more/index.vue'
import dialogMixin from 'packages/mixins/dialog'

export default {
  name: 'ActivityPicker',
  components: {
    LoadMore
  },
  mixins: [dialogMixin],
  data() {
    return {
      list: {
        query: {
          keyword: ''
        },
        paging: {
          pageSize: 10,
          PageIndex: 1
        },
        total: 0,
        items: [{}],
        busy: false, // 防重复标记
        loading: true
      },
      storeNum: 0,
      filter: {
        keyword: ''
      },
      msg: '暂无相关活动哦'
    }
  },
  computed: {
    brandInfo() {
      return JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}')
    }
  },
  watch: {
    showDialog(val) {
      val && this.handleChange()
    }
  },
  methods: {
    resetData() {
      this.list.items = []
    },
    handleChange() {
      this.resetData()
      this.getData()
    },
    async getData() {
      if (this.list.busy) return
      this.list.busy = true

      let res = await apiGetActivities({
        keyword: this.filter.keyword,
        activitytype: 38
      })
      if (this.$ck(res)) {
        let list = res.return_data || []
        list.forEach(item => {
          item.showTime = `${item.starttime.split(' ')[0]} - ${item.endtime.split(' ')[0]}`
        })
        this.list.items = list
        this.list.busy = false
        this.list.loading = false
      }
    },

    handleSelect(item) {
      this.$emit('select', item)
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  height: 650rpx;
  padding: 0 18rpx;
  margin: 30rpx 0;
  box-sizing: border-box;
  padding-right: 0;
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    color: transparent;
  }
  .item {
    border-bottom: 1rpx solid #e5e5e5;
    padding-bottom: 35rpx;
    position: relative;
    padding-top: 35rpx;
    .iconjiantou {
      position: absolute;
      right: 40rpx;
      top: 22%;
    }
    .img {
      width: 240rpx;
      height: 80rpx;
    }
    .right {
      .act-title {
        width: 530rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #222222;
      }
      .time {
        font-weight: 500;
        color: #666666;
      }
    }
  }
  // .info,
  // .item {
  //   position: relative;
  //   .iconright {
  //     position: absolute;
  //     right: 40rpx;
  //     top: 50%;
  //   }
  // }
  .item {
    .iconright {
      top: 12%;
    }
  }
}
.pupup-title {
  text-align: center;
  margin: 32rpx 0;
}
.search-box {
  margin-top: 30rpx;
  display: flex;
  padding: 0 20rpx;
  .search-input {
    flex: 1;
    height: 80rpx;
    padding-left: 20rpx;
    @include border(#cccccc, 11rpx);
  }
  .search-button {
    width: 110rpx;
    height: 80rpx;
    background: #fff;
    color: $uni-color-primary;
    line-height: 80rpx;
    text-align: center;
    margin-left: 10rpx;
    font-weight: bold;
    @include border($uni-color-primary, 11rpx);
  }
}
</style>
