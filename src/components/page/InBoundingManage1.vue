<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 入库管理</el-breadcrumb-item>
				<el-breadcrumb-item>入库单详情</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<template v-if="$route.params.type == '待完成'">
					<el-button type="primary" @click="checkBatch">批量审核</el-button>
				</template>
				<div class="inbound_filter">
					物流单号:
					<el-input v-model="search_logistics_number" placeholder="请输入物流单号" class="handle-select mr10 batch_box"></el-input>
					批次号:
					<el-select v-model="select_batch" filterable remote :loading="loading2" placeholder="选择批次" class="handle-select mr10 batch_box" @visible-change="batchVisible" :remote-method="remoteMethodBatch">
						<el-option v-for="item in batchoptions" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite_batch" ref="infiniteLoading2"></infinite-loading>
					</el-select>
					FNSKU:
					<el-input v-model="search_fnsku" placeholder="请输入FNSKU" class="handle-select mr10 batch_box"></el-input>
					<!-- 批次:
					<el-select v-model="select_batch" placeholder="选择批次" class="handle-select mr10 batch_box">
						<el-option v-for="item in batchoptions" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite_batch" ref="infiniteLoading2"></infinite-loading>
					</el-select> -->
					状态:
					<el-select v-model="statusSelect" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_inbound" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<!--<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">-->
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="追踪编码" width="150">
				</el-table-column>
				<el-table-column prop="batch_number" label="申请批次" width="100">
				</el-table-column>
				<el-table-column prop="order_number" label="订单编码" width="100">
				</el-table-column>
				<el-table-column prop="total_plan_sum" label="计划数量" width="120">
				</el-table-column>
				<el-table-column prop="total_arrive_sum" label="接收数量" width="120">
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>				
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
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

		<!-- 详情弹出框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%">
			<template v-if="need_check">
				<div class="check_button">
					<el-button type="primary" @click="check">通过审核</el-button>
				</div>
				<br>
			</template>
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
		// name: 'inbounds_manage',
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
				statusOptions: [{value: '', label: '全部'}, {value: 7, label: '待入库'}, {value: 4, label: '已入库'}, {value: 5, label: '待删除'},],
				statusOptions2: [{value: '', label: '全部'}, {value: 4, label: '已入库'}, {value: 6, label: '已结算'}, {value: 5, label: '待删除'},],
				statusSelect: '',
				search_logistics_number: '',
				need_check: false,
				loading2: '',
				query2: undefined
			}
		},
		created() {
			this.getData()
			this.getBatch()
		},
		// watch: {
		// 	"$route": "getData"
		// },
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
					1: 'warning',
					4: 'success',
					5: 'danger',
					7: 'warning'
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
				this.getData()
			},
			// 获取 easy-mock 的模拟数据
			getData() {
				if(process.env.NODE_ENV === 'development') {
				};
				// if (!this.$route.params.batch_store_in_id) {
    //                 this.$route.params.batch_store_in_id = ''
    //             }
				if (this.$route.params.status == 'incomplete') {
					this.statusOptions = this.statusOptions
				} else {
					this.statusOptions = this.statusOptions2
				}
				this.$axios.get('/store_ins?page=' + this.cur_page + '&is_quick=0&s_status=1' + '&fnsku=' + this.search_fnsku + '&logistics_number=' + this.search_logistics_number + '&status=' + this.statusSelect + '&batch_store_in_id=' + this.select_batch, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
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
			filter_inbound() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/store_ins?page=' + this.cur_page + '&is_quick=0&s_status=1' + '&fnsku=' + this.search_fnsku + '&logistics_number=' + this.search_logistics_number + '&status=' + this.statusSelect + '&batch_store_in_id=' + this.select_batch, {
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
			clear_filter() {
				this.paginationShow = false
				this.cur_page = 1
				this.search_logistics_number = ''
				this.search_fnsku = ''
				this.statusSelect = ''
				this.select_batch = ''
				this.getData()
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
			dataFilterBatchFirst() {
				if(this.select_batch == -1) {
					this.search_fnsku = ''
					this.select_batch = ''
					this.paginationShow = false
					this.cur_page = 1
					this.getData()
					return
				}
				this.paginationShow = false
				this.$axios.get('/store_ins?page=' + this.cur_page + '&batch_store_in_id=' + this.select_batch + '&fnsku=' + this.search_fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
						this.paginationShow = true
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			dataFilterBatch() {
				this.$axios.get('/store_ins?page=' + this.cur_page + '&batch_store_in_id=' + this.select_batch, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData = res.data.data
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			batchVisible(visible){
				if(visible){
					this.query2 = undefined
				  	this.remoteMethodBatch("")
				}  
			},
			onInfinite_batch(obj) {
				if((this.batch_page * 20) < this.batch_total) {
					this.batch_page += 1
					this.remoteMethodBatch(this.query2,obj.loaded)
//					this.getUser(obj.loaded)
				} else {
					obj.complete()
					console.log(obj.complete())
				}
			},
			remoteMethodBatch(query,callback=undefined){
				if(query != "" || this.query2 != "" || callback){
					let reload = false
					if(this.query2 != query){
						this.loading2 = true
						this.batch_page = 1
						this.query2 = query
						reload = true
						if(this.$refs.infiniteLoading2.isComplete){
							this.$refs.infiniteLoading2.stateChanger.reset()
						}
					}
					console.log(this.user_page)
					this.$axios.get("/batch_store_ins?batch_number=" + query.trim()+"&page="+this.batch_page, {
						headers: {
						'Authorization': localStorage.getItem('token')
					},
					}).then((res) => {
						if(res.data.code == 200){
							console.log(res.data.data)
							this.loading2 = false
//							this.options = res.data.data
							if(reload){
//								this.user_page = 1
								this.batchoptions = res.data.data
							}else{
								this.batchoptions = this.batchoptions.concat(res.data.data)
							}
//							this.options = this.options.concat(res.data.data)
							this.batch_total = res.data.count
							if(callback){
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
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
			//          formatter(row, column) {
			//              return row.address;
			//          },
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
				this.need_check = false
				if (row.status == '1') {
					this.need_check = true
				}
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
			checkBatch() {
                if(this.multipleSelection.length == 0) {
                    this.$message.error('请选择至少一个任务')
                    return
                }
                this.$confirm('确认审核通过?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    let id = []
                    this.multipleSelection.forEach((data) => {
                        id.push(data.id)
                    })
                    let params = {
                        ids: id,
                    }
                    this.$axios.post('/store_ins/batch_check', params,{
                     headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                    }).then((res) => {
                        if(res.data.code == 200) {
                            this.$message.success('审核成功!')
                            this.getData()
                        }
                    }).catch((res) => {

                    })
                }).catch(() => {
                    this.$message.info('已取消审核')
                })
            },
			getStatusName(status) {
				if(status == 1) {
					return "待审核"
				}else if (status == 2) {
					return "被删除"
				}else if (status == 3) {
					return "删除"
				}else if (status == 4) {
					return "已入库"
				}else if (status == 6) {
					return "已结算"
				} else if(status == 5) {
					return "删除待审核"
				}else if (status == 7) {
					return "等待入库"
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
</style>