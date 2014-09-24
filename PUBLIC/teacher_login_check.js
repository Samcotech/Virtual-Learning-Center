/**
 * Created by samcom on 22/9/14.
 */

$('#submit').click(function(){
    var username = $('#username').val();
    var password = $('#password').val();

    if(username == '' || password == '')
    {
        if(username == '' && password == '')
        {
            $('#err_msg').html('Username and Password can not be blank').show().fadeOut(10000);
        }
        else if(username == '')
        {
            $('#err_msg').html('Username can not be blank').show().fadeOut(10000);
        }
        else
        {
            $('#err_msg').html('Password can not be blank').show().fadeOut(10000);
        }
    }
    else
    {
        $('#err_msg').hide();
        console.log("come to else part");
        $.ajax({

            method: "POST",
            data: {
                username: username,
                password: password
            },
            dataType:'json',
            url: '/teacher_login',
            success: function(indata) {
                console.log(indata.indata);

                if (indata.indata == '0')
                {
                    location.href='/teacher_home';

                }
                else if(indata.indata == '1')
                {
                    $('#err_msg').html('invalid Username and Password..').show().fadeOut(10000);
                }
                else
                {
                    $('#err_msg').html('Please provide username and password..').show().fadeOut(10000);
                }
            }

        });
    }
});