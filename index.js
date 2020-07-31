const VueRouter = require('vue-router')
const Vue = require('vue')
const {renderToString} = require('@vue/server-renderer')

function compAsyncTimeout(comp, time) {

	return Vue.defineAsyncComponent(function() {
		return new Promise(function(resolve) {
		console.log('## load comp: '+comp.name);
		setTimeout(resolve, time, comp);
		});
	});

}

var MyComp = {
	foo: compAsyncTimeout({
		name: 'foo',
		template: '<div class="foo">foo component resolve async</div>'
	}, 3000),
	bar: compAsyncTimeout({
		name: 'bar',
		template: '<div class="bar">bar component resolve async</div>'
	}, 2000),
	page: compAsyncTimeout({
		name: 'page',
		template: '\
<div class="page">\
	<div>page component resolve async</div>\
	<p>static:</p>\
	<div><foo></foo></div>\
	<div><bar></bar></div>\
	<p>dynamic:</p>\
	<component is=\"foo\"></component>\
	<component is=\"bar\"></component>\
</div>'
	}, 1500)
};

var originalRC = Vue.resolveComponent;

Vue.resolveComponent = function(name) {
	return MyComp[name] || originalRC(name);
};

var originalRDC = Vue.resolveDynamicComponent;

Vue.resolveDynamicComponent = function(name) {
	return MyComp[name] || originalRDC(name);
};

var router = VueRouter.createRouter({
	history: VueRouter.createMemoryHistory(),
	routes: [
		{ path: '/', component: MyComp.page }
	]
});

var app = Vue.createSSRApp({
	template: "\
<div class=\"app-root\">\
	<router-view></router-view>\
</div>\
"
});
app.use(router);

router.push('/');

router.isReady().then(function() {

	renderToString(app).then(function(html) {
		console.error('/** vue app renderToString success **/');
		console.log(html);
	}).catch(function (err) {
		console.error('/** vue app renderToString error **/', err);
	});

}).catch(function(e) {
	console.error('/** router.isReady error **/', e);
});





