<script setup>
import AppIcon from './AppIcon.vue'
import { githubRepo, nodeGateway, overviewDashboard, packetLoss, statusPage } from '@/data/links'

const links = [
  { label: '节点管理', href: nodeGateway },
  { label: '信息总览', href: overviewDashboard },
  { label: '网络状态', href: statusPage },
  { label: '丢包检测', href: packetLoss },
  { label: 'GitHub', href: githubRepo },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">

      <div class="footer-brand">

        <AppIcon name="logo" />

        <div class="footer-copy">
          <strong>
            重庆大学蓝盟 · CQU NetProbe
          </strong>
          <span>
            由蓝盟提供技术支持
          </span>
        </div>

      </div>


      <div class="footer-links">

        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.label }}
        </a>

        <span>
          © <span>{{ year }}</span> LanUnion
        </span>

      </div>

    </div>
  </footer>
</template>
