<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS货物订单</el-breadcrumb-item>
				<el-breadcrumb-item>不良品管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<div class="fnsku_filter">
					用户:
					<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
						<el-option v-for="item in options" :key="item.id" :label="item.usercode" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
					</el-select>
					Fnsku:
					<el-input style="width:150px" placeholder="请输入Fnsku" v-model="search_fnsku"></el-input>
					<el-button @click="clear_filter" type="default">重置</el-button>
					<el-button @click="filter_fnsku" type="primary">查询</el-button>
				</div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column fixed prop="fnsku" label="Fnsku" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="name" label="名称" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="usercode" label="用户">
				</el-table-column>
				<el-table-column prop="defect_sum" label="不良品数量">
				</el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间" width="150">
				</el-table-column>
				<el-table-column fixed="right" label="操作" width="100">
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
									<el-button @click="handleTransfer(scope.$index, scope.row)" type="text">转良品</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleOut(scope.$index, scope.row)" type="text">出库</el-button>
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

		<!-- 转换弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="40%" @close="closePutVisible">
			<el-table :data="waretable" border style="width: 100%">
				<el-table-column label="库位选择">
					<template slot-scope="scope">
						<el-select v-model="ware_id" placeholder="选择库位" class="handle-select mr10">
							<el-option v-for="item in wareoptions" :label="item.name" :value="item.id"></el-option>
							<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteLoading"></infinite-loading>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="转换数量">
					<template scope="scope">
						<el-input-number :min="0" :max="transferMaxSum" v-model="transferSum"></el-input-number>
						<!-- <el-input class="input-new-tag" placeholder="输入数量" v-model.trim="transferSum" ref="saveTagInput" size="small">
						</el-input> -->
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-form ref="form" :model="form" label-width="60px">
				<!-- <div class="newWare">
					<el-button @click="createWare">添加库位</el-button>
					<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
				</div>
				<br>
				<el-form-item label="不良品">
					<el-input-number :min="0" v-model="bad_number"></el-input-number>
				</el-form-item> -->
				
				<el-form-item label="备注">
					<el-input v-model="remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="closePutVisible">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 详情提示框 -->
		<el-dialog title="不良品记录" :visible.sync="detailVisible" width="50%">
			<el-table :data="form.cargo_ware_houses" border style="width: 100%">
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="type" label="类型">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilterdefect">{{getStatusNameDefect(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间" width="150">
				</el-table-column>
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

		<!-- 出库提示框 -->
        <el-dialog title="编辑" :visible.sync="outVisible" width="50%">
        	<el-form ref="form" label-width="80px">
        		<el-form-item label="数量">
        			<el-input-number :min="0" :max="outMax" v-model="outSum"></el-input-number>
        		</el-form-item>
        		<el-form-item label="备注">
        			<el-input v-model.trim="remark"></el-input>
        		</el-form-item>
        	</el-form>
        	<span slot="footer" class="dialog-footer">
                <el-button @click="outVisible = false">取 消</el-button>
                <el-button type="primary" @click="onSubmitOut" :disabled="submitDisable">确 定</el-button>
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
				options: [],
				options2: [],
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
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
				bad_number: 0,
				ware_id: '',
				transferSum: 0,
				cargo_id: '',
				remark: '',
				transferMaxSum: 0,
				outVisible: false,
				outMax: 0,
				outSum: 0,
				outId: undefined,
				submitDisable: false,
				outId2: undefined,
				search_usercode: ''
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
			statusFilterdefect(status) {
				const statusMap = {
					1: 'warning',
					2: 'success',
					3: 'default',
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
				this.getData();
				// if(!this.select_cate || this.select_cate == -1) {
				// 	this.getData();
				// } else {
				// 	this.getUserDatas()
				// }
			},
			// 获取 easy-mock 的模拟数据
			getData() {
				this.$axios.get("/admin/cargos/search_by_fnsku?page=" + this.cur_page + '&defect=true' + '&query=' + this.search_fnsku.trim() + '&user_id=' + this.select_cate , {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}, ).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.name = data.product.name
							let tempcode =  String(data.user_id%1000)
							let tempindex = parseInt(data.user_id/1000)
							if(tempcode.length ==1) {
								tempcode = '00' + tempcode
							}else if(tempcode.length ==2) {
								tempcode = '0' + tempcode
							}else{

							}
							data.usercode = this.code[tempindex] + tempcode
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}				
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
				}).catch((res) => {
					console.log('error')
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
				this.bad_number = 0
				this.editVisible = true;
			},
			closePutVisible() {
				this.waretable = [{
					ware: undefined,
					sum: 0
				}]
				this.editVisible = false
			},
			// 不良品换良品
			saveEdit(form) {
				let params = {
					cargo_id: this.cargo_id,
					sum: this.transferSum,
					ware_house_id: this.ware_id,
					remark: this.remark
				}
				this.$axios.post('/admin/transfer_records/out', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.editVisible = false;
						this.detailVisible = false
						this.getData()
						this.$message.success('转换完成')
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
				}).catch((res) => {
					console.log('error')
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
							res.data.data.forEach((data) => {
								let tempcode =  String(data.id%1000)
								let tempindex = parseInt(data.id/1000)
								if(tempcode.length ==1) {
									tempcode = '00' + tempcode
								}else if(tempcode.length ==2) {
									tempcode = '0' + tempcode
								}else{

								}
								data.usercode = this.code[tempindex] + tempcode
							})
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
				// if(this.search_fnsku.trim() == '') {
				// 	this.$message.error("请输入fnsku")
				// 	return false
				// }
				this.cur_page = 1
				this.paginationShow = false
				this.$axios.get("/admin/cargos/search_by_fnsku?page=" + this.user_page + '&defect=true' + '&query=' + this.search_fnsku.trim() + '&user_id=' + this.select_cate , {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.name = data.product.name
							let tempcode =  String(data.user_id%1000)
							let tempindex = parseInt(data.user_id/1000)
							if(tempcode.length ==1) {
								tempcode = '00' + tempcode
							}else if(tempcode.length ==2) {
								tempcode = '0' + tempcode
							}else{

							}
							data.usercode = this.code[tempindex] + tempcode
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						
					}
					this.paginationShow = true
				}).catch((res) => {

				})
			},
			clear_filter() {
				this.paginationShow = false
				this.cur_page = 1
				this.select_cate = ''
				this.search_fnsku = ''
				this.getData()
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
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			getUserDatas() {
				this.$axios.get('/admin/cargos?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
					}
				}).catch((res) => {

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
				this.idx = index
				this.$axios.get('/admin/transfer_records?cargo_id=' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						// res.data.data.forEach((data) => {
						// 	if(data.transfer_in == false) {
						// 		data.type = '3'
						// 	}else if(data.transfer_in == true) {
						// 		data.type = '4'
						// 	}
						// })
						this.form = {
							cargo_ware_houses: res.data.data,
						}
						this.detailVisible = true
					}
				})
			},

			search() {
				this.is_search = true
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19)
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19)
			},
			filterTag(value, row) {
				return row.tag === value
			},
			handleDelete(index, row) {
				this.idx = index
				this.delVisible = true
			},
			delAll() {
				const length = this.multipleSelection.length;
				let str = ''
				this.del_list = this.del_list.concat(this.multipleSelection)
				for(let i = 0; i < length; i++) {
					str += this.multipleSelection[i].name + ' '
				}
				this.$message.error('删除了' + str)
				this.multipleSelection = []
			},
			handleSelectionChange(val) {
				this.multipleSelection = val
			},
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1)
				this.$message.success('删除成功')
				this.delVisible = false
			},
			getStatusNameDefect(status) {
				if(status == 1) {
					return "转不良品"
				}else if(status == 2){
					return "转良品"
				}else if(status == 3){
					return "不良品出库"
				} else {
					return "其他"
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
			handleTransfer(index, row) {
				this.ware_id = ''
				this.transferSum = 0
				this.transferMaxSum = row.defect_sum
				this.cargo_id = row.id
				this.remark = ''
				this.editVisible = true
			},
			handleOut(index, row) {
				this.outMax = row.defect_sum
				this.outSum = 0
				this.remark = ''
				this.outId = row.product_id
				this.outId2 = row.id
				this.outVisible = true
			},
			onSubmitOut() {
				this.submitDisable = true
				let params = {
					cargo_id: this.outId2,
					remark: this.remark,
					sum: this.outSum,
				}
				this.$axios.delete('/admin/transfer_records/1', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					params
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('出库成功')
						this.outVisible = false
						this.getData()
					}
				}).catch((res) => {

				}).finally(() => {
					this.submitDisable = false
				})
			}
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