// var host='http://dicom.tongxinyilian.com:9090';
var host=getUrlParam('dicom_url');
var wadoServer = host+"/dcm4chee-arc/wado/DCM4CHEE";
var qidoServer = host + "/dcm4chee-arc/qido/DCM4CHEE";

var scopeSeriesData=new Array(); //所有序列
var scopeSeriesDataIndex=0; //当前选择的序列Index
var scopeImageIndex=1; //选中序列当前显示的图像Index

var element;
var instancImageIds;  //当前加载的序列图片列表
var stack,loaded;
var studyUID = "1.2.840.113619.2.134.1762680288.2032.1122564926.252";
var seriesUID = "1.2.840.113619.2.134.1762680288.2032.1122564926.307";
var objectUID = "1.2.840.113619.2.134.1762680288.2032.1122564926.254";
var isPlay=false;
var rangeObj;

valueOf = function(attr) {
    return attr && attr.Value || "&nbsp";
}

wadoURIof = function(rsuri) {
    return rsuri.replace("/studies/", "?requestType=WADO&studyUID=")
        .replace("/series/", "&seriesUID=").replace("/instances/",
        "&objectUID=");
}

cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
        // Add custom headers here (e.g. auth tokens)
        //xhr.setRequestHeader('x-auth-token', 'my auth token');
    }
});

function onNewImage(e, data){
    var currentValueSpan = document.getElementById("sliceText");
    if (isPlay) {
      var toolData = cornerstoneTools.getToolState(element, 'stack');
      if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
        return;
      }
      var stack = toolData.data[0];
      scopeImageIndex = stack.currentImageIdIndex+1;
      currentValueSpan.textContent = "" + (scopeImageIndex) + "/" +instancImageIds.length;
      rangeObj.setValue(scopeImageIndex);
    }else{
      currentValueSpan.textContent = "" + (scopeImageIndex) + "/" +instancImageIds.length;
    }
}

function onViewportUpdated(e){
    var viewport = cornerstone.getViewport(e.target);
    $('#wwText').text("WW/WC: " + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
    $('#zoomText').text("Zoom: " + viewport.scale.toFixed(2));
}

function expandInstances(instances,first){
  instancImageIds=new Array();
  var length = instances.length;
  var tempInstanceNumberArr=[];
  var tempInstanceList=[];
  var arr=[];

  if(first){
    createRange(length);
  }

  instancImageIds = [];
  for(var i=0;i<length;i++){
    var inst = instances[i];
    instancImageIds[i]="wadouri:"+inst.imageId;
  }
  stack = {
    currentImageIdIndex : 0,
    imageIds: instancImageIds
  };
  scopeImageIndex =1;

  rangeObj.updateInterval(instancImageIds.length-1);

  loadAndViewImage(instancImageIds[scopeImageIndex-1],first);
}

function createRange(tolength){
  rangeObj = $('.single-slider').jRange({
    from: 1,
    to: tolength,
    step: 1,
    format: '%s',
    width:'10.0rem',
    showLabels: false,
    showScale: false,
    onstatechange:function(){
      if(isPlay){return;}
      scopeImageIndex = parseInt($(".single-slider").val());
      loadAndViewImage(instancImageIds[scopeImageIndex-1],false);
    }
  });
}

function loadAndViewImage(imageId,first) {
    if(imageId==undefined) return;
    cornerstone.loadAndCacheImage(imageId).then(function(image) {
        console.log(image);
        var viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.displayImage(element, image, viewport);
        cornerstone.fitToWindow(element);
        cornerstoneTools.addStackStateManager(element, ['stack']);
        cornerstoneTools.addToolState(element, 'stack', stack);
        cornerstoneTools.stackPrefetch.enable(element);
        cornerstoneTools.touchInput.enable(element);
        cornerstoneTools.zoomTouchPinch.activate(element);
        if (first) {
          onPictureWW();
        }
        if(loaded === false) {
            onPictureSwitch();
            loaded = true;
        }
    }, function(err) {
        console.log("loadAndViewImage:"+err);
    });
}

function onPictureSwitch(){
    disableAllTools();
    cornerstoneTools.stackScrollTouchDrag.activate(element);
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
