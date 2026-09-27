<script setup>
import AppIcon from './AppIcon.vue'

const cards = [
  {
    icon: 'list',
    title: '配置获取',
    items: [
      '启动时自动从 Gateway 拉取探测配置。',
      '拉取失败后从 1 秒开始指数退避，最大间隔 1 分钟。',
      '没有可上报目标时，每个测量周期会主动检查配置。',
    ],
  },
  {
    icon: 'measure',
    title: '测量调度',
    items: [
      '配置拉取成功后立即执行第一轮测量。',
      '同一轮中的 Target 和不同拨测类型可以并发执行。',
      '测量轮次不会重叠，耗时过长时会跳过已经错过的调度点。',
    ],
  },
  {
    icon: 'arrowRightLong',
    title: '结果上报',
    items: [
      '每轮测量完成后向 Gateway 上报最新结果。',
      'Push 失败不会补传历史数据。',
      '下一轮继续测量，并只上报最新结果。',
    ],
  },
  {
    icon: 'icmp',
    title: 'ICMP / HTTP',
    items: [
      'ICMP 域名目标优先使用 IPv4，无 IPv4 时使用 IPv6。',
      'HTTP 拨测直接连接目标，不读取系统代理配置。',
      'HTTP 耗时包含重定向和响应体读取过程。',
    ],
  },
]
</script>

<template>
  <section id="details" class="section section-muted">
    <div class="container">

      <div class="section-heading">

        <span class="section-eyebrow">
          How NetProbe works
        </span>

        <h2>探针如何工作</h2>

        <p>
          节点接入后无需人工维护探测目标。
          探针会从 Gateway 获取配置，
          并按照服务端下发的任务持续执行测量和上报。
        </p>

      </div>

      <div class="details-grid">

        <article
          v-for="card in cards"
          :key="card.title"
          class="detail-card"
        >

          <h3>
            <AppIcon :name="card.icon" />

            {{ card.title }}
          </h3>

          <div class="detail-list">

            <div
              v-for="item in card.items"
              :key="item"
              class="detail-item"
            >
              {{ item }}
            </div>

          </div>

        </article>

      </div>

    </div>
  </section>
</template>
