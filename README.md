# 个人网盘
服务器 golang 开发，支持使用本地盘或 ucloud 对象存储。    
可浏览视频、音频、图片。    
可以接入mysql，也可以不接入，推荐不接入，保持应用独立性及可移植性。

# 配置文件
## config
``` javascript
{
	"location": "./", // 本地盘
	"ucloud": "apikey,apisecret,bucket",
	"qiniu": "apikey,apisecret,bucket",
}
```

# 数据文件
不接入 mysql 的情况下，应用会在本地写入一个文件用来记录每个文件的位置、大小、类型、修改时间以及唯一id。不管本地盘或者对象存储，不需要使用目录做分层，数据文件会记录目录之间的层级关系。    
默认的数据文件在 ```~/.enetdiskfiledb```

# 未完成
1. [ ] web 界面
2. [ ] ucloud 接入
3. [ ] qiniu 接入
