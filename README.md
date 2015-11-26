# fis3-hook-loadurl
fis3 hook 插件

解析require.loadUrl(...)语法

把解析到的模块放置在file.extras.loadUrls数组里面

然后通过其他插件对这些模块进行处理

## 使用

### 安装
```
npm i fis3-hook-loadurl -g
```

### 配置
在 `fis-conf.js` 中：
```js
fis.hook('loadurl');
```
