<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 入库管理</el-breadcrumb-item>
				<el-breadcrumb-item>待完成</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<div class="inbound_filter">
					批次:
					<el-input v-model="select_batch" placeholder="请输入批次号" class="handle-select mr10 batch_box"></el-input>
					<!-- <el-select v-model="select_batch" placeholder="选择批次" class="handle-select mr10 batch_box">
						<el-option v-for="item in batchoptions" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite_batch" ref="infiniteLoading2"></infinite-loading>
					</el-select> -->
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_BatchData" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-table :data="scope.row.batch_store_in_infos">
							<el-table-column prop="fnsku" label="fnsku"></el-table-column>
							<el-table-column prop="total" label="总数量" ></el-table-column>
							<el-table-column prop="waiting_sum" label="待入库数量" ></el-table-column>
							<el-table-column prop="done_sum" label="已入库数量" width="120">
							</el-table-column>
							<el-table-column prop="done_diff_sum" label="入库差异" width="120">
							</el-table-column>
							<el-table-column prop="putaway_sum" label="已上架数量" width="120">
							</el-table-column>
							<el-table-column prop="miss_sum" label="未接收数量" width="120">
							</el-table-column>
							<el-table-column prop="defect_sum" label="次品数量" width="120">
							</el-table-column>
							<el-table-column prop="diff_sum" label="差异" width="120">
							</el-table-column>
						</el-table>
					</template>
				</el-table-column>
				<el-table-column prop="batch_number" label="申请批次">
					<template slot-scope="scope">
						<span class="link-type" @click="showInbound(scope.$index, scope.row, 'incomplete')">{{scope.row.batch_number}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="total" label="批次总数量" width="120">
				</el-table-column>
				<el-table-column prop="waiting_sum" label="待入库数量" width="120">
				</el-table-column>
				<el-table-column prop="done_sum" label="已入库数量" width="120">
				</el-table-column>
				<el-table-column prop="done_diff_sum" label="入库差异" width="120">
				</el-table-column>
				<el-table-column prop="miss_sum" label="未接收数量" width="120">
				</el-table-column>
				<el-table-column prop="status" label="状态">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间" width="140">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间" width="140">
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
								<el-dropdown-item>
									<el-button @click="showInbound(scope.$index, scope.row)" type="text">查看入库单</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
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

		<!-- 详情弹出框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%">
			<div class="check_button">
				<el-button type="primary" @click="check">通过审核</el-button>
			</div>
			<br>
			<el-table :data="ware_details" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="plan_sum" label="计划数量"></el-table-column>
				<el-table-column prop="arrive_sum" label="实际到达数量"></el-table-column>
			</el-table>
		</el-dialog>

		<!-- 删除提示框 -->
		<el-dialog title="提交删除请求" :visible.sync="delVisible" width="35%">
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="备注" prop="remark">
					<el-input v-model.trim="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteInbound('form')">确 定</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	export default {
		//      name: 'inbounds_manage',
		data() {
			return {
				url: './static/vuetable.json',
				tableData: [],
				cur_page: 1,
				batch_page: 1,
				pagesize: 20,
				multipleSelection: [],
				// batchoptions: [{id: -1, batch_number: "所有批次"},],
				batchoptions: [],
				batch_total: 0,
				select_batch: '',
				select_cate: '',
				select_word: '',
				totals: 0,
				detail_id: undefined,
				del_list: [],
				is_search: false,
				detailVisible: false,
				delVisible: false,
				paginationShow: false,
				search_fnsku: '',
				ware_details: [],
				form: {
					remark: ''
				},
				idx: -1,
				rules: {
					remark: [{
						required: true,
						message: '请输入删除备注',
						trigger: 'blur'
					}],
				},
				statusOptions: [{value: 1, label: '待审核'}, {value: 7, label: '待入库'}, {value: 4, label: '已入库'}, {value: 6, label: '已结算'}, {value: 5, label: '待删除'},],
				statusSelect: '',
			}
		},
		created() {
			this.getBatchData()
			this.getBatch()
			this.getNotify()
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
					8: 'warning',
					4: 'success',
					5: 'danger',
					7: 'warning',
					6: 'success'
				}
				return statusMap[status]
			},
		},
		methods: {
			handleSizeChange(val) {
				this.pagesize = val;
			},
			// 分页导航
			handleCurrentChange(val) {
				this.cur_page = val;
				this.getBatchData()
			},
			// 获取 easy-mock 的模拟数据
			getBatchData() {
				this.$axios.get('/batch_store_ins?page=' + this.cur_page + '&batch_number=' + this.select_batch + '&status=in&is_quick=1', {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.total = 0
							data.waiting_sum = 0
							data.done_sum = 0
							data.putaway_sum = 0
							data.defect_sum = 0
							data.miss_sum = 0
							data.done_diff_sum = 0
							data.batch_store_in_infos.forEach((data2) => {
								data.total += data2.total
								data.waiting_sum += data2.waiting_sum
								data.done_sum += data2.done_sum
								data.putaway_sum += data2.putaway_sum
								data.defect_sum += data2.defect_sum
								data.miss_sum += data2.miss_sum
								data.done_diff_sum += data2.done_diff_sum
								data2.diff_sum = data2.done_sum - data2.putaway_sum - data2.defect_sum
							})
							data.diff_sum = data.done_sum - data.putaway_sum - data.defect_sum
						})
						this.tableData = res.data.data;
						this.totals = res.data.count
						this.paginationShow = true
					}
					
				}).catch((res) => {
					console.log(res)
				})
			},
			getData() {
				if(process.env.NODE_ENV === 'development') {
				};
				this.$axios.get('/store_ins?page=' + this.cur_page + '&batch_store_in_id=' + this.select_batch + '&fnsku=' + this.search_fnsku + '&status=1', {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
					//                  page: this.cur_page
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data;
						this.totals = res.data.count
						this.paginationShow = true
					}
					
				}).catch((res) => {
					console.log(res)
				})
			},
			filter_BatchData() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/batch_store_ins?page=' + this.cur_page + '&batch_number=' + this.select_batch + '&status=in&is_quick=1', {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							data.total = 0
							data.waiting_sum = 0
							data.done_sum = 0
							data.putaway_sum = 0
							data.defect_sum = 0
							data.miss_sum = 0
							data.done_diff_sum = 0
							data.batch_store_in_infos.forEach((data2) => {
								data.total += data2.total
								data.waiting_sum += data2.waiting_sum
								data.done_sum += data2.done_sum
								data.putaway_sum += data2.putaway_sum
								data.defect_sum += data2.defect_sum
								data.miss_sum += data2.miss_sum
								data.done_diff_sum += data2.done_diff_sum
								data2.diff_sum = data2.done_sum - data2.putaway_sum - data2.defect_sum
							})
							data.diff_sum = data.done_sum - data.putaway_sum - data.defect_sum
						})
						this.tableData = res.data.data;
						this.totals = res.data.count
						this.paginationShow = true
					}
					
				}).catch((res) => {
					console.log(res)
				})
			},
			clear_filter() {
				this.paginationShow = false
				this.cur_page = 1
				this.select_batch = ''
				this.search_fnsku = ''
				this.statusSelect = ''
				this.getBatchData()
			},
			getBatch(callback = undefined) {
				this.$axios.get('/batch_store_ins/available_index?page=' + this.batch_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.batchoptions = this.batchoptions.concat(res.data.data)
						this.batch_total = res.data.count
						if(callback) {
							callback()
						}
					}
				})
			},
			onInfinite_batch(obj) {
				if((this.batch_page * 20) < this.batch_total) {
					this.batch_page += 1
					this.getBatch(obj.loaded)
				} else {
					obj.complete()
					console.log(obj.complete())
				}
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19);
			},
			search() {
				this.is_search = true;
			},
			filterTag(value, row) {
				return row.tag === value;
			},
			detailsShow2(index, row) {
				this.detail_id = row.id
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					product_store_ins: item.product_store_ins,
				}
				this.detailVisible = true;
			},
			detailsShow(index, row) {
				this.detail_id = row.id
				this.$axios.get('/store_ins/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code = 200) {
						res.data.data.product_store_ins.forEach((data) => {
							this.ware_details = res.data.data.product_store_ins
						})
						this.detailVisible = true
					}
				}).catch((res) => {
					console.log('error')
				})
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
			saveEdit() {
				this.detailVisible = false;
			},
			// 确定删除
			deleteRow() {
				let index = this.idx
				const item = this.tableData[index];
				this.form = {
					id: item.id
				}
				this.$axios.delete('/store_ins/' + this.form.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
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
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
			},
			check() {
				this.$axios.get('/store_ins/' + this.detail_id + '/user_check', {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("审核成功!")
						this.getData()
						this.detailVisible = false
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			deleteInbound(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let index = this.idx
						const item = this.tableData[index]
						this.form = {
							id: item.id,
							remark: this.form.remark
						}
						let params = {
							remark: this.form.remark
						}
						this.$axios.delete('/store_ins/' + this.form.id, {
							headers: {
								'Authorization': localStorage.getItem('token')
							},
							params
						}).then((res) => {
							if(res.data.code == 200) {
								this.getData()
								this.$message.success("成功提交申请")
								this.form.remark = ''
							}
						}).catch((res) => {
							this.$message.error("提交失败")
						})
						this.delVisible = false;
					} else {
						console.log("没有输入删除备注")
						return false;
					}
				})
			},
			showInbound(index, row, status) {
                this.$router.push({name: 'inbounding', params: {batch_store_in_id: row.id, status: status, type: '待完成'}});
            },
			getStatusName2(status) {
				if(status == 1) {
					return "待审核"
				}else if (status == 2) {
					return "被删除"
				}else if (status == 3) {
					return "删除"
				}else if (status == 4) {
					return "未结算"
				}else if (status == 6) {
					return "已结算"
				} else if(status == 5) {
					return "删除待审核"
				}else if (status == 7) {
					return "未完成"
				}else if (status == 8) {
					return "等待入库"
				} else {
					return "其他"
				}
			},
			getStatusName(status) {
				if(status == 1) {
					return "未使用"
				}else if (status == 2) {
					return "被删除"
				}else if (status == 3) {
					return "删除"
				}else if (status == 4) {
					return "已入库"
				}else if (status == 5) {
					return "删除待审核"
				} else if(status == 6) {
					return "已结算"
				}else if (status == 7) {
					return "待入库"
				}else if (status == 8) {
					return "待审核"
				} else {
					return "其他"
				}
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

	.check_button {
		text-align: left;
	}

	.inbound_filter {
        float: right;
    }

    .link-type,
    .link-type:focus {
      color: #337ab7;
      cursor: pointer;
    }
    .link-type:hover {
        color: rgb(32, 160, 255);
    }
</style>