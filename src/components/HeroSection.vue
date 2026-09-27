<script setup>
import AppIcon from './AppIcon.vue'
import { nodeGateway, packetLoss, statusPage } from '@/data/links'

const meta = [
  { icon: 'checkCircle', label: '开源探针' },
  { icon: 'wifi', label: 'ICMP / HTTP' },
  { icon: 'window', label: 'Windows / Linux / Docker' },
]
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">

        <div class="hero-badge">
          <span class="status-dot"></span>
          蓝盟校园网络基础设施项目
        </div>

        <h1>
          从校园的每一个角落<br>
          <span>感知网络状态</span>
        </h1>

        <p class="hero-description">
          通过部署在不同校区、楼栋和网络环境中的轻量级探测节点，
          持续执行 ICMP 与 HTTP 拨测，为校园网络运行状态提供
          更真实、更细粒度的分布式观测。
        </p>

        <div class="hero-actions">

          <a
            class="button button-primary"
            :href="nodeGateway"
            target="_blank"
            rel="noopener noreferrer"
          >
            接入探测节点

            <AppIcon name="arrowRightRound" />
          </a>

          <a
            class="button button-secondary"
            :href="statusPage"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon name="chart" />

            查看网络状态
          </a>

          <a
            class="button button-secondary"
            :href="packetLoss"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon name="activity" />

            丢包检测
          </a>

        </div>

        <div class="hero-meta">

          <span
            v-for="item in meta"
            :key="item.label"
            class="hero-meta-item"
          >
            <AppIcon :name="item.icon" />
            {{ item.label }}
          </span>

        </div>

      </div>
    </div>
  </section>
</template>
