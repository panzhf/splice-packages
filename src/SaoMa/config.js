/**
 * 映射文件配置，现有扫码模板是基于总后台创建的，路径格式为: yyyy/mm/dd/${id}
 * 此映射配置主要将语义不明的扫码模板（H5）路径转为具体扫码文件
 * 由于测试和生产环境路径不同，因此需要配两种路径，但映射到项目的文件是同一个
 * 更多分析参考：https://miduo1031.yuque.com/docs/share/c830a58e-3760-4dd4-b2ae-33b44f15f11d
 */
export default {
  'error-page': '/scan-templates/error-page', // 错误页
  '2022/5/6/10049': '/scan-templates/ssq/index', // 上上签
  '2022/5/26/10035': '/scan-templates/ssq/index',
  '2022/10/19/10054': '/scan-templates/shoot-ball/index', // 点球有礼
  '2022/10/21/10037': '/scan-templates/shoot-ball/index',
  '2023/7/4/100003': '/scan-templates/custom-scan/index', // 点得奖
  '2023/7/11/10040': '/scan-templates/custom-scan/index',
  '2023/11/9/100006': '/scan-templates/custom-guide-scan/index', // 默认导购模板
  '2023/12/1/10044': '/scan-templates/custom-guide-scan/index',
  '2023/12/20/100012': '/scan-templates/custom-guide-scan/index', // 默认门店模板
  '2024/1/2/10046': '/scan-templates/custom-guide-scan/index',
  '2024/3/18/100014': '/scan-templates/custom-scan/index', //大转盘
  '2024/3/18/10048': '/scan-templates/custom-scan/index'
}
