const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'js', 'data.js');
const dataSource = fs.readFileSync(dataPath, 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${dataSource}\nglobalThis.__KANA_EXPORT__={HIRA,KATA,EX};`, context);
const { HIRA, KATA, EX } = context.__KANA_EXPORT__;

function safeName(romaji) {
  return romaji
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'audio';
}

const itemsByFile = new Map();
const audioMap = new Map();

function add(text, romaji) {
  if (!text || !romaji) return;
  const file = `audio/${safeName(romaji)}.mp3`;
  if (!itemsByFile.has(file)) itemsByFile.set(file, { text, romaji, file });
  audioMap.set(text, file);
}

for (const table of [HIRA, KATA]) {
  for (const group of ['sei', 'daku', 'you']) {
    for (const [kana, romaji] of table[group]) add(kana, romaji);
  }
}
for (const example of Object.values(EX)) {
  add(example[0], example[1]);
}

const audioObject = Object.fromEntries([...audioMap.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja')));
const items = [...itemsByFile.values()].sort((a, b) => a.file.localeCompare(b.file));
fs.writeFileSync(path.join(root, 'js', 'audio-map.js'), `const AUDIO=${JSON.stringify(audioObject, null, 2)};\n`, 'utf8');
fs.writeFileSync(path.join(root, 'tools', 'audio-items.json'), `${JSON.stringify(items, null, 2)}\n`, 'utf8');

const staticAssets = [
  './',
  './index.html',
  './kana.html',
  './css/style.css',
  './js/data.js',
  './js/audio-map.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  ...items.map(item => `./${item.file}`),
];
const sw = `const CACHE_NAME='kana-pwa-v5';\nconst ASSETS=${JSON.stringify(staticAssets, null, 2)};\n\nself.addEventListener('install',event=>{\n  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));\n});\n\nself.addEventListener('activate',event=>{\n  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))) .then(()=>self.clients.claim()));\n});\n\nself.addEventListener('fetch',event=>{\n  if(event.request.method!=='GET')return;\n  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{\n    const copy=response.clone();\n    caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));\n    return response;\n  }).catch(()=>caches.match('./index.html'))));\n});\n`;
fs.writeFileSync(path.join(root, 'sw.js'), sw, 'utf8');

console.log(`audio map entries: ${audioMap.size}`);
console.log(`audio files to generate: ${items.length}`);

