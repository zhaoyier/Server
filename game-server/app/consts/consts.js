module.exports={
	OK: 200,
	TOKEN:201,
	ERROR:{
		SQL_ERROR: 10000,
		ACCOUNT: {
			ERROR_USERNAME:10001,	//login error username or password
			USERNAME_LONG: 10002,	//regist username too long
			USERNAME_FORMAT: 10003,	//regist username format error
			USERNAME_USED:10004,		//regist the username been used
			PASSWORD_INEQUALITY:10005
		},
		POKER: {
			CONFIG_ERROR: 10101
		}
	},
	TEAM:{
		TEAM_ID_NONE:0
	}
}
