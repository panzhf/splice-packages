<template>
  <view v-if="activityList.length > 0" class="banner-box bg-white ml-20 mr-20 br-10">
    <view v-if="showTitle" class="header flex flex-middle flex-between pl-30 pr-30">
      <view class="title fw-bold fs-28">{{ title }}</view>
      <view class="link fs-24 c-6" @tap="handleNav">
        全部活动
        <text class="iconfont iconjiantou1 ml-10 c-3 fs-20" />
      </view>
    </view>
    <!-- 单个活动直接显示 -->
    <banner-item v-if="activityList.length === 1" :info="activityList[0]" />
    <!-- 多个活动使用轮播 -->
    <view v-else class="swiper-container">
      <swiper :autoplay="true" :circular="true" :style="{ height: swiperHeight }" @change="onSwiperChanged">
        <swiper-item v-for="(item, index) in activityList" :key="index" class="swiper-item">
          <banner-item :info="item" style="width: 100%" />
        </swiper-item>
      </swiper>
      <!-- 轮播指示器 -->
      <view class="swiper-dots">
        <view
          v-for="(item, index) in activityList"
          :key="index"
          class="swiper-dot"
          :class="{ 'is-active': activeIndex === index }"
        />
      </view>
    </view>
  </view>
</template>

<script>
import BannerItem from 'packages/components/activity-banner/index.vue'
import { apiGetStoreNewActs } from '@/api/activity'
export default {
  name: 'RetailActivity',
  components: {
    BannerItem
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activityList: [],
      loading: false,
      activeIndex: 0,
      swiperHeight: '380rpx' // 默认高度，可根据实际内容调整
    }
  },
  computed: {
    title() {
      return this.data.Title || '最新活动'
    },
    showTitle() {
      return this.data.IsShowTitle !== false
    },
    activityType() {
      return this.data.ActivityType || 'latest'
    },
    size() {
      return this.data.size || 3
    },
    customActivities() {
      return this.data.CustomActivities || []
    },
    // 获取权限菜单配置
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const homemenu = userMenuInfo.homemenu || []
      return homemenu.find(item => item.number === 35 && item.state === 1)
    }
  },
  mounted() {
    // 只有权限允许才加载数据
    if (this.permissionMenu) {
      this.fetchActivityList()
    }
  },
  methods: {
    async fetchActivityList() {
      if (!this.permissionMenu) return

      this.loading = true
      try {
        let ids = []
        let mode = 1 // 1-按最新活动，2-按自定义活动

        if (this.activityType === 'custom') {
          // 自定义活动，提取ID列表
          ids = this.customActivities.map(item => item.id).filter(id => id)
          mode = 2
        }

        const res = await apiGetStoreNewActs({
          mode: mode,
          size: this.size,
          ids: ids
        })

        if (this.$ck && this.$ck(res)) {
          this.activityList = res.return_data.results || []
        }
      } catch (error) {
        this.activityList = []
      } finally {
        this.loading = false
      }
    },
    handleNav() {
      uni.reLaunch({ url: '/activity-tab/index' })
    },
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: banner-box;
.#{$prefix} {
  padding-bottom: 6rpx;
  .header {
    padding-top: 28rpx;
  }
  .title {
    font-size: 28rpx;
  }
  .link {
    color: #666;
  }
  .iconfont {
    font-size: 20rpx;
  }
  .empty {
    padding: 140rpx 0;
  }
}

.swiper-container {
  position: relative;

  swiper {
    width: 100%;
  }

  .swiper-item {
    display: flex;
    overflow: hidden;
  }

  .swiper-dots {
    position: absolute;
    bottom: 20rpx;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 10;

    .swiper-dot {
      display: inline-block;
      margin: 0 6rpx;
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.2);
      transition: all 0.3s;

      &.is-active {
        width: 32rpx;
        border-radius: 8rpx;
        background-color: var(--theme-color, #ff7640);
      }
    }
  }
}
</style>

