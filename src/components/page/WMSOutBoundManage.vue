<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 库位管理</el-breadcrumb-item>
				<el-breadcrumb-item>库位管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

		<div class="container">
			<div class="handle-box">
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @change="getUserDatasFirst" @visible-change="selectVisble" :remote-method="remoteMethod">
					<el-option v-for="item in options" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
			</div>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="is_mix" label="是否混装" width="150"></el-table-column>
				<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item>
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp详&nbsp情&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="sendProduct(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp发&nbsp货&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>
		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%">
			<div class="creat">
				<el-button type="primary" @click="pick">生成拣货单</el-button>
				<el-button type="default" @click="print">打印</el-button>
				<!--<el-button type="default" @click="print2">打印</el-button>-->
			</div>
			<div id="printJS-form">
				<!--<h1 class="ismix">{{is_mix}}</h1>-->
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="200" height="100"></barcode>
				<el-table :data="outBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<!--<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间"></el-table-column>
					<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间"></el-table-column>-->
				</el-table>
			</div>
		</el-dialog>
		
		<!-- 发货弹出框 -->
		<el-dialog title="发货" :visible.sync="sendProductVisible" width="30%">
			<el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="物流单号">
					<el-input v-model.trim="form.logistics_number"></el-input>
				</el-form-item>
				<el-form-item label="物流方式">
					<el-radio v-model="l_type" label="1">FBA</el-radio>
					<el-radio v-model="l_type" label="2">自提</el-radio>
					<el-radio v-model="l_type" label="3">其他</el-radio>
					<!--<el-input v-model="form.l_type"></el-input>-->
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="sendProductVisible = false">取 消</el-button>
                <el-button type="primary" @click="sendEnd">确 定</el-button>
            </span>
		</el-dialog>
		
		<!-- 图片弹出框 -->
		<el-dialog title="附件详情" :visible.sync="showImg" width="30%">
			<el-carousel :interval="4000" type="card" height="200px" v-if="img_show">
				<el-carousel-item v-for="item in form.pictures">
					<img :src="$axios.defaults.baseURL+item.url.url" />
				</el-carousel-item>
			</el-carousel>
			<div v-if="pdf_show" v-for="item in form.pictures">
				<a target="_blank" :href="$axios.defaults.baseURL+item.url.url">{{'查看' + item.id + '.pdf'}}</a>
			</div>
			<span slot="footer" class="dialog-footer">
                <!--<el-button @click="showImg = false">取 消</el-button>-->
                <el-button type="primary" @click="showImg = false">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 删除提示框 -->
		<el-dialog title="提示" :visible.sync="delVisible" width="30%" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="danger" @click="deleteRow">删 除</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	import VueBarcode from '@xkeshi/vue-barcode'
	import Print from 'print-js'
	import global_ from '../common/cookie'
	let Base64 = require('js-base64').Base64
	export default {
		//		name: 'WareManage',
		data: function() {
			return {
				cur_page: 1,
				user_page: 1,
				img_show: 1,
				l_type: '1',
				pdf_show: 0,
				pagesize: 20,
				tableData: [],
				select_cate: '',
				outBoundTable: [],
				options: [{
					id: -1,
					name: "所有用户"
				}, ],
				options2: [{
					id: -1,
					name: "所有用户"
				}, ],
				is_mix: '',
				pick_id: undefined,
				barcode: undefined,
				status: undefined,
				totals: 0,
				detailVisible: false,
				loading: false,
				paginationShow: true,
				delVisible: false,
				showImg: false,
				sendProductVisible: false,
				user_total: 0,
				form: {

				}
			}
		},
		created() {
			this.getData();
		},
		watch: {
			"$route": "getData"
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					return d
				})
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					5: 'primary',
					1: 'warning',
					8: 'danger',
					2: 'success',
					7: 'info'
				}
				return statusMap[status]
			},
		},
		methods: {
			print() {
				if(this.status == 1) {
					this.$message.error("请先生成拣货单")
					return false
				}
				Print({
					printable: 'printJS-form',
					type: 'html',
					targetStyle: ['text-align']
				})
			},
			print2() {
				let sub = document.getElementById('printJS-form')
				let newHtml = sub.innerHTML
				let oldHtml = document.body.innerHTML
				document.body.innerHTML = newHtml
				window.print()
				//				window.location.reload()
				document.body.innerHTML = oldHtml
			},
			handleCurrentChange(val) {
				this.cur_page = val;
				if(!this.select_cate || this.select_cate == -1) {
					this.getData();
				} else {
					this.getUserDatas()
				}
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			getData() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
						})
						this.tableData = res.data.data
						this.totals = res.data.count
					} else {
						console.log(res.data.message)
					}
					this.paginationShow = true
				})
			},
			getUser(callback = undefined) {
				this.$axios.get('/admin/users?page=' + this.user_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.options = this.options.concat(res.data.data)
						this.user_total = res.data.count
						if(callback) {
							callback()
						}
					}
				})
			},
			selectVisble(visible) {
				if(visible) {
					this.query = undefined
					this.remoteMethod("")
				}
			},
			remoteMethod(query, callback = undefined) {
				if(query != "" || this.query != "" || callback) {
					let reload = false
					if(this.query != query) {
						this.loading = true
						this.user_page = 1
						this.query = query
						reload = true
						if(this.$refs.infiniteLoading.isComplete) {
							this.$refs.infiniteLoading.stateChanger.reset()
						}
					}
					this.$axios.get("/admin/users/search_user?query=" + query.trim() + "&page=" + this.user_page, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.loading = false
							//							this.options = res.data.data
							if(reload) {
								this.options = this.options2.concat(res.data.data)
							} else {
								this.options = this.options.concat(res.data.data)
							}
							this.user_total = res.data.count
							if(callback) {
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
				}
			},
			onInfinite(obj) {
				if((this.user_page * 20) < this.user_total) {
					this.user_page += 1
					this.remoteMethod(this.query, obj.loaded)
					//					this.getUser(obj.loaded)
				} else {
					obj.complete()
				}
			},
			getUserDatasFirst() {
				if(this.select_cate == -1) {
					this.paginationShow = false
					this.cur_page = 1
					this.getData()
					return
				}
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.tableData = res.data.data
					this.totals = res.data.count
					this.paginationShow = true
				})
			},
			getUserDatas() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.tableData = res.data.data
					this.totals = res.data.count
				})
			},
			pick() {
				this.$axios.get('/admin/outbound_orders/' + this.pick_id + '/print_pick', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('拣货成功')
						this.status = 2
						this.getData()
					} else {
						this.$message.error("失败,请联系管理员")
					}
				})
			},
			//箱标弹出框
			showImgs(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					pictures: item.pictures
				}
				if(item.pictures.length == 0) {
					this.$message.error('抱歉，该用户暂未提供附件')
					return false
				}
				if(item.pictures[0].url.url.endsWith('.pdf')) {
					this.img_show = 0
					this.pdf_show = 1
				} else {
					this.img_show = 1
					this.pdf_show = 0
				}
				this.showImg = true;
			},
			sendProduct(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					logistics_number: item.logistics_number,
					l_type: this.l_type
				}
				this.sendProductVisible = true;
			},
			//发货
			sendEnd() {
				if(this.form.logistics_number == null || this.form.logistics_number == '') {
					this.$message.error('请输入完整信息')
					return false
				}
				let params = {
					id: this.form.id,
					logistics_number: this.form.logistics_number,
					l_type: this.l_type
				}
				this.$axios.post('/admin/store_outs/' + this.form.id + '/done', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("下发成功!")
						this.getData()
						this.sendProductVisible = false;
					}
				}).catch((res) => {
					this.$message.error(res)
				})
			},
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
			},
			// 确定删除
			deleteRow() {
				let index = this.idx
				const item = this.tableData[index];
				this.$axios.delete('/admin/outbound_orders/' + item.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData.splice(this.idx, 1)
						//						this.getData()
						this.$message.success("删除成功")
					}
				}).catch((res) => {
					this.$message.error("删除失败")
				})
				this.delVisible = false;
			},
			detailsShow(index, row) {
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						if(row.is_mix) {
							this.is_mix = '可混装'
						} else {
							this.is_mix = '不混装'
						}
						this.outBoundTable = res.data.data.label_changes
						this.pick_id = row.id
						this.barcode = '88888888_888888' + row.id
						this.status = row.status
						//						this.barcode = Base64.encode('123456789_1')
						console.log(this.barcode)
						this.detailVisible = true
					} else {
						this.$message.error("失败,请联系管理员")
					}
				})
			},
			getStatusName(status) {
				if(status == 1) {
					return "待拣货"
				} else if(status == 2) {
					return "已拣货"
				} else if(status == 8) {
					return "用户请求删除"
				} else if(status == 6) {
					return '待定'
				} else {
					return '其他'
				}
			},
		},
		components: {
			"infinite-loading": VueInfiniteLoading,
			"barcode": VueBarcode
		}
	}
</script>

<style scoped>
	.handle-box {
		margin-bottom: 20px;
	}
	
	.handle-select {
		width: 120px;
	}
	
	.creat {
		margin-bottom: 20px;
		float: right;
	}
</style>