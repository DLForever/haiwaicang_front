<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 入库即出订单</el-breadcrumb-item>
				<el-breadcrumb-item>出库单管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

		<div class="container">
			<div class="handle-box">
				<div class="fnsku_filter">
					用户:
					<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
						<el-option v-for="item in options" :label="item.usercode" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
					</el-select>
					Fnsku:
                    <el-input style="width:150px" placeholder="请输入Fnsku" v-model.trim="search_fnsku"></el-input>
                    状态:
					<el-select v-model="statusSelect" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
                    <el-button @click="clear_search" type="default">重置</el-button>
                    <el-button @click="filter_inbound" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="barcode" label="出库单号">
				</el-table-column>
				<!-- <el-table-column label="条形码" width="120">
					<template slot-scope="scope">
						<barcode :value="scope.row.barcode" :options="{displayValue:false}" tag="img" width="100" height="50"></barcode>
					</template>
				</el-table-column> -->
				<el-table-column prop="user_number" label="用户名">
				</el-table-column>
				<el-table-column prop="user_number" label="批次号">
					<template slot-scope="scope">
						<span>{{scope.row.batch_store_in.batch_number}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="total" label="数量">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" show-overflow-tooltip>
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
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp附&nbsp件&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="sendProduct(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp发&nbsp货&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="printStock(scope.$index, scope.row)" type="text">打印出库单&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<!-- <el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item> -->
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
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%" @close="closeDetails">
			<div class="creat">
				<el-button type="primary" @click="print">打印</el-button>
			</div>

			<div id="printJS-form">
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table :data="outBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column label="新标" width="120px">
						<template slot-scope="scope">
							<!-- <span>{{scope.row.pictures[0]}}</span> -->
							<span v-if="scope.row.pictures.length === 0">无</span>
							<img class="img_fnsku" v-else-if="scope.row.pictures[0] != undefined && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url"/>
							<a v-else :href="$axios.defaults.baseURL+scope.row.pictures[0].url.url" target="_blank">{{scope.row.pictures[0].url.url.split('/').pop()}}</a>
							<!-- <span v-else>无</span> -->
						</template>
						<!-- <template slot-scope="scope">
							<img class="img_fnsku" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url" />					
						</template> -->
					</el-table-column>
				</el-table>
				<br>
				<el-table v-if="this.ware_houseTable2.length != 0" :data="ware_houseTable2" border style="width: 100%">
					<el-table-column prop="ware_house_name" label="库位" width="307"></el-table-column>
					<!-- <el-table-column prop="sum" label="数量"></el-table-column> -->
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
				</el-table>
				<br>
				<el-table v-if="this.order_box_cargos.length != 0" :data="order_box_cargos" border style="width: 100%">
					<el-table-column type="expand">
						<template slot-scope="scope">
							<el-table :data="scope.row.order_box_cargos">
								<el-table-column prop="fnsku" label="fnsku"></el-table-column>
								<el-table-column prop="sum" label="数量"></el-table-column>
							</el-table>
						</template>
					</el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="box_size" label="箱子尺寸(长*宽*高)"></el-table-column>
					<el-table-column prop="weight" label="箱子重量"></el-table-column>
					<el-table-column prop="repeat" label="箱子数量"></el-table-column>
				</el-table>
			</div>
		</el-dialog>

		<!-- 打印发货单提示框 -->
		<el-dialog title="详情" :visible.sync="importStockVisible" width="50%" @close="closeSendPrint">
			<div class="creat">
				<el-button type="primary" @click="printSend">打印</el-button>
			</div>
			<div id="send-form">
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table v-if="this.order_box_cargos.length != 0" :data="order_box_cargos" border style="width: 100%">
					<el-table-column type="expand">
						<template slot-scope="scope">
							<el-table :data="scope.row.order_box_cargos">
								<el-table-column prop="fnsku" label="fnsku"></el-table-column>
								<el-table-column prop="sum" label="数量"></el-table-column>
							</el-table>
						</template>
					</el-table-column>
					<el-table-column prop="sku" label="sku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="box_size" label="箱子尺寸(长*宽*高)"></el-table-column>
					<el-table-column prop="weight" label="箱子重量"></el-table-column>
				</el-table>
			</div>
		</el-dialog>
		
		<!-- 发货弹出框 -->
		<el-dialog title="发货" :visible.sync="sendProductVisible" width="30%" center>
			<div class="del-dialog-cnt">确认发货？</div>
			<!-- <el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="物流单号">
					<el-input v-model.trim="form.logistics_number"></el-input>
				</el-form-item>
				<el-form-item label="物流方式">
					<el-radio v-model="l_type" label="1">FBA</el-radio>
					<el-radio v-model="l_type" label="2">自提</el-radio>
					<el-radio v-model="l_type" label="3">其他</el-radio>
				</el-form-item>
			</el-form> -->
			<span slot="footer" class="dialog-footer">
                <el-button @click="sendProductVisible = false">取 消</el-button>
                <el-button type="primary" @click="sendEnd">确 定</el-button>
            </span>
		</el-dialog>
		
		<!-- 图片弹出框 -->
		<el-dialog title="附件详情" :visible.sync="showImg" width="30%">
			<el-table :data="form.pictures" border style="width: 100%">
                <el-table-column prop="sum" label="箱标图片">
                    <template slot-scope="scope">
                        <img class="img_fnsku" v-if="scope.row.url.url != undefined && !(scope.row.url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.url.url"/>
                        <a v-else :href="$axios.defaults.baseURL+scope.row.url.url" target="_blank">{{scope.row.url.url.split('/').pop()}}</a>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button type="danger" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column> -->
            </el-table>
			<!-- <el-carousel :interval="4000" type="card" height="200px" v-if="img_show">
				<el-carousel-item v-for="item in form.pictures">
					<img :src="$axios.defaults.baseURL+item.url.url" />
				</el-carousel-item>
			</el-carousel>
			<div v-if="pdf_show" v-for="item in form.pictures">
				<a target="_blank" :href="$axios.defaults.baseURL+item.url.url">{{'查看' + item.id + '.pdf'}}</a>
			</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="showImg = false">取 消</el-button>
                <el-button type="primary" @click="showImg = false">确 定</el-button>
            </span> -->
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
				box_page: 1,
				img_show: 1,
				l_type: '1',
				pdf_show: 0,
				pagesize: 20,
				tableData: [],
				select_cate: '',
				outBoundTable: [],
				ware_houseTable: [],
				ware_houseTable2: [],
				// options: [{
				// 	id: -1,
				// 	name: "所有用户"
				// }, ],
				// options2: [{
				// 	id: -1,
				// 	name: "所有用户"
				// }, ],
				options: [],
				options2: [],
				form: [{
					boxes_id: '',
					boxes_weight: '',
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				}],
				new_form: {
					boxes_id: '',
					boxes_weight: '',
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				},
				form_branch: {
					fnsku: '',
					sum: ''
				},
				package_fnskus: [],
				product_store_ins_mul: [],
				order_box_cargos: [],
				store_ins_mul: [],
				package_id: undefined,
				details_id: undefined,
				box_options: [],
				is_mix: '',
				pick_id: undefined,
				barcode: undefined,
				status: undefined,
				totals: 0,
				box_total: 0,
				detailVisible: false,
				loading: false,
				paginationShow: true,
				delVisible: false,
				showImg: false,
				sendProductVisible: false,
				packageVisible: false,
				isdisable: false,
				checkVisible: false,
				importStockVisible: false,
				user_total: 0,
				package_ramark: '',
				checkData: [],
				checkData2: [],
				checkData3: [],
				checkData4: [],
				checkData5: [],
				check_id: undefined,
				sendProductId: undefined,
				importStockTable:[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9},{id:10}],
				search_fnsku: '',
				statusOptions: [{value: 6, label: '待发货'}, {value: 10, label: '已完成'}],
				statusSelect: '',
				query: undefined,
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
			}
		},
		created() {
			this.getData();
			this.getBoxs()
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
				if(this.form.length <= 1) {
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
					5: 'primary',
					6: 'warning',
					8: 'danger',
					10: 'success',
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
				}else if (this.status == 8) {
					this.$message.error("待删除订单不能打印")
				} else {
					Print({
					printable: 'printJS-form',
					type: 'html',
					targetStyle: ['text-align', 'height'],
				})
				}
			},
			printSend() {
				Print({
					printable: 'send-form',
					type: 'html',
					targetStyle: ['text-align'],
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
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19)
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19)
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
			store_insSelectionChange(val) {
				this.store_ins_mul = val
			},
			productSelectionChange(val) {
				this.product_store_ins_mul = val
				for(let i = 0; i < this.checkData5.length; i++) {
					console.log(this.checkData5[i].check_sum2)
				}
			},
			getData() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true&is_quick=1' + '&out=true&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
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
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			filter_inbound() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true&is_quick=1' + '&out=true&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
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
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			clear_search() {
				this.paginationShow = false
				this.cur_page = 1
				this.select_cate = ''
				this.search_fnsku = ''
				this.statusSelect = ''
				this.getData()
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
				}).catch((res) => {

				})
			},
			onInfinite_box(obj) {
				if((this.box_page * 20) < this.box_total) {
					this.box_page += 1
					this.getBoxs(obj.loaded)
				} else {
					obj.complete()
				}
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
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true' + '&out=true&fnsku=' + this.search_fnsku, {
				// this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code) {
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				})
			},
			getUserDatas() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true' + '&out=true&fnsku=' + this.search_fnsku, {
				// this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
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
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			//箱标弹出框
			showImgs(index, row) {
				this.idx = index
				const item = this.tableData[index]
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
				this.showImg = true
			},
			sendProduct(index, row) {
				this.idx = index
				const item = this.tableData[index]
				this.sendProductId = item.id
				console.log(item)
				// this.form = {
				// 	id: item.id,
				// 	logistics_number: item.logistics_number,
				// 	l_type: this.l_type
				// }
				this.sendProductVisible = true
			},
			//发货
			sendEnd() {
				// if(this.form.logistics_number == null || this.form.logistics_number == '') {
				// 	this.$message.error('请输入完整信息')
				// 	return false
				// }
				// let params = {
				// 	id: this.form.id,
				// 	logistics_number: this.form.logistics_number,
				// 	l_type: this.l_type
				// }
				this.$axios.post('/admin/outbound_orders/' + this.sendProductId + '/done', '',{
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("下发成功!")
						this.getData()
						this.sendProductVisible = false
					}
				}).catch((res) => {
					console.log("error")
				})
			},
			handleDelete(index, row) {
				this.idx = index
				this.delVisible = true
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
						this.delVisible = false;
					}
				}).catch((res) => {
					this.$message.error("删除失败")
				})
			},
			printStock(index, row) {
				this.details_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.is_mix = row.is_mix
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							data.label_ware_houses.forEach((data2) => {
								this.ware_houseTable.push(data2)
							})
						})
						this.ware_houseTable.forEach((data) => {
							data.fnsku_ware = data.ware_house_id + data.fnsku
						})
						let temparr = []
						this.ware_houseTable.forEach((data, index) => {
							let indextepm = temparr.indexOf(data.fnsku_ware)
							if(indextepm == -1) {
								temparr.push(data.fnsku_ware)
								this.ware_houseTable2.push(data)
							} else {
								this.ware_houseTable2[indextepm].sum = this.ware_houseTable2[indextepm].sum + data.sum
							}
						})
						res.data.data.order_boxes.forEach((data) => {
							data.box_size = data.box.length + '*' + data.box.width + '*' + data.box.height
						})
						// this.ware_houseTable.forEach((ware) => {
						// 	this.ware_houseTable2.push(ware)
						// })
						this.order_box_cargos = res.data.data.order_boxes
						this.outBoundTable = res.data.data.label_changes
						this.pick_id = row.id
						this.barcode = 'hwc_' + row.id
						this.status = row.status
						this.importStockVisible = true
					} else {
						this.$message.error("失败,请联系管理员")
					}
				}).catch((res) => {

				})
				
			},
			detailsShow(index, row) {
				this.details_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.is_mix = row.is_mix
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							data.label_ware_houses.forEach((data2) => {
								// data.labal_ware_houses = data.labal_ware_houses + ' ' + data2.ware_house_name + '(' + data2.sum + ')'
								this.ware_houseTable.push(data2)
							})
						})
						this.ware_houseTable.forEach((data) => {
							data.fnsku_ware = data.ware_house_id + data.fnsku
						})
						let temparr = []
						this.ware_houseTable.forEach((data, index) => {
							let indextepm = temparr.indexOf(data.fnsku_ware)
							if(indextepm == -1) {
								temparr.push(data.fnsku_ware)
								this.ware_houseTable2.push(data)
							} else {
								this.ware_houseTable2[indextepm].sum = this.ware_houseTable2[indextepm].sum + data.sum
							}
						})
						res.data.data.order_boxes.forEach((data) => {
							data.box_size = data.box.length + '*' + data.box.width + '*' + data.box.height
						})
						this.order_box_cargos = res.data.data.order_boxes
						this.outBoundTable = res.data.data.label_changes
						this.pick_id = row.id
						this.barcode = 'hwc_' + row.id
						this.status = row.status
						//						this.barcode = Base64.encode('123456789_1')
						console.log(this.barcode)
						this.detailVisible = true
					} else {
						this.$message.error("失败,请联系管理员")
					}
				}).catch((res) => {

				})
			},
			refresh_detail() {
				this.$axios.get('/admin/outbound_orders/' + this.details_id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.label_changes.forEach((data) => {
							data.label_ware_houses.forEach((data2) => {
								this.ware_houseTable.push(data2)
							})
						})
						this.outBoundTable = res.data.data.label_changes
					} else {
						console.log('error')
					}
				}).catch((res) => {

				})
			},
			closeDetails() {
				this.ware_houseTable = []
				this.ware_houseTable2 = []
			},
			closeSendPrint() {
				this.ware_houseTable = []
				this.order_box_cargos = []
				this.ware_houseTable2 = []
			},
			getStatusName(status) {
				if(status == 1) {
					return "待审核"
				} else if(status == 2) {
					return "正在拣货"
				} else if (status == 3) {
					return "待换标"
				} else if (status == 4) {
					return "待自审"
				}else if (status == 5) {
					return "审核通过"
				}else if(status == 8) {
					return "删除待审核"
				} else if(status == 6) {
					return '待发货'
				}else if (status == 7) {
					return "被删除"
				}else if (status == 9) {
					return "删除"
				}else if (status == 10) {
					return "已完成"
				}else if (status == 11) {
					return "待拣货"
				}else if (status == 12) {
					return '已换标'
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

	.newOrder {
		text-align: center;
	}

	.dialog-footer-check {
		text-align: center;
	}

	.img_fnsku {
		width:5rem;
    	height:5rem;
	}

	.fnsku_filter {
        float: right;
    }
</style>