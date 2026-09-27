/**
 * Code samples shown in the deployment panes.
 * Kept in String.raw template literals so backslashes (shell line
 * continuations, Windows paths) survive verbatim.
 */

export const dockerCode = String.raw`docker run -d \
  --cap-add NET_RAW \
  --name cqu-netprobe \
  -e CQU_NETPROBE_GATEWAY_URL=GATEWAY_URL \
  -e CQU_NETPROBE_TOKEN=YOUR_GATEWAY_TOKEN \
  -e CQU_NETPROBE_LOG_LEVEL=info \
  --restart unless-stopped \
  tano26/cqu-netprobe:sha-438bd5530c76`

export const linuxCode = String.raw`mkdir cqu-netprobe
cd cqu-netprobe

tar -xzf ../cqu-netprobe_v1.0.0_linux_amd64.tar.gz

cp config.example.json config.json

nano config.json

./cqu-netprobe`

export const configCode = String.raw`{
  "gateway_url": "GATEWAY_URL",
  "token": "YOUR_GATEWAY_TOKEN",
  "log_level": "info"
}`

export const windowsCode = String.raw`Expand-Archive .\cqu-netprobe_v1.0.0_windows_amd64.zip .\cqu-netprobe

cd .\cqu-netprobe

Copy-Item .\config.example.json .\config.json

notepad .\config.json

.\cqu-netprobe.exe`
