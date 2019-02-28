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
        <el-dialog title="详情" :visible.sync="detailVisible" width="80%">
        	<el-button :disabled="submitDisabled" v-if="isaddWare" type="success" size="small" icon="el-icon-circle-check-outline" @click="addWarehouse">确认</el-button>
        	<el-button v-else type="primary" size="small" icon="el-icon-plus" @click="isaddWare=!isaddWare">增加</el-button>
        	<el-button v-if="isaddWare" type="warning" icon="el-icon-refresh" @click="cancelAddWare">取消</el-button>
        	<template v-if="isaddWare">
        		<el-input placeholder="请输入Fnsku" style="width:150px" v-model="addWare.fnsku"></el-input>
        		<el-input placeholder="请输入数量" style="width:150px" v-model="addWare.sum"></el-input>
        	</template>
        	<br><br>
			<el-table :data="cargo_ware_houses" border style="width: 100%">
				<el-table-column prop="usercode" label="客户编码"></el-table-column>
				<el-table-column prop="ware_house_name" label="库位">
					<template slot-scope="scope">
						<template v-if="scope.row.remove">
							<el-input v-model="scope.row.ware_house_name" class="edit-input" size="small"/>
							<el-button class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelRemove(scope.row)">取消</el-button>
						</template>
						<span v-else>{{scope.row.ware_house_name}}</span>
					</template>
				</el-table-column>
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
				<el-table-column label="操作" width="300">
					<template slot-scope="scope">
						<template v-if="!scope.row.remove">
							<el-button v-if="scope.row.edit" :disabled="submitDisabled" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">确认</el-button>
							<el-button v-else type="primary" size="small" icon="el-icon-edit" :disabled="scope.row.noshow" @click="scope.row.edit=!scope.row.edit">编辑</el-button>
							<el-button v-if="!scope.row.edit" type="danger" size="small" icon="el-icon-delete" :disabled="scope.row.noshow" @click="deleteWare(scope.$index, scope.row)">删除</el-button>
						</template>
						<template v-if="!scope.row.edit">
							<el-button v-if="scope.row.remove" type="success" size="small" icon="el-icon-circle-check-outline" :disabled="scope.row.noshow" @click="confirmRemove(scope.$index,scope.row)">确认</el-button>
							<el-button v-else type="info" size="small" icon="el-icon-sort" :disabled="scope.row.noshow" @click="scope.row.remove=!scope.row.remove">移库</el-button>
						</template>
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
				addWare: {
					fnsku: '',
					sum: '',
					warehouse: ''
				},
				search_fnsku: '',
				paginationShow: true,
				warename: '',
				submitDisabled: false,
				cargo_ware_houses: [],
				isaddWare: false,
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
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
								data2.noshow = false
								data2.remove = false
								data2.originalWare = data2.ware_house_name
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
								data2.noshow = false
								data2.remove = false
								data2.originalWare = data2.ware_house_name
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
				this.isaddWare = false
				this.addWare = {
					fnsku: '',
					sum: '',
					warehouse: ''
				}
				this.addWare.warehouse = row.name
				this.idx = row.id;
				const item = this.tableData[index];
				row.cargo_ware_houses.forEach((data) => {
					let tempcode =  String(data.user_id%1000)
					let tempindex = parseInt(data.user_id/1000)
					if(tempcode.length ==1) {
						tempcode = '00' + tempcode
					}else if(tempcode.length ==2) {
						tempcode = '0' + tempcode
					}else{

					}
					data.usercode = this.code[tempindex] + tempcode
				})
				this.cargo_ware_houses = row.cargo_ware_houses
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
			},
			addWarehouse() {
				this.submitDisabled = true
                let params = {
                    id: this.idx,
                    sum: this.addWare.sum,
                    fnsku: this.addWare.fnsku
                }
                this.$axios.post('/admin/warehouses', params,{
                     headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }).then((res) => {
                    if(res.data.code == 200) {
                    	this.getData()
                    	this.isaddWare = false
                    	this.cargo_ware_houses.push({ware_house_name: this.addWare.warehouse, fnsku: this.addWare.fnsku, sum: this.addWare.sum, lock_sum: '0', noshow: true})
                        this.$message.success("创建成功")
                    }
                }).catch((res) => {

                }).finally(() => {
                    this.submitDisabled = false
                })
			},
			cancelAddWare() {
				this.isaddWare = false
				this.addWare = {
					fnsku: '',
					sum: '',
					warehouse: ''
				}
			},
			deleteWare(index, row) {
				this.$confirm('此操作将永久删除该信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    let params = {
                        cargo_ware_house_id: row.id
                    }
                    this.$axios.delete('/admin/warehouses/' + row.ware_house_id, {
                         headers: {
                            'Authorization': localStorage.getItem('token_admin')
                        },
                        params
                    }).then((res) => {
                        if(res.data.code == 200) {
                            this.cargo_ware_houses.splice(index, 1);
                            this.getData()
                            this.$message.success("删除成功")
                        }
                    }).catch(() => {
                        
                    })
                }).catch(() => {
                    this.$message.info('已取消删除')
                })
			},
			cancelRemove(row) {
				row.sum = row.originalSum
				row.ware_house_name = row.originalWare
				row.remove = false
			},
			confirmRemove(index, row) {
				this.submitDisabled = true
                let params = {
                    cwh_id: row.id,
                    warehouse: row.ware_house_name
                }
                this.$axios.post('/admin/warehouses/' + row.ware_house_id + '/move', params,{
                     headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }).then((res) => {
                    if(res.data.code == 200) {
                        this.getData()
                        this.$message.success("移库成功")
                        this.cargo_ware_houses.splice(index, 1)
                        // row.originalWare = row.ware_house_name
                        // row.remove = false
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