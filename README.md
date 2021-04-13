# VUE-
简单的双向绑定原理，通过Object.definePrototype来进行数据劫持，同时对vm进行属性代理，在模板编译的时候，对元素添加watcher，在数据劫持的get中添加watcher到Dep中，set中来通知watcher更新。
