UserBasic: {
	uid: bigint,
	username: varchar
	password: varchar
	telphone: varchar
	avatar: varchar
	last_time: timestamp
	create_time: datetime

}

AccountInfo: {
	uid: bigint
	diamond: bigint
	goldcoin: bigint
	last_time: timestamp
}

RechargeHistory: {
	uid: bigint
	amount: int
	transId: uuid()
	create_time: timestamp
}

roomUserInfo: {
	userNo: i,												//编号
	userId: message.ROOM.PLAYER_ID_NONE, 					//用户id
	username: '', 											//用户名
	userAvatar:'', 											//用户头像
	userAccount: 0, 										//用户帐户
	userBetFund: 0,											//用户资金
	roomPattern: message.ROOM.TABLE_PATTERN_NONE,			//房间类型
	userCards: [], 											//卡牌
	cardPattern: message.ROOM.PLAYER_INFO_NONE, 			//卡牌类型
	cardStatus: message.ROOM.PLAYER_CARD_STATUS.POSSESS,	//卡牌状态
	userStatus: message.ROOM.PLAYER_STATUS.NEW				//用户状态
}