module.exports = { 
    Color: {
        'HEART':0,
        'SPADE':1,
        'CLUB':2,
        'DIAMOND':3
    },  
    XXRefer: {
        REFER_HEX:16
    },  
    XXConstant: {
        UNKNOWN_ERROR: -1,
        WIN: 0,
        LOSE: 1,
        OK: 1,
        MIN_PLAYER_NUM:2,
        HAND_CARDS_NUM:3,
        CARD_COLOR: 4,
        MAX_PLAYER_NUM: 5,
		MAX_CARD_VALUE:13,
		HEX_VALUE: 16,
        MAX_HAND_NUM: 17,
        CARD_MAX: 54,
        CROSS_MAX_CARD: 55
    },  
    XXType: {
        XX_DANZHANG: 1,
        XX_DUIZI: 2,
        XX_SHUNZI: 3,
        XX_JINHUA: 4,
        XX_SHUNJIN: 5,
        XX_BAOZI: 6,
        XX_TESHU:7
    },
    /** 
    * Team
    */
    ROOM: {
        ROOM_ID_NONE: 0, // player without team(not in any team)
        PLAYER_ID_NONE: 0, // none player id in a team(placeholder)
        TABLE_ID_NONE: 0, // none area id (placeholder)
        TABLE_PATTERN_NONE: 0, //none pattern id (placeholder)
        USER_ID_NONE: 0, // none user id (placeholder)
        SERVER_ID_NONE: 0, // none server id (placeholder)
        PLAYER_CARD_PATTERN: 0, //none pattern (placeholder)
        PLAYER_INACTIVITY: 0,    //placeholder
        PLAYER_ACTIVITY: 1,
        PLAYER_INFO_NONE: '', // none player info   (placeholder)
        PLAYER_CARD_STATUS: {
            POSSESS : 0,
            ABANDON : 1,
            DISPLAY : 2,
            NOTDISPLAY : 3
        },
        JOIN_ROOM_RET_CODE: {
            OK                            : 1,    // join ok
            NO_POSITION           : -1,   // there is no position
            ALREADY_IN_ROOM   : -2,   // already in the team
            IN_OTHER_ROOM     : -3,   // already in other team
            SYS_ERROR             : -4    // system error
        }, // return code of trying to join a team

        ROOM_TITLE: {
            MEMBER: 0,
            CAPTAIN: 1
        }, // team member title(member/captain)

        JOIN_ROOM_REPLY: {
            REJECT: 0,
            ACCEPT: 1
        }, // player's replying code

        // sys return
        OK: 1,
        FAILED: 0,

        // yes / no
        YES: 1,
        NO: 0,

        DEFAULT_NAME: ''
    }
}
