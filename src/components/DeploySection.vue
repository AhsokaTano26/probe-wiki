<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import CodeBlock from './CodeBlock.vue'
import { configCode, dockerCode, linuxCode, windowsCode } from '@/data/code'
import { githubReleases } from '@/data/links'

const tabs = [
  { id: 'docker', label: 'Docker', icon: 'docker' },
  { id: 'binary', label: '二进制文件', icon: 'download' },
]

const platforms = [
  { name: 'Linux x86-64', target: 'linux_amd64' },
  { name: 'Linux ARM64', target: 'linux_arm64' },
  { name: 'Linux ARM', target: 'linux_armv6 / linux_armv7' },
  { name: 'Linux MIPS', target: 'linux_mips / linux_mipsle' },
  { name: 'Windows x86-64', target: 'windows_amd64' },
  { name: 'Windows ARM64', target: 'windows_arm64' },
]

const activeTab = ref('docker')

const mutedStyle = {
  marginBottom: '10px',
  color: 'var(--text-secondary)',
  fontSize: '12px',
}
</script>

<template>
  <section id="deploy" class="section">
    <div class="container">

      <div class="section-heading">

        <span class="section-eyebrow">
          Deployment
        </span>

        <h2>选择你的部署方式</h2>

        <p>
          CQU NetProbe 提供 Docker 镜像和预编译二进制程序。
          对于服务器、NAS、软路由等长期运行环境可以使用 Docker；
          也可以直接下载与设备平台和 CPU 架构对应的 Release。
        </p>

      </div>

      <div class="deploy-layout">

        <div class="deploy-nav">

          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="activeTab === tab.id ? 'deploy-tab active' : 'deploy-tab'"
            type="button"
            @click="activeTab = tab.id"
          >
            <AppIcon :name="tab.icon" />
            {{ tab.label }}
          </button>

        </div>


        <div class="deploy-content">

          <!-- =================================================
               Docker
               ================================================= -->

          <div
            :class="activeTab === 'docker' ? 'deploy-pane active' : 'deploy-pane'"
          >

            <h3>使用 Docker 部署</h3>

            <p>
              从节点管理平台获取 Gateway 地址和 Token，
              然后替换下面命令中的
              <code>GATEWAY_URL</code>
              与
              <code>YOUR_GATEWAY_TOKEN</code>。
            </p>

            <dl class="var-list">

              <dt>
                <code>GATEWAY_URL</code>
              </dt>

              <dd>
                Gateway 的接入地址。探针从它获取拨测配置，
                并把测量结果上报给它。
              </dd>

              <dt>
                <code>YOUR_GATEWAY_TOKEN</code>
              </dt>

              <dd>
                这个节点自己的 Token，形如
                <code>cqu_probe_…</code>。
                Gateway 用它识别和认证是哪一个节点，每个节点一个。
              </dd>

            </dl>

            <CodeBlock title="Docker" :code="dockerCode" />

            <div class="notice">

              <AppIcon name="info" />

              <div>
                Linux 下探针优先使用非特权 ping socket，
                不可用时会回退到 raw socket，
                因此 Docker 容器需要
                <strong>NET_RAW</strong>
                capability。
              </div>

            </div>

            <div class="notice notice-warning">

              <AppIcon name="warning" />

              <div>
                Token 是探测节点的身份凭据，请勿将真实 Token
                发布到公开仓库或分享给无关人员。
              </div>

            </div>

          </div>


          <!-- =================================================
               Binary
               ================================================= -->

          <div
            :class="activeTab === 'binary' ? 'deploy-pane active' : 'deploy-pane'"
          >

            <h3>运行预编译二进制文件</h3>

            <p>
              如果不使用 Docker，可以直接下载官方 Release。
              v1.0.0 已提供常见 Linux 与 Windows 平台的预编译程序，
              无需在本地安装 Go 或自行编译。
            </p>

            <div class="version-bar">

              <span class="version-badge">
                v1.0.0
              </span>

              <a
                class="button button-primary"
                :href="githubReleases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AppIcon name="downloadPlain" />

                前往 GitHub Releases
              </a>

            </div>

            <div class="platform-grid">

              <div
                v-for="platform in platforms"
                :key="platform.target"
                class="platform-card"
              >
                <strong>{{ platform.name }}</strong>
                <span>{{ platform.target }}</span>
              </div>

            </div>


            <div class="subheading">
              Linux 示例
            </div>

            <p :style="mutedStyle">
              以常见的 Linux x86-64 主机为例，下载
              <code>cqu-netprobe_v1.0.0_linux_amd64.tar.gz</code>
              后执行：
            </p>

            <CodeBlock title="Linux" :code="linuxCode" />


            <div class="subheading">
              配置节点信息
            </div>

            <p :style="mutedStyle">
              编辑同目录中的
              <code>config.json</code>，
              将 Gateway 地址和 Token 替换为节点管理平台提供的实际内容。
            </p>

            <CodeBlock title="config.json" :code="configCode" />


            <div class="subheading">
              Windows 示例
            </div>

            <p :style="mutedStyle">
              下载对应的 ZIP 文件并解压后，
              创建 <code>config.json</code>，
              即可运行 <code>cqu-netprobe.exe</code>。
            </p>

            <CodeBlock title="PowerShell" :code="windowsCode" />


            <div class="notice">

              <AppIcon name="info" />

              <div>
                Release 压缩包中已经包含程序本体、
                <strong>README.md</strong>
                和
                <strong>config.example.json</strong>。
                程序默认读取当前工作目录中的
                <strong>config.json</strong>。
              </div>

            </div>


            <div class="notice notice-warning">

              <AppIcon name="warning" />

              <div>
                不确定设备架构时，可以先执行
                <code>uname -m</code>
                查看 Linux CPU 架构，再选择对应的 Release 文件。
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>
