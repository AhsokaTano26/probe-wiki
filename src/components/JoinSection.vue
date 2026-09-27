<script setup>
import AppIcon from './AppIcon.vue'
import { githubReleases, nodeGateway } from '@/data/links'
</script>

<template>
  <section id="join" class="section section-muted">
    <div class="container">

      <div class="section-heading">
        <span class="section-eyebrow">
          Join the network
        </span>

        <h2>接入一个探测节点</h2>

        <p>
          完成节点登记并获取接入信息后，
          在设备上运行 CQU NetProbe 即可加入校园网络分布式监测体系。
        </p>
      </div>

      <div class="steps">

        <article class="step-card">

          <div class="step-number">
            01
          </div>

          <h3>登记探测节点</h3>

          <p>
            打开
            <a
              class="inline-link"
              :href="nodeGateway"
              target="_blank"
              rel="noopener noreferrer"
            >
              NetProbe 节点管理平台
            </a>
            ，按照页面提示填写节点所在的校区、楼栋等信息。
          </p>

        </article>

        <article class="step-card">

          <div class="step-number">
            02
          </div>

          <h3>获取 Token</h3>

          <p>
            创建节点后获取平台提供的接入信息和节点 Token。
            Token 用于识别和认证你的探测节点，请妥善保存，不要公开分享。
          </p>

        </article>

        <article class="step-card">

          <div class="step-number">
            03
          </div>

          <h3>运行 CQU NetProbe</h3>

          <p>
            根据设备环境选择 Docker，
            或从
            <a
              class="inline-link"
              :href="githubReleases"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Releases
            </a>
            下载对应平台和架构的二进制程序并启动。
          </p>

        </article>

      </div>

      <div class="join-panel">

        <div>
          <h3>准备好加入了吗？</h3>
          <p>
            创建节点，获取 Token，然后选择一种部署方式即可。
          </p>
        </div>

        <a
          class="button button-primary"
          :href="nodeGateway"
          target="_blank"
          rel="noopener noreferrer"
        >
          前往节点管理平台

          <AppIcon name="arrowRight" />
        </a>

      </div>

    </div>
  </section>
</template>
