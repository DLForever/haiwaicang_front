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
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="printStock(scope.$index, scope.row)" type="text">打印出库单&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleBack(scope.row)" type="text">返回上一状态</el-button>
								</el-dropdown-item>
								<!-- <el-dropdown-item>
									<el-button @click="package(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp打&nbsp包&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="check(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp结&nbsp算&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item> -->
								<!-- <el-dropdown-item>
									<el-button @click="sendProduct(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp发&nbsp货&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item> -->
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
			<!-- <div style="height: 10%;">
			<el-scrollbar style="height: 100%;"> -->
			<div class="creat">
				<el-button type="primary" @click="pick">生成拣货单</el-button>
				<el-button type="default" @click="print">打印</el-button>
				<!--<el-button type="default" @click="print2">打印</el-button>-->
			</div>

			<div id="printJS-form">
				<!--<h1 class="ismix">{{is_mix}}</h1>-->
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table :data="outBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="sum" label="新标" width="120px" show-overflow-tooltip>
						<template slot-scope="scope">
							<!-- <span>{{scope.row.pictures[0]}}</span> -->
							<span v-if="scope.row.pictures.length === 0">无</span>
							<!-- <span v-else-if="scope.row.pictures[0].url.url != null">无</span> -->
							<img class="img_fnsku" v-else-if="scope.row.pictures[0] != undefined && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url"/>
							<a v-else :href="$axios.defaults.baseURL+scope.row.pictures[0].url.url" target="_blank">{{scope.row.pictures[0].url.url.split('/').pop()}}</a>
						</template>
						<!-- <template slot-scope="scope">
							<img class="img_fnsku" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url" />					
						</template> -->
					</el-table-column>
					<!-- <el-table-column prop="labal_ware_houses" label="取货详情"></el-table-column> -->
					<!--<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间"></el-table-column>
					<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间"></el-table-column>-->
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
				</el-table>
			</div>
			<!-- </el-scrollbar>
			</div> -->
		</el-dialog>

		<!-- 检查提示框 -->
		<el-dialog title="详情" :visible.sync="checkVisible" width="65%">
			<el-table :data="checkData" border style="width: 100%">
				<el-table-column prop="total" label="总数"></el-table-column>
				<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="this.checkData3.length != 0" :data="checkData3" border style="width: 100%">
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="weight" label="箱子重量"></el-table-column>
			</el-table>
			<br>
			<el-table :data="checkData2" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="this.checkData4.length != 0" :data="checkData4" border style="width: 100%" @selection-change="store_insSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="batch_number" label="任务批次"></el-table-column>
				<el-table-column prop="total_plan_sum" label="计划数量"></el-table-column>
				<el-table-column prop="total_arrive_sum" label="到达数量"></el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at"></el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="this.checkData5.length != 0" :data="checkData5" border style="width: 100%" @selection-change="productSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="plan_sum" label="计划数量"></el-table-column>
				<el-table-column prop="way_sum" label="在途数量"></el-table-column>
				<el-table-column prop="arrive_sum" label="到达数量"></el-table-column>
				<el-table-column prop="check_sum" label="已结算数量"></el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at"></el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at"></el-table-column>
				<el-table-column label="结算数量">
					<template slot-scope="scope">
						<el-input placeholder="输入结算数量" :value="scope.row.check_sum2" v-model="scope.row.check_sum2"></el-input>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<div class="dialog-footer-check">
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="check_done">提交</el-button>
				</span>
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

		<!-- 打包弹出框 -->
		<el-dialog title="打包" :visible.sync="packageVisible" width="60%" @close="cancel_Package">
			<el-form label-width="115px">
				<el-form-item label="箱子" required>
					<table class="table text-center">
						<tbody v-for="(p,index) in form">
							<tr>
							<td>
								<el-select placeholder="选择箱子" v-model="p.boxes_id"  class="handle-select mr10" value-key="id">
									<el-option v-for="item in box_options" :label="item.name" :value="item.id"></el-option>
									<infinite-loading :on-infinite="onInfinite_box" ref="infiniteLoading"></infinite-loading>
								</el-select>
							</td>
							<td>
								<el-input v-model.trim="p.boxes_weight" placeholder="箱子重量"></el-input>
							</td>
							
							<i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
							<span>&nbsp</span>
							<i class="el-icon-remove" @click="orderDel(index)"></i>
							</tr>
							<tr v-for="(q,index) in p['form_branch']">
								<td>
									<el-select v-model="q.fnsku" placeholder="选择产品" class="handle-select mr10">
										<el-option v-for="item in package_fnskus" :label="item" :value="item"></el-option>
									</el-select>
								</td>
								<td>
									<!-- <td> -->
										<el-input v-model.trim="q.sum" placeholder="计划数量"></el-input>
									<!-- </td> -->
								</td>
							</tr>
							<span>-----</span>
						</tbody>
					</table>
				</el-form-item>
				<div class="newOrder">
					<el-button @click="addBoxes">添加箱子</el-button>
					<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
				</div>
				<br>
				<el-form-item label="备注">
					<el-input ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="package_done">打包</el-button>
				</el-form-item>
			</el-form>
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
		<!-- 打印出库提示框 -->
		<el-dialog title="详情" :visible.sync="importStockVisible" width="50%">
			<div class="creat">
				<el-button type="primary" @click="printImport">打印</el-button>
			</div>
			<div id="importStock">
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table :data="importStockTable" border style="width: 100%">
					<el-table-column prop="id" label="id" width="50"></el-table-column>
					<el-table-column label="箱子"></el-table-column>
					<el-table-column label="箱子重量"></el-table-column>
					<el-table-column label="fnsku"></el-table-column>
					<el-table-column label="数量"></el-table-column>
				</el-table>
			</div>
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
				user_total: 0,
				package_ramark: '',
				checkData: [],
				checkData2: [],
				checkData3: [],
				checkData4: [],
				checkData5: [],
				check_id: undefined,
				sendProductId: undefined,
				search_fnsku: '',
				importStockTable:[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9},{id:10}],
				importStockVisible: false,
				statusOptions: [{value: 11, label: '待拣货'}, {value: 2, label: '拣货中'}, {value: 3, label: '待换标'}],
				statusSelect: '',
				query: undefined,
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
			}
		},
		created() {
			this.getData()
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
					1: 'warning',
					8: 'danger',
					2: 'success',
					7: 'info',
					3: 'warning',
				}
				return statusMap[status]
			},
		},
		methods: {
			handleBack(row) {
				this.$confirm('确定返回上一状态吗？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
				}).then(() => {
					this.$axios.post('/admin/outbound_orders/' + row.id + '/back', '' , {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.$message.success('更改成功！')
						}
					}).catch((res) => {
						console.log(res)
					})
				}).catch(() => {
					this.$message.info('已取消返回状态')
				})
			},
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
				this.cur_page = val
				if(!this.select_cate || this.select_cate == -1) {
					this.getData()
				} else {
					this.getUserDatas()
				}
			},
			handleSelectionChange(val) {
				this.multipleSelection = val
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
				// this.paginationShow = false
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true&is_quick=1' + '&out=false&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
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
					} else {
						console.log(res.data.message)
					}
					this.paginationShow = true
				})
			},
			filter_inbound() {
				this.cur_page = 1
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true&is_quick=1' + '&out=false&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
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
					} else {
						console.log(res.data.message)
					}
					this.paginationShow = true
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
			// getUserDatasFirst() {
			// 	if(this.select_cate == -1) {
			// 		this.paginationShow = false
			// 		this.cur_page = 1
			// 		this.getData()
			// 		return
			// 	}
			// 	this.paginationShow = false
			// 	this.cur_page = 1
			// 	this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
			// 		headers: {
			// 			'Authorization': localStorage.getItem('token_admin')
			// 		},
			// 	}).then((res) => {
			// 		if(res.data.code == 200) {
			// 			this.tableData = res.data.data
			// 			this.totals = res.data.count
			// 			this.paginationShow = true
			// 		}
			// 	}).catch((res) => {
			// 		console.log('error')
			// 	})
			// },
			getUserDatas() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=true' + '&out=false&fnsku=' + this.search_fnsku, {
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
					}
				}).catch((res) => {
					console.log('error')
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
						this.refresh_detail()
						this.getData()
					} else {
						console.log('error')
						// this.$message.error("失败,请联系管理员")
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			//打包
			package(index, row) {
				this.idx = index
				const item = this.tableData[index]
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.label_changes.forEach((data) => {
							console.log(data['dst_fnsku'])
							this.package_fnskus.push(data['dst_fnsku'])
						})
					}
				})
				this.package_id = item.id
				this.packageVisible = true
			},
			package_done() {
				let box_ids = []
				let weight = []
				let sum = []
				let fnsku = []
				this.form.forEach((data) => {
					let temp_sum = []
					let temp_fnsku = []
					data.form_branch.forEach((data2) => {
						temp_sum.push(data2['sum'])
						temp_fnsku.push(data2['fnsku'])
					})
					sum.push(temp_sum)
					fnsku.push(temp_fnsku)
					weight.push(data['boxes_weight'])
					box_ids.push(data['boxes_id'])
				})
				let params = {
					box_ids: box_ids,
					weight: weight,
					sum: sum,
					fnsku: fnsku,
					remark: this.package_ramark
				}
				this.$axios.post('/admin/outbound_orders/' + this.package_id + '/done_package', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code ==200) {
						this.$message.success("打包成功")
						this.getData()
						this.packageVisible = false
					}
				}).catch((res) => {

				})
			},
			cancel_Package() {
				this.package_fnskus = []
				this.package_ramark = ''
				this.packageVisible = false
			},
			check(index, row) {
				this.check_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id + '/settlement', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.checkData = [res.data.data]
						this.checkData2 = res.data.data.label_changes
						this.checkData3 = res.data.data.order_boxes
						this.checkData4 = res.data.data.store_ins
						
						res.data.data.product_store_ins.forEach((data) => {
							data.check_sum2 = ''
						})
						this.checkData5 = res.data.data.product_store_ins
						this.checkVisible = true
					}
				}).catch((res) => {

				})
			},
			check_done() {
				let store_in_ids = []
				let product_store_in_ids = []
				let sum = []
				for(let i = 0; i < this.store_ins_mul.length; i++) {
					store_in_ids.push(this.store_ins_mul[i].id)
				}
				for(let j = 0; j < this.product_store_ins_mul.length; j++) {
					sum.push(this.product_store_ins_mul[j].check_sum2)
					product_store_in_ids.push(this.product_store_ins_mul[j].id)
				}
				let params = {
					store_in_ids: store_in_ids,
					product_store_in_ids: product_store_in_ids,
					sum: sum
				}
				this.$axios.post('/admin/outbound_orders/' + this.check_id + '/check', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.getData()
						this.checkVisible = false
						this.$message.success('审核成功')
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			addBoxes() {
				this.form.push(this.new_form)
				this.new_form = {
					boxes_id: '',
					boxes_weight: '',
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				}
			},
			back() {
				this.form.pop(this.new_form)
			},
			orderAdd(index) {
				this.form[index]['form_branch'].push(this.form_branch)
				this.form_branch = {
					fnsku: '',
					sum: ''
				}
			},
			orderDel(index) {
				if(this.form[index]['form_branch'].length == 1) {
					this.$message.error("至少保留一项哦")
					return false
				}
				this.form[index]['form_branch'].pop(this.form_branch)
				console.log(this.form)
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
						this.sendProductVisible = false;
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
					}
				}).catch((res) => {
					this.$message.error("删除失败")
				})
				this.delVisible = false
			},
			detailsShow(index, row) {
				this.details_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						console.log(1111)
						this.is_mix = row.is_mix
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							// data.labal_ware_houses = ''
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
						this.detailVisible = true
					} else {
						this.$message.error("失败,请联系管理员")
					}
				})
			},
			refresh_detail() {
				this.$axios.get('/admin/outbound_orders/' + this.details_id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							// data.labal_ware_houses = ''
							data.label_ware_houses.forEach((data2) => {
								this.ware_houseTable.push(data2)
								// data.labal_ware_houses = data.labal_ware_houses + ' ' + data2.ware_house_name + '(' + data2.sum + ')'
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
						this.outBoundTable = res.data.data.label_changes
					} else {
						console.log('error')
					}
				})
			},
			closeDetails() {
				this.ware_houseTable = []
				this.ware_houseTable2 = []
			},
			printStock(index, row) {
				this.is_mix = row.is_mix
				// if(row.is_mix) {
				// 	this.is_mix = '可混装'
				// } else {
				// 	this.is_mix = '不混装'
				// }
				// this.barcode = 'hwc_7896541'
				this.barcode = 'hwc_' + row.id
				this.importStockVisible = true
			},
			printImport() {
				Print({
					printable: 'importStock',
					type: 'html',
					targetStyle: ['text-align'],
				})
			},
			getStatusName(status) {
				if(status == 1) {
					return "待审核"
				} else if(status == 2) {
					return "正在拣货"
				} else if (status == 3) {
					return "等待换标"
				} else if (status == 4) {
					return "待结算"
				}else if (status == 5) {
					return "已结算"
				}else if(status == 8) {
					return "删除待审核"
				} else if(status == 6) {
					return '已提供箱标'
				}else if (status == 7) {
					return "被删除"
				}else if (status == 9) {
					return "删除"
				}else if (status == 10) {
					return "已完成"
				}else if (status == 11) {
					return "待拣货"
				}else if (status == 12) {
					return '已装箱'
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