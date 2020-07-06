

## Install

```bash
# Using npm
npm i fastify-start -S

# Using yarn
yarn add fastify-start
```

## Quickstart
```js
const f= require('fastify-start');

f({
  config:{
  global: {

  },
  redis: {
    // 用户中心系统专用
    oauth: {
      port: 6381, // Redis port
      host: "xxxx", // Redis host
      password: "xxxxx",
      db: 0,
    },
  },
  mysqlDB: {
    oauth: {
      user: "xxx", // 用户名
      pass: "xxxxx", // 口令
      dbName: "db",
      name: "default",
      option: {
        host: "xxxx",
        port: 3306,
        dialect: "mysql",
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          createdAt: "created_at",
          // 将updatedAt对应到数据库的updated_at字段
          updatedAt: "updated_at",
          freezeTableName: true,
        },
      },
    }
  },
  mongoDB: {
    app: {
      url: "mongodb://xxxx",
      options: {
        user: "xxx", // 用户名
        pass: "xxxxx", // 口令
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoReconnect: false,
        //创建索引本来就是一次性的工作，在mongo shell里面手动创建是最好的选择，为什么要说“难道”呢？
        // 这不仅是会执行多少次的问题，还有什么时间执行，以及是否影响到生产环境的问题。要理解索引过程对于数据库是一个很大的消耗，前台索引会锁住整个集合上的所有CRUD操作，后台索引虽然没有直接上锁，但仍然需要消耗大量CPU和IO来读取文档和修改索引。无论哪种都有可能消耗大量的时间和资源（比如在一个比较大的集合上新建一个索引）。mongoose不建议在生产环境使用的原因也在这里。
        // 生产环境要求的是稳定，方便只是其次。在影响到“稳定”的时候让步的必然是“方便”
        autoIndex: false, // 不创建索引
        reconnectTries: Number.MAX_VALUE, // 总是尝试重新连接
        reconnectInterval: 500, // 每500ms重新连接一次
        poolSize: 10, // 维护最多10个socket连接
        // 如果没有连接立即返回错误，而不是等待重新连接
        bufferMaxEntries: 0,
        connectTimeoutMS: 10000, // 10s后放弃重新连接
        socketTimeoutMS: 45000, // 在45s不活跃后关闭sockets
        family: 4,
      },
    },

  },
},
  routers:require('./app/routers')
})

```