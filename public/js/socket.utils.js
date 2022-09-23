document.addEventListener('DOMContentLoaded', () => {
  if ((location.pathname == '/') || (location.pathname == '/tmac')) {
    // const socket = io("https://tipmeacoffee.com");
    const socket = io("http://localhost:5000");
    let onlineUsers = [];
    let usershow = false;
    let searchkey = '';
    let directmessage = [];
    // client-side
    socket.on("connect", () => {
      console.log('your socket id: ', socket.id); // x8WIv7-mJelg7on_ALbx
    });
    socket.on("tmac", (data) => {
      data.data.forEach((article) => {
        if (!document.getElementById(article._id)) {
          newData = newArticle(article);
          document.getElementsByClassName('inner-card-wrapper')[0].insertAdjacentHTML("beforebegin", newData);
          window.scrollTo(0,document.body.scrollHeight);
        var alert = '';

        alert += '<div class="alert success">'
          alert += '<span class="closebtn">&times;</span>  '
          alert += '<strong>new!</strong>'+article.json.title+''
        alert += '</div>'
        };
      })
    });
    socket.on('broadcast', (data) => {
      if (data.type === 'new') {
        console.log('new user:', data.user)
        onlineUsers.push(data.user);
      } else {
        console.log('new disconnect:', data.user)
        onlineUsers.splice(onlineUsers.indexOf(data.user), 1);
      }
      console.log('refresh:', onlineUsers)
    })
    socket.on('users', (data) => {
      onlineUsers = [];
      let userHtml = '';
      for (var i = 0; i < data.users.length; i++) {
        userHtml += `<li class="user-list-li" data="${data.users[i]}">${data.users[i]}</li>`;
        onlineUsers.push(data.users[i]);
      }
      setTimeout(() => {
        document.getElementById('user-list').innerHTML = userHtml;
      }, 3000);
      console.log('welcome. users is', onlineUsers)
    })
    socket.on("disconnect", () => {
      console.log('you are disconnected.', socket.id); // undefined
    });
    const offsetLeft = document.getElementsByClassName('main')[0].offsetLeft;
    document.getElementById('mention-count-badge').style.left = document.getElementsByClassName('main')[0].offsetWidth - 50 + 'px';
    window.addEventListener("resize", () => {
      offsetLeft = document.getElementsByClassName('main')[0].offsetLeft;
    });

    if (document.getElementById('url_field')) {
      let userHtml = `<ul id="user-list" class='search-users'><li>no user</li></ul>`;
      document.getElementsByClassName('main')[0].insertAdjacentHTML("afterbegin", userHtml);
      document.getElementById('url_field').addEventListener('keyup', (e) => {
        if (e.key === '@') {
          const ind = document.getElementById('url_field').value.indexOf('@');
          document.getElementById('user-list').style.display = 'block';
          console.log(offsetLeft, ind, this.selectionStart, offsetLeft + ind * 3)
          document.getElementById('user-list').style.left = offsetLeft + ind * 6 + 'px';
          usershow = true;
        }
        if (usershow && e.key === ' ') {
          document.getElementById('user-list').style.display = 'none';
          usershow = false;
        }
        if (usershow && e.key !== 'Shift' ) {
          searchkey += e.key;
          refresh();
        }
        // console.log(e)
      })
    }
    if (document.getElementById('sendmessage')) {
      document.getElementById('sendmessage').addEventListener('click', newMessage)
    }
  
    socket.on("newMessage", (data) => {
      console.log(data)
      let html = '';
      if (data.type === 'direct') {
        directmessage.push(data);
        document.getElementById('mention-badge').innerHTML = directmessage.length;
        document.getElementById('mention-badge').style.display = 'block';
        document.getElementById('mention-link').href = '#direct-message-'+directmessage.length;
        toastr['success']("You receive the direct message from "+data.user.name);
        html = `<div class="inner-card-wrapper post_rw" style="align-items: center; background-color: #ceed92" id='direct-message-`+directmessage.length+`'>`
      }  else {
        html = `<div class="inner-card-wrapper post_rw" style="align-items: center; background-color: #f5f5dc">`
      }
          html += `<div class="card-userPic-wrapper">
            <a href="/profile/${data.user.name}"><img alt="${data.user.name}" width="100%" height="29px" src="${data.user.avatar}" class="home_pro_pic"> </a>
          </div>
          <div class="card-content-wrapper" style="grid-template-columns: auto 10px;">
                <div class="post-content">
                <p>${data.data.data}</p>
                </div>
          </div>
        </div>`
        document.getElementsByClassName('inner-card-wrapper')[0].insertAdjacentHTML("beforebegin", html);
        window.scrollTo(0,document.body.scrollHeight);

    });
    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
    socket.on("error", (data) => {
      toastr['error'](data.data);
    })
    function newMessage() {
      const message = document.getElementById('url_field').value;
      if (message !== '' && message.length > 60) {
        document.getElementById('url_field').value = '';
          socket.emit('message', {
            type: 'message',
            data: message
          })
      } else {
        toastr['error']('Minimum text 60 characters!');
      }
    }
    function refresh() {
      console.log('searchkey', searchkey)
      const post = document.getElementById('url_field').value;
      if (post.indexOf('@') === -1) {
          document.getElementById('user-list').style.display = 'none';
        usershow = false;
      }
      let match = post.match(/@[^\s]+/g);
      console.log(match)
      searchkey = (match !== null && match.length > 0)?match[0].slice(1, match[0].length):''
      console.log('match', match)
      let userHtml = '';
      const searchuser = onlineUsers.filter((obj)=> obj.startsWith(searchkey));
      for (var i = 0; i < searchuser.length; i++) {
        userHtml += `<li class="user-list-li" data="${searchuser[i]}">${searchuser[i]}</li>`;
      }
      document.getElementById('user-list').innerHTML = userHtml;
      const liArr = document.getElementsByClassName('user-list-li');
      for (var i = 0; i < liArr.length; i++) {
        liArr[i].addEventListener('click', (e) => userselect(e))
      }
    }
    function userselect(e) {
      const name = e.target.getAttribute('data');
      let post = document.getElementById('url_field').value;
      if (post.match(/@[^\s]+/g) === null) {
        post = post.replace(/@/, '@'+name);
      } else {
        post = post.replace(/@[^\s]+/g, '@'+name);
      }
      document.getElementById('url_field').value = post;
      usershow = false;
      document.getElementById('user-list').style.display = 'none';
    }
  }
})

document.getElementsByClassName('inner-card-wrapper');
function newArticle(article) {
  let html = '';
  let tags = article.json.tags; 
  let metatags = tags.map(s => '<a href="/tags/'+s+'">#'+s+'</a>').join(' '); 
  var catg=article.json.category;
  var category = catg.charAt(0).toUpperCase() + catg.slice(1);
  let upvotes=JSON.stringify(article.votes); 
  if(article.likes>0){
    postIncome=((article.dist)/1000000).toString()
  }else{
    postIncome=0
  }
  if(article.__promoted) {
   html += '<div class="promoted_sec"><span class="promoted_icon"><svg width="20px" height="20px" viewBox="0 0 30 30"><path d="M 5 5 L 5 27 L 27 27 L 27 5 Z M 7 7 L 25 7 L 25 25 L 7 25 Z M 13 10 L 13 12 L 18.5625 12 L 9.28125 21.28125 L 10.71875 22.71875 L 20 13.4375 L 20 19 L 22 19 L 22 10 Z" /></svg></span><span class="promoted_title">Promoted</span></div>'
  } 
   html += '<div class="inner-card-wrapper" id="'+article._id+'" style="align-items: center;"><div class="card-userPic-wrapper"><a href="/profile/'+article.author+'">'
    if(article.user){
      html += '<img alt="'+article.author +'" width="100%" height="49px" src="'+article.user.profile.avatar+'" class="home_pro_pic" />'
    }else{
      html += '<img alt="'+article.author+'" width="100%" height="49px" src="/images/user.png" class="home_pro_pic" />'
    }
    html += '</a></div><div class="card-content-wrapper" style="display: flex;justify-content: space-between;align-items: center;">'

    if(article.json && article.json.type){
      var hashregex = /(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,30})(\b|\r)/g;
      var content=article.json.body;
      var ptags = content.match(hashregex);
      if(ptags){
        for(var i = 0, l = ptags.length; i < l; i++ ){
          content=content.replace(ptags[i], '<a style="color:rgb(0 43 255)" href="/tags/'+ptags[i].replace(/#/g, '').toLowerCase()+'">'+ptags[i]+'</a>');
        };
      };
      if(article.json.type==3){
        html += '<div class="post-content" data-permlink="'+article.link +'" data-author="'+article.author +'"  onclick="window.location.href=\'/post/'+article.author +'/'+article.link+'\'"><p>'+content +'</p></div>'
      }else if(article.json.type==2){
        html += '<div class="post-content" data-permlink="'+article.link +'" data-author="'+article.author +'"><p>'+content +'</p></div><div class="card-content-images"><a href="/post/'+article.author +'/'+article.link +'"><div class="card-image-link"><img alt="'+article.link +'" src="'+article.json.image +'" style="" /></div></a></div>'
      }else if(article.json.type==1){
      html += '<div>'
        html += '<span class="card-content-info card_home_title">'
          html += '<a href="/post/'+article.author +'/'+article.link +'">'+article.json.title +'</a>'
        html += '</span>'
        html += '<span class="card-content-info card_home_tags">'+metatags.toString() +'</span>'
      html += '</div>'
      html += '<div>'
        html += '<span class="card-content-images"><a href="/post/'+article.author +'/'+article.link +'">'
        html += '<span class="card-image-link"><iframe width="170px" height="100px" style="border: none;border-radius: 14px;min-height: 100px;" src="https://youtube.com/embed/'+article.json.videoid+'?mute=1"></iframe></span></a></span>'
      html += '</div>'
      }else if(article.json.type==0){ 
        if(!article.json.image || article.json.image === undefined){
          var iimg='/images/img-tmac.png';
        }else{
          var iimg=article.json.image;
        };
      html += '<span>'
        html += '<div class="card-content-info card_home_title"><a href="/post/'+article.author +'/'+article.link +'">'+article.json.title +'</a></div>'
        html += '<div class="card-content-info">'+article.json.body +'</div>'
        html += '<div class="card-content-info card_home_tags">'+metatags.toString() +'</div>'
      html += '</span>'
      html += '<span>'
        html += '<div class="card-content-images"><a href="/post/'+article.author +'/'+article.link +'"><div class="card-image-link" ><img alt="'+article.link +'" src="'+iimg +'" style="" /></div></a></div>'
      html += '</span>'
      }
    }else{
      html += '<div class="card-content-info card_home_title"><a href="/post/'+article.author +'/'+article.link +'">'+article.json.title +'</a></div>'
      html += '<div class="card-content-info card_home_tags">'+metatags.toString() +'</div>'
      html += '<div class="card-content-images"><a href="/post/'+article.author +'/'+article.link +'"><div class="card-image-link"><img alt="'+article.link +'" src="'+article.json.image +'" /></div></a></div>'
    }
     html += '</div>'
   html += '</div>'

return html

} 