var http = require('http');
var querystring = require('querystring');
var postData = {
    uid:'hQuId9Z7YqKC',
    pas:'Id9Z7Y9',
    mob:'15201994768',
    con:'【微米网】您的验证码是：610912，3分钟内有效。如非您本人操作，可忽略本消息。',
    type:'json'
};
var content = querystring.stringify(postData);
var options = {
    host:'api.weimi.cc',
    path:'/2/sms/send.html',
    method:'POST',
    agent:false,
    rejectUnauthorized : false,
    headers:{
        'Content-Type' : 'application/x-www-form-urlencoded', 
        'Content-Length' :content.length
    }
};
var req = http.request(options,function(res){
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log(JSON.parse(chunk));
    });
    res.on('end',function(){
        console.log('over');
    });
});
req.write(content);
req.end();