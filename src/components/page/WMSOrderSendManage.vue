<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS发货订单</el-breadcrumb-item>
				<el-breadcrumb-item>发货管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
				<el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
					<el-option key="1" label="广东省" value="广东省"></el-option>
					<el-option key="2" label="湖南省" value="湖南省"></el-option>
				</el-select>-->
				<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @change="getUserDatasFirst" @visible-change="selectVisble" :remote-method="remoteMethod">
					<el-option v-for="item in options" :label="item.name" :value="item.id"></el-option>
					<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
				</el-select>
				<div class="fnsku_filter">
					<el-input style="width:150px" placeholder="请输入fnsku" v-model="search_fnsku"></el-input>
					<el-button @click="filter_fnsku()" type="primary">查询</el-button>
				</div>
				<!--<el-button type="primary" icon="search" @click="allUser">所有用户</el-button>-->
				<!--<el-input v-model="select_word" placeholder="筛选fnsku" class="handle-input mr10"></el-input>-->
				<!--<el-button type="primary" icon="search" @click="search">搜索</el-button>-->
			</div>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="物流编号" width="200">
				</el-table-column>
				<el-table-column prop="l_type" label="物流方式" width="150">
					<template slot-scope="scope">{{getStatusLtype(scope.row.l_type)}}</template>
				</el-table-column>
				<el-table-column prop="total_plan_sum" label="产品数量" width="150">
				</el-table-column>
				<el-table-column prop="box_sum" label="箱子数量" width="120">
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户刪除备注" show-overflow-tooltip>
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
									<el-button @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp打&nbsp包&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="sendProduct(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp发&nbsp货&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<!--<el-dropdown-item><el-button @click="editVisible = true" type="text">详情</el-button></el-dropdown-item>-->
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

		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
			<el-table :data="form.cargo_store_outs" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="fnsku" label="产品名称" width="150"></el-table-column>
				<el-table-column prop="sum" label="计划发货数量" width="150"></el-table-column>
				<el-table-column prop="ware_out" label="出库详情" show-overflow-tooltip></el-table-column>
			</el-table>
			<br />
			<el-table :data="form.store_out_boxes" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="box_detail" label="箱子(长*宽*高)" width="220"></el-table-column>
				<el-table-column prop="sum" label="总发货数量" width="150"></el-table-column>
				<el-table-column prop="weight" label="重量" width="150"></el-table-column>
				<el-table-column prop="pack_count" label="箱子包含的产品(数量)" show-overflow-tooltip></el-table-column>
			</el-table>
		</el-dialog>

		<!-- 打包弹出框 -->
		<el-dialog title="打包" :visible.sync="editVisible" width="60%" @close="cancelPack">
			<el-table :data="form.cargo_store_outs" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="fnsku" label="产品名称"></el-table-column>
				<el-table-column prop="sum" label="计划发货数量"></el-table-column>
			</el-table>
			<br />
			<el-table :data="warehouse_info" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column label="库位选择（括号里面为库存数量）">
					<template slot-scope="scope">
						<el-select v-model="scope.row.warehouse" placeholder="选择库位" class="handle-select mr10" multiple>
							<el-option v-for="item in scope.row.cargo_ware_houses" :label="item.ware_house_name" :value="item.ware_house_id"></el-option>
							<!--<infinite-loading :on-infinite="onInfinite_ware" ref="infiniteWareHouseLoading"></infinite-loading>-->
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="处理数量">
					<template scope="scope">
						<el-input class="input-new-tag" v-model="scope.row.lock_sum" ref="saveTagInput" size="small">
						</el-input>
					</template>
				</el-table-column>
			</el-table>
			<span class="el-upload__tip">温馨提示：如果一个产品选择多个库位，处理数量请用‘/’分开，格式为 66/88，确保库位和数据一一对应</span>
			<br><br>
			<el-table :data="box_temp" border style="width: 100%">
				<el-table-column label="箱子选择" width="150">
					<template scope="scope">
						<el-select v-model="boxes" placeholder="选择箱子" @change="handleInputConfirm" class="handle-select mr10" value-key="id" multiple>
							<el-option v-for="item in box_options" :label="item.name" :value="item.id + '_' + item.name"></el-option>
							<infinite-loading :on-infinite="onInfinite_box" ref="infiniteLoading"></infinite-loading>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="箱子详情">
					<template scope="scope">
						<el-tag v-for="tag in dynamicTags" closable :disable-transitions="false" @close="handleClose(tag)">
							{{tag}}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="箱子重量">
					<template slot-scope="scope">
						<el-input type="text" v-model="box_weight"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="产品数量">
					<el-table-column :label="item.fnsku" v-for="item in warehouse_info">
						<template slot-scope="scope">
							<el-input type="text" v-model="item.stock_sum"></el-input>
						</template>
					</el-table-column>
				</el-table-column>
			</el-table>
			<span class="el-upload__tip">温馨提示：如果有多个箱子，箱子重量与产品数量请用‘/’分开，如果A产品在某箱子数量为0，格式为 66/0/88，确保箱子和数据一一对应</span>
			<br /><br>
			<el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="cancelPack">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
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
		//		name: 'wms_orderssendmanage',
		data() {
			return {
				url: './static/vuetable.json',
				img_show: 1,
				pdf_show: 0,
				tableData: [],
				store_outs_details: [],
				box_store_details: [],
				options: [{id: -1, name: "所有用户"},],
				options2: [{id: -1, name: "所有用户"},],
				box_options: [],
				boxes: [],
				dynamicTags: [],
				boxes2: [],
				box_weight: '',
				box_temp: [{
					temp: []
				}],
				cur_page: 1,
				user_page: 1,
				box_page: 1,
				pagesize: 20,
				l_type: '1',
				totals: 0,
				user_total: 0,
				box_total: 0,
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				search_fnsku: '',
				del_list: [],
				warehouse_info: [],
				temp: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				showImg: false,
				sendProductVisible: false,
				detailVisible: false,
				paginationShow: true,
				loading: false,
				query: undefined,
				cargo_ids: [],
				cargo_store_outs: [],
				form: {
					order: 'rr',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					status: '',
					remarks: '',
					name: '',
					date: '',
					address: '',
					cargo_store_outs: [],
				},
				idx: -1,
				rules: {
					box_sum: [{
						required: true,
						message: '请填入箱子数量',
						trigger: 'blur'
					}],
					weight: [{
						required: true,
						message: '请填入箱子重量',
						trigger: 'blur'
					}],
					length: [{
						required: true,
						message: '请填入箱子长度',
						trigger: 'blur'
					}],
					width: [{
						required: true,
						message: '请填入箱子宽度',
						trigger: 'blur'
					}],
					height: [{
						required: true,
						message: '请填入箱子高度',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getData();
//			this.getUser()
		},
		watch: {
			"$route": "getData"
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					let is_del = false
					return d
					//					if(!is_del) {
					//						if((d.logistics_number.indexOf(this.select_word) > -1)) {
					//							return d;
					//						}
					//					}
				})
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					5: 'primary',
					6: 'warning',
					1: 'danger',
					4: 'success',
					7: 'info'
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
				this.$axios.get('/admin/store_outs?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					//					res.data.data.forEach((data) => {
					//						data.cargo_ids = []
					//						data.cargo_store_outs.forEach((data2) => {
					//							data2.warehouse = []
					//							data.cargo_ids.push(data2.cargo_id)
					//						})
					//					})
					this.tableData = res.data.data;
					this.totals = res.data.count
					this.paginationShow = true
					this.getBoxs()
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
//							this.options = res.data.data
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
				this.$axios.get("/admin/store_outs/search_by_fnsku?query=" + this.search_fnsku.trim() +"&page=" + this.user_page, {
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
			getBoxs(callback = undefined) {
				this.$axios.get('/admin/boxes?page=' + this.box_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.box_options = this.box_options.concat(res.data.data)
						this.box_total = res.data.count
						if(callback) {
							callback()
						}
					}
				})
			},
			getUserDatasFirst() {
				if(this.select_cate == -1) {
					this.getData()
					return
				}
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/store_outs?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
				this.$axios.get('/admin/store_outs?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
					this.remoteMethod(this.query,obj.loaded)
//					this.getUser(obj.loaded)
				} else {
					obj.complete()
				}
			},
			onInfinite_box(obj) {
				if((this.box_page * 20) < this.box_total) {
					this.box_page += 1
					this.getBoxs(obj.loaded)
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
				this.$axios.get('/admin/store_outs/' + item.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					res.data.data.cargo_store_outs.forEach((data) => {
						data.warehouse = []
						this.cargo_ids.push(data.cargo_id)
					})
					this.cargo_store_outs = res.data.data.cargo_store_outs

					this.form = {
						id: item.id,
						remark: item.remark,
						box_sum: item.box_sum,
						weight: item.weight,
						length: item.length,
						width: item.width,
						height: item.height,
						cargo_store_outs: this.cargo_store_outs
					}
					let params = {
						ids: this.cargo_ids
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
								data.cargo_ware_houses.forEach((data2) => {
									//								data.ware_sum = data.ware_sum.concat(data2.ware_house_name + '(' + data2.sum + ') ')
									data2.ware_house_name = data2.ware_house_name + '(' + data2.sum + ')'
								})
							})
							this.warehouse_info = res.data.data
							this.editVisible = true;
						}
					})
				})

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
			// 打包
			saveEdit(form) {
				//				this.$refs[form].validate((valid) => {
				//					if(valid) {
				let boxes_temp = []
				for(let i = 0; i < this.dynamicTags.length; i++) {
					boxes_temp.push(Number(this.dynamicTags[i].split('_')[0]))
				}
				if(this.dynamicTags.length == 0) {
					this.$message.error('请选择箱子')
					return false
				}
				let sum = []
				let ware = []
				let box_cargo_sum = []
				let box_cargo_sum_temp = []
				try {
					for(let i = 0; i < this.warehouse_info.length; i++) {
						if(this.judge_inbound(this.warehouse_info[i].lock_sum) && this.judge_inbound(this.warehouse_info[i].stock_sum)) {

						} else {
							return false
						}
						if(this.warehouse_info[i].warehouse.length == 1) {
							let sum_temp = []
							sum_temp.push(parseInt(this.warehouse_info[i].lock_sum))
							sum.push(sum_temp)
						} else {
							sum.push(this.warehouse_info[i].lock_sum.split('/').map(Number))
						}
						ware.push(this.warehouse_info[i].warehouse)
					}
					for(let i = 0; i < this.warehouse_info.length; i++) {
						if(this.dynamicTags.length == 1) {
							let box_temp = []
							box_temp.push(parseInt(this.warehouse_info[i].stock_sum))
							box_cargo_sum_temp.push(box_temp)
						} else {
							box_cargo_sum_temp.push(this.warehouse_info[i].stock_sum.split('/').map(Number))
						}

					}
					for(let i = 0; i < this.dynamicTags.length; i++) {
						let temp = []
						for(let j = 0; j < this.warehouse_info.length; j++) {
							temp.push(box_cargo_sum_temp[j][i])
						}
						box_cargo_sum.push(temp)
					}
				} catch(e) {
					this.$message.error('请核对数据格式是否正确')
					return false
				}
				let params = {
					id: this.form.id,
					remark: this.form.remark,
					box_sum: this.dynamicTags.length,
					weight: this.box_weight.split('/').map(Number),
					sum: sum,
					ware_houses: ware,
					box_ids: boxes_temp,
					box_cargo_sum: box_cargo_sum
				}
				this.$axios.post('/admin/store_outs/' + this.form.id + '/done_package', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("下发成功!")
						this.getData()
						this.editVisible = false;
						this.boxes = []
						this.box_weight = ''
						this.dynamicTags = []
					}
				}).catch((res) => {
					this.$message.error(res)
				})
				//					} else {
				//						this.$message.error('请填写完整内容')
				//						return false
				//					}
				//				})

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
				this.$axios.delete('/admin/store_outs/' + this.form.id, {
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
					return "待打包"
				} else if(status == 4) {
					return "已完成"
				} else if(status == 7) {
					return "删除待审核"
				} else if(status == 6) {
					return '待发货'
				} else {
					return '包装完成'
				}
			},
			getStatusLtype(status) {
				if(status == 1) {
					return "FBA"
				} else if(status == 2) {
					return "自提"
				} else if(status == 3) {
					return "其他"
				} else {
					return '未发货'
				}
			},
			detailsShow(index, row) {
				this.idx = index;
				this.$axios.get('/admin/store_outs/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					res.data.data.store_out_boxes.forEach((data) => {
						data.pack_count = ''
						data.box_detail = data.box.name + ' (' + data.box.length + '*' + data.box.width + '*' + data.box.height + ')'
						data.fnsku = []
						data.store_out_box_cargos.forEach((data2) => {
							data.pack_count += data2.fnsku + '(' + data2.sum + ') '
						})
					})
					res.data.data.cargo_store_outs.forEach((data) => {
						data.ware_out = ''
						data.store_out_ware_houses.forEach((data2) => {
							data.ware_out += data2.ware_house_name + '(' + data2.sum + ') '
						})
					})
					this.store_outs_details = res.data.data;
					const item = this.store_outs_details
					this.form = {
						cargo_store_outs: item.cargo_store_outs,
						store_out_boxes: item.store_out_boxes
					}
					this.detailVisible = true;
				})

			},
			cancelPack() {
				this.cargo_ids = []
				this.warehouse_info = []
				this.editVisible = false
			},
			handleClose(tag) {
				this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
			},

			showInput() {
				this.inputVisible = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},

			handleInputConfirm() {
				if(this.boxes) {
					this.dynamicTags.push(this.boxes[0]);
				}
				this.inputVisible = false;
				this.boxes = []
			}
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
	
	a {
		display: block;
		text-align: center;
	}
</style>