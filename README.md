# 校园网分布式探测 | 重庆大学蓝盟

CQU NetProbe 项目主页，使用 Vue 3 + Vite 构建。

页面与原始 `reference-original.html` 在结构、文案、样式与交互上保持一致，
`reference-original.html` 保留为比对基准，请勿修改。

## 开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 预渲染并输出到 dist/
npm run preview    # 预览构建结果
```

## 预渲染

`npm run build` 不是单纯的 `vite build`，而是 `scripts/build.mjs` 三步：

1. 打包客户端 → `dist/`
2. 打包服务端 → `dist-ssr/`
3. 把应用渲染成 HTML，内联进 `dist/index.html`

页面是静态内容，所以构建产物里直接带着完整标记——访客立刻看到内容，不用等 JS
下载、解析、执行完才出现画面；爬虫和禁用 JS 的环境同样能读到全部文案。Vue 加载后
hydrate 这份标记接管交互（菜单、标签切换、复制按钮），行为不变。

`dist/index.html` 约 24 KB，其中约 4 KB 是纯文本；客户端包在无事可做时不会重绘页面。

开发模式下 `index.html` 里的容器是空的，`createSSRApp` 检测到没有子节点就正常挂载。

## 目录结构

```
index.html                  Vite 入口
reference-original.html     原始页面（比对基准）
src/
  main.js                   应用入口
  App.vue                   页面组装
  assets/logo.svg           全站统一使用的 Logo
  styles/main.css           全站样式（原始部分未改动，新增集中在末尾）
  data/
    icons.js                图标 SVG（由脚本生成）
    code.js                 部署示例命令
    links.js                所有外部链接
    nav.js                  导航链接
  components/
    AppIcon.vue             按名称渲染 SVG 图标
    AppNav.vue              顶部导航（含移动端菜单）
    HeroSection.vue         首屏
    ArchitectureSection.vue 架构示意
    AboutSection.vue        项目介绍
    DistributedSection.vue  分布式观测与节点示意图
    JoinSection.vue         接入步骤
    DeploySection.vue       部署方式（Docker / 二进制）
    CodeBlock.vue           代码块
    CopyButton.vue          复制按钮
    DetailsSection.vue      运行机制
    StatusSection.vue       状态入口
    FaqSection.vue          常见问题
    SiteFooter.vue          页脚
scripts/
  build.mjs                 构建：打包 + 预渲染 + 内联
  extract-icons.mjs         生成图标 → src/data/icons.js
  audit-svgs.mjs            校验图标映射、图标名引用与 path 语法
  compare-logo.mjs          校验 logo.svg 几何形状
  compare.mjs               服务端渲染后与原始页面比对
  interaction-check.mjs     在 jsdom 中驱动真实交互
  hydration-check.mjs       校验构建产物能干净地 hydrate
  ssr-entry.js              SSR 入口
  dom-entry.js              客户端挂载 / hydrate 入口
```

## Logo

`src/assets/logo.svg` 是全站唯一的 Logo 来源，导航栏、节点示意图中心与页脚
都渲染这一个文件（由 `scripts/extract-icons.mjs` 在生成 `src/data/icons.js`
时内联）。导航栏中的实例额外带 `aria-hidden`，因为外层链接已有 `aria-label`。

原页面三处 Logo 并不一致：导航栏用的是完整版本，示意图中心与页脚用的是删掉了
内部线框细节的简化版本。现在三处统一为 `logo.svg`。

## 状态入口

对外提供两个监测入口，都是新标签页打开：

| 入口 | 地址 | 出现位置 |
|---|---|---|
| 网络状态 | `https://status.tano.asia/status/net` | 首屏按钮、状态卡片、导航栏、页脚 |
| 丢包检测 | `http://grafana.tano.asia/public-dashboards/86d7f554f8704d99961fc05a4c481f44` | 首屏按钮、状态卡片、导航栏、页脚 |

丢包检测是 Grafana 公开面板「CQU NetProbe · 校园网丢包状态」，按校区与园区
（A 区、B 区、C 区、虎溪、兰园、荷园、梅园、松园、竹园、菊园、两江）分组展示。

首屏 `.hero-actions` 里是三个按钮：主操作「接入探测节点」用 `.button-primary`，
两个监测入口用 `.button-secondary`（两者是同级视图，样式保持一致）。该容器原本
就是 flex + wrap + gap，所以新增按钮不需要改样式；640px 以下会自动竖排铺满。

状态卡片里第一个按钮是白色实心（主操作），第二个用 `.button-ghost` 描边样式，
避免两个同权重按钮并排。除这条新增规则外，样式都集中在 `src/styles/main.css`
末尾的「Additions on top of the original stylesheet」段落，原始样式保持未改动。

## 部署到 Zeabur

本站是纯静态产物，构建完只有 3 个文件（`index.html` + 2 个 assets），把 `dist/`
传上去即可，不需要 Zeabur 侧再构建。

```bash
npm run build
cd dist
npx zeabur@latest auth login    # 首次需要
npx zeabur@latest deploy
```

`npm run deploy` 等价于上面这三条（跳过已登录的情况）。

三个要点，都影响成败：

- **必须在 `dist/` 里执行 `zeabur deploy`**。`dist/` 中没有 `package.json`，
  Zeabur 才会按静态站点处理（Caddy 托管，`index.html` 作为首页）；在项目根目录
  执行会被识别成 Node 项目，改为在云端构建。
- **不要在项目根目录执行**。CLI 打包时只读取当前目录下的 `.zeaburignore`（优先）
  或 `.gitignore`，且不向上层目录查找——所以 `cd dist` 后没有任何文件会被排除。
  在根目录执行的话，根目录 `.gitignore` 里的 `dist/` 会把要部署的东西整个排除掉。
- **构建产物用绝对路径** `/assets/...`，所以要挂在域名根路径下。

部署完在控制台 Network → Generate Domain 生成域名。之后更新只需 `npm run deploy`；
用 `--service-id` 可以跳过交互选择。

另一种做法是走 Git：把仓库推到 GitHub，在 Zeabur 里连接仓库，由它执行
`npm run build`。好处是 push 即部署，代价是每次都要云端构建，所以 `dist/`
在 `.gitignore` 里保持忽略即可。

## 与原页面的差异

除移植本身外，以下几处是刻意改动。`check:fidelity` 里都对它们做了处理，
且都在 `check:interactions` 里被断言存在——所以「剔除」不会掩盖问题：
删掉任何一处，交互检查都会报错。

| 改动 | 比对时的处理 |
|---|---|
| 三处 Logo 统一为 `logo.svg`（原页示意图中心与页脚用的是删掉内部线框的残缺版） | 两侧都归一化为 logo.svg；几何形状另由 `compare-logo.mjs` 校验 |
| 新增丢包检测入口（首屏、状态卡片、导航栏、页脚） | 比对前剔除，交互检查断言四个入口都在 |
| Docker 说明里新增两个占位符的含义 | 比对前剔除，交互检查断言说明存在 |
| Docker 镜像 tag 从 `:1` 固定到 `sha-438bd5530c76` | 两侧 tag 归一化为 `TAG`，交互检查断言实际 tag |

`sha-438bd5530c76` 是 `tano26/cqu-netprobe`（探针）的一次构建。注意别和
`tano26/cqu-netprobe-gateway` 搞混：后者是中心 Gateway（入口
`/usr/local/bin/gateway`，监听 8080/9090，用 `docker compose` 部署），
和这里「部署一个探测节点」是两回事。

## 校验

```bash
npm run check              # 以下四项一起运行
npm run check:assets       # 图标映射、图标名引用、path 语法、logo 几何形状
npm run check:fidelity     # 结构 / SVG / 文案 / <pre> 与原页面比对
npm run check:interactions # 部署切换、复制、移动端菜单、Logo、监测入口
npm run check:hydration    # 构建产物能否干净地 hydrate
```

- `check:assets`：原始页面每个 `<svg>` 必须对应唯一一个图标（Logo 除外），
  所有 `path` 的 `d` 必须语法合法，`logo.svg` 的几何形状与原始导航栏 Logo 一致，
  组件里引用的图标名必须都存在、且每个图标都被用到。
- `check:fidelity`：将 Vue 应用服务端渲染后与 `reference-original.html` 逐项对比
  元素序列、完整 SVG 标记（含 `d`）、文案与 `<pre>` 内容。
- `check:interactions`：在 jsdom 中挂载真实应用，验证部署标签切换、四个复制按钮
  （含剪贴板失败回退）、移动端导航开合、三处 Logo 都渲染完整版，以及四个丢包入口。
- `check:hydration`：读取真实的 `dist/index.html`，把 `#app` 里的预渲染标记交给
  客户端包 hydrate，验证标记未被改动、Vue 没有报 hydration 警告，且页面仍然可交互。

`check:fidelity` 会剔除新增的丢包入口再比对，`check:interactions` 则断言它们存在——
两边互相咬合，删掉任何一个都会报错。

图标或 Logo 更新后运行 `node scripts/extract-icons.mjs` 重新生成 `src/data/icons.js`。
