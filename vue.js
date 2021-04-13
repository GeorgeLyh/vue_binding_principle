//html编译
function compile(el, vm) {
	const RegExp = /\{\{s*(\S+)\}\}/;

	const fragment = document.createDocumentFragment();
	vm.$el = document.querySelector(el);
	const data = vm.$data;
	let child;
	while (child = vm.$el.firstChild) {
		replaceDom(child);
		fragment.appendChild(child);
	}
	vm.$el.appendChild(fragment);
	
	function replaceDom(node) {
		const nodeName = node.nodeName;
		//元素
		if (node.nodeType === 1 && nodeName) {
			const attr = node.attributes;
			if(nodeName.toUpperCase() === "INPUT") {
				const keys = attr[1].value.split(".");
				node.value = keys.reduce((newObj, k) => newObj[k], vm);
				
				node.addEventListener("input", e => {
					const endObj = keys.slice(0, -1).reduce((newObj, k) => newObj[k], vm);
					const k = keys[keys.length - 1];
					endObj[k] = e.target.value;
				})
				
				new Watcher(vm, keys, newValue => {
					node.value = newValue;
				})
			} else {
				const expResult = RegExp.exec(node.textContent);
				const keys = expResult[1].split(".");
				const value = keys.reduce((newObj, k) => newObj[k], vm);
				node.textContent = value;
				new Watcher(vm, keys, newValue => {
					node.textContent = newValue;
				})
			}
		}
		
	}

}

//数据劫持
function observer(data){
	if(!data || typeof data !== "object") return;
	let dep = new Dep();
	Object.keys(data).forEach(key => {
		let value = data[key];
		observer(value);
		Object.defineProperty(data, key, {
			enumerable: true,
			configable: true,
			get(){
				if(Dep.target) dep.addSub(Dep.target);
				return value;
			},
			set(newValue){
				if(value === newValue) return;
				value = newValue;
				observer(newValue);
				dep.notify();
			}
		})
		
	})
}

class Dep{
	constructor(){
		this.subs = [];
	}
	
	addSub(watcher){
		this.subs.push(watcher);
	}
	
	notify(){
		this.subs.forEach(watcher => {
			watcher.update();
		})
	}
}

class Watcher{
	constructor(vm, keys, cb){
		Dep.target = this;
		this.cb = cb;
		this.vm = vm;
		this.keys = keys;
		keys.reduce((newObj, k) => newObj[k], vm);//此行代码只为了触发 get方法；
		Dep.target = null;
	}
	
	update(){
		const newValue = this.keys.reduce((newObj, k) => newObj[k], vm);
		this.cb(newValue);
	}
}

class Vue {
	constructor(options) {
		const el = options.el;
		this.$data = options.data();
		observer(this.$data);
		//代理属性
		Object.keys(this.$data).forEach(key => {
			Object.defineProperty(this, key, {
				enumerable: true,
				configable: true,
				get(){
					return this.$data[key];
				},
				set(newValue){
					return this.$data[key] = newValue;
				}
			})
		})
		
		compile(el, this);
	}
}
