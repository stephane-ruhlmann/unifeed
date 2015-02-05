# unifeed
Unified feed data parser for social networks applications

# Installing unifeed

```
npm install unifeed
```

```javascript
var unifeed = require('unifeed');
```

# Usage

```javascript
var getFeed = function (token, callback) {
    FB.napi("/me/home", "get", {access_token: token, limit: 15}, function(err, res){
            if(err) callback(err);
            else unifeed.unifeed("facebook", res, callback);
    });
};
```
