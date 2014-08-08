

function myAlert(text){

$('<div id="markDiv"></div>').appendTo("body");

$('#markDiv').css({
width:$(document).width(),
height:$(document).height(),
background:"black",
opacity:"0.8",
position:"absolute",
left:"0",
top:"0",
zIndex:"10000"
});

$('<div id="markDiv_content" class="alert alert-info" role="alert">'+text+'</div>').appendTo('#markDiv');
$('#markDiv_content').css(
    {
      marginTop:"100px",
      paddingTop:"100px",
      width:"480px",
      height:"280px",
      marginLeft:"auto",
      marginRight:"auto",
      textAlign:"center",
      fontSize:"30px",
      fontFamily:"微软雅黑"
   }

);

$('<a id="markDiv_content_button" href="javascript:void(0)">确定</a>').appendTo('#markDiv_content');

$('#markDiv_content_button').css({
  display:"block",
         marginTop:"30px",
          backgroundColor:"blue",
          color:"white",
          textDecoration:"none"
});
$('#markDiv_content_button').click(function(){

   $('#markDiv').remove();
})


}




$(function  () {




function header(){
var url=window.location.pathname;
$('#header_nav li a').each(function(i,n){
   var href= $(n).attr("href");
   if(url==="/")return;
   if(url.indexOf('blogs')!=-1){
   	$('#header_nav .active').removeClass("active");
   $('#header_nav li').eq(1).addClass("active");
   return;
   }
   if(url.indexOf(href)!=-1){
   $('#header_nav .active').removeClass("active");
   $('#header_nav li').eq(i).addClass("active");
   }
  
});


$('.header_search_button').click(function(){
   
  var text=$('#header_search').val()+"";
  var text2=text.replace(/[ ]/g,"");
  if(text2.length==0){
   myAlert("搜索框的内容不能为空");
  }
  else{
   $('#search_form').submit();
  }

});



}

header();

});


$.setScroll=function(elemName,dist,time){

$(elemName).click(function(){
 var $start=$(document).scrollTop();
 scroll($start,dist,time);
 
});

function scroll(number,dist,time){
  number=number-dist;
$(document).scrollTop(number);

  var repeat=function(){
    scroll(number,dist,time);
  }
  if(number<0)
    return;
   setTimeout(repeat,time);
}

}
/*参数分别代表：被点击的元素的id，移动的距离，时间间隔*/
$.setScroll('#footerTop',200,50);



