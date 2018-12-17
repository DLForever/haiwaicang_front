<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 库位管理</el-breadcrumb-item>
				<el-breadcrumb-item>库位管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<div class="fnsku_filter">
					Fnsku:
                    <el-input style="width:150px" placeholder="请输入Fnsku" v-model.trim="search_fnsku"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_ware" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="name" label="库位名称"></el-table-column>
				<el-table-column prop="sum" label="总数量"></el-table-column>
				<el-table-column prop="lock_sum" label="锁定数量"></el-table-column>
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
			<el-table :data="form.cargo_ware_houses" border style="width: 100%">
				<el-table-column prop="name" label="库位"></el-table-column>
				<el-table-column prop="fnsku" label="产品名称"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="lock_sum" label="锁定数量"></el-table-column>
				<!--<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间"></el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间"></el-table-column>-->
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
		methods: {
			handleCurrentChange(val) {
				this.cur_page = val
				this.getData()
			},
			handleSelectionChange(val) {
				this.multipleSelection = val
			},
			getData() {
				this.$axios.get('/admin/warehouses?page=' + this.cur_page + '&fnsku=' + this.search_fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.sum = 0
							data.lock_sum = 0
							data.cargo_ware_houses.forEach((data2) => {
								data2.name = data.name
								data.sum += data2.sum
								data.lock_sum += data2.lock_sum
							})
						})
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
				this.$axios.get('/admin/warehouses?page=' + this.cur_page + '&fnsku=' + this.search_fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.sum = 0
							data.lock_sum = 0
							data.cargo_ware_houses.forEach((data2) => {
								data2.name = data.name
								data.sum += data2.sum
								data.lock_sum += data2.lock_sum
							})
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
				this.search_fnsku = ''
				this.getData()
			},
			detailsShow(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					cargo_ware_houses: item.cargo_ware_houses,
				}
				this.detailVisible = true
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