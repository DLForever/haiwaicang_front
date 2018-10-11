<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS入库管理</el-breadcrumb-item>
				<el-breadcrumb-item>入库管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" :loading="loading" class="handle-select mr10" @visible-change="test" @change="getUserDatasFirst" :remote-method="remoteMethod">
					<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
				
				<el-select v-model="select_batch" filterable remote placeholder="选择批次" :loading="loading2" class="handle-select mr10 batch_box" @visible-change="batchVisible" @change="getBatchsDatas" :remote-method="remoteMethodBatch">
					<el-option v-for="item in batchoptions" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite_batch" ref="infiniteLoading2"></infinite-loading>
				</el-select>
				<!--<el-button type="primary" icon="search" @click="allUser">所有用户</el-button>-->
			</div>
			
			<!--<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">-->
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="入库单号" width="200">
				</el-table-column>
				<el-table-column prop="batch_number" label="申请批次" width="100">
				</el-table-column>
				<el-table-column prop="total_plan_sum" label="计划总数量" width="150">
				</el-table-column>
				<el-table-column prop="total_arrive_sum" label="已收到数量" width="120">
				</el-table-column>				
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间" width="150">
				</el-table-column>
				<el-table-column prop="status" label="状态">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
						<!--<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item>
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleEdit(scope.$index, scope.row)" type="text">入库</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
								</el-dropdown-item>
								<!--<el-dropdown-item><el-button @click="editVisible = true" type="text">详情</el-button></el-dropdown-item>-->
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :current-page.sync='cur_page' :page-size="20" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 入库弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<el-table :data="form.product_store_ins" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="plan_sum" label="预计入库"></el-table-column>
				<!--<el-table-column label="库位选择">
					<template slot-scope="scope">
						<el-select v-model="scope.row.warehouse" placeholder="选择库位" class="handle-select mr10" multiple>
							<el-option v-for="item in wareoptions" :label="item.name" :value="item.id"></el-option>
							<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteWareHouseLoading"></infinite-loading>
						</el-select>
					</template>
				</el-table-column>-->
				<el-table-column label="实际到货数量" width="133">
					<template scope="scope">
						<el-input class="input-new-tag" v-model="scope.row.arrive_sum" ref="saveTagInput" size="small">
						</el-input>
					</template>
				</el-table-column>
			</el-table>
			<!--<span class="el-upload__tip">温馨提示：如果一个产品入多个库，到货数量请用‘/’分开，格式为 66/88，确保库位和数据一一对应</span>-->
			<br><br>
			<el-form ref="form" :model="form" label-width="40px">
				<!--<el-form-item label="选择库位">
					<el-input v-model="form.ware"></el-input>
				</el-form-item>
				<el-form-item label="推荐库位">
					<el-input v-model="form.ware"></el-input>
				</el-form-item>-->
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
			<el-table :data="ware_details" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="fnsku" label="产品名称" width="150"></el-table-column>
				<el-table-column prop="plan_sum" label="计划入库数量" width="150"></el-table-column>
				<el-table-column prop="arrive_sum" label="实际入库数量" show-overflow-tooltip></el-table-column>
			</el-table>
			<br />
		</el-dialog>

		<!-- 删除提示框 -->
		<el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	export default {
		//		name: 'wmsinmanage',
		data() {
			return {
				url: './static/vuetable.json',
				paginationShow: true,
				batchDisabled: true,
				tableData: [],
				options: [{id: -1, name: "所有用户"},],
				options2: [{id: -1, name: "所有用户"},],
				batchoptions: [],
				batch_total: 0,
				wareoptions: [],
				ware_details: [],
				cur_page: 1,
				user_page: 1,
				ware_page: 1,
				batch_page: 1,
				ware_total: 0,
				pagesize: 20,
				multipleSelection: [],
				select_cate: '',
				select_batch: '',
				select_word: '',
				del_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				detailVisible: false,
				query: undefined,
				query2: undefined,
				loading: false,
				loading2: false,
				totals: 0,
				user_total: 0,
				product_store_ins_change: [],
				form: {
					order: 'rr',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					remarks: '',
					name: '',
					date: '',
					address: '',
					arrive_sum: '',
					ware_houses: [],
					id: '',
					product_store_ins: []
				},
				idx: -1,
				inputVisible: true,
				inputValue: '',
			}
		},
		created() {
			this.getData();
			this.getUser();
			this.getWarehouse();
		},
		watch: {
			"$route": "getData",
			select_cate(newVal, oldVal) {
				this.cur_page = 1
			}
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					return d
				})
			},
			batchDisableds(){
				if(this.select_cate != "") {
				return this.batchDisabled = false
			}else {
				return this.batchDisabled = true
			}
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
//					2: 'info',
					1: 'warning',
					4: 'success',
					5: 'danger'
				}
				return statusMap[status]
			},
		},
		methods: {
			// 分页导航
			handleCurrentChange(val) {
				this.cur_page = val;
				if(!this.select_cate) {
					this.getData();
				} else {
					this.getUserDatas()
				}				
			},
			// 获取 easy-mock 的模拟数据
			getData() {
				// 开发环境使用 easy-mock 数据，正式环境使用 json 文件
				if(process.env.NODE_ENV === 'development') {
					//					this.url = '/ms/table/list';
				};				
				this.$axios.get('/admin/store_ins?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					//					page: this.cur_page
				}).then((res) => {
					//					res.data.data.forEach((data) => {
					//						data.product_store_ins.forEach((data2) => {
					//							data2.warehouse = []
					//						})
					//					})
					this.tableData = res.data.data;
					//					let test = res.data.data[1].product_store_ins
					//					this.totals = this.tableData.length
					this.totals = res.data.count
					this.paginationShow = true
				})
			},
			allUser() {	
				this.paginationShow = false
				this.cur_page = 1
				this.getData()
				this.select_cate = ''
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
			test(visible){
				if(visible){
					this.query = undefined
				  	this.remoteMethod("")
				}  
			},
			batchVisible(visible){
				if(visible){
					this.query2 = undefined
				  	this.remoteMethodBatch("")
				}  
			},
			remoteMethod(query,callback=undefined) {
				this.select_batch = ''
				console.log("remote")
				console.log(query)
				console.log(this.query)
				if(query != "" || this.query != "" || callback){
					let reload = false
					if(this.query != query){
						this.loading = true
						this.user_page = 1
						this.query = query
						reload = true
						if(this.$refs.infiniteLoading.isComplete){
							this.$refs.infiniteLoading.stateChanger.reset()
						}
					}
					console.log(this.user_page)
					this.$axios.get("/admin/users/search_user?query=" + query.trim()+"&page="+this.user_page, {
						headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					}).then((res) => {
						if(res.data.code == 200){
							this.loading = false
//							this.options = res.data.data
							if(reload){
//								this.user_page = 1
								this.options = this.options2.concat(res.data.data)
							}else{
								this.options = this.options.concat(res.data.data)
							}
//							this.options = this.options.concat(res.data.data)
							this.user_total = res.data.count
							if(callback){
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
				}
			},
			remoteMethodBatch(query,callback=undefined){
				this.select_cate = ''
				console.log("remote")
				console.log(query)
				console.log(this.query2)
				if(query != "" || this.query2 != "" || callback){
					let reload = false
					if(this.query2 != query){
						this.loading2 = true
						this.batch_page = 1
						this.query2 = query
						reload = true
						if(this.$refs.infiniteLoading2.isComplete){
							this.$refs.infiniteLoading2.stateChanger.reset()
						}
					}
					console.log(this.user_page)
					this.$axios.get("/admin/batch_store_ins/search_batch?query=" + query.trim()+"&page="+this.batch_page, {
						headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					}).then((res) => {
						if(res.data.code == 200){
							console.log(res.data.data)
							this.loading2 = false
//							this.options = res.data.data
							if(reload){
//								this.user_page = 1
								this.batchoptions = res.data.data
							}else{
								this.batchoptions = this.batchoptions.concat(res.data.data)
							}
//							this.options = this.options.concat(res.data.data)
							this.batch_total = res.data.count
							if(callback){
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
				}
			},
			getUserDatasFirst() {
				if(this.select_cate == -1) {
					this.getData()
					return
				}
				this.paginationShow = false				
				this.cur_page = 1
				this.$axios.get('/admin/store_ins?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.tableData = res.data.data
					this.totals = res.data.count
					this.paginationShow = true
				})
			},
			getBatchsDatas() {
				this.paginationShow = false				
				this.cur_page = 1
				this.$axios.get('/admin/store_ins/search_by_batch?page=' + this.cur_page + '&batch_id=' + this.select_batch, {
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
				this.$axios.get('/admin/store_ins?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.tableData = res.data.data
					this.totals = res.data.count
				})
			},
			getWarehouse(callback = undefined) {
				this.$axios.get('/admin/warehouses?page=' + this.ware_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.wareoptions = this.wareoptions.concat(res.data.data)
						this.ware_total = res.data.count
						if(callback) {
							callback()
						}
					}

				})
			},
			onInfinite(obj) {
				if((this.user_page * 20) < this.user_total) {
					this.user_page += 1
					this.remoteMethod(this.query,obj.loaded)
//					this.getUser(obj.loaded)
				} else {
					obj.complete()
					console.log(obj.complete())
				}
			},
			onInfinite_batch(obj) {
				if((this.batch_page * 20) < this.batch_total) {
					this.batch_page += 1
					this.remoteMethodBatch(this.query2,obj.loaded)
//					this.getUser(obj.loaded)
				} else {
					obj.complete()
					console.log(obj.complete())
				}
			},
			onInfinite_ware(obj) {
				if((this.ware_page * 20) < this.ware_total) {
					this.ware_page += 1
					this.getWarehouse(obj.loaded)
					//					obj.loaded()
				} else {
					obj.complete()
				}
			},
			search() {
				this.is_search = true;
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19);
			},
			filterTag(value, row) {
				return row.tag === value;
			},
			handleEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.$axios.get('/admin/store_ins/' + item.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					res.data.data.product_store_ins.forEach((data) => {
						data.warehouse = []
						//						data.product_store_ins.forEach((data2) => {
						//							data2.warehouse = []
						//						})
					})
					this.product_store_ins_change = res.data.data.product_store_ins
					this.form = {
						id: item.id,
						arrive_sum: item.arrive_sum,
						remark: item.remark,
						product_store_ins: this.product_store_ins_change
					}
					this.editVisible = true;
				})

			},
			
			delAll() {
				const length = this.multipleSelection.length;
				let str = '';
				this.del_list = this.del_list.concat(this.multipleSelection);
				for(let i = 0; i < length; i++) {
					str += this.multipleSelection[i].name + ' ';
				}
				this.$message.error('删除了' + str);
				this.multipleSelection = [];
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 入库
			saveEdit(form) {
				let id = this.form.id
				let product_store_ins = []
				let sum = []
				let ware = []
				for(let i = 0; i < this.form.product_store_ins.length; i++) {
					if(this.judge_inbound((this.form.product_store_ins[i].arrive_sum))){
						
					}else {
						return false
					}
//					if(this.form.product_store_ins[i].warehouse.length == 0) {
//						this.$message.error('请核对格式是否正确')
//						return false
//					}
					product_store_ins.push(this.form.product_store_ins[i].id)
					let sum_temp = []
					sum_temp.push(parseInt(this.form.product_store_ins[i].arrive_sum))
					sum.push(sum_temp)
//					if(this.form.product_store_ins[i].warehouse.length == 1) {
//						let sum_temp = []
//						sum_temp.push(parseInt(this.form.product_store_ins[i].arrive_sum))
//						sum.push(sum_temp)
//					} else {
//						sum.push(this.form.product_store_ins[i].arrive_sum.split('/').map(Number))
//					}
//					ware.push(this.form.product_store_ins[i].warehouse)
				}
				this.$axios.post('/admin/store_ins/' + id + '/done', {
					sum: sum,
					product_store_ins: product_store_ins,
					remark: this.form.remark,
//					ware_houses: ware
				}, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.editVisible = false;
						this.$message.success('入库完成')
						this.getData()
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
				this.form = {
					id: item.id
				}
				this.$axios.delete('/admin/store_ins/' + this.form.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData.splice(this.idx, 1)						
						this.getData()
						this.$message.success("删除成功")
					}
				}).catch((res) => {
					this.$message.error("删除失败")
				})
				this.delVisible = false;
			},
			getStatusName(status) {
				if(status == 1) {
					return "待入库"
				}else if(status == 5) {
					return "删除待审核"
				} else {
					return "已入库"
				}
			},
			detailsShow(index, row) {
				this.$axios.get('/admin/store_ins/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					res.data.data.product_store_ins.forEach((data) => {
//						data.ware_count = ''
//						data.store_in_ware_houses.forEach((data2) => {
//							data.ware_count += data2.ware_house_name + '(' + data2.sum + ') '
//						})
						this.ware_details = res.data.data.product_store_ins
					})
					this.detailVisible = true
				})
			},
			
		},
		components: {
			"infinite-loading": VueInfiniteLoading
		}
	}
</script>

<style scoped>
	.handle-box {
		margin-bottom: 20px;
	}
	
	.batch_box {
		float: right;
	}
	
	.handle-select {
		width: 120px;
	}
	
	.handle-input {
		width: 300px;
		display: inline-block;
	}
	
	.del-dialog-cnt {
		font-size: 16px;
		text-align: center
	}
	
	.el-dropdown {
		vertical-align: top;
	}
	
	.el-dropdown+.el-dropdown {
		margin-left: 15px;
	}
	
	.el-icon-arrow-down {
		font-size: 12px;
	}
	
	.el-tag+.el-tag {
		margin-left: 10px;
	}
	
	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
</style>