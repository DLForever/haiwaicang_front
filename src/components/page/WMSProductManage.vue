<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS货物订单</el-breadcrumb-item>
				<el-breadcrumb-item>货物管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @change="getUserDatasFirst" @visible-change="selectVisble" :remote-method="remoteMethod">
					<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
				<div class="fnsku_filter">
					<el-input style="width:150px" placeholder="请输入fnsku" v-model="search_fnsku"></el-input>
					<el-button @click="filter_fnsku()" type="primary">查询</el-button>
				</div>
			</div>
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku" width="200">
				</el-table-column>
				<el-table-column prop="arrive_sum" label="未上架数量" width="150">
				</el-table-column>
				<el-table-column prop="stock_sum" label="库存数量" width="150">
				</el-table-column>
				<el-table-column prop="done_sum" label="已发出数量" width="150">
				</el-table-column>
				<el-table-column prop="lock_sum" label="已锁定数量" width="120">
				</el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间" width="150">
				</el-table-column>
				<el-table-column prop="remark" label="备注">
				</el-table-column>
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="grounding(scope.$index, scope.row)" type="text">上架</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :current-page='cur_page' :page-size="20" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 上架弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="40%" @close="closePutVisible">
			<el-table :data="product_store_ins" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="arrive_sum" label="到达数量"></el-table-column>
			</el-table>
			<br>
			<el-table :data="waretable" border style="width: 100%">
				<el-table-column label="库位选择">
					<template slot-scope="scope">
						<el-select v-model="scope.row.ware" placeholder="选择库位" class="handle-select mr10">
							<el-option v-for="item in wareoptions" :label="item.name" :value="item.id"></el-option>
							<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteLoading"></infinite-loading>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="上架数量">
					<template scope="scope">
						<el-input class="input-new-tag" placeholder="输入数量" v-model.trim="scope.row.sum" ref="saveTagInput" size="small">
						</el-input>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-form ref="form" :model="form" label-width="40px">
				<div class="newWare">
					<el-button @click="createWare">添加库位</el-button>
					<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
				</div>
				<br>
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="closePutVisible">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%">
				<el-table :data="form.cargo_ware_houses" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="ware_house_name" label="所在库位"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="lock_sum" label="锁定数量"></el-table-column>
				</el-table>
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
	import Print from 'print-js'
	export default {
		//      name: 'wms_productsmanage',
		data() {
			return {
				url: './static/vuetable.json',
				//              url: 'package.json',
				tableData: [],
				options: [{
					id: -1,
					name: "所有用户"
				}, ],
				options2: [{
					id: -1,
					name: "所有用户"
				}, ],
				wareoptions: [],
				ware_total: 0,
				query: undefined,
				loading: false,
				ware_house_ids: [],
				bround_sum: '',
				product_store_ins_change: [],
				cur_page: 1,
				user_page: 1,
				ware_page: 1,
				pagesize: 20,
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				search_fnsku: '',
				del_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				detailVisible: false,
				paginationShow: true,
				totals: 0,
				user_total: 0,
				product_store_ins: [],
				form: {
					fnsku: ''
				},
				idx: -1,
				waretable: [{
					ware: undefined,
					sum: 0
				}],
				waretabletemp: {
					ware: undefined,
					sum: 0
				},
			}
		},
		created() {
			this.getData();
			this.getUser();
			this.getWarehouse();
		},
		watch: {
			"$route": "getData"
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					return d
				})
			},
			isDisableBu() {
				if(this.waretable.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					1: 'success',
					2: 'danger'
				}
				return statusMap[status]
			},
		},
		methods: {
			handleSizeChange(val) {
				this.pagesize = val;
			},
			// 分页导航
			handleCurrentChange(val) {
				this.cur_page = val;
				if(!this.select_cate || this.select_cate == -1) {
					this.getData();
				} else {
					this.getUserDatas()
				}
			},
			// 获取 easy-mock 的模拟数据
			getData() {
				this.$axios.get('/admin/cargos?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}, ).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
					}else {
						console.log(res.data.message)
					}					
					this.paginationShow = true
				}).catch((res) => {
					this.$message.error(res)
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
			createWare() {
				this.waretable.push(this.waretabletemp)
				this.waretabletemp = {
					ware: undefined,
					sum: 0
				}
			},
			back() {
				this.waretable.pop(this.waretabletemp)
			},
			grounding(index, row) {
				this.idx = index;
				const item = this.tableData[index]
				this.product_store_ins = [this.tableData[index]]
				this.form = {
					id: item.id,
					arrive_sum: item.arrive_sum
				}
				this.editVisible = true;
			},
			closePutVisible() {
				this.waretable = [{
					ware: undefined,
					sum: 0
				}]
				this.editVisible = false
			},
			// 上架
			saveEdit(form) {
				console.log(this.waretable)
				let sum = []
				let ware_house_ids = []
				this.waretable.forEach((data) => {
					sum.push(data.sum)
					ware_house_ids.push(data.ware)
				})
				let params = {
					sum: sum,
					ware_house_ids: ware_house_ids
				}
				this.$axios.post('/admin/cargos/' + this.form.id + '/putaway', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.editVisible = false;
						this.getData()
						this.$message.success('入库完成')
						this.bround_sum = ''
						this.ware_house_ids = []
					}
				}).catch((res) => {
					console.log(res)
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
			filter_fnsku() {
				if(this.search_fnsku.trim() == '') {
					this.$message.error("请输入fnsku")
					return false
				}
				this.paginationShow = false
				this.$axios.get("/admin/cargos/search_by_fnsku?query=" + this.search_fnsku.trim() + "&page=" + this.user_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
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
				this.$axios.get('/admin/cargos?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
				this.$axios.get('/admin/cargos?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.tableData = res.data.data
					this.totals = res.data.count
				})
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
			detailsShow(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					cargo_ware_houses: item.cargo_ware_houses,
				}
				this.detailVisible = true;
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
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
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
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1);
				this.$message.success('删除成功');
				this.delVisible = false;
			},
			getStatusName(status) {
				if(status == 1) {
					return "有库存"
				} else {
					return "无库存"
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
		},
		components: {
			"infinite-loading": VueInfiniteLoading,
			"Print": Print
		}
	}
</script>

<style scoped>
	.handle-box {
		margin-bottom: 20px;
	}
	
	.fnsku_filter {
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

	.newWare {
		text-align: center;
	}
</style>