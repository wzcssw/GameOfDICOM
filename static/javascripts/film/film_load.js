// Load JSON study information for each study
function loadStudy(studyViewer, viewportModel,imageViewer, data) {
    if (data.list == null) {
      console.log("无数据", data);
      return;
    }

    // 设置默认布局
    imageViewer.setLayout('1x1');

    // 布局按钮选择
    $(".image_btn_wrapper").find('.choose-layout').click(function() {
      var layout = $(this).text();

      var previousUsed = [];

      // 保留之前选择
      // imageViewer.forEachElement(function(el, vp, i) {
      //   if (!isNaN($(el).data('useStack'))) {
      //     previousUsed.push($(el).data('useStack'));
      //   }
      // });

      imageViewer.setLayout(layout);

      initViewports();

      // 调整展示区样式大小
      resizeStudyViewer(imageViewer);

      // if (previousUsed.length > 0) {
      //   previousUsed = previousUsed.slice(0, imageViewer.viewports.length);
      //   var item = 0;
      //   previousUsed.forEach(function(v) {
      //     useItemStack(item++, v);
      //   });
      // }

    });

    // Load the first series into the viewport (?)
    //var stacks = [];
    //var currentStackIndex = 0;
    var seriesIndex = 0;

    // Create a stack object for each series
    data.list.forEach(function(series, series_index) {
        var stack = {
          seriesDescription: series.seriesDescription,
          stackId: series.seriesNumber,
          imageIds: [],
          seriesIndex: seriesIndex,
          currentImageIdIndex: 0,
          frameRate: series.frameRate
        };


        // Populate imageIds array with the imageIds from each series
        // For series with frame information, get the image url's by requesting each frame
        if (series.numberOfFrames !== undefined) {
          var numberOfFrames = series.numberOfFrames;
          for (var i = 0; i < numberOfFrames; i++) {
            var imageId = series.instanceList[0].imageId + "?frame=" + i;
            if (imageId.substr(0, 4) !== 'http') {
                imageId = "dicomweb:" + imageId;
            }
            stack.imageIds.push(imageId);
          }
          // Otherwise, get each instance url
        } else {
          series.instanceList.forEach(function(image) {
            var imageId = "dicomweb:" + image.imageId;

            if (image.imageId.substr(0, 4) !== 'http') {
                imageId = "dicomweb:" + image.imageId;
            }
            stack.imageIds.push(imageId);

            // 加载定位线数据
            addRefrenceLine(image);
          });
        }
        // Move to next series
        seriesIndex++;

        // Add the series stack to the stacks array
        imageViewer.stacks.push(stack);
    });

    // 初始化定位线数据
    cornerstoneTools.metaData.addProvider(getRefrenceLine);

    // Resize the parent div of the viewport to fit the screen
    var imageViewerElement = $(studyViewer).find('.imageViewer')[0];
    var viewportWrapper = $(imageViewerElement).find('.viewportWrapper')[0];
    var parentDiv = $(studyViewer).find('.viewer')[0];

    var studyRow = $(studyViewer).find('.studyRow')[0];
    var width = $(studyRow).width();

    // Get the viewport elements
    var element = $(studyViewer).find('.viewport')[0];

    // Image enable the dicomImage element
    initViewports();

    // Get series list from the series thumbnails (?)
    var seriesList = $(studyViewer).find('.thumbnails')[0];

    $(seriesList).empty();

    imageViewer.stacks.forEach(function(stack, stackIndex) {

        // Create series thumbnail item
        var seriesEntry = '<a class="list-group-item" + ' +
            'oncontextmenu="return false"' +
            'unselectable="on"' +
            'onselectstart="return false;"' +
            'onmousedown="return false;">' +
            '<div class="csthumbnail"' +
            'oncontextmenu="return false"' +
            'unselectable="on"' +
            'onselectstart="return false;"' +
            'onmousedown="return false;"></div>' +
            "<div class='text-center small'>" + stack.seriesDescription + '</div></a>';

        // Add to series list
        var seriesElement = $(seriesEntry).appendTo(seriesList);

        // Find thumbnail
        var thumbnail = $(seriesElement).find('div')[0];

        // Enable cornerstone on the thumbnail
        cornerstone.enable(thumbnail);

        // 显示序列第一张图
        cornerstone.loadAndCacheImage(imageViewer.stacks[stack.seriesIndex].imageIds[0]).then(function(image) {
            // Make the first thumbnail active
            if (stack.seriesIndex === 0) {
                $(seriesElement).addClass('active');
            }
            // Display the image
            cornerstone.displayImage(thumbnail, image);
            $(seriesElement).draggable({ helper: "clone" });
        });

        // 缩略图点击替换右边第一个序列
        $(seriesElement).on('click touchstart', function() {
            // useItemStack(0, stackIndex);
        }).data('stack', stackIndex);
    });

    if(browserMobile()){
        var myScroll = new IScroll('.thumbnailSelector');
    }else{
        $('.thumbnails').css({
            'overflow-y':'auto',
            'overflow-x':'hidden'
        });
    }
    // Call resize viewer on window resize
    $(window).resize(function() {
      // 调整展示区样式大小
      resizeStudyViewer(imageViewer);
      if(myScroll){
        myScroll.refresh();  
      }
    });
    // 调整展示区样式大小
    resizeStudyViewer(imageViewer);

    // 单布局展示 1x1
    if (imageViewer.isSingle()){
      useItemStack(0, 0);
    }

    // 多局展示 2x2
    if (imageViewer.isDouble()){
      useItemStack(0, 0);
      useItemStack(1, 1);
      useItemStack(2, 2);
      useItemStack(3, 3);
    }

    // 判断是否是移动端
    function browserMobile() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if ((bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
            return true;
        }else{
            return false;
        }
    }

    //-- 方法
    // 初始化展示
    function initViewports() {
      imageViewer.forEachElement(function(el) {
        cornerstone.enable(el);

        $(el).bind('click touchstart', function() {
          $(this).parent().siblings().css('border', '1px solid #777');
          $(this).parent().css('border', '1px solid #1ebab9');
        });

         var container = el;

        $(el).bind('dblclick', function() {
           if (!document.fullscreenElement && !document.mozFullScreenElement &&
              !document.webkitFullscreenElement && !document.msFullscreenElement) {
              if (container.requestFullscreen) {
                  container.requestFullscreen();
              } else if (container.msRequestFullscreen) {
                  container.msRequestFullscreen();
              } else if (container.mozRequestFullScreen) {
                  container.mozRequestFullScreen();
              } else if (container.webkitRequestFullscreen) {
                  container.webkitRequestFullscreen();
              }

              $(container).find("canvas").css("width","100%");
            $(container).find("canvas").css("height","100%");
          }
        });

        $(el).droppable({
            drop: function(evt, ui) {
              var fromStack = $(ui.draggable.context).data('stack'),
                  toItem = $(this).data('index');
              useItemStack(toItem, fromStack);

              // 拖拽后隐藏定位线
              resetReferenceLine();
            }
        });
      });
    }

    // 加载序列到右边展示
    // item: 左边序列
    // stack: 右边展区
    function useItemStack(item, stack) {
      // debugger
      if (imageViewer.stacks[stack] != undefined) {
        var imageId = imageViewer.stacks[stack].imageIds[0],
            element = imageViewer.getElement(item);
        if ($(element).data('waiting')) {
          imageViewer.viewports[item].find('.overlay-text').remove();
          $(element).data('waiting', false);
        }
        $(element).data('useStack', stack);
        $(element).data('curIndex', item);

        displayThumbnail(seriesList, $(seriesList).find('.list-group-item')[stack], element, imageViewer.stacks[stack], function(el, stack) {
          if (!$(el).data('setup')) {
            setupViewport(el, stack, this);
            setupViewportOverlays(el, data);
            $(el).data('setup', true);
          }
        });
      }
    }

}

// 调整展示区样式大小
function resizeStudyViewer(imageViewer) {

    var studyViewer = $("#studyViewerTemplate");
    var seriesList = $(studyViewer).find('.thumbnails')[0];
    var parentDiv = $(studyViewer).find('.viewer')[0];
    var imageViewerElement = $(studyViewer).find('.imageViewer')[0];

    var studyRow = $(studyViewer).find('.studyContainer')[0];
    var height = $(studyRow).height();
    var width = $(studyRow).width();
    console.log($(studyRow).innerWidth(), $(studyRow).outerWidth(), $(studyRow).width());
    $(seriesList).height("100%");
    $(parentDiv).width(width - $(studyViewer).find('.thumbnailSelector:eq(0)').width());
    $(parentDiv).css({ height: '100%' });
    $(imageViewerElement).css({ height: $(parentDiv).height() - $(parentDiv).find('.text-center:eq(0)').height() });

    imageViewer.forEachElement(function(el, vp) {
      cornerstone.resize(el, true);

      if ($(el).data('waiting')) {
        var ol = vp.find('.overlay-text');
        if (ol.length < 1) {
            ol = $('<div class="overlay overlay-text">请从左侧拖入序列进行查看.</div>').appendTo(vp);
        }
        var ow = vp.width() / 2,
            oh = vp.height() / 2;
        ol.css({ top: oh, left: ow - (ol.width() / 2) });
      }
    });
  }
