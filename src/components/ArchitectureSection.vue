<script setup>
import AppIcon from './AppIcon.vue'

const nodes = [
  {
    icon: 'monitor',
    title: '探测节点',
    text: '部署在宿舍、实验室、办公室、服务器或其他校园网络环境。',
  },
  {
    icon: 'server',
    title: 'NetProbe Gateway',
    text: '向节点下发拨测配置，并接收节点周期性上报的测量结果。',
  },
  {
    icon: 'stats',
    title: '状态监测',
    text: '汇总不同区域的观测结果，形成校园网络状态视图。',
  },
]
</script>

<template>
  <section class="architecture">
    <div class="container">

      <div class="architecture-card">

        <div class="architecture-label">
          How it works
        </div>

        <div class="architecture-flow">

          <template v-for="(node, index) in nodes" :key="node.title">

            <div v-if="index > 0" class="flow-arrow">
              <AppIcon name="chevron" />
            </div>

            <div class="architecture-node">

              <div class="architecture-icon">
                <AppIcon :name="node.icon" />
              </div>

              <h3>{{ node.title }}</h3>

              <p>
                {{ node.text }}
              </p>

            </div>

          </template>

        </div>

      </div>

    </div>
  </section>
</template>
