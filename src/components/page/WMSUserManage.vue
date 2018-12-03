<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 用户管理</el-breadcrumb-item>
				<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<div class="fnsku_filter">
					备注:
                    <el-input style="width:150px" placeholder="用户姓名/备注" v-model.trim="search_remark"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_users" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="name" label="姓名"></el-table-column>
				<el-table-column prop="username" label="用户名"></el-table-column>
				<el-table-column prop="phone" label="电话"></el-table-column>
				<el-table-column prop="email" label="邮箱"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<!-- <el-dropdown-item>
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">编辑</el-button>
								</el-dropdown-item> -->
								<el-dropdown-item>
									<el-button @click="editRemark(scope.$index, scope.row)" type="text">编辑</el-button>
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

		 <!-- 编辑提示框 -->
        <el-dialog title="编辑" :visible.sync="detailVisible" width="50%">
        	<el-form ref="form" label-width="80px">
        		<el-form-item label="备注" required>
        			<el-input v-model.trim="remark"></el-input>
        		</el-form-item>
        	</el-form>
        	<span slot="footer" class="dialog-footer">
                <el-button @click="detailVisible = false">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :disabled="submitDisable">确 定</el-button>
            </span>
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
				remark: '',
				search_remark: '',
				paginationShow: true,
				sex: undefined,
				submitDisable: false,
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
				this.$axios.get('/admin/users/search_user?query=' + this.search_remark + '&page=' + this.cur_page, {
				// this.$axios.get('/admin/users?page=' + this.cur_page, {
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
			filter_users() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/users/search_user?query=' + this.search_remark + '&page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
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
				this.search_remark = ''
				this.getData()
			},
			detailsShow(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = row
				this.sex = String(row.sex)
				this.detailVisible = true
			},
			editRemark(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = row
				this.sex = String(row.sex)
				this.detailVisible = true
			},
			onSubmit() {
				this.submitDisable = true
				if(this.remark.trim() == '') {
					this.$message.error("请输入备注")
					return
				}
				let params = {
					remark: this.remark,
				}
				this.$axios.patch('/admin/users/' + this.form.id, params, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('更新成功')
						this.detailVisible = false
						this.getData()
						this.remark = ''
					}
					this.submitDisable = false
				}).catch((res) => {
					console.log('error')
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
</style>