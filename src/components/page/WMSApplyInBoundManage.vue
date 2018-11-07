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
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" :loading="loading" class="handle-select mr10" @visible-change="selectVisble" @change="getUserDatasFirst" :remote-method="remoteMethod">
					<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
				
				<!--<el-select v-model="select_cate" filterable placeholder="选择用户" class="handle-select mr10" @change="getUserDatasFirst">
					<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>-->
				<!--<el-button type="primary" icon="search" @click="allUser">所有用户</el-button>-->
			</div>
			<!--<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">-->
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="文件">
					<template slot-scope="scope">
						<a :href="$axios.defaults.baseURL+scope.row.url.url">查看文件</a>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间">
				</el-table-column>
				<el-table-column prop="remark" label="备注">
				</el-table-column>
				<el-table-column prop="status" label="状态">
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp详情&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleEdit(scope.$index, scope.row)" type="text">处理用户批次</el-button>
								</el-dropdown-item>
								<!--<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
								</el-dropdown-item>-->
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
			
		
		<!-- 创建批次弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<span>确定创建批次吗？</span>
			<span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="danger" @click="refuseEdit('form')">拒 绝</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>
		
		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
			<el-table :data="batch_list" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="batch_number" label="批次编号" width="150"></el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间">
				</el-table-column>
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
				query: undefined,
				tableData: [],
				options: [],
				batch_list: [],
				cur_page: 1,
				user_page: 1,
				ware_page: 1,
				ware_total: 0,
				pagesize: 20,
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				loading: false,
				is_search: false,
				editVisible: false,
				delVisible: false,
				detailVisible: false,
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
//			this.getUser();
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
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
//					2: 'info',
					1: 'warning',
					3: 'success',
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
			
			getData() {			
				this.$axios.get('/admin/apply_store_ins?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data;
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			allUser() {	
				this.paginationShow = false
				this.cur_page = 1
				this.getData()
				this.select_cate = ''
			},
			searchUser() {
				
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
				if(visible){
					this.query = undefined
				  	this.remoteMethod("")
				}  
			},
			remoteMethod(query,callback=undefined) {
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
					this.$axios.get("/admin/users/search_user?query=" + query.trim()+"&page="+this.user_page, {
						headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					}).then((res) => {
						if(res.data.code == 200){
							this.loading = false
//							this.options = res.data.data							
							if(reload){
								this.options = res.data.data
							}else{
								this.options = this.options.concat(res.data.data)
							}
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
			getUserDatasFirst() {
				this.paginationShow = false				
				this.cur_page = 1
				this.$axios.get('/admin/apply_store_ins?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
					console.log('error')
				})
			},
			getUserDatas() {
				this.$axios.get('/admin/apply_store_ins?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code) {
						this.tableData = res.data.data
						this.totals = res.data.count
					}
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
//					this.getUser(obj.loaded)
					this.remoteMethod(this.query,obj.loaded)
				} else {
					obj.complete()
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
				this.form = {
					apply_store_in_id: item.id,
					user_id: item.user_id
				}
				this.editVisible = true;
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
				let apply_store_in_id = this.form.apply_store_in_id
				let user_id = this.form.user_id
				this.$axios.post('/admin/batch_store_ins', {
					apply_store_in_id: apply_store_in_id,
					user_id: user_id,
				}, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.editVisible = false;
						this.$message.success('创建成功')
						this.getData()
					}
				}).catch((res) => {
					this.$message.error(res)
				})
			},
			refuseEdit(form) {
				this.$axios.delete('/admin/apply_store_ins/' + this.form.apply_store_in_id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.editVisible = false;
						this.$message.success("已拒绝")
						this.getData()
					}
				}).catch((res) => {
					this.$message.error(res.data.message)
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
					return "待通过"
				}else if(status == 3) {
					return "已通过"
				} else {
					return "其他"
				}
			},
			detailsShow(index, row) {
				this.$axios.get('/admin/batch_store_ins?apply_store_in_id=' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					this.batch_list = res.data.data
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