var express = require('express');
var router = express.Router();

var aws = require('aws-sdk');
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
var S3_BUCKET = process.env.S3_BUCKET_NAME;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Samba Video Converter' });
});


router.get('/sign_s3', function(req, res){
  console.log("hello, sweetie")
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
  var s3 = new aws.S3();
  var s3_params = {
    Bucket: S3_BUCKET,
    Key: req.query.file_name,
    Expires: 60,
    ContentType: req.query.file_type,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
    if(err){
      console.log(err)
    }
    else{
      var return_data = {
        signed_request: data,
        url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/'+req.query.file_name
      };
      res.write(JSON.stringify(return_data));
      res.end();
    }
  })
})


router.post("/transcode", function(req, res){
  var Zencoder = require('zencoder')
  var ZENCODER_KEY = process.env.ZENCODER_API_KEY;
  var client = Zencoder(ZENCODER_KEY)
  client.Job.create({input: req.body.url, "outputs": [{"url": "s3://"+S3_BUCKET+"/output.mp4"}]}, function(err, data){
    if (err) {console.log(err); return;}
    console.log(data)
    var s3 = new aws.S3()
    var params = {Bucket: S3_BUCKET, Key: "output.mp4"}
    var url = s3.getSignedUrl('getObject', params)
    console.log(url)
  })
  
})

module.exports = router;
