import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
// import '../static/css/theme-green/index.css';       // 浅绿色主题
import '../static/css/icon.css';
import "babel-polyfill";
import judge from '../static/js/judge_number.js'
import cookie_ from './components/common/cookie'

Vue.use(ElementUI, { size: 'small' });
Vue.prototype.$axios = axios;
Vue.use(judge)
Vue.prototype.cookie = cookie_
//Vue.prototype.token_admin = localStorage.getItem('token_admin')
//Vue.prototype.token = localStorage.getItem('token')

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('ms_username');
    const isAdmin = localStorage.getItem('token_admin')
    if(!role && to.path !== '/login' && to.path !== "/register"){
        next('/login');
    }else if(to.meta.permission){
        if(isAdmin){
        	next()
        }else {
        	next('/403')
        }
//      role === 'admin' ? next() : next('/403');
    }else{
        // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
        if(navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor'){
            Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
                confirmButtonText: '确定'
            });
        }else{
            next();
        }
    }
})

var defaultHost = window.location.protocol + "//" + window.location.hostname
// var defaultHost = 'http://47.74.177.128'
// var defaultHost = 'https://warehouse.superspeedus.com'
axios.defaults.baseURL = defaultHost

// axios.interceptors.response.use((config) => {
// 	console.log(config)
// 	if (config.data.code != 200){
// 		ElementUI.Message.error(config.data.message)
// 	}
//     (err) => {
//         ElementUI.Message.error('服务器更新中')
//     }
// 	return config
// })

axios.interceptors.response.use(
    response => {
        if (response.data.code != 200) {
            ElementUI.Message.error(response.data.message)
        }
        if (response.data.code == 1005) {
            ElementUI.Message.info('服务器更新中,请稍等')
        }
        if (response.data.code == 1500) {
            Vue.prototype.$alert('登陆过期，请重新登陆！', '提示', {
                    confirmButtonText: '确定',
                    // cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    clearInterval(localStorage.getItem('myVal'))
                    localStorage.removeItem('token')
                    localStorage.removeItem('token_admin')
                    localStorage.removeItem('notifyid')
                    localStorage.removeItem('ms_username')
                    router.push('/login')
                }).catch((res) => {
                    clearInterval(localStorage.getItem('myVal'))
                    localStorage.removeItem('token')
                    localStorage.removeItem('token_admin')
                    localStorage.removeItem('notifyid')
                    localStorage.removeItem('ms_username')
                    router.push('/login')
                })
        }
        return response
    },
    error => {
        ElementUI.Message.error('服务器更新中')
    }
    )
new Vue({
    router,
    render: h => h(App)
}).$mount('#app');