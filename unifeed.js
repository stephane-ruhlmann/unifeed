/*
POST : {
        origin:
        id:
        date:
        from: {
                name:
                id:
                url:
                profile_picture:
        }
        content: {
                type:
                body: \ depends on content type
                message:
                desc:
                story:
        }
        // facebook case
        comments: [
                 from: {
                     name:
                     id:
                     url:
                     profile_picture:
                 }
                 message:
                 date:
        ]
        comments_count:
        likes_count:
        retweet_count:
    }
*/


exports.unifeed = function(origin, array, callback){
    var posts =[];
    console.log("UNIFEED OVER", origin);
    switch(origin){
        case 'facebook':
            array.data.forEach(function(post){
                var a = {};
                a.origin = 'facebook';
                a.raw = post;
                a.id = post.id;
                a.date = new Date(post.created_time);

                // 'FROM' ATTRIBUTE
                a.from = {
                    name: post.from.name,
                    id: post.from.id,
                    profile_picture: "http://graph.facebook.com/" + post.from.id + "/picture",
                    url: "http://facebook.com/" + post.from.id
                };

                // 'TO' ATTRIBUTE
                if(post.to){
                    if(post.message_tags){
                        a.tags = post.message_tags;

                    }
                    else a.to = post.to.data[0];
                }

                // 'CONTENT' ATTRIBUTE
                var content = {};
                content.type = post.type;
                switch(post.type){
                    case 'link':
                        if(post.message) content.message = post.message;
                        if(post.picture) content.body = post.picture;
                        if(post.name) content.desc = post.name;
                        content.body = post.link;
                        break;
                    case 'photo':
                        if(post.story) content.story = post.story;
                        if(post.message) content.message = post.message;
                        content.body = post.picture;
                        break;
                    case 'status':
                        if(!post.message) return;
                        content.message = post.message;
                        break;
                    case 'video':
                        if(post.message) content.message = post.message;
                        if(post.name) content.desc = post.name;
                        if(post.source.indexOf("&autoplay") > -1){
                            content.body = post.source.split("&autopl")[0];
                        }
                        else if(post.source.indexOf("fbcdn-video") > -1) content.body = post.link;
                        else content.body = post.source;
                        break;
                    default:
                        content.message = "ERROR : NO VIDEO, PHOTO, STATUS OR LINK";
                        break;
                }
                a.content = content;

                // LIKES ----------------------------------------------------

                if(post.likes){
                    a.likes_count = post.likes.data.length;
                } else {
                    a.likes_count = 0;
                }

                // COMMENTS ----------------------------------------------------

                if(post.comments){
                    a.comments_count = post.comments.data.length;
                    a.comments = [];
                    for(var i=post.comments.data.length-1; i>post.comments.data.length - 4; i--)
                    {
                        var com = post.comments.data[i];
                        var comment = {};
                        comment.from ={
                            name: com.from.name,
                            profile_picture: "http://graph.facebook.com/" + com.from.id + "/picture",
                            id: com.from.id,
                            url: "http://facebook.com/" + com.from.id
                        };
                        comment.message = com.message;
                        comment.date = new Date(com.created_time);
                        a.comments.push(comment);
                        if(i==0) break;
                    }
                } else {
                    a.comments_count = 0;
                }
                posts.push(a);
            });
            break;

        // TWITTER  ----------------------------------------------------
        case 'twitter':
            array.forEach(function(post){
                var t = {};
                //t.raw = post;
                t.origin = 'twitter';
                t.id = post.id_str;
                t.date = new Date(post.created_at);
                t.from = {
                    id: post.user.id_str,
                    name: post.user.name,
                    url: "http://twitter.com/" + post.user.screen_name,
                    profile_picture: post.user.profile_image_url
                };
                t.content = {
                    message: post.text,
                    type: 'status'
                };
                if(post.entities.media){
                    t.content.type = post.entities.media[0].type;
                    t.content.body = post.entities.media[0].media_url;
                }
                if(post.retweeted_status){
                    t.content.story = t.from.name + " retweeted " + post.retweeted_status.user.name +
                    "@" + post.retweeted_status.user.screen_name;
                }
                t.retweet_count = post.retweet_count;
                posts.push(t);
            });
            break;
        default:
            callback({message: 'Wrong source param'}, null);
            break;
    }
    callback(null, posts);
};