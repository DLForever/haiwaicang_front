import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/table',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve),
                    meta: { title: '基础表格' }
                },
                {
                    path: '/tabs',
                    component: resolve => require(['../components/page/Tabs.vue'], resolve),
                    meta: { title: 'tab选项卡' }
                },
                {
                    path: '/add',
                    component: resolve => require(['../components/page/AddProduct.vue'], resolve),
                    meta: { title: '新建产品' }
                },
                {
                    path: '/productmanage',
                    component: resolve => require(['../components/page/ProductManage.vue'], resolve),
                    meta: { title: '产品管理' }
                },
                //创建入库
                {
                    path: '/inbound',
                    component: resolve => require(['../components/page/InBound.vue'], resolve),
                    meta: { title: '创建入库单' }
                },
                {
                    path: '/inboundmanage',
                    component: resolve => require(['../components/page/InBoundManage.vue'], resolve),
                    meta: { title: '入库单管理' }
                },
                {
                    path: '/goodsmanage',
                    component: resolve => require(['../components/page/GoodsManage.vue'], resolve),
                    meta: { title: '货物管理' }
                },
                {
                    path: '/ordermanage',
                    component: resolve => require(['../components/page/OrderManage.vue'], resolve),
                    meta: { title: '换标订单管理' }
                },
                {
                    path: '/ordersendmanage',
                    component: resolve => require(['../components/page/OrderSendManage.vue'], resolve),
                    meta: { title: '发货订单管理' }
                },
                {
                    path: '/fbamanage',
                    component: resolve => require(['../components/page/FBAManage.vue'], resolve),
                    meta: { title: 'FBA管理' }
                },
                {
                    path: '/WMSinmanage',
                    component: resolve => require(['../components/page/WMSInBoundManage.vue'], resolve),
                    meta: { title: 'WMS入库管理' }
                },
                {
                    path: '/WMSordermanage',
                    component: resolve => require(['../components/page/WMSOrderManage.vue'], resolve),
                    meta: { title: 'WMS换标订单管理' }
                },
                {
                    path: '/WMSordersendmanage',
                    component: resolve => require(['../components/page/WMSOrderSendManage.vue'], resolve),
                    meta: { title: 'WMS发货订单管理' }
                },
                {
                    path: '/WMSproductmanage',
                    component: resolve => require(['../components/page/WMSProductManage.vue'], resolve),
                    meta: { title: 'WMS货物管理' }
                },
                {
                    // 权限页面
                    path: '/permission',
                    component: resolve => require(['../components/page/Permission.vue'], resolve),
                    meta: { title: '权限测试', permission: true }
                },
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve),
        },
        {
            path: '/register',
            component: resolve => require(['../components/page/Register.vue'], resolve)
        },
        {
            path: '/404',
            component: resolve => require(['../components/page/404.vue'], resolve)
        },
        {
            path: '/403',
            component: resolve => require(['../components/page/403.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
