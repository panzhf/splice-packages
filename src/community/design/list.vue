<template>
  <view class="list pr-20 pb-20 pl-20" :style="{ background: bgColor, minHeight: '100vh' }">
    <u-waterfall ref="uWaterfall" v-model="pageList" class="list-box" id-key="communityid">
      <template #left="{ leftList }">
        <Item
          v-for="(item, index) in leftList"
          :key="item.communityid"
          :item="item"
          :index="index"
          custom-class="mr-20"
          @click.native="handleDetail(item)"
          @zan="handleZan"
        />
      </template>
      <template #right="{ rightList }">
        <Item
          v-for="(item, index) in rightList"
          :key="item.communityid"
          :item="item"
          :index="index"
          @click.native="handleDetail(item)"
          @zan="handleZan"
        />
      </template>
    </u-waterfall>
    <load-more v-if="!loading && list.length" :has-more="hasMore" :safe-area="false" />
    <none-data v-if="!list.length && !loading" />
    <!-- <view style="height: 100rpx" /> -->
  </view>
</template>

<script>
import { getExtConfig } from '@/config'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import Item from './item'
import { apiContentLikeit } from 'packages/api/community'
export default {
  components: {
    NoneData,
    LoadMore,
    Item
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    bgColor: {
      type: String,
      default: '#f4f4f4'
    }
  },
  data() {
    return {}
  },
  computed: {
    pageList: {
      get() {
        if (!this.list.length) {
          // 瀑布流重置数据
          this.$refs.uWaterfall.clear && this.$refs.uWaterfall.clear()
        }
        return this.list
      },
      set(val) {
        this.$emit('update:list', val)
      }
    }
  },
  created() {
    uni.$on('setZan', id => {
      this.setZan(id)
    })
  },
  beforeDestroy() {
    uni.$off('setZan')
  },
  methods: {
    setZan(id, jia = true, animation = false) {
      // 瀑布流更改数据不响应，手动更改数据
      this.$refs.uWaterfall.leftList.forEach((item, index) => {
        if (item.communityid === id) {
          if (animation) {
            item.istaped = true
            return
          }
          item.islike = !item.islike
          jia ? item.likeitnum++ : item.likeitnum--
        }
      })
      this.$refs.uWaterfall.rightList.forEach((item, index) => {
        if (item.communityid === id) {
          if (animation) {
            item.istaped = true
            return
          }
          item.islike = !item.islike
          jia ? item.likeitnum++ : item.likeitnum--
        }
      })
    },
    handleZan(item) {
      this.setZan(item.communityid)
      apiContentLikeit({
        m: this.$toLowerKey(getExtConfig()).memberlogin,
        id: item.communityid
      })
        .then(res => {
          this.setZan(item.communityid, false, true)
        })
        .catch(err => {
          this.$msg(err.return_msg || '网络异常')
          this.setZan(item.communityid, false)
        })
    },
    handleDetail(item) {
      this.$emit('detail', item)
    }
  }
}
</script>
