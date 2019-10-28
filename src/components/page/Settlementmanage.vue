<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 结算记录管理</el-breadcrumb-item>
				<el-breadcrumb-item>结算详情</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<!-- <div class="handle-box">
				<div class="fnsku_filter">
					用户:
					<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
						<el-option v-for="item in options" :key="item.id" :label="item.usercode" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
					</el-select>
					<el-date-picker v-model="date_filter" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2" unlink-panels value-format="yyyy-MM-dd"></el-date-picker>
					fnsku:
					<el-input style="width:150px" placeholder="请输入fnsku" v-model.trim="search_fnsku"></el-input>
					<el-button @click="clear_filter" type="default">重置</el-button>
					<el-button @click="filter_ware" type="primary">查询</el-button>
				</div>
			</div>
			<br><br> -->
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column prop="total_price" label="费用"></el-table-column>
				<el-table-column prop="status" label="类型">
					<template slot-scope="scope">
						<el-tag :type="scope.row.s_type | statusFilter">{{getStatusName(scope.row.s_type)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" show-overflow-tooltip>
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
			<el-table v-if="form.settlement_details.length != 0 && form.settlement_details[0].s_type != '1'" :data="form.settlement_details" border style="width: 100%">
				<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
				<el-table-column prop="box_price" label="箱子费用"></el-table-column>
				<el-table-column prop="change_box_price" label="换箱费用"></el-table-column>
				<el-table-column prop="label_change_sum" label="换标数量"></el-table-column>
				<el-table-column prop="label_change_price" label="换标费用"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="form.store_ins.length != 0" :data="form.store_ins" border style="width: 100%">
				<el-table-column prop="batch_number" label="批次号"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="order_number" label="订单号"></el-table-column>
				<el-table-column prop="total_plan_sum" label="总计划数量"></el-table-column>
				<el-table-column prop="total_arrive_sum" label="实际到达数量"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="form.settlement_details.length != 0" :data="form.settlement_details" border style="width: 100%">
				<el-table-column prop="store_in_sum" label="入库数量"></el-table-column>
				<el-table-column prop="store_in_price" label="费用"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="form.settlement_charges.length != 0" :data="form.settlement_charges" border style="width: 100%">
				<el-table-column prop="price" label="价格"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="form.settlement_store_ins.length != 0 && form.settlement_details[0].store_price != '0.0'" :data="form.settlement_store_ins" border style="width: 100%">
				<el-table-column prop="cube" label="立方数"></el-table-column>
				<el-table-column prop="day" label="天数"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="store_price" label="仓储费"></el-table-column>
			</el-table>
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
					settlement_details: [],
					store_ins: [],
					settlement_charges: [],
					settlement_store_ins: []
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
			}
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
				this.$axios.get('/settlement_records?page=' + this.cur_page + '&date_begin=' + date_begin_temp +'&date_end=' + date_end_temp, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.total_price = 0
							data.settlement_charges.forEach((data2) => {
								data.total_price += parseFloat(Number(data2.price))
							})
							data.total_price += parseFloat(Number(data.box_price) + Number(data.change_box_price) + Number(data.label_change_price) + Number(data.store_in_price) + Number(data.store_price))
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			filter_ware() {
				this.paginationShow = false
				this.cur_page = 1
				let date_begin_temp = this.date_filter[0]
                let date_end_temp = this.date_filter[1]
                if(this.date_filter.length == 0) {
                    date_begin_temp = ''
                    date_end_temp = ''
                }
				this.$axios.get('/settlement_records?page=' + this.cur_page + '&date_begin=' + date_begin_temp +'&date_end=' + date_end_temp, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.total_price = 0
							data.settlement_charges.forEach((data2) => {
								data.total_price += parseFloat(Number(data2.price))
							})
							data.total_price += parseFloat(Number(data.box_price) + Number(data.change_box_price) + Number(data.label_change_price) + Number(data.store_in_price) + Number(data.store_price))
						})
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
				this.select_cate = ''
				this.date_filter = []
				this.getData()
			},
			detailsShow(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					store_ins: item.store_ins,
					settlement_charges: item.settlement_charges,
					settlement_details: [item],
					settlement_store_ins: item.settlement_store_ins
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
					this.$axios.get("/users/search_user?query=" + query.trim() + "&page=" + this.user_page, {
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
			getStatusName(status) {
				if(status == 1) {
					return "入库费"
				}else if (status ==2) {
					return "出库费"
				}else if (status == 3) {
					return "入库即出库费"
				}else if (status == 4) {
					return "仓储费"
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
</style>