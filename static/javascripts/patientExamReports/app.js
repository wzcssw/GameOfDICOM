//

var scopeSeriesData = new Array();

$(function(){
  var hospital_no = getUrlParam('file_no');

  var url = "/api/dicom/"+hospital_no;

  var firstLoad=true;
  var html = "";
  var thumbList = $(".pick_img");
  var seriesList;

  $.ajax({
      url:url,
      async:false,
      success:function(data){
        data = JSON.parse(data);
        seriesList = data.list;
        if(seriesList!=null && seriesList.length>0){
          for(var j=0;j<seriesList.length;j++){
            var seriesItem = seriesList[j];
            if(j==0 && firstLoad){
              firstLoad =false;
              element = $('#dicomImage').get(0);
              cornerstone.enable(element);
              $(element).on("CornerstoneImageRendered", onViewportUpdated);
              $(element).on("CornerstoneNewImage", onNewImage);
              loadData(seriesItem.instanceList,true);
            }
            scopeSeriesData.push(seriesItem);
            //   html+= "<div onclick='selectItemClick("+scopeSeriesDataIndex+");'><img src='"+seriesItem.thumb+"'><p>"+seriesItem.series.seriesDesc+"</p></div>";
              var seriesEntry = '<a class="list-group-item" + ' +
                        'onclick="selectItemClick('+scopeSeriesDataIndex+');"'+
                        'oncontextmenu="return false"' +
                        'unselectable="on"' +
                        'onselectstart="return false;"' +
                        'onmousedown="return false;">' +
                        '<div class="csthumbnail"' +
                        'oncontextmenu="return false"' +
                        'unselectable="on"' +
                        'onselectstart="return false;"' +
                        'onmousedown="return false;"></div>' +
                        "<p>" + seriesItem.seriesDescription + '</p></a>';
                var seriesElement = $(seriesEntry).appendTo(thumbList);
                scopeSeriesDataIndex++;
            }

            var seriesListIndex =0;
            thumbList.find("a").each(function(){
               seriesItem = seriesList[seriesListIndex];
               var thumbnail = $(this).find('div')[0];
               cornerstone.enable(thumbnail);
               cornerstone.loadAndCacheImage("wadouri:"+seriesItem.instanceList[0].imageId)
               .then(function(image) {
                   cornerstone.displayImage(thumbnail, image);
               });
               seriesListIndex++;
            });

      //   $('.pick_img').append(html);
          var myScroll = new IScroll('#wrapper',{ click: true });
        }

      }
  });

  $("#btnPrev").bind('click',onPrevImage);  //上一张
  $("#btnNext").bind('click',onNextImage);  //下一张
  $("#btnLength").bind('click',onPictureLength);
  $("#btnRectangleroi").bind('click',onRectFunc);
  $("#btnCircle").bind('click',onCircleFunc);
  $("#btnProbe").bind('click',onProbeFunc);
  $("#btnClear").bind('click',onClearFunc);
  $("#btnRotate").bind('click',onRotateFunc);
  $('#btnInvert').bind('click',onInvertFunc);
  $("#btnGlass").bind('click',onGlassFunc);
  $("#btnReset").bind('click',onResetViewFunc);
  $("#btnZhujie").bind('click',onZhujieFunc);
  $("#btnPlayClip").bind('click',onPlayClipFunc);
  $("#btnAjustWin").bind('click',onPictureWW);
  $("#btnMoves").bind('click',onPanFunc);


});

function loadData(data,first){
  expandInstances(data,first);
}

function selectItemClick(index) {
  if($(".picker").is(":hidden")){
		$(".picker").show();
		$(this).css("background","#000");
		$(this).children().css("color","#fff");
	}else{
		$(".picker").hide();
		$(this).css("background","#fff");
		$(this).children().css("color","#545454");
	}
  var seriesItem = scopeSeriesData[index];
  loadData(seriesItem.instanceList,false);
  scopeImageIndex = 1;
  $('.tabbar').show();
}

function disableAllTools()
{
  cornerstoneTools.panTouchDrag.deactivate(element);
  cornerstoneTools.rotateTouchDrag.deactivate(element);
  cornerstoneTools.rotateTouch.disable(element);
  cornerstoneTools.ellipticalRoiTouch.deactivate(element);
  cornerstoneTools.angleTouch.deactivate(element);
  cornerstoneTools.rectangleRoiTouch.deactivate(element);
  cornerstoneTools.lengthTouch.deactivate(element);
  cornerstoneTools.probeTouch.deactivate(element);
  cornerstoneTools.zoomTouchDrag.deactivate(element);
  cornerstoneTools.wwwcTouchDrag.deactivate(element);
  cornerstoneTools.stackScrollTouchDrag.deactivate(element);
  cornerstoneTools.magnifyTouchDrag.disable(element);
}

function onPrevImage(){
  if(scopeImageIndex>1){
    scopeImageIndex=scopeImageIndex-1;
    rangeObj.setValue(scopeImageIndex);
  }
}

function onNextImage(){
  if(scopeImageIndex<instancImageIds.length){
    scopeImageIndex=scopeImageIndex+1;
    rangeObj.setValue(scopeImageIndex);
  }
}

function onPictureLength(){
    disableAllTools();
    cornerstoneTools.lengthTouch.activate(element);
}

function onRectFunc(){
    disableAllTools();
    cornerstoneTools.rectangleRoiTouch.activate(element);
}

function onCircleFunc(){
    disableAllTools();
    cornerstoneTools.ellipticalRoiTouch.activate(element);
}

function onProbeFunc(){
    disableAllTools();
    cornerstoneTools.probeTouch.activate(element);
}

function onClearFunc(){
  disableAllTools();
  cornerstoneTools.wwwcTouchDrag.activate(element);
  cornerstoneTools.zoomTouchPinch.activate(element);
  var toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
  toolStateManager.clear(element)
  cornerstone.updateImage(element);
}

function onRotateFunc(){
  disableAllTools();
  cornerstoneTools.rotateTouchDrag.activate(element);
}

function onInvertFunc(){
  disableAllTools();
  var viewport = cornerstone.getViewport(element);
  // Toggle invert
  if (viewport.invert === true) {
      viewport.invert = false;
  } else {
      viewport.invert = true;
  }
  cornerstone.setViewport(element, viewport);
}

function onGlassFunc(){
  disableAllTools();
  cornerstoneTools.magnifyTouchDrag.activate(element);
}

function onPictureWW(){
  disableAllTools();
  cornerstoneTools.wwwcTouchDrag.activate(element);
  cornerstoneTools.zoomTouchPinch.activate(element);
}

function onPanFunc(){
  disableAllTools();
  cornerstoneTools.panTouchDrag.activate(element);
}

function onResetViewFunc(){
  disableAllTools();
  var canvas = $('#dicomImage canvas').get(0);
  var enabledElement = cornerstone.getEnabledElement(element);
  var viewport = cornerstone.getDefaultViewport(canvas, enabledElement.image)
  cornerstone.setViewport(element, viewport);
}

function onPlayClipFunc(){
  disableAllTools();
  if(!isPlay){
    isPlay=true;
    $("#btnPlayClip").find('i').addClass('icon-b').removeClass('icon-bofang');
    var stackState = cornerstoneTools.getToolState(element, 'stack');
    var frameRate = stackState.data[0].frameRate;
    // Play at a default 10 FPS if the framerate is not specified
    if (frameRate === undefined) {
      frameRate = 2;
    }
    cornerstoneTools.playClip(element, frameRate);
  }else{
    isPlay=false;
    $("#btnPlayClip").find('i').addClass('icon-bofang').removeClass('icon-b');
    cornerstoneTools.stopClip(element);
  }
}

function onZhujieFunc(){
  disableAllTools();
  if($(this).find('span').text()=='隐藏注解'){
    $("#mrbottomleft").hide();
    $("#mrbottomright").hide();
    $(this).find('span').text('显示注解');
  }else{
    $("#mrbottomleft").show();
    $("#mrbottomright").show();
    $(this).find('span').text('隐藏注解');
  }
}
