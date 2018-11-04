<script>
	const token = localStorage.getItem('token')
	const token_admin = localStorage.getItem('token_admin')
	const mescount = 8
	export default {
		token, //普通用户
		token_admin, //管理员
		mescount, //消息数量
//		watch: {
//			"$route": "getCookies_"
//		},
//		methods: {
//			getCookies_() {
//				const token = localStorage.getItem('token')
//				const token_admin = localStorage.getItem('token_admin')
//			}
//		}
	}
</script>