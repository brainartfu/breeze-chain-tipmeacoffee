$('#profile_likes').hide();
$('.likes_tab').on('click', function() { $('.likes_tab').addClass('activeTab'); $('.posts_tab').removeClass('activeTab'); $('#profile_posts').hide(); $('#profile_likes').show(); });
$('.posts_tab').on('click', function() {$('.posts_tab').addClass('activeTab'); $('.likes_tab').removeClass('activeTab'); $('#profile_likes').hide(); $('#profile_posts').show(); });
$('#profile_edit').click(function(e) {  e.preventDefault();$(".modal-profile").show();});
$(".modal-closeIcon-wrap").click(function(){$(".modal-profile").hide();});
$('.prof_edit_btn').click(function() { 
    $this=$(this); $this.attr("disabled", true).html('updating...'); 
    let p_about=$('#profile_about').val();let p_website = $('#profile_website').val(); let p_location = $('#profile_location').val();let p_cover_img = $('#cover_img').val();let p_img = $('#profile_img').val(); 
    $.ajax({url: '/pupdate', type: 'post',contentType: 'application/json', data: JSON.stringify({ acc_about:p_about, acc_website:p_website, acc_location:p_location, acc_cover_img:p_cover_img, acc_img:p_img }), success: function(data) { 
        if (data.error == true) {toastr['error'](data.message);$this.attr("disabled", false).html('UPDATE');return false; 
        } else {$(".modal-profile").hide();toastr['success']("updated Successfully!");setTimeout(function(){window.location.reload();}, 300);} } 
    });
});
$('.btn_follow_user').click(function() {
    $this=$(this);var followName = $(this).attr("data-username");$this.html('Following...').attr("disabled", true);
    $.ajax({url: '/follow',type: 'POST',data: JSON.stringify({ followName: followName }),contentType: 'application/json',success: function(data)  {if (data.error == false) {$this.html('Following').attr("disabled", true);toastr['success']("Followed Successfully!");setTimeout(function(){window.location.reload();}, 300); } else {toastr['error'](data.message);$this.html('Follow').attr("disabled", false);return false} } });
});

$('.btn_unfollow_user').click(function() {
    let $this=$(this);var unfollowName = $(this).attr("data-username");$this.html('UNFollowing...').attr("disabled", true);
    $.ajax({url: '/unfollow',type: 'POST',data: JSON.stringify({ unfollowName: unfollowName }),contentType: 'application/json',success: function(data)  {if (data.error == false) {$this.html('Follow').attr("disabled", true);toastr['success']("UNFollowed Successfully!");setTimeout(function(){window.location.reload();}, 300); } else {toastr['error'](data.message);$this.html('Following').attr("disabled", false);return false} } });
});