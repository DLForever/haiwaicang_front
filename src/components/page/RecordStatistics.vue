<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 出入库统计</el-breadcrumb-item>
				<el-breadcrumb-item>扫描记录统计</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<div class="fnsku_filter">
					物流单号:
                    <el-input style="width:150px" placeholder="请输入物流单号" v-model.trim="logistics_number"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_ware" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="match" label="是否匹配">
					<template slot-scope="scope">
                            <el-tag type="warning" v-if="scope.row.match === true">是</el-tag>
                            <el-tag type="success" v-else-if="scope.row.match === false">否</el-tag>
                        </template>
				</el-table-column>
				<!-- <el-table-column prop="status" label="状态">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column> -->
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" show-overflow-tooltip>
				</el-table-column>
				<!-- <el-table-column label="操作" width="100">
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
				</el-table-column> -->
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>
		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%">
			<el-table :data="form.cargo_ware_houses" border style="width: 100%">
				<el-table-column prop="name" label="库位"></el-table-column>
				<el-table-column prop="fnsku" label="产品名称"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="lock_sum" label="锁定数量"></el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
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
				logistics_number: ''
			}
		},
		created() {
			// this.getData()
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
				this.$axios.get('/scan_records?page=' + this.cur_page + '&logistics_number=' + this.logistics_number, {
					headers: {
						'Authorization': localStorage.getItem('token')
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
			filter_ware() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/scan_records?page=' + this.cur_page + '&logistics_number=' + this.logistics_number, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
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
				this.logistics_number = ''
				this.date_filter = []
				// this.getData()
			},
			detailsShow(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					cargo_ware_houses: item.cargo_ware_houses,
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
			getSummaries(param) {
				const { columns, data } = param;
				const sums = [];
				columns.forEach((column, index) => {
					if (index === 0) {
					sums[index] = '总计';
					return;
					}
					if (index === 4 || index === 5) {
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
							sums[index] += ' 个';
							} else {
								sums[index] = 'N/A';
							}
					}
				// const values = data.map(item => Number(item[column.property]));
				// if (!values.every(value => isNaN(value))) {
				// 	sums[index] = values.reduce((prev, curr) => {
				// 		const value = Number(curr);
				// 		if (!isNaN(value)) {
				// 			return prev + curr;
				// 		} else {
				// 			return prev;
				// 		}
				// 	}, 0);
				// 	sums[index] += ' 元';
				// 	} else {
				// 		sums[index] = 'N/A';
				// 	}
				});

				return sums;
			},
			getStatusName(status) {
				if(status == 1) {
					return "导入库存"
				}else if (status ==2) {
					return "库存更新"
				}else if (status == 3) {
					return "库存创建"
				}else if (status == 4) {
					return "库存删除"
				}else if (status == 5) {
					return "未上架数量更新"
				}else {
					return "其他"
				}
			},
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