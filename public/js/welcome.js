$('.login_btn').click(function () {
    let login_user = ($('#login_user_id').val()).trim();
    let login_pass = ($('#login_pass').val()).trim();
    if (login_user=="") {toastr.error('phew.. Username should not be empty');return false;}
    if (login_pass=="") {toastr.error('phew... Private key should not be empty');return false;};
    loginProcess()
})

function loginProcess() {
    $(".login_btn").attr("disabled", true);$('#login_txt').html('Login..');
    const pivkey = ($('#login_pass').val()).trim();
    const username = ($('#login_user_id').val()).trim();
    $.ajax({
        type: 'POST',
        data: JSON.stringify({ pivkey: pivkey,  username: username}),
        contentType: 'application/json',
        url: '/loginuser',            
        success: function(data) {
            if (data.error == true) {
                toastr['error'](data.message);$(".login_btn").attr("disabled", false);
                $('#login_txt').html('Login');
                return false;
            } else {
                $(".login_btn").attr('disabled', true);
                toastr['success']("Login Success");
                setTimeout(function(){window.location.href = '/';}, 100);
            }
        }
    });
}

$('.register_btn').click(function() {$('.login_section').hide(); $('.signup_section').show();});
$('.loginNow_btn').click(function() {$('.signup_section').hide(); $('.login_section').show();});
$('.signin_btn, .n_signin_btn, .n_signup_btn').click(function() {window.location.href = '/welcome';});
function accountKeys() {$('.signup_section').hide(); $('.key_section').show();}

$('.signup_btn').click(function () {
    let input_username = ($('#user_name').val()).trim();
    if (input_username=="") {toastr.error('phew.. Username should not be empty');return false;}
    let allowed_name = /^[0-9a-z]+$/; 
    if (!input_username.match(allowed_name)) { toastr.error('phew.. Only alphanumeric usernames allowed (all lowercase)');return false; };
    if (input_username && input_username.length < 5) { toastr.error('phew.. Username length should not be less than 5'); return false; };
    const url = 'https://api.breezechain.org/account/'+input_username;
    fetch(url)
    .then((response) => {
        if(response.status == '200'){ toastr.error('phew.. Username not available'); return false; } else{
            let d_token = ($('#dtoken').val()).trim();
            if (d_token=="") {toastr.error('phew... Activation token should not be empty. Get from TipMeACoffee discord server');return false;};
            $('.signup_txt').html('Processing...'); $('.signup_btn').attr("disabled", true);
            signupProcess()
        }
    })
})
function signupProcess() {
    const input_username = ($('#user_name').val()).trim();
    const d_token = ($('#dtoken').val()).trim();
    const referrer = ($('#refer_by').val()).trim();
    $.ajax({
        type: 'POST',
        data: JSON.stringify({ name: input_username, dtoken: d_token, ref: referrer}),
        contentType: 'application/json',
        url: '/signup',            
        success: function(data) {
            if (data.error == true) {
                toastr['error'](data.message);
                $(".signup_btn").attr("disabled", false);
                $('.signup_txt').html('Signup');
                return false;
            } else {
                accountKeys()
                toastr['success']("Account cteared Successfully!");
                $('#acct_priv_key').val(data.priv);
                $("a.explorerLink").attr("href", "https://breezescan.io/#/@"+data.user);
            }
        }
    });
}
$('.copy_pass').click(function() {var copyText = document.getElementById("acct_priv_key");copyText.select();copyText.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");$('.copy_pass').html('Copied!');toastr['success']("Key copied to clipboard.");return false;
})
