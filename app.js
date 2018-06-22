let port  = 8000;
let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
let MIME = require('./MIME.js').type;
let zlib = require('zlib');



let Expires = {//有效期   配置文件最大缓存时间--》缓存机制step1
    fileMatch:/^(gif|png|jpg|js|css)$/ig,
    maxAge:60*60*24*365
}


let server = http.createServer((req,res)=>{
    let pathname = url.parse(req.url).pathname||'';
    let realPath = path.join('assets/',path.normalize(pathname.replace(/\.\./g,"")));
    let index = realPath.indexOf('/static');
    if(index!=-1){
        realPath = realPath.substr(0,index)+realPath.substr(index+7,realPath.length);
    }
    if(realPath.indexOf('/static'))
    fs.exists(realPath,(exists)=>{//判断文件是否存在
        if(!exists){
            res.writeHead(404,{
                'Content-Type':'text/plain'
            });
            res.write('this is a request URL '+realPath+' was not fount on the server.');
            res.end();
        }else{
            
            fs.readFile(realPath,'binary',(err,file)=>{
                if(err){
                    res.writeHead(500,{
                        'Content-Type':'text/plain'
                    });
                    res.end(err);
                }else{
                    let extName = path.extname(realPath);
                    extName = extName?extName.slice(1):'';//文件类型映射MIME判断
                    let contentType = MIME[extName]||'text/plain';

                    if(extName.match(Expires.fileMatch)){
                        let expires = new Date();
                        expires.setTime(expires.getTime()+Expires.maxAge*1000);
                        res.setHeader("Expires",expires.toUTCString());
                        res.setHeader('Cache-Control','max-age='+Expires.maxAge);
                    }
                    let stat = fs.statSync(realPath);
                    let lastModified = stat.mtime.toUTCString();
                    res.setHeader("Last-Modified", lastModified);

                    if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
                        res.writeHead(304, "Not Modified");
                        res.end();
                        return;
                    }

                    let raw = fs.createReadStream(realPath);
                    let acceptEncoding = req.headers['accept-encoding'] || '';

                    if (acceptEncoding.match(/\bdeflate\b/)) {
                        res.writeHead(200, { 'Content-Encoding': 'deflate' });
                        raw.pipe(zlib.createDeflate()).pipe(res);
                      } else if (acceptEncoding.match(/\bgzip\b/)) {
                        res.writeHead(200, { 'Content-Encoding': 'gzip' });
                        raw.pipe(zlib.createGzip()).pipe(res);
                      } else {
                        res.writeHead(200, {});
                        raw.pipe(res);
                      }  
                }
            })
        }
    })
});
server.listen(port);
console.log('Server runing at port :'+port);
