<template>
	<div class="sidebar">
		<el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157" text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
			<template v-for="item in items">
				<template v-if="item.subs">
					<el-submenu :index="item.index" :key="item.index">
						<template slot="title">
							<i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
						</template>
						<el-menu-item v-for="(subItem,i) in item.subs" :key="i" :index="subItem.index">
							{{ subItem.title }}
						</el-menu-item>
					</el-submenu>
				</template>
				<template v-else>
					<el-menu-item :index="item.index" :key="item.index">
						<i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</div>
</template>

<script>
	import bus from '../common/bus';
	export default {
		data() {
			return {
				collapse: false,
				items: [{
						icon: 'el-icon-setting',
						index: 'dashboard',
						title: '首页'
					},
					{
						icon: 'el-icon-date',
						index: '3',
						title: '产品管理',
						subs: [{
								index: 'add',
								title: '新建产品'
							},
							{
								index: 'productmanage',
								title: '产品管理'
							},
						]
					},
					{
						icon: 'el-icon-message',
						index: '2',
						title: '入库管理',
						subs: [{
								index: 'applyinbound',
								title: '创建入库申请'
							},
							{
								index: 'applyinboundmanage',
								title: '入库申请管理'
							},
							{
								index: 'inbound',
								title: '创建入库单'
							},
							{
								index: 'inboundmanage',
								title: '入库单管理'
							},
						]
					},
					{
						icon: 'el-icon-news',
						index: '4',
						title: '库存管理',
						subs: [{
							index: 'goodsmanage',
							title: '库存管理'
						}, ]
					},
					{
						icon: 'el-icon-news',
						index: 'ordermanage',
						title: '订单管理',
						subs: [
//						{
//								index: 'ordermanage',
//								title: '换标订单管理'
//							},
//							{
//								index: 'ordersendmanage',
//								title: '发货订单管理'
//							},
							{
								index: 'outboundmanage',
								title: '出库单管理'
							},
							{
								index: 'batchoutboundmanage',
								title: '批量出库'
							},
						]
					},
					//                  {
					//                      icon: 'el-icon-printer',
					//                      index: '5',
					//                      title: 'FBA管理',
					//                      subs: [
					//                          {
					//                              index: 'fbamanage',
					//                              title: 'FBA管理'
					//                          },
					//                      ]
					//                  },
					//                  {
					//                      icon: 'el-icon-printer',
					//                      index: '6',
					//                      title: 'WMS入库管理',
					//                      subs: [
					//                          {
					//                              index: 'WMSinmanage',
					//                              title: 'WMS入库管理'
					//                          },
					//                      ]
					//                  },
					//                  {
					//                      icon: 'el-icon-printer',
					//                      index: '7',
					//                      title: 'WMS订单管理',
					//                      subs: [
					//                          {
					//                              index: 'WMSordermanage',
					//                              title: 'WMS换标订单'
					//                          },
					//                          {
					//                              index: 'WMSordersendmanage',
					//                              title: 'WMS发货订单'
					//                          },
					//                      ]
					//                  },
					//                  {
					//                      icon: 'el-icon-printer',
					//                      index: '9',
					//                      title: 'WMS货物管理',
					//                      subs: [
					//                          {
					//                              index: 'WMSproductmanage',
					//                              title: 'WMS货物管理'
					//                          },
					//                      ]
					//                  },
					//                  {
					//                      icon: 'el-icon-tickets',
					//                      index: 'table',
					//                      title: '基础表格'
					//                  },
					//                  {
					//                      icon: 'el-icon-message',
					//                      index: 'tabs',
					//                      title: 'tab选项卡'
					//                  },
					//                  {
					//                      icon: 'el-icon-warning',
					//                      index: 'permission',
					//                      title: '权限测试'
					//                  },
					//                  {
					//                      icon: 'el-icon-error',
					//                      index: '404',
					//                      title: '404页面'
					//                  }
				],
				items2: [{
						icon: 'el-icon-setting',
						index: 'dashboard',
						title: '首页'
					},
					{
						icon: 'el-icon-printer',
						index: '10',
						title: 'WMS用户管理',
						subs: [{
							index: 'WMSusermanage',
							title: 'WMS用户管理'
						}]
					},
					{
						icon: 'el-icon-printer',
						index: '11',
						title: 'WMS产品管理',
						subs: [{
							index: 'WMSproductmanage',
							title: 'WMS产品管理'
						}]
					},
					{
						icon: 'el-icon-printer',
						index: '8',
						title: 'WMS库位管理',
						subs: [{
							index: 'WMSwaremanage',
							title: 'WMS库位管理'
						}]
					},
					{
						icon: 'el-icon-printer',
						index: '6',
						title: 'WMS入库管理',
						subs: [{
								index: 'WMSapplyinmanage',
								title: 'WMS入库申请'
							},
							{
								index: 'WMSinmanage',
								title: 'WMS入库管理'
							},
							//						{
							//							index: 'WMSbatchinmanage',
							//							title: 'WMS批量入库'
							//						}
						]
					},
					{
						icon: 'el-icon-printer',
						index: '7',
						title: 'WMS订单管理',
						subs: [{
								index: 'WMSoutboundmanage',
								title: 'WMS出库单管理(美国)'
							},
							{
								index: 'WMSoutboundmanageChina',
								title: 'WMS出库单管理(国内)'
							},
							{
								index: 'WMSsendmanage',
								title: 'WMS发货管理'
							},
						]
					},
					{
						icon: 'el-icon-printer',
						index: '9',
						title: 'WMS货物管理',
						subs: [{
							index: 'WMSgoodsmanage',
							title: 'WMS货物管理'
						},
						{
							index: 'WMSImportStock',
							title: '导入库存'
						},
						{
							index: 'WMSImportStockDetail',
							title: '导入记录'
						},
						]
					},
				]
			}
		},
		computed: {
			onRoutes() {
				const role = localStorage.getItem('token_admin');
				if(role) {
					this.items = this.items2
				}
				return this.$route.path.replace('/', '');
			}
		},
		created() {
			// 通过 Event Bus 进行组件间通信，来折叠侧边栏
			bus.$on('collapse', msg => {
				this.collapse = msg;
			})
		}
	}
</script>

<style scoped>
	.sidebar {
		display: block;
		position: absolute;
		left: 0;
		top: 70px;
		bottom: 0;
		overflow-y: scroll;
	}
	
	.sidebar::-webkit-scrollbar {
		width: 0;
	}
	
	.sidebar-el-menu:not(.el-menu--collapse) {
		width: 250px;
	}
	
	.sidebar>ul {
		height: 100%;
	}
</style>