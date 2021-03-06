import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    // mode: 'history',
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
                    meta: { title: '未读消息' }
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
                    path: '/applyinbound',
                    component: resolve => require(['../components/page/ApplyInBound.vue'], resolve),
                    meta: { title: '入库申请' }
                },
                {
                    path: '/applyinboundmanage',
                    component: resolve => require(['../components/page/ApplyInBoundManage.vue'], resolve),
                    meta: { title: '申请管理' }
                },
                {
                    path: '/inbound',
                    component: resolve => require(['../components/page/InBound.vue'], resolve),
                    meta: { title: '创建入库单' }
                },
                {
                    path: '/inboundmanage',
                    component: resolve => require(['../components/page/InBoundManage.vue'], resolve),
                    meta: { title: '待完成' }
                },
                {
                    path: '/inbounded',
                    component: resolve => require(['../components/page/InBoundedManage.vue'], resolve),
                    meta: { title: '已完成' }
                },
                {
                    path: '/inboundmanagequick',
                    component: resolve => require(['../components/page/InBoundManageQuick.vue'], resolve),
                    meta: { title: '待完成(入库即出)' }
                },
                {
                    path: '/inboundedquick',
                    component: resolve => require(['../components/page/InBoundedManageQuick.vue'], resolve),
                    meta: { title: '已完成(入库即出)' }
                },
                {
                    path: '/inbounding',
                    component: resolve => require(['../components/page/InBoundingManage.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '入库单详情' }
                },
                {
                    path: '/inbounding1',
                    component: resolve => require(['../components/page/InBoundingManage1.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '未完成' }
                },
                {
                    path: '/inbounding2',
                    component: resolve => require(['../components/page/InBoundingManage2.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '已完成' }
                },
                {
                    path: '/inbounding3',
                    component: resolve => require(['../components/page/InBoundingManage3.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '未接收' }
                },
                {
                    path: '/inboundingquick1',
                    component: resolve => require(['../components/page/InBoundingManageQuick1.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '未完成(入库即出)' }
                },
                {
                    path: '/inboundingquick2',
                    component: resolve => require(['../components/page/InBoundingManageQuick2.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '已完成(入库即出)' }
                },
                {
                    path: '/inboundingquick3',
                    component: resolve => require(['../components/page/InBoundingManageQuick3.vue'], resolve),
                    name: 'inbounding',
                    meta: { title: '未接收(入库即出)' }
                },
                {
                    path: '/inboundsettlement',
                    component: resolve => require(['../components/page/InBoundsettleManage.vue'], resolve),
                    meta: { title: '已结算' }
                },
                {
                    path: '/goodsmanage',
                    component: resolve => require(['../components/page/GoodsManage.vue'], resolve),
                    meta: { title: '库存管理' }
                },
                {
                    path: '/defectgoodsmanage',
                    component: resolve => require(['../components/page/DefectGoodsManage.vue'], resolve),
                    meta: { title: '不良品管理' }
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
                    path: '/addoutbound',
                    component: resolve => require(['../components/page/addOutBound.vue'], resolve),
                    meta: { title: '创建出库单' }
                },
                {
                    path: '/addoutboundquick',
                    component: resolve => require(['../components/page/addOutBoundQuick.vue'], resolve),
                    meta: { title: '创建出库单(入库即出)' }
                },
                {
                    path: '/outboundmanage',
                    component: resolve => require(['../components/page/OutBoundManage.vue'], resolve),
                    meta: { title: '待审核' }
                },
                {
                    path: '/outboundingmanage',
                    component: resolve => require(['../components/page/OutBoundingManage.vue'], resolve),
                    meta: { title: '正在处理' }
                },
                {
                    path: '/outboundedmanage',
                    component: resolve => require(['../components/page/OutBoundedManage.vue'], resolve),
                    meta: { title: '已完成' }
                },
                {
                    path: '/outboundmanagequick',
                    component: resolve => require(['../components/page/OutBoundManageQuick.vue'], resolve),
                    meta: { title: '待审核(入库即出)' }
                },
                {
                    path: '/outboundingmanagequick',
                    component: resolve => require(['../components/page/OutBoundingManageQuick.vue'], resolve),
                    meta: { title: '正在处理(入库即出)' }
                },
                {
                    path: '/outboundedmanagequick',
                    component: resolve => require(['../components/page/OutBoundedManageQuick.vue'], resolve),
                    meta: { title: '已完成(入库即出)' }
                },
                {
                    path: '/batchoutboundmanage',
                    component: resolve => require(['../components/page/batchoutbound.vue'], resolve),
                    meta: { title: '批量出库' }
                },
                {
                    path: '/batchoutboundmanagequick',
                    component: resolve => require(['../components/page/batchoutboundquick.vue'], resolve),
                    meta: { title: '批量出库(入库即出)' }
                },
                {
                    path: '/fbamanage',
                    component: resolve => require(['../components/page/FBAManage.vue'], resolve),
                    meta: { title: 'FBA管理' }
                },
                {
                    path: '/Settlementmanage',
                    component: resolve => require(['../components/page/Settlementmanage.vue'], resolve),
                    meta: { title: '结算详情'}
                },
                {
                    path: '/RecordStatistics',
                    component: resolve => require(['../components/page/RecordStatistics.vue'], resolve),
                    meta: { title: '扫描记录详情' }
                },
                {
                    path: '/WMSaddware',
                    component: resolve => require(['../components/page/WMSAddWare.vue'], resolve),
                    meta: { title: 'WMS新建库位', permission: true  }
                },
                {
                    path: '/WMSusermanage',
                    component: resolve => require(['../components/page/WMSUserManage.vue'], resolve),
                    meta: { title: 'WMS用户管理', permission: true  }
                },
                 {
                    path: '/WMSproductmanage',
                    component: resolve => require(['../components/page/WMSProductManage.vue'], resolve),
                    meta: { title: 'WMS产品管理', permission: true  }
                },
                {
                    path: '/WMSwaremanage',
                    component: resolve => require(['../components/page/WMSWareManage.vue'], resolve),
                    meta: { title: 'WMS库位管理', permission: true  }
                },
                {
                    path: '/WMSapplyinmanage',
                    component: resolve => require(['../components/page/WMSApplyInBoundManage.vue'], resolve),
                    meta: { title: 'WMS入库申请管理', permission: true  }
                },
                {
                    path: '/WMSinmanage',
                    component: resolve => require(['../components/page/WMSInBoundManage.vue'], resolve),
                    meta: { title: '未完成(批次)', permission: true  }
                },
                {
                    path: '/WMSinmanagequick',
                    component: resolve => require(['../components/page/WMSInBoundManageQuick.vue'], resolve),
                    meta: { title: '未完成(入库即出批次)', permission: true  }
                },
                {
                    path: '/WMSinedmanage',
                    component: resolve => require(['../components/page/WMSInBoundedManage.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '入库单详情', permission: true  }
                },
                {
                    path: '/WMSinedmanage1',
                    component: resolve => require(['../components/page/WMSInBoundedManage1.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '未完成', permission: true  }
                },
                {
                    path: '/WMSinedmanage2',
                    component: resolve => require(['../components/page/WMSInBoundedManage2.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '已完成', permission: true  }
                },
                {
                    path: '/WMSinedmanage3',
                    component: resolve => require(['../components/page/WMSInBoundedManage3.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '未接收', permission: true  }
                },
                {
                    path: '/WMSinedmanagequick1',
                    component: resolve => require(['../components/page/WMSInBoundedManageQuick1.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '未完成(入库即出)', permission: true  }
                },
                {
                    path: '/WMSinedmanagequick2',
                    component: resolve => require(['../components/page/WMSInBoundedManageQuick2.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '已完成(入库即出)', permission: true  }
                },
                {
                    path: '/WMSinedmanagequick3',
                    component: resolve => require(['../components/page/WMSInBoundedManageQuick3.vue'], resolve),
                    name: 'WMSinedmanage',
                    meta: { title: '未接收(入库即出)', permission: true  }
                },
                {
                    path: '/WMSinsettlement',
                    component: resolve => require(['../components/page/WMSInBoundSettlementManage.vue'], resolve),
                    meta: { title: '已完成(批次)', permission: true  }
                },
                {
                    path: '/WMSinsettlementquick',
                    component: resolve => require(['../components/page/WMSInBoundSettlementManageQuick.vue'], resolve),
                    meta: { title: '已完成(入库即出批次)', permission: true  }
                },
                {
                    path: '/WMSbatchinmanage',
                    component: resolve => require(['../components/page/WMSBatchInBoundManage.vue'], resolve),
                    meta: { title: 'WMS批量入库管理', permission: true  }
                },
                {
                    path: '/WMSoutboundmanage',
                    component: resolve => require(['../components/page/WMSOutBoundManage.vue'], resolve),
                    meta: { title: 'WMS出库单管理(美国)', permission: true  }
                },
                {
                    path: '/WMSoutboundmanageChina',
                    component: resolve => require(['../components/page/WMSOutBoundManageChina.vue'], resolve),
                    meta: { title: 'WMS出库单管理(国内)', permission: true  }
                },
                {
                    path: '/WMSsendmanage',
                    component: resolve => require(['../components/page/WMSsendManage.vue'], resolve),
                    meta: { title: 'WMS发货管理', permission: true  }
                },
                {
                    path: '/WMSoutboundmanagequick',
                    component: resolve => require(['../components/page/WMSOutBoundManageQuick.vue'], resolve),
                    meta: { title: 'WMS出库单管理(美国)', permission: true  }
                },
                {
                    path: '/WMSoutboundmanageChinaquick',
                    component: resolve => require(['../components/page/WMSOutBoundManageChinaQuick.vue'], resolve),
                    meta: { title: 'WMS出库单管理(国内)', permission: true  }
                },
                {
                    path: '/WMSsendmanagequick',
                    component: resolve => require(['../components/page/WMSsendManageQuick.vue'], resolve),
                    meta: { title: 'WMS发货管理', permission: true  }
                },
//              {
//                  path: '/WMSordermanage',
//                  component: resolve => require(['../components/page/WMSOrderManage.vue'], resolve),
//                  meta: { title: 'WMS换标订单管理', permission: true  }
//              },
//              {
//                  path: '/WMSordersendmanage',
//                  component: resolve => require(['../components/page/WMSOrderSendManage.vue'], resolve),
//                  meta: { title: 'WMS发货订单管理', permission: true  }
//              },
                {
                    path: '/WMSgoodsmanage',
                    component: resolve => require(['../components/page/WMSGoodsManage.vue'], resolve),
                    meta: { title: 'WMS货物管理', permission: true }
                },
                {
                    path: '/WMSbadgoodsmanage',
                    component: resolve => require(['../components/page/WMSBadGoodsManage.vue'], resolve),
                    meta: { title: 'WMS不良品管理', permission: true }
                },
                {
                    path: '/WMSpdgoodsmanage',
                    component: resolve => require(['../components/page/WMSGoodsPDManage.vue'], resolve),
                    meta: { title: 'WMS盘点管理', permission: true }
                },
                {
                    path: '/WMSImportStock',
                    component: resolve => require(['../components/page/WMSImportStock.vue'], resolve),
                    meta: { title: 'WMS导入库存', permission: true }
                },
                {
                    path: '/WMSImportStockDetail',
                    component: resolve => require(['../components/page/WMSImportStockDetail.vue'], resolve),
                    meta: { title: 'WMS导入详情', permission: true }
                },
                {
                    path: '/WMSInBoundStatistics',
                    component: resolve => require(['../components/page/WMSInBoundStatistics.vue'], resolve),
                    meta: { title: 'WMS入库统计详情', permission: true }
                },
                {
                    path: '/WMSOutBoundStatistics',
                    component: resolve => require(['../components/page/WMSOutBoundStatistics.vue'], resolve),
                    meta: { title: 'WMS出库统计详情', permission: true }
                },
                {
                    path: '/WMSRecordStatistics',
                    component: resolve => require(['../components/page/WMSRecordStatistics.vue'], resolve),
                    meta: { title: 'WMS扫描记录详情', permission: true }
                },
                {
                    path: '/WMSsettlementmanage',
                    component: resolve => require(['../components/page/WMSsettlementmanage.vue'], resolve),
                    meta: { title: 'WMS结算详情', permission: true }
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
            path: '/loginadmin',
            component: resolve => require(['../components/page/AdminLogin.vue'], resolve),
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

