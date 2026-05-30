# 五十音测试 PWA

纯静态多文件 PWA，内置 Edge TTS 预生成日语 MP3。首次加载完成后，可离线打开并发音。

## 本地预览

```powershell
cd D:\MYproject
python -m http.server 8765
```

打开：`http://127.0.0.1:8765/index.html`

> PWA/service worker 需要通过 HTTP/HTTPS 访问；不要直接双击 `index.html` 做离线能力测试。

## 重新生成音频

```powershell
cd D:\MYproject
node .\tools\build_audio_manifest.js
.\.venv\Scripts\python.exe .\tools\generate_audio.py
```

生成配置：`ja-JP-NanamiNeural`，`rate=-15%`。

## 进度同步

当前进度保存在浏览器本机 `localStorage`，不同设备之间不同步。
