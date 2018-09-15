<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> WMS批量入库管理</el-breadcrumb-item>
				<el-breadcrumb-item>批量入库</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="批量入库" name="first">
					<div class="form-box">
						<el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" multiple>
							<i class="el-icon-upload"></i>
							<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
							<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件，且不超过5M</div>
						</el-upload>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	export default {
		//		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				totals: 0,
				cur_page: 1,
				select_cate: [],
				options: [],
				product_id: '',
				remark: '',
				form: [{
					plan_sum: '',
					logistics_number: ''
				}],
				newForm: {
					fnskus: [],
					amounts: []
				},
				inputVisible: false,
				inputVisible2: false,
				isdisable: true,
				Fnskus: [],
				Fnsku: '',
				Amounts: [],
				Amount: '',
				tag: '',
				rules: {
					name1: [{
						required: true,
						message: '请输入名称',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getData();
		},
		computed: {

		},
		methods: {
			getData() {},
		},
	}
</script>

<style>
	.el-tag+.el-tag {
		margin-left: 10px;
	}
	
	.button-new-tag {
		margin-left: 10px;
		height: 32px;
		line-height: 30px;
		padding-top: 0;
		padding-bottom: 0;
	}
	
	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
	
	.newOrder {
		text-align: center;
	}
</style>