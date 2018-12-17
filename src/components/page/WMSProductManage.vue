<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i> 产品管理</el-breadcrumb-item>
                <el-breadcrumb-item>产品管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
                <!--<el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
                    <el-option key="1" label="广东省" value="广东省"></el-option>
                    <el-option key="2" label="湖南省" value="湖南省"></el-option>
                </el-select>-->
                <!-- <el-input v-model="select_word" placeholder="筛选fnsku/产品名称" class="handle-input mr10"></el-input> -->
                <!--<el-button type="primary" icon="search" @click="search">搜索</el-button>-->
                <div class="fnsku_filter">
                    用户:
                    <el-select v-model="select_cate" filterable remote placeholder="选择用户" :loading="loading" class="handle-select mr10" @visible-change="test" :remote-method="remoteMethod">
                        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        <infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
                    </el-select>
                    店铺名:
                    <el-input style="width:150px" placeholder="请输入店铺名" v-model.trim="search_shopname"></el-input>
                    Fnsku:
                    <el-input style="width:150px" placeholder="请输入Fnsku" v-model.trim="search_fnsku"></el-input>
                    <el-button @click="clear_filter" type="default">重置</el-button>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div>
            </div>
            <br><br>
            <!--<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">-->
            <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="shopname" label="店铺名" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="erp_number" label="erp 编码" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="fnsku" label="Fnsku" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="price" label="申报价值">
                </el-table-column>
                <el-table-column prop="name" label="产品名称" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="size" label="尺寸(长*宽*高)" width="150">
                </el-table-column>
                <el-table-column prop="weight" label="重量" width="110">
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" sortable width="140">
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" sortable width="140">
                </el-table-column>
                <el-table-column prop="remark" label="备注" width="180" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-dropdown>
                            <el-button type="primary">
                                操作<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>
                                    <el-button @click="showProduct(scope.$index, scope.row)" type="text">&nbsp产品图片</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="showPackage(scope.$index, scope.row)" type="text">外包装图片</el-button>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-button @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp&nbsp编&nbsp&nbsp辑</el-button>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
            </el-table>
            <div class="pagination">
                <el-pagination v-if="paginationShow" @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="产品名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <!-- <el-form-item label="fnsku">
                    <el-input v-model="form.fnsku"></el-input>
                </el-form-item> -->
                <el-form-item label="sku">
                    <el-input v-model="form.sku"></el-input>
                </el-form-item>
                <el-form-item label="申报价值">
                    <el-input v-model="form.price"></el-input>
                </el-form-item>
                <el-form-item label="外包装尺寸">
                    <template slot-scope="scope">
                        <el-col :span="7">
                            <el-form-item prop="length">
                                <el-input v-model.trim="form.length" placeholder="长(英寸)"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="line" :span="1">-</el-col>
                        <el-col :span="7">
                            <el-form-item prop="width">
                                <el-input v-model.trim="form.width" placeholder="宽(英寸)"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="line" :span="1">-</el-col>
                        <el-col :span="7">
                            <el-form-item prop="height">
                                <el-input v-model.trim="form.height" placeholder="高(英寸)"></el-input>
                            </el-form-item>
                        </el-col>
                    </template>
                </el-form-item>
                <el-form-item label="重量">
                    <el-input v-model="form.weight"></el-input>
                </el-form-item>
                <el-form-item label="店铺名">
                    <el-input v-model="form.shopname"></el-input>
                </el-form-item>
                <el-form-item label="erp编码">
                    <el-input v-model="form.erp_number"></el-input>
                </el-form-item>
                 <el-form-item label="备注">
                    <el-input v-model="form.remark"></el-input>
                </el-form-item>
                <el-form-item label="产品图片">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="外包装图片">
                    <el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit" :disabled="submitDisabled">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 查看产品图片 -->
        <el-dialog title="产品图片" :visible.sync="productVisible" width="20%" @close="closeProduct">
            <el-table :data="picturesProductList" border style="width: 100%">
                <el-table-column prop="sum" label="产品图片">
                    <template slot-scope="scope">
                        <!-- <span>{{scope.row.url}}</span> -->
                        <img class="img_fnsku" v-if="scope.row.url.url != undefined && !(scope.row.url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.url.url"/>
                        <a v-else :href="$axios.defaults.baseURL+scope.row.url.url" target="_blank">{{scope.row.url.url.split('/').pop()}}</a>
                        <!-- <span v-else>无</span> -->
                    </template>
                    <!-- <template slot-scope="scope">
                        <img class="img_fnsku" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url" />                  
                    </template> -->
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button type="danger" @click="handleDeletePro(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            <!-- <el-carousel :interval="4000" type="card" height="200px" v-if="img_product">
                <el-carousel-item v-for="item in form.pictures">
                    <img :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <div v-if="pdf_product" v-for="item in form.pictures">
                <a target="_blank" :href="$axios.defaults.baseURL + ':3000' +item.url.url">{{'查看' + item.id + '.pdf'}}</a>
            </div> -->
            <!-- <span slot="footer" class="dialog-footer"> -->
            <!--<el-button @click="showImg = false">取 消</el-button>-->
            <!-- <el-button type="primary" @click="productVisible = false">确 定</el-button> -->
        </span>
        </el-dialog>
        <!-- 查看包装图片 -->
        <el-dialog title="包装图片" :visible.sync="packageVisible" width="20%" @close="closePackage">
            <el-table :data="picturesPackageList" border style="width: 100%">
                <el-table-column prop="sum" label="包装图片">
                    <template slot-scope="scope">
                        <!-- <span>{{scope.row.url}}</span> -->
                        <img class="img_fnsku" v-if="scope.row.url.url != undefined && !(scope.row.url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.url.url"/>
                        <a v-else :href="$axios.defaults.baseURL+scope.row.url.url" target="_blank">{{scope.row.url.url.split('/').pop()}}</a>
                        <!-- <span v-else>无</span> -->
                    </template>
                    <!-- <template slot-scope="scope">
                        <img class="img_fnsku" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url" />                  
                    </template> -->
                </el-table-column>
                
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button type="danger" @click="handleDeletePac(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- <el-carousel :interval="4000" type="card" height="200px" v-if="img_package">
                <el-carousel-item v-for="item in form.pictures">
                    <img :src="$axios.defaults.baseURL+item.url.url" />
                </el-carousel-item>
            </el-carousel>
            <div v-if="pdf_package" v-for="item in form.pictures">
                <a target="_blank" :href="$axios.defaults.baseURL + ':3000' +item.url.url">{{'查看' + item.id + '.pdf'}}</a>
            </div> -->
            <!-- <span slot="footer" class="dialog-footer"> -->
            <!--<el-button @click="showImg = false">取 消</el-button>-->
            <!-- <el-button type="primary" @click="packageVisible = false">确 定</el-button> -->
        </span>
        </el-dialog>
        <!-- 删除产品图片提示 -->
        <el-dialog title="删除产品图片" :visible.sync="confirmDelProVis" width="35%">
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="confirmDelProVis = false">取 消</el-button>
            <el-button type="danger" @click="deleteProductImg">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 删除包装图片提示 -->
        <el-dialog title="删除产品图片" :visible.sync="confirmDElPacVis" width="35%">
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="confirmDElPacVis = false">取 消</el-button>
            <el-button type="danger" @click="deletePackageImg">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
    import VueInfiniteLoading from "vue-infinite-loading"
    export default {
//      name: 'product_manage',
        data() {
            return {
                url: './static/vuetable.json',
//              url: 'package.json',
                tableData: [],
                cur_page: 1,
                pagesize: 20,
//              pagesizes:'',
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                fileList: [],
                fileList2: [],
                is_search: false,
                editVisible: false,
                delVisible: false,
                paginationShow: true,
                search_fnsku: '',
                search_shopname: '',
                totals: 1,
                form: {
                    name: '',
                    date: '',
                    address: '',
                },
                idx: -1,
                loading: false,
                query: undefined,
                options: [],
                options2: [],
                user_page: 1,
                productVisible: false,
                packageVisible: false,
                picturesProductList: [],
                picturesPackageList: [],
                product_id: undefined,
                confirmDelProVis: false,
                confirmDElPacVis: false,
                picture_id: undefined,
                submitDisabled: false
            }
        },
        created() {
            this.getData();
        },
        watch: {
        	"$route": "getData"
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
//              	let totals = tableData.length
                    let is_del = false;
//                  for (let i = 0; i < this.del_list.length; i++) {
//                      if (d.name === this.del_list[i].name) {
//                          is_del = true;
//                          break;
//                      }
//                  }
                    if (!is_del) {
                        if ((d.name.indexOf(this.select_word) > -1 ||
                                d.fnsku.indexOf(this.select_word) > -1)
                        ) {
                            return d;
                        }
                    }
                })
            }
        },
        methods: {
        	handleSizeChange(val) {
        		this.pagesize = val;
        	},
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                // 开发环境使用 easy-mock 数据，正式环境使用 json 文件
                if (process.env.NODE_ENV === 'development') {
//                  this.url = '/ms/table/list';
                };
                this.$axios.get( '/admin/products?page='+this.cur_page + '&shopname=' + this.search_shopname + '&fnsku=' + this.search_fnsku + '&user_id=' + this.select_cate, {
                	headers: {'Authorization': localStorage.getItem('token_admin')}
                },
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                        data.size = data.length + '*' + data.width + '*' + data.height
                    })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                        this.paginationShow = true
                    }
                }).catch((res) => {
                	console.log('error')
                })
            },
            filter_product() {
                this.cur_page = 1
                this.paginationShow = false
                this.$axios.get( '/admin/products?page='+this.cur_page + '&shopname=' + this.search_shopname + '&fnsku=' + this.search_fnsku + '&user_id=' + this.select_cate, {
                    headers: {'Authorization': localStorage.getItem('token_admin')}
                },
                ).then((res) => {
                    if(res.data.code == 200) {
                        res.data.data.forEach((data) => {
                        data.size = data.length + '*' + data.width + '*' + data.height
                    })
                        this.tableData = res.data.data
                        this.totals = res.data.count
                    }
                    this.paginationShow = true
                }).catch((res) => {
                    console.log('error')
                })
            },
            clear_filter() {
                this.paginationShow = false
                this.cur_page = 1
                this.select_cate = ''
                this.search_fnsku = ''
                this.search_shopname = ''
                this.getData()
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
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    id: item.id,
                    name: item.name,
                    fnsku: item.fnsku,
                    sku: item.sku,
                    price: item.price,
                    length: item.length,
                    width: item.width,
                    height: item.height,
                    weight: item.weight,
                    shopname: item.shopname,
                    erp_number: item.erp_number,
                    remark: item.remark
                }
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
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
                this.submitDisabled = true
                console.log(this.form)
                let params = {
                    remark: this.form.remark,
                }
                let formData = new FormData()
                formData.append('product[shopname]', this.form.shopname)
                formData.append('product[erp_number]', this.form.erp_number)
                // formData.append('product[fnsku]', this.form.fnsku)
                formData.append('product[name]', this.form.name)
                formData.append('product[sku]', this.form.sku)
                formData.append('product[length]', this.form.length)
                formData.append('product[width]', this.form.width)
                formData.append('product[height]', this.form.height)
                formData.append('product[weight]', this.form.weight)
                formData.append('product[price]', this.form.price)
                formData.append('product[remark]', this.form.remark)
                this.fileList.forEach((item) => {
                    formData.append('product_pictures[]', item.raw)
                })
                this.fileList2.forEach((item) => {
                    formData.append('package_pictures[]', item.raw)
                })
                let config = {
                    headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }
                this.$axios.patch('/admin/products/' + this.form.id, formData, config).then((res) => {
                    if(res.data.code == 200) {
                        this.$message.success('提交成功！')
                        this.fileList = []
                        this.fileList2 = []
                        this.getData()
                        this.editVisible = false
                    }
                    this.submitDisabled = false
                }).catch((res) => {
                    console.log('err')
                })
                // this.$axios.patch('/admin/users/' + this.form.id, params, {
                //     headers: {
                //         'Authorization': localStorage.getItem('token_admin')
                //     },
                // }).then((res) => {
                //     if(res.data.code == 200) {
                //         this.$message.success('更新成功')
                //         this.editVisible = false
                //         this.getData()
                //         this.remark = ''
                //     }
                // }).catch((res) => {
                //     console.log('error')
                // })
            },
            changeFile(file) {
                this.fileList.push(file)
            },
            handleRemove(a, b) {
                this.fileList = b
            },
            changeFile2(file) {
                this.fileList2.push(file)
            },
            handleRemove2(a, b) {
                this.fileList2 = b
            },
            changeBatch(file) {
                this.batchList.push(file)
            },
            // 确定删除
            deleteRow(){
            	let index = this.idx
            	const item = this.tableData[index];
            	this.form = {
            		id: item.id
            	}
            	this.$axios.delete('/products/'+this.form.id, 
            	{
            		headers: {'Authorization': localStorage.getItem('token_admin')}
            	}
            ).then((res) => {
            	if(res.data.code == 200){
            		this.tableData.splice(this.idx, 1)
            		this.getData()
            		this.$message.success("删除成功")           		
            	}
            }).catch((res) => {
            	this.$message.error("删除失败")
            })
                this.delVisible = false;
            },
            test(visible){
                if(visible){
                    this.query = undefined
                    this.remoteMethod("")
                }  
            },
            remoteMethod(query,callback=undefined) {
                // this.select_batch = ''
                console.log("remote")
                console.log(query)
                console.log(this.query)
                if(query != "" || this.query != "" || callback){
                    let reload = false
                    if(this.query != query){
                        this.loading = true
                        this.user_page = 1
                        this.query = query
                        reload = true
                        if(this.$refs.infiniteLoading.isComplete){
                            this.$refs.infiniteLoading.stateChanger.reset()
                        }
                    }
                    console.log(this.user_page)
                    this.$axios.get("/admin/users/search_user?query=" + query.trim()+"&page="+this.user_page, {
                        headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    },
                    }).then((res) => {
                        if(res.data.code == 200){
                            this.loading = false
//                          this.options = res.data.data
                            if(reload){
//                              this.user_page = 1
                                this.options = this.options2.concat(res.data.data)
                            }else{
                                this.options = this.options.concat(res.data.data)
                            }
//                          this.options = this.options.concat(res.data.data)
                            this.user_total = res.data.count
                            if(callback){
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
                    this.remoteMethod(this.query,obj.loaded)
//                  this.getUser(obj.loaded)
                } else {
                    obj.complete()
                    console.log(obj.complete())
                }
            },
            showProduct(index, row) {
                this.product_id = row.id
                const item = this.tableData[index]
                item.pictures.forEach((data) => {
                    if(data.remark == 'product') {
                        this.picturesProductList.push(data)
                    }
                })
                this.productVisible = true;
            },
            showPackage(index, row) {
                this.product_id = row.id
                const item = this.tableData[index]
                item.pictures.forEach((data) => {
                    if(data.remark == 'package') {
                        this.picturesPackageList.push(data)
                    }
                })
                this.packageVisible = true;
            },
            closeProduct() {
                this.productVisible = false
                this.picturesProductList = []
            },
            closePackage() {
                this.packageVisible = false
                this.picturesPackageList = []
            },
            deleteProductImg() {
                this.$axios.get('/admin/products/' + this.product_id+ '/delete_picture?picture_id=' + this.picture_id ,{
                     headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }).then((res) => {
                    if(res.data.code == 200) {
                        this.picturesProductList.splice(this.idx, 1);
                        this.getData()
                        this.$message.success("删除成功")
                        this.confirmDelProVis = false
                    }
                }).catch((res) => {

                })
            },
            deletePackageImg() {
                this.$axios.get('/admin/products/' + this.product_id+ '/delete_picture?picture_id=' + this.picture_id ,{
                     headers: {
                        'Authorization': localStorage.getItem('token_admin')
                    }
                }).then((res) => {
                    if(res.data.code == 200) {
                        this.picturesPackageList.splice(this.idx, 1);
                        this.getData()
                        this.$message.success("删除成功")
                        this.confirmDElPacVis = false
                    }
                }).catch((res) => {

                })
            },
            handleDeletePro(index, row) {
                this.picture_id = row.id
                this.idx = index;
                this.confirmDelProVis = true;
            },
            handleDeletePac(index, row) {
                this.picture_id = row.id
                this.idx = index;
                this.confirmDElPacVis = true;
            },
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
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }

    .fnsku_filter {
        float: right;
    }

    .img_fnsku {
        width:6rem;
        height:6rem;
    }
</style>
