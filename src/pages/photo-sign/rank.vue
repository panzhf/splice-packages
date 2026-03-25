<template>
  <view class="sign-rank">
    <TitleBar title="排行榜" textcolor="#fff" :opacity="0" show-nav-title is-transparent />
    <view class="top" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}photo-sign/rank-bg.jpg)` }">
      <!-- 活动规则 -->
      <view class="rule text-center fs-28 fw-bold" :style="{ top: ruleTop }" @tap="isShowExample = true">上榜规则</view>
      <!-- 个人信息 -->
      <view class="user-info flex flex-middle">
        <image :src="customerInfo.headpath" class="avatar br-round" />
        <view class="name fs-32">{{ customerInfo.nickname }}</view>
      </view>
    </view>
    <!-- 排行统计 -->
    <view class="count-box flex flex-middle flex-between fs-30">
      <view class="flex-1 flex flex-middle">
        <view class="fw-medium">
          累计打卡
          <text class="count fw-bold">{{ customerInfo.totalnumber }}</text>
          天
        </view>
        <view v-if="customerInfo.customerrange" class="fw-medium rank">
          第
          <text class="count fw-bold">{{ customerInfo.customerrange }}</text>
          名
        </view>
      </view>
      <image class="bg-icon" :src="PACKAGE_STATIC_URL + 'photo-sign/rank-camera.png'" />
    </view>
    <scroll-view class="main bg-white" scroll-y @scrolltolower="handleLoadMore">
      <view class="rank-list pl-30 pr-30">
        <view v-for="(item, index) in list" :key="index" class="item flex flex-middle fs-28 overflow-h">
          <view class="num text-center">
            <image
              v-if="index <= 2"
              :src="`${PACKAGE_STATIC_URL}photo-sign/rank-${index + 1}.png`"
              class="rank-icon shrink-0"
            />
            <view v-else class="rank-text fw-bold c-9">{{ index + 1 }}</view>
          </view>
          <view class="flex-1 flex flex-middle overflow-h">
            <image :src="item.headpath" class="avatar br-round shrink-0" />
            <view class="name ml-20 fw-bold c-3 ellipsis">{{ item.nickname }}</view>
          </view>
          <view class="c-6 fw-medium">{{ item.totalnumber }}天</view>
        </view>
      </view>
      <none-data v-if="showNoneData" msg="暂无排行数据" />
      <load-more v-if="!loading && list.length" :has-more="hasMore" />
    </scroll-view>
    <!-- 上榜规则 -->
    <rule-dialog v-model="isShowExample" :mode="2" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import RuleDialog from './components/rule-dialog'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleColorMixin } from 'packages/mixins/navigation'
import loadMoreMixin from 'packages/mixins/load-more'
import { commonMixin } from './mixins'
import { apiGetRank } from 'packages/api/photo-sign'
export default {
  name: 'SignRank',
  components: {
    TitleBar,
    RuleDialog,
    NoneData,
    LoadMore
  },
  mixins: [commonMixin, packageStaticMixin, setTitleColorMixin, loadMoreMixin],
  data() {
    return {
      actId: '',
      loading: true,
      customerInfo: {}
    }
  },
  onLoad(options) {
    this.setTitleColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff'
    })
    if (!options.id) return
    this.actId = options.id
    this.getData()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        let res = await apiGetRank({
          aid: this.actId,
          pageindex: nextPage,
          pagesize: this.paging.pageSize
        })
        const d = this.$toLowerKey(res, true)
        if (this.$ck(d)) {
          this.customerInfo = d.return_data.customerinfo
          this.dealRes({ res: d, nextPage, mode: 3 })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    handleLoadMore() {
      if (this.hasMore) {
        this.getData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: sign-rank;
.#{$prefix} {
  min-height: 100vh;
  color: #fff;
  .top {
    position: fixed;
    top: 0;
    left: 0;
    @include wh(100%, 470rpx);
    background-size: cover;
    background-repeat: no-repeat;
  }
  .user-info {
    margin-top: 270rpx;
    margin-left: 30rpx;
    .avatar {
      @include wh(80rpx);
      border: 2rpx solid #facc76;
    }
    .name {
      margin-left: 16rpx;
    }
  }
  .count-box {
    position: fixed;
    z-index: 10;
    left: 30rpx;
    right: 30rpx;
    top: 383rpx;
    height: 100rpx;
    padding: 0 30rpx 0 40rpx;
    @include round(50rpx);
    background: linear-gradient(90deg, #fffcee 0%, #ffffff 100%);
    box-shadow: 0px 0px 15rpx 0px rgba(255, 141, 6, 0.23);
    color: #333;
    .rank {
      margin-left: 70rpx;
    }
    .count {
      margin: 0 6rpx;
      color: #ff6d07;
    }
    .bg-icon {
      @include wh(86rpx, 63rpx);
    }
  }
  .rule {
    position: fixed;
    right: 0;
    z-index: 10;
    background: rgba(255, 161, 71, 0.6);
    border: 1px solid #ffcba8;
    box-shadow: 0px 5rpx 10rpx 0px #e67700;
    @include round(34rpx 0 0 34rpx);
    @include whl(148rpx, 68rpx);
  }
  .main {
    position: fixed;
    top: 440rpx;
    bottom: 0;
    width: 100%;
    overflow-x: hidden;
    @include round(10rpx 10rpx 0 0);
  }
  .rank-list {
    padding-top: 50rpx;
    .item {
      height: 124rpx;
      & + .item {
        border-top: 1px solid #eee;
      }
    }
    .num {
      min-width: 68rpx;
      margin-right: 20rpx;
      .rank-icon {
        @include wh(68rpx, 43rpx);
      }
    }
    .avatar {
      @include wh(64rpx);
    }
  }
}
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
view {
  box-sizing: border-box;
}
image {
  display: block;
}
/* #endif */
</style>
