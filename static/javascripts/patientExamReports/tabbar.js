//禁止安卓手机调整字体大小
(function() {
  if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
	  handleFontSize();
  } else {
	  if (document.addEventListener) {
		  document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
	  } else if (document.attachEvent) {
		  document.attachEvent("WeixinJSBridgeReady", handleFontSize);
		  document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
	  }
  }
  function handleFontSize() {
	  WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
	  WeixinJSBridge.on('menu:setfont', function() {
		  WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
	  });
  }
  })();
var imgeHeight = $("body").height()-$(".tabbar").height()-$(".progress").outerHeight();
$(".imge").css("height",imgeHeight);
$(".tools").on('click',function(){
	$('.picker').hide();
	if(!$(".tools_wrapper").is(":animated")){
		$('.tools_wrapper').slideToggle("fast");
	};
});
$('.tools_wrapper ul li').not($("#btnInvert")).on('click',function(){
	$('.tools_wrapper ul li').not($("#btnInvert")).removeClass('active');
	$(this).addClass('active');
});
$('.order').on('click',function(){
	$('.tools_wrapper').hide();
	$('.picker').fadeToggle('fast');
	$('.tabbar').hide();
	disableAllTools();
	isPlay=false;
	$("#btnPlayClip").find('i').addClass('icon-bofang').removeClass('icon-b');
	cornerstoneTools.stopClip(element);
	rangeObj.setValue(1);
});
var isInvert = false;
$('#btnInvert').on('click',function(){
	$("#btnReset").removeClass('active');
	if (isInvert) {
		isInvert = false;
		$(this).removeClass('active');
	}else{
		isInvert = true;
		$(this).addClass('active');
	}
});
$("#btnReset").on('click',function(){
	$('#btnInvert').removeClass('active');
	isInvert = false;
});
