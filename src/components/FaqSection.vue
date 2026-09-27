<script setup>
import { githubReleases, githubRepo } from '@/data/links'

const faqs = [
  {
    question: '什么设备适合部署探测节点？',
    answer:
      '能够长期保持校园网连接并运行 CQU NetProbe 的设备都可以考虑， 例如服务器、软路由、NAS、实验室主机或其他长期在线设备。',
  },
  {
    question: '应该选择 Docker 还是二进制文件？',
    answer:
      '如果设备已经具有 Docker 环境，可以直接使用容器部署。 如果是普通 Windows、Linux 主机或者不希望安装 Docker， 可以从 GitHub Releases 下载对应架构的二进制程序直接运行。',
  },
  {
    question: '节点需要开放公网端口吗？',
    answer:
      'CQU NetProbe 主动从 Gateway 获取配置并上报测量结果， 因此通常不需要为了探针本身开放公网入站端口。',
  },
  {
    question: '为什么 Docker 需要 NET_RAW？',
    answer:
      'Linux 下探针优先使用非特权 ping socket。当该方式不可用时会回退到 raw socket，因此容器需要 NET_RAW capability 才能完成 ICMP 探测。',
    code: 'NET_RAW',
  },
  {
    question: 'Token 可以分享给别人吗？',
    answer:
      '不建议。Token 用于识别和认证一个探测节点， 应当像其他访问凭据一样妥善保管。',
  },
]
</script>

<template>
  <section class="section">
    <div class="container">

      <div class="section-heading">
        <span class="section-eyebrow">FAQ</span>
        <h2>常见问题</h2>
      </div>

      <div class="faq-list">

        <article
          v-for="faq in faqs"
          :key="faq.question"
          class="faq-item"
        >

          <h3>
            {{ faq.question }}
          </h3>

          <p v-if="faq.code">
            Linux 下探针优先使用非特权 ping socket。
            当该方式不可用时会回退到 raw socket，
            因此容器需要
            <code>{{ faq.code }}</code>
            capability 才能完成 ICMP 探测。
          </p>

          <p v-else>
            {{ faq.answer }}
          </p>

        </article>


        <article class="faq-item">

          <h3>
            哪里可以查看源码和最新版本？
          </h3>

          <p>
            项目代码托管于
            <a
              class="inline-link"
              :href="githubRepo"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            ，二进制程序可以在
            <a
              class="inline-link"
              :href="githubReleases"
              target="_blank"
              rel="noopener noreferrer"
            >
              v1.0.0 Release
            </a>
            下载。
          </p>

        </article>

      </div>

    </div>
  </section>
</template>
