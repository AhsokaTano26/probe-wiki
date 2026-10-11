<script setup>
import AppIcon from './AppIcon.vue'
import { overviewDashboard, packetLoss, statusPage } from '@/data/links'
</script>

<template>
  <section class="status-section">
    <div class="container">

      <div class="status-card">

        <div class="status-copy">

          <span class="section-eyebrow">
            Network status
          </span>

          <h2>
            看看校园网络现在怎么样
          </h2>

          <p>
            <span class="overview-description">总览面板集中展示所有监测信息。</span>
            通过状态页面查看校园网络相关目标的实时监测结果，
            快速了解当前网络服务状态。
          </p>

        </div>

        <div class="status-action">

          <a
            class="button"
            :href="overviewDashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看信息总览

            <AppIcon name="arrowRight" />
          </a>

          <a
            class="button button-ghost"
            :href="statusPage"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看网络状态

            <AppIcon name="arrowRight" />
          </a>

          <a
            class="button button-ghost"
            :href="packetLoss"
            target="_blank"
            rel="noopener noreferrer"
          >
            丢包状态检测

            <AppIcon name="arrowRight" />
          </a>

        </div>

      </div>

    </div>
  </section>
</template>
