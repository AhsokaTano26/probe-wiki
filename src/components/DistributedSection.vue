<script setup>
import AppIcon from './AppIcon.vue'

const reasons = [
  {
    title: '覆盖不同校区与楼栋',
    text: '从更多真实校园网络出口持续进行拨测。',
  },
  {
    title: '区分局部异常与整体异常',
    text: '通过不同节点之间的结果差异辅助判断问题范围。',
  },
  {
    title: '持续积累网络运行数据',
    text: '长期观察网络质量变化，为问题排查提供参考。',
  },
]

const points = [
  { className: 'point-1', label: 'A 区节点' },
  { className: 'point-2', label: 'B 区节点' },
  { className: 'point-3', label: '宿舍节点' },
  { className: 'point-4', label: '实验室节点' },
  { className: 'point-5', label: '教学区节点' },
  { className: 'point-6', label: '服务器节点' },
]

const lines = ['line-1', 'line-2', 'line-3', 'line-4', 'line-5', 'line-6']
</script>

<template>
  <section class="section">
    <div class="container">

      <div class="distributed-layout">

        <div class="distributed-copy">

          <span class="section-eyebrow">
            Distributed monitoring
          </span>

          <h2>
            一个节点看到的是一点，很多节点看到的是校园网络。
          </h2>

          <p>
            当多个区域同时出现异常，可以辅助判断问题是否具有普遍性；
            当只有少数节点异常，则可以进一步缩小问题所在的网络区域。
            节点覆盖越丰富，对校园网络状态的观察就越完整。
          </p>

          <div class="reason-list">

            <div
              v-for="reason in reasons"
              :key="reason.title"
              class="reason"
            >

              <div class="reason-icon">
                <AppIcon name="check" />
              </div>

              <div>
                <h3>{{ reason.title }}</h3>
                <p>{{ reason.text }}</p>
              </div>

            </div>

          </div>

        </div>

        <div class="node-map">

          <div
            v-for="line in lines"
            :key="line"
            :class="`map-line ${line}`"
          ></div>

          <div class="map-center">
            <AppIcon name="logo" />
          </div>

          <div
            v-for="point in points"
            :key="point.className"
            :class="`map-point ${point.className}`"
          >
            {{ point.label }}
          </div>

        </div>

      </div>

    </div>
  </section>
</template>
