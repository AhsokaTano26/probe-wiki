<script setup>
import AppIcon from './AppIcon.vue'

const features = [
  {
    icon: 'target',
    title: '真实校园网络视角',
    text: '节点运行在校园不同网络位置，可以观察中心服务器难以感知的 楼栋级和区域级网络异常。',
  },
  {
    icon: 'activity',
    title: 'ICMP 与 HTTP 拨测',
    text: '探针根据 Gateway 下发的配置周期执行 ICMP 和 HTTP 测量， 从网络层和应用层共同观察目标状态。',
  },
  {
    icon: 'globe',
    title: '由社区共同构建',
    text: '一台长期连接校园网的电脑、服务器、软路由或其他设备， 就可以成为校园网络的一个观测点。',
  },
]
</script>

<template>
  <section id="about" class="section section-muted">
    <div class="container">

      <div class="section-heading">
        <span class="section-eyebrow">About the project</span>

        <h2>为什么需要分布式探测？</h2>

        <p>
          一个中心服务器只能看到自己所在网络位置的连通情况。
          校园网覆盖多个校区、楼栋和接入网络，同一时间不同区域的网络体验可能完全不同。
          分布式节点让我们能够从更多真实的校园网络位置观察问题。
        </p>
      </div>

      <div class="feature-grid">

        <article
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
        >

          <div class="feature-icon">
            <AppIcon :name="feature.icon" />
          </div>

          <h3>{{ feature.title }}</h3>

          <p>
            {{ feature.text }}
          </p>

        </article>

      </div>

    </div>
  </section>
</template>
