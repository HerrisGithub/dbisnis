var requestify=require('requestify');
var localStorage = require('localStorage');
module.exports=function(channel,boss){


  // channel.subscribe('channel-post',function(data){
  //   console.log(data);
  // })

  boss.start()
  .then(ready)
  .catch(onError);
  function ready() {
      boss.subscribe('timeline-news', function(data){
        channel.publish('timeline-news',data.data.data);
      })
      .catch(onError);
  }
  function onError(error) {
      console.error(error);
  }


  };