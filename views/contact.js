$(function(){
        $("#goodcount").click(function(){
            var params ={
                
            };
            $.ajax({
                data: params,
                url: '/goodCount',
                dataType: 'post',
                cache: false,
                timeout: 5000,
                success: function(data){
                   alert(data);
                },
                error: function(jqXHR, textStatus, errorThrown){
                   alert("error");
                }
            });
        });

    });