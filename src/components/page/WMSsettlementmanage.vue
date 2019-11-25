<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 结算记录管理</el-breadcrumb-item>
				<el-breadcrumb-item>结算详情</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<el-button @click="addSettlement" type="primary">添加</el-button>
				<div class="fnsku_filter">
					用户:
					<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
						<el-option v-for="item in options" :key="item.id" :label="item.usercode" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
					</el-select>
					类型:
					<el-select v-model="typeSelect" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
					是否支付:
					<el-select v-model="paySelect" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in payOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
					<!-- <el-date-picker v-model="date_filter" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2" unlink-panels value-format="yyyy-MM-dd"></el-date-picker> -->
					<!-- fnsku:
					<el-input style="width:150px" placeholder="请输入fnsku" v-model.trim="search_fnsku"></el-input> -->
					<el-button @click="clear_filter" type="default">重置</el-button>
					<el-button @click="filter_settlement" type="primary">查询</el-button>
				</div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="expand">
					<template slot-scope="scope" >
						<template v-if="scope.row.s_type != '5'">
						<el-table :data="[scope.row]" border style="width: 100%">
							<el-table-column type="index" width="55"></el-table-column>
							<el-table-column label="入库收费标准" v-if="scope.row.s_type == '1' || scope.row.s_type == '3'">
								<template slot-scope="scope">
									<span v-if="scope.row.charge_standard.by_box == false">每个收费{{scope.row.charge_standard.store_in_fee}}美元</span>
									<span v-else-if="scope.row.charge_standard.by_box == true">每箱收费{{scope.row.charge_standard.store_in_fee}}美元</span>
								</template>
							</el-table-column>
							<el-table-column label="出库收费标准" v-if="scope.row.s_type == '2' || scope.row.s_type == '3'">
								<template slot-scope="scope">
									<span >箱子{{scope.row.charge_standard.box_fee}}美元一个，换箱费{{scope.row.charge_standard.change_box_fee}}美元一个，换标费{{scope.row.charge_standard.change_label_fee}}美元一个</span>
								</template>
							</el-table-column>
							<el-table-column label="仓储收费标准" v-if="scope.row.s_type == '4'">
								<template slot-scope="scope">
									<span>每{{scope.row.charge_standard.cube}}方{{scope.row.charge_standard.day}}天收费{{scope.row.charge_standard.store_fee}}美元</span>
								</template>
							</el-table-column>
						</el-table>
						<br>
						<el-table v-if="[scope.row].length != 0 && scope.row.s_type != '1' && scope.row.s_type != '4'" :data="[scope.row]" border style="width: 100%">
							<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
							<el-table-column prop="box_price" label="箱子费用"></el-table-column>
							<el-table-column prop="change_box_price" label="换箱费用"></el-table-column>
							<el-table-column prop="label_change_sum" label="换标数量"></el-table-column>
							<el-table-column prop="label_change_price" label="换标费用"></el-table-column>
							<el-table-column prop="store_price" label="仓储费"></el-table-column>
						</el-table>
						<br v-if="scope.row.s_type != '1' && scope.row.s_type != '4'">
						<el-table v-if="scope.row.store_ins.length != 0" :data="scope.row.store_ins" border style="width: 100%">
							<el-table-column prop="batch_number" label="批次号"></el-table-column>
							<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
							<el-table-column prop="order_number" label="订单号"></el-table-column>
							<el-table-column prop="total_plan_sum" label="总计划数量"></el-table-column>
							<el-table-column prop="total_arrive_sum" label="实际到达数量"></el-table-column>
						</el-table>
						<br v-if="scope.row.store_ins.length != 0">
						<el-table v-if="scope.row.length != 0 && scope.row.s_type != '2' && scope.row.s_type != '4'" :data="[scope.row]" border style="width: 100%">
							<el-table-column prop="store_in_sum" label="入库数量"></el-table-column>
							<el-table-column prop="store_in_price" label="费用"></el-table-column>
						</el-table>
						<br v-if="scope.row.s_type != '2' && scope.row.s_type != '4'">
						<el-table show-summary :summary-method="getSummaries" v-if="scope.row.settlement_store_ins.length != 0 && scope.row.store_price != '0.0'" :data="scope.row.settlement_store_ins" border style="width: 100%">
							<el-table-column type="index" width="55"></el-table-column>
							<el-table-column prop="day" label="天数"></el-table-column>
							<el-table-column prop="fnsku" label="fnsku"></el-table-column>
							<el-table-column prop="sum" label="数量"></el-table-column>
						</el-table>
						<br v-if="scope.row.store_price != '0.0'">
						<el-table v-if="scope.row.settlement_charges.length != 0" :data="scope.row.settlement_charges" border style="width: 100%">
							<el-table-column prop="price" label="价格"></el-table-column>
							<el-table-column prop="remark" label="备注"></el-table-column>
						</el-table></template>
						<template v-if="scope.row.s_type == '5'">
						<el-table v-if="scope.row.settlement_charges.length != 0" :data="scope.row.settlement_charges" border style="width: 100%">
							<el-table-column prop="price" label="价格"></el-table-column>
							<el-table-column prop="remark" label="备注"></el-table-column>
						</el-table></template>
					</template>
				</el-table-column>
				<el-table-column prop="usercode" label="用户"></el-table-column>
				<el-table-column label="批次号/出库单号">
					<template slot-scope="scope">
						<span v-if="scope.row.batch_store_in != null">{{scope.row.batch_store_in.batch_number}}</span>
						<span v-else-if="scope.row.s_type == 2 ">{{'hwc_' + scope.row.outbound_order_id}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="total_price_dollar" label="费用(美元)"></el-table-column>
				<el-table-column prop="total_price_cny" label="费用(人民币)"></el-table-column>
				<el-table-column prop="exchange_rate" label="汇率"></el-table-column>
				<el-table-column prop="discount" label="折扣"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
				<el-table-column prop="status" label="类型">
					<template slot-scope="scope">
						<el-tag :type="scope.row.s_type | statusFilter">{{getStatusName(scope.row.s_type)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="check" label="状态">
					<template slot-scope="scope">
						<el-tag v-if="scope.row.check == true" type="success">已支付</el-tag>
						<el-tag v-else-if="scope.row.check == false" type="warning">未支付</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="140" show-overflow-tooltip>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<!-- <el-dropdown-item>
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item> -->
								<el-dropdown-item>
									<el-button @click="confirmCheck(scope.row)" type="text">结算</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handelEdit(scope.row)" type="text">编辑</el-button>
								</el-dropdown-item>
								<!-- <el-dropdown-item>
									<el-button @click="addSettlement(scope.row)" type="text">添加</el-button>
								</el-dropdown-item> -->
								<el-dropdown-item>
									<el-button @click="deleteConfirm(scope.row)" type="text">删除</el-button>
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
		<el-dialog title="详情" :visible.sync="detailVisible" width="60%">
			<div style="text-align:center;">
				<el-tag type="warning" size="max">总费用：{{total_price}}美元</el-tag>
			</div>
			<br>
			<el-table :data="form.charge_standard" border style="width: 100%">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column label="入库收费标准" v-if="form.settlement_details[0].s_type == '1' || form.settlement_details[0].s_type == '3'">
					<template slot-scope="scope">
						<span v-if="scope.row.by_box == false">每个收费{{scope.row.store_in_fee}}美元</span>
						<span v-else-if="scope.row.by_box == true">每箱收费{{scope.row.store_in_fee}}美元</span>
					</template>
				</el-table-column>
				<el-table-column label="出库收费标准" v-if="form.settlement_details[0].s_type == '2' || form.settlement_details[0].s_type == '3'">
					<template slot-scope="scope">
						<span >箱子{{scope.row.box_fee}}美元一个，换箱费{{scope.row.change_box_fee}}美元一个，换标费{{scope.row.change_label_fee}}美元一个</span>
					</template>
				</el-table-column>
				<el-table-column label="仓储收费标准" v-if="form.settlement_details[0].s_type == '4'">
					<template slot-scope="scope">
						<span>每{{scope.row.cube}}方{{scope.row.day}}天收费{{scope.row.store_fee}}美元</span>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-table v-if="form.settlement_details.length != 0 && form.settlement_details[0].s_type != '1' && form.settlement_details[0].s_type != '4'" :data="form.settlement_details" border style="width: 100%">
				<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
				<el-table-column prop="box_price" label="箱子费用"></el-table-column>
				<el-table-column prop="change_box_price" label="换箱费用"></el-table-column>
				<el-table-column prop="label_change_sum" label="换标数量"></el-table-column>
				<el-table-column prop="label_change_price" label="换标费用"></el-table-column>
				<el-table-column prop="store_price" label="仓储费"></el-table-column>
			</el-table>
			<br v-if="form.settlement_details[0].s_type != '1' && form.settlement_details[0].s_type != '4'">
			<el-table v-if="form.store_ins.length != 0" :data="form.store_ins" border style="width: 100%">
				<el-table-column prop="batch_number" label="批次号"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="order_number" label="订单号"></el-table-column>
				<el-table-column prop="total_plan_sum" label="总计划数量"></el-table-column>
				<el-table-column prop="total_arrive_sum" label="实际到达数量"></el-table-column>
			</el-table>
			<br v-if="form.store_ins.length != 0">
			<el-table v-if="form.settlement_details.length != 0 && form.settlement_details[0].s_type != '2' && form.settlement_details[0].s_type != '4'" :data="form.settlement_details" border style="width: 100%">
				<el-table-column prop="store_in_sum" label="入库数量"></el-table-column>
				<el-table-column prop="store_in_price" label="费用"></el-table-column>
			</el-table>
			<br v-if="form.settlement_details[0].s_type != '2' && form.settlement_details[0].s_type != '4'">
			<el-table show-summary :summary-method="getSummaries" v-if="form.settlement_store_ins.length != 0 && form.settlement_details[0].store_price != '0.0'" :data="form.settlement_store_ins" border style="width: 100%">
				<el-table-column type="index" width="55"></el-table-column>
				<!-- <el-table-column prop="cube" label="立方数"></el-table-column> -->
				<el-table-column prop="day" label="天数"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
				<!-- <el-table-column prop="store_price" label="仓储费"></el-table-column> -->
			</el-table>
			<br v-if="form.settlement_details[0].store_price != '0.0'">
			<el-table v-if="form.settlement_charges.length != 0" :data="form.settlement_charges" border style="width: 100%">
				<el-table-column prop="price" label="价格"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
			</el-table>
		</el-dialog>

		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible2" width="60%">
			<div style="text-align:center;">
				<el-tag type="warning" size="max">总费用：{{total_price}}美元</el-tag>
			</div>
			<br>
			<el-table v-if="form.settlement_charges.length != 0" :data="form.settlement_charges" border style="width: 100%">
				<el-table-column prop="price" label="价格"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
			</el-table>
		</el-dialog>

		<!-- 添加结算提示框 -->
		<el-dialog title="结算" :visible.sync="settlementVisible" width="65%">
			<el-table :data="pricetable" border style="width: 100%">
				<el-table-column label="价格">
					<template slot-scope="scope">
						<el-input-number :min="0" :precision="2" :step="10" v-model="scope.row.price"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="备注">
					<template scope="scope">
						<el-input placeholder="请输入备注" v-model.trim="scope.row.price_remark">
						</el-input>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-form label-width="60px">
				<div class="newPrice">
					<el-button @click="createPrice">添加价格</el-button>
					<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
				</div>
				<br>
				<el-form-item label="汇率">
					<el-input-number :min="0" :precision="5" :step="0.01" v-model="exchange_rate"></el-input-number>
				</el-form-item>
				<el-form-item label="折扣">
					<el-input-number :min="0" :max="1" :precision="5" :step="0.01" v-model="discount"></el-input-number>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="settlementVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveSettlement()" :disabled="submitDisable">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改提示框 -->
		<el-dialog title="修改" :visible.sync="editVisible" width="30%">
			<el-form label-width="60px">
				<el-form-item label="汇率">
					<el-input-number :min="0" :precision="5" :step="0.01" v-model="exchange_rate"></el-input-number>
				</el-form-item>
				<el-form-item label="折扣">
					<el-input-number :min="0" :max="1" :precision="5" :step="0.01" v-model="discount"></el-input-number>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveEdit()" :disabled="submitDisable">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	import global_ from '../common/cookie'
	export default {
//		name: 'WareManage',
		data: function() {
			return {
				cur_page: 1,
				pagesize: 20,
				tableData: [],
				totals: 0,
				detailVisible: false,
				form: {
					settlement_details: [{'s_type': ''}],
					store_ins: [],
					settlement_charges: [],
					settlement_store_ins: [],
					charge_standard: []
				},
				search_fnsku: '',
				paginationShow: true,
				pickerOptions2: {
				shortcuts: [{
				  text: '最近一周',
				  onClick(picker) {
				    const end = new Date();
				    const start = new Date();
				    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
				    picker.$emit('pick', [start, end]);
				  }
				}, {
				  text: '最近一个月',
				  onClick(picker) {
				    const end = new Date();
				    const start = new Date();
				    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
				    picker.$emit('pick', [start, end]);
				  }
				}, {
				  text: '最近三个月',
				  onClick(picker) {
				    const end = new Date();
				    const start = new Date();
				    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
				    picker.$emit('pick', [start, end]);
				  }
				}]
				},
				date_filter: [],
				query: undefined,
				loading: false,
				user_page: 1,
				user_total: 0,
				select_cate: '',
				options: [],
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
				options2: [],
				typeSelect: '',
				typeOptions: [{value: 1, label: '入库费'}, {value: 2, label: '出库费'}, {value: 3, label: '入库即出库费'}, {value: 4, label: '仓储费'}, {value: 5, label: '其他费用'}],
				paySelect: '',
				payOptions: [{value: 1, label: '已支付'}, {value: 0, label: '未支付'}],
				pricetable: [],
				pricetable: [{
					price: 0,
					remark: ''
				}],
				pricetabletemp: {
					price: 0,
					remark: ''
				},
				settlementVisible: false,
				remark: '',
				submitDisable: false,
				user_id: '',
				detailVisible2: false,
				total_price: '',
				editVisible: false,
				exchange_rate: 7,
				discount: 1,
			}
		},
		created() {
			this.getData()
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
				if(this.pricetable.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			},
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
//					2: 'info',
					1: 'success',
					2: 'warning',
					4: 'danger',
					3: 'default',
				}
				return statusMap[status]
			},
		},
		methods: {
			handleCurrentChange(val) {
				this.cur_page = val
				this.getData()
			},
			handleSelectionChange(val) {
				this.multipleSelection = val
			},
			getData() {
				let date_begin_temp = this.date_filter[0]
                let date_end_temp = this.date_filter[1]
                if(this.date_filter.length == 0) {
                    date_begin_temp = ''
                    date_end_temp = ''
                }
				this.$axios.get('/admin/settlement_records?page=' + this.cur_page + '&check=' + this.paySelect + '&s_type=' + this.typeSelect + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							let tempcode =  String(data.user_id%1000)
							let tempindex = parseInt(data.user_id/1000)
							if(tempcode.length ==1) {
								tempcode = '00' + tempcode
							}else if(tempcode.length ==2) {
								tempcode = '0' + tempcode
							}else{

							}
							data.usercode = this.code[tempindex] + tempcode
							data.total_price_dollar = 0
							data.total_price_cny = 0
							data.settlement_charges.forEach((data2) => {
								data.total_price_dollar += parseFloat(Number(data2.price))
							})
							data.total_price_dollar += parseFloat(Number(data.box_price) + Number(data.change_box_price) + Number(data.label_change_price) + Number(data.store_in_price) + Number(data.store_price))
							data.total_price_dollar = Math.round((data.total_price_dollar * data.discount) * 100) / 100
							data.total_price_cny = Math.round((data.total_price_dollar * data.exchange_rate) * 100) / 100
						})
						// res.data.data.forEach((data) => {
						// 	data.sum = 0
						// 	data.lock_sum = 0
						// 	data.cargo_ware_houses.forEach((data2) => {
						// 		data2.name = data.name
						// 		data.sum += data2.sum
						// 		data.lock_sum += data2.lock_sum
						// 	})
						// })
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			filter_settlement() {
				this.paginationShow = false
				this.cur_page = 1
				let date_begin_temp = this.date_filter[0]
                let date_end_temp = this.date_filter[1]
                if(this.date_filter.length == 0) {
                    date_begin_temp = ''
                    date_end_temp = ''
                }
				this.$axios.get('/admin/settlement_records?page=' + this.cur_page + '&fnsku=' + this.search_fnsku + '&check=' + this.paySelect + '&s_type=' + this.typeSelect + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							let tempcode =  String(data.user_id%1000)
							let tempindex = parseInt(data.user_id/1000)
							if(tempcode.length ==1) {
								tempcode = '00' + tempcode
							}else if(tempcode.length ==2) {
								tempcode = '0' + tempcode
							}else{

							}
							data.usercode = this.code[tempindex] + tempcode
							data.total_price_dollar = 0
							data.total_price_cny = 0
							data.settlement_charges.forEach((data2) => {
								data.total_price_dollar += parseFloat(Number(data2.price))
							})
							data.total_price_dollar += parseFloat(Number(data.box_price) + Number(data.change_box_price) + Number(data.label_change_price) + Number(data.store_in_price) + Number(data.store_price))
							data.total_price_dollar = Math.round((data.total_price_dollar * data.discount) * 100) / 100
							data.total_price_cny = Math.round((data.total_price_dollar * data.exchange_rate) * 100) / 100
						})
						// res.data.data.forEach((data) => {
						// 	data.sum = 0
						// 	data.lock_sum = 0
						// 	data.cargo_ware_houses.forEach((data2) => {
						// 		data2.name = data.name
						// 		data.sum += data2.sum
						// 		data.lock_sum += data2.lock_sum
						// 	})
						// })
						this.tableData = res.data.data
						this.totals = res.data.count
					}
					this.paginationShow = true
				}).catch((res) => {
					console.log(res)
				})
			},
			clear_filter() {
				this.paginationShow = false
				this.cur_page = 1
				this.paySelect = ''
				this.typeSelect = ''
				this.select_cate = ''
				this.getData()
			},
			detailsShow(index, row) {
				this.total_price = row.total_price_dollar
				if(row.s_type == 5) {
					this.form.settlement_charges = row.settlement_charges,
					this.detailVisible2= true
					return
				}
				this.idx = index;
				const item = this.tableData[index];
				
				this.form = {
					store_ins: item.store_ins,
					settlement_charges: item.settlement_charges,
					settlement_details: [item],
					settlement_store_ins: item.settlement_store_ins,
					charge_standard: [item.charge_standard]
				}
				this.detailVisible = true
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_done_at(row, column) {
				if(row.done_time != null) {
					return row.done_time.substr(0, 19);
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
						console.log(res)
						// console.log('失败')
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
			confirmCheck(row) {
				this.$confirm('结算后不可修改, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'danger'
				}).then(() => {
					this.$axios.patch('/admin/settlement_records/' + row.id, '', {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.$message.success('结算成功！')
						}
					}).catch((res) => {
						console.log('error')
					})
				}).catch(() => {
					this.$message.info('已取消结算')
				})
			},
			deleteConfirm(row) {
				this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'danger'
				}).then(() => {
					this.$axios.delete('/admin/settlement_records/' + row.id, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.$message.success('删除成功！')
						}
					}).catch((res) => {
						console.log('error')
					})
				}).catch(() => {
					this.$message.info('已取消删除')
				})
			},
			createPrice() {
				this.pricetable.push(this.pricetabletemp)
				this.pricetabletemp = {
					price: 0,
					remark: ''
				}
			},
			back() {
				this.pricetable.pop(this.pricetabletemp)
			},
			saveSettlement() {
				let price = []
				let price_remark = []
				let isNull = 0
				this.pricetable.forEach((data) => {
					if(data.price == 0 || data.price_remark == null || data.price_remark == '') {
						isNull = 1
					}
					price.push(data.price)
					price_remark.push(data.price_remark)
				})
				if(isNull == 1) {
					this.$message.info('价格和备注不能为空，请核对！')
					return
				}
				this.submitDisable = true
				let params = {
					user_id: this.user_id,
					price: price,
					price_remark: price_remark,
					remark: this.remark,
					exchange_rate: this.exchange_rate,
					discount: this.discount
				}
				this.$axios.post('/admin/settlement_records', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.select_cate = ''
						this.getData()
						this.settlementVisible = false;
					}
				}).catch((res) => {
					console.log('error')
				}).finally(() => {
					this.submitDisable = false
				})
			},
			addSettlement(row) {
				if(this.select_cate == '') {
					this.$message.info('请选择用户')
					return
				}
				this.remark = ''
				this.user_id = this.select_cate
				this.exchange_rate = 7
				this.discount = 1
				this.pricetable = [{
					price: 0,
					remark: ''
				}]
				this.settlementVisible = true
			},
			handelEdit(row){
				this.idx = row.id
				this.exchange_rate = row.exchange_rate
				this.discount = row.discount
				this.editVisible = true
			},
			saveEdit(){
				this.submitDisable = true
				let params = {
					exchange_rate: this.exchange_rate,
					discount: this.discount,
				}
				this.$axios.post('/admin/settlement_records/' + this.idx + '/change_info', params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.getData()
						this.editVisible = false;
					}
				}).catch((res) => {
					console.log('error')
				}).finally(() => {
					this.submitDisable = false
				})
			},
			getSummaries(param) {
				const { columns, data } = param;
				const sums = [];
				columns.forEach((column, index) => {
					if (index === 0) {
					sums[index] = '总计';
					return;
					}
					if (index === 3) {
						const values = data.map(item => Number(item[column.property]));
						if (!values.every(value => isNaN(value))) {
							sums[index] = values.reduce((prev, curr) => {
								const value = Number(curr);
								if (!isNaN(value)) {
									return prev + curr;
								} else {
									return prev;
								}
							}, 0);
							if(index === 3) {
								sums[index] += ' 个';
							}
							} else {
								sums[index] = 'N/A';
							}
					}
				});
				return sums;
			},
			getStatusName(status) {
				if(status == 1) {
					return "入库费"
				}else if (status ==2) {
					return "出库费"
				}else if (status == 3) {
					return "入库即出库费"
				}else if (status == 4) {
					return "仓储费"
				}else if (status == 5) {
					return "其他费用"
				}else {
					return "其他"
				}
			},
		},
		components: {
			"infinite-loading": VueInfiniteLoading,
		},
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
	.newPrice {
		text-align: center;
	}
</style>