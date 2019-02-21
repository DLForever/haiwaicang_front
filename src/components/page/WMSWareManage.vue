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
                    库位:
                    <el-input style="width:150px" placeholder="请输入库位" v-model.trim="warename"></el-input>
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
        <el-dialog title="详情" :visible.sync="detailVisible" width="60%">
			<el-table :data="form.cargo_ware_houses" border style="width: 100%">
				<el-table-column prop="name" label="库位"></el-table-column>
				<el-table-column prop="fnsku" label="产品名称"></el-table-column>
				<el-table-column prop="sum" label="数量" width="250">
					<template slot-scope="scope">
						<template v-if="scope.row.edit">
							<el-input v-model="scope.row.sum" class="edit-input" size="small"/>
							<el-button class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">取消</el-button>
						</template>
						<span v-else>{{scope.row.sum}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="lock_sum" label="锁定数量"></el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button v-if="scope.row.edit" :disabled="submitDisabled" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">确认</el-button>
						<el-button v-else type="primary" size="small" icon="el-icon-edit" @click="scope.row.edit=!scope.row.edit">编辑</el-button>
					</template>
				</el-table-column>
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
				warename: '',
				submitDisabled: false
			}
		},
		created() {
			this.getData()
		},
		watch: {
			"$route": "getData",
			"search_fnsku": "clear_warename",
			"warename": "clear_fnsku"
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
				this.$axios.get('/admin/warehouses?page=' + this.cur_page + '&fnsku=' + this.search_fnsku + '&name=' + this.warename, {
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
								data2.edit = false
								data2.originalSum = data2.sum
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
				this.$axios.get('/admin/warehouses?page=' + this.cur_page + '&fnsku=' + this.search_fnsku + '&name=' + this.warename, {
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
								data2.edit = false
								data2.originalSum = data2.sum
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
				this.warename = ''
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
			clear_warename() {
				this.warename = ''
			},
			clear_fnsku() {
				this.search_fnsku = ''
			},
			cancelEdit(row) {
				row.sum = row.originalSum
				row.edit = false
			},
			confirmEdit(row) {
				this.submitDisabled = true
                let params = {
                    cargo_ware_house_id: row.id,
                    sum: row.sum
                }
                this.$axios.patch('/admin/warehouses/' + row.ware_house_id, params,{
                     headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("修改成功")
                        row.originalSum = row.sum
                        row.edit = false
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
			}
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

    .edit-input {
	  	padding-right: 100px;
	}

	.cancel-btn {
	  	position: absolute;
	  	right: 15px;
	  	top: 10px;
	}
</style>