<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS换标订单</el-breadcrumb-item>
				<el-breadcrumb-item>换标管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @change="getUserDatasFirst" @visible-change="selectVisble" :remote-method="remoteMethod">
					<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
				<!--<el-button type="primary" icon="search" @click="allUser">所有用户</el-button>-->
				<div class="fnsku_filter">
					<el-input style="width:150px" placeholder="请输入fnsku" v-model="search_fnsku"></el-input>
					<el-button @click="filter_fnsku()" type="primary">查询</el-button>
				</div>
				
				<!--<el-button type="primary" icon="search" @click="search">搜索</el-button>-->

			</div>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku" width="200">
				</el-table-column>
				<el-table-column prop="dst_fnsku" label="新fnsku" width="200">
				</el-table-column>
				<el-table-column prop="sum" label="数量" width="150">
				</el-table-column>
				<!--<el-table-column prop="done_sum" label="已发出数量" width="120">
				</el-table-column>-->
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="status" label="状态" width="120">
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp详&nbsp情&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp贴&nbsp标&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :current-page='cur_page' :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 贴标 -->
		<el-dialog title="贴标" :visible.sync="editVisible" width="50%" @close="closeStick">
			<el-table :data="warehouse_info" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="plan_sum" label="计划贴标数量"></el-table-column>
				<!--<el-table-column prop="ware_sum" label="库位剩余数量"></el-table-column>-->
				<el-table-column label="库位选择（括号里面为库存数量）">
					<template slot-scope="scope">
						<el-select v-model="old_ware" placeholder="选择库位" class="handle-select mr10" multiple>
							<el-option v-for="item in scope.row.cargo_ware_houses" :label="item.ware_house_name" :value="item.ware_house_id"></el-option>
							<!--<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteWareHouseLoading"></infinite-loading>-->
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="处理数量">
					<template scope="scope">
						<el-input class="input-new-tag" v-model="old_count" ref="saveTagInput" size="small">
						</el-input>
					</template>
				</el-table-column>
			</el-table>			
			<br>
			<el-table :data="ware_temp" border style="width: 100%">
				<el-table-column label="库位选择" width="308">
					<template slot-scope="scope">
						<el-select v-model="dst_wareoptions" placeholder="选择库位" class="handle-select mr10" multiple>
							<el-option v-for="item in wareoptions" :label="item.name" :value="item.id"></el-option>
							<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteWareHouseLoading"></infinite-loading>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="处理数量">
					<template slot-scope="scope">
						<el-input type="text" v-model="change_count"></el-input>
					</template>
				</el-table-column>
			</el-table>
			<span class="el-upload__tip">温馨提示：如果一个产品选择多个库位，处理数量请用‘/’分开，格式为 66/88，确保库位和数据一一对应</span>
			<br />
			<el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="备注">
					<el-input v-model="form.remark" placeholder="贴标备注"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="closeStick">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
			<el-table :data="order_ware_houses" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="ware_house_name" label="库位"></el-table-column>
				<el-table-column prop="in_ware_house" label="状态">
					<template slot-scope="scope">{{getInorOut(scope.row.in_ware_house)}}</template>
				</el-table-column>
				<el-table-column prop="sum" label="取(入)数量"></el-table-column>
			</el-table>
			<br />
		</el-dialog>

		<!-- 查看图片 -->
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
		//				name: 'wms_ordersmanage',
		data() {
			return {
				url: './static/vuetable.json',
				img_show: 1,
				pdf_show: 0,
				tableData: [],
				warehouse_info: [],
				wareoptions: [],
				dst_wareoptions: [],
				options: [{id: -1, name: "所有用户"},],
				options2: [{id: -1, name: "所有用户"},],
				old_ware: [],
				order_ware_houses: [],
				old_count: '',
				change_count: '',
				search_fnsku: '',
				cur_page: 1,
				user_page: 1,
				ware_page: 1,
				pagesize: 20,
				totals: 0,
				user_total: 0,
				ware_temp: [{
					temp: []
				}],
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				showImg: false,
				detailVisible: false,
				paginationShow: true,
				loading: false,
				query: undefined,
				form: {
					id: '',
					order: 'rr',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					status: '',
					remark: '',
					name: '',
					date: '',
					address: ''
				},
				idx: -1
			}
		},
		created() {
			this.getData();
//			this.getUser();
			this.getWarehouse()
		},
		watch: {
			"$route": "getData"
		},
		computed: {
			data() {
				return this.tableData
//				return this.tableData.filter((d) => {
//					return d
//					let is_del = false
//					if(!is_del) {
//						if((d.fnsku.indexOf(this.select_word) > -1 ||
//								d.dst_fnsku.indexOf(this.select_word) > -1)) {
//							return d;
//						}
//					}
//				})
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					2: 'info',
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
				let params = {
					o_type: 1
				}
				this.$axios.get('/admin/orders?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					params
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
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
							if(reload){
								this.options = this.options2.concat(res.data.data)
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
			filter_fnsku() {
				if(this.search_fnsku.trim() == '') {
					this.$message.error("请输入fnsku")
					return false
				}
				this.paginationShow = false
				this.$axios.get("/admin/orders/search_by_fnsku?query=" + this.search_fnsku.trim() +"&page=" + this.user_page, {
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
					this.getData()
					return
				}
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
				this.$axios.get('/admin/orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.totals = res.data.count
					}
				}).catch((res) => {
					console.log('error')
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
			onInfinite_ware(obj) {
				if((this.ware_page * 20) < this.ware_total) {
					this.ware_page += 1
					this.getWarehouse(obj.loaded)
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
					id: item.id,
					remark: item.remark,
					sum: item.sum
				}
				let ids = []
				ids.push(item.cargo_id)
				let params = {
					ids: ids
				}
				this.$axios.get('/admin/cargos/warehouse_info', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
					params
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							//							data.ware_sum = ''
							data.warehouse = []
							data.plan_sum = item.sum
							data.cargo_ware_houses.forEach((data2) => {
								//								data.ware_sum = data.ware_sum.concat(data2.ware_house_name + '(' + data2.sum + ') ')
								data2.ware_house_name = data2.ware_house_name + '(' + data2.sum + ')'								
							})
						})
						this.warehouse_info = res.data.data
						this.editVisible = true;
					}
				})
				this.editVisible = true;
			},
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
				}else {
					this.img_show = 1
					this.pdf_show = 0
				}
				this.showImg = true;
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
			// 保存编辑
			saveEdit(form) {
				this.$confirm('确认已贴标？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					center: true
				}).then(() => {
					if(this.judge_inbound(this.old_count) && this.judge_inbound(this.change_count)) {
						
					}else {
						return false
					}
					let ware_houses = this.old_ware
					let sum = this.old_count.split('/').map(Number)
					let dst_ware_house = this.dst_wareoptions
					let dst_sum = this.change_count.split('/').map(Number)
					let params = {
						remark: this.form.remark,
						ware_houses: ware_houses,
						sum: sum,
						dst_ware_houses: dst_ware_house,
						dst_sum: dst_sum
					}
					this.$axios.post('/admin/orders/' + this.form.id + '/done', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.$message.success("换标成功!")
							this.getData()
							this.editVisible = false;
							this.old_ware = []
							this.old_count = ''
							this.dst_wareoptions = []
							this.change_count = ''
						}
					}).catch((res) => {
						console.log('error')
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消贴标'
					})
				})

			},
			//取消贴标
			closeStick() {
				this.editVisible = false
				this.old_ware = []
				this.old_count = ''
				this.dst_wareoptions = []
				this.change_count = ''
			},
			detailsShow(index, row) {
				this.$axios.get('/admin/orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.order_ware_houses = res.data.data.order_ware_houses
						this.detailVisible = true
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			// 确定删除
			deleteRow() {
				let index = this.idx
				const item = this.tableData[index];
				this.form = {
					id: item.id
				}
				this.$axios.delete('/admin/orders/' + this.form.id, {
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
					return "等待换标"
				} else if(status == 4) {
					return "已完成"
				}else if(status == 5) {
					return "删除待审核"
				} else {
					return '包装完成'
				}
			},
			getInorOut(status) {
				if(status == true) {
					return "放入"
				} else if(status == false) {
					return "取出"
				} else {
					return "暂未贴标"
				}
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
	
	.el-dropdown {
		vertical-align: top;
	}
	
	.el-dropdown+.el-dropdown {
		margin-left: 15px;
	}
	
	.el-icon-arrow-down {
		font-size: 12px;
	}
	
	a{
		display: block;
		text-align: center;
	}
</style>