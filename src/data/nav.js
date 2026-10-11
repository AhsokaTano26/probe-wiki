import { overviewDashboard, packetLoss, statusPage } from './links'

export const navLinks = [
  { label: '项目介绍', href: '#about' },
  { label: '接入节点', href: '#join' },
  { label: '部署方式', href: '#deploy' },
  { label: '运行机制', href: '#details' },
  { label: '信息总览', href: overviewDashboard, external: true },
  { label: '网络状态', href: statusPage, external: true },
  { label: '丢包检测', href: packetLoss, external: true },
]

export default navLinks
