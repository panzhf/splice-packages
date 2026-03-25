/**
 * 质保产品信息处理 mixin
 * 用于统一处理产品名称和编号的显示逻辑
 */

/**
 * 产品名称过滤器（带规格）
 * @param {Object} productInfo - 产品信息对象
 * @returns {String} 格式化后的产品名称
 */
export const productNameFilter = (productInfo = {}) => {
  // 兼容不同字段名的大小写
  const goodsName = productInfo.goodsname || ''
  const goodsFormatName = productInfo.goodsformatname || ''
  
  // 如果产品名称和规格都存在，显示为 "产品名称 - 规格"
  if (goodsName && goodsFormatName) {
    return `${goodsName} - ${goodsFormatName}`
  }
  
  // 否则返回其中一个，都没有则返回空字符串
  return goodsName || goodsFormatName || ''
}

/**
 * 产品编号过滤器
 * @param {Object} productInfo - 产品信息对象
 * @returns {String} 产品编号
 */
export const productNoFilter = (productInfo = {}) => { 
  return productInfo.goodsno || ''
}

export default {
  methods: {
    /**
     * 获取产品名称（带规格）
     * @param {Object} productInfo - 产品信息对象
     * @returns {String} 格式化后的产品名称
     */
    getProductName(productInfo = {}) {
      return productNameFilter(productInfo)
    },
    
    /**
     * 获取产品编号
     * @param {Object} productInfo - 产品信息对象
     * @returns {String} 产品编号
     */
    getProductNo(productInfo = {}) {
      return productNoFilter(productInfo)
    }
  }
}
