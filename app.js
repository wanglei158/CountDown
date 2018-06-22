var http = require('http');
var httpProxy = require('http-proxy');

//新建代理 Proxy Server对象
var proxy = httpProxy.createProxyServer({});

//捕获异常
proxy.on('error',function(err,req,res){
    res.writeHead(500,{
        'Content-Type':'text/plain;charset=utf-8'
    })
    res.end('Something went wrong. And we are reporting a custom error message.');
})

var server = http.createServer(function(req,res){
    var fullUrl = req.headers.referer,
        ip = req.headers['x-forwarded-for']||req.connection.remoteAddress;
        console.log(req.headers.referer);
        var domain = 'longxiaxiao.com';
        var hostr = fullUrl.substr((fullUrl.indexOf(domain)+domain.length));
        switch(hostr){
            case '/static':
                proxy.web(req,res,{target:'http://localhost:8000'})
            ;
            break;
            default :
            res.writeHead(200,{
                'Content-Type':'text/plain;charset=utf-8'
            });
            res.end('welcome come to 小龙虾之地')
        }
});

server.listen(80);