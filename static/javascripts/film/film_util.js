function setupViewport(element, stack, image) {
  // Display the image on the viewer element
  cornerstone.displayImage(element, image);

  // If it's a movie (has frames), then play the clip
  if (stack.frameRate !== undefined) {
      cornerstone.playClip(element, stack.frameRate);
  }

  // Activate mouse clicks, mouse wheel and touch
  cornerstoneTools.mouseInput.enable(element);
  cornerstoneTools.mouseWheelInput.enable(element);
  cornerstoneTools.touchInput.enable(element);

  // 初始化影像动作 Enable all tools we want to use with this element
  cornerstoneTools.stackScroll.activate(element, 1);
  cornerstoneTools.stackScrollTouchDrag.activate(element);

  // Stack tools
  cornerstoneTools.addStackStateManager(element, ['playClip', 'stack', 'referenceLines']);
  cornerstoneTools.addToolState(element, 'stack', stack);
  cornerstoneTools.stackScrollWheel.activate(element);
  cornerstoneTools.stackPrefetch.enable(element);
}

function displayThumbnail(seriesList, seriesElement, element, stack, loaded) {
  // Deactivate other thumbnails
  $(seriesList).find('a').each(function() {
    $(this).removeClass('active');
  });

  // Make the selected thumbnail active
  $(seriesElement).addClass('active');

  var enabledImage = cornerstone.getEnabledElement(element);
  if (enabledImage.image) {
      // Stop clip from if playing on element
      cornerstoneTools.stopClip(element);
      // Disable stack scrolling
      cornerstoneTools.stackScroll.disable(element);
      // Enable stackScroll on selected series
      cornerstoneTools.stackScroll.enable(element);
  }

  // Load the first image of the selected series stack
  cornerstone.loadAndCacheImage(stack.imageIds[0]).then(function(image) {
    if (loaded) {
      loaded.call(image, element, stack);
    }

    // Get the state of the stack tool
    var stackState = cornerstoneTools.getToolState(element, 'stack');
    stackState.data[0] = stack;
    stackState.data[0].currentImageIdIndex = 0;

    // Get the default viewport
    var defViewport = cornerstone.getDefaultViewport(element, image);
    // Get the current series stack index
    // Display the image
    cornerstone.displayImage(element, image, defViewport);
    // Fit the image to the viewport window
    cornerstone.fitToWindow(element);

    // Prefetch the remaining images in the stack (?)
    cornerstoneTools.stackPrefetch.enable(element);

    // Play clip if stack is a movie (has framerate)
    if (stack.frameRate !== undefined) {
      cornerstoneTools.playClip(element, stack.frameRate);
    }


    //-- 同步播放参数计算
    var raw_imageId = image.imageId.replace("dicomweb:", "");
    var temp_rl = window.referenceLineArr.find(function(item) {
        return (raw_imageId == item.imageId);
    });
    var begin_row_xyz = "";
    var begin_col_xyz = "";
    if (temp_rl != undefined) {
      begin_row_xyz = temp_rl.rowCosines.x + "," + temp_rl.rowCosines.y + "," + temp_rl.rowCosines.z;
      begin_col_xyz = temp_rl.columnCosines.x + "," + temp_rl.columnCosines.y + "," + temp_rl.columnCosines.z;
      stack.space_vector = begin_row_xyz + ";" + begin_col_xyz;
      $(element).data("space_vector", begin_row_xyz + ";" + begin_col_xyz);
    }

  });
};


// 遍历右侧展示区
function forEachViewport(callback) {
  var elements = $('.viewport');
  $.each(elements, function(index, value) {
    var element = value;
    try {
        callback(element);
    } catch (e) {
    }
  });
}

// 图像布局方法
ImageViewer = function(root, viewport) {
  var self = this;

  self.root = root;
  self.stacks = [];
  self.viewports = [];
  self.layout = '1x1';
  self.viewportModel = viewport;

  self.setLayout = function(layout) {
      self.layout = layout;
      // TODO: create viewports
      var ab = self.getRowsCols(),
          a = ab[0],
          b = ab[1],
          numOfViewports = a * b,
          perWidth = 100 / b,
          perHeight = 100 / a;
      self.root.find('.imageViewer').html('');
      var i = 0;
      self.viewports = [];
      while (i < numOfViewports) {
          var elem = self.viewportModel.clone().css({
              width: perWidth + '%',
              height: perHeight + '%'
          }).appendTo(self.root.find('.imageViewer'));
          elem.find('.viewport').data('index', i).data('waiting', true);
          self.viewports.push(elem);
          i++;
      }
  }

  self.getRowsCols = function() {
      var s = self.layout.split(/x/);
      return [parseInt(s[0]), parseInt(s[1])];
  }

  self.isSingle = function() {
      return self.layout == '1x1';
  }

  self.isDouble = function() {
    return self.layout == '2x2';
  }

  self.getElement = function(item) {
      return self.viewports[item].find('.viewport')[0];
  }

  self.forEachElement = function(cb) {
      self.viewports.forEach(function(vp, i) {
          cb.call(self, vp.find('.viewport')[0], vp, i);
      });
  }
}

function setupViewportOverlays(element, data) {
  var parent = $(element).parent();

  // Get the overlays
  var childDivs = $(parent).find('.overlay');
  var topLeft = $(childDivs[0]).find('div');
  var topRight = $(childDivs[1]).find('div');
  var bottomLeft = $(childDivs[2]).find('div');
  var bottomRight = $(childDivs[3]).find('div');

  // Set the overlay text
  $(topLeft[0]).text(data.studyDate);
  $(topRight[0]).text(data.studyDescription);

  // 图片展示信息
  function onNewImage(e, eventData) {
      // If we are currently playing a clip then update the FPS
      // Get the state of the 'playClip tool'
      var playClipToolData = cornerstoneTools.getToolState(element, 'playClip');

      // If playing a clip ...
      if (playClipToolData !== undefined && playClipToolData.data.length > 0 && playClipToolData.data[0].intervalId !== undefined && eventData.frameRate !== undefined) {
        // Update FPS
        $(bottomLeft[0]).text("FPS: " + Math.round(eventData.frameRate));
        console.log('frameRate: ' + e.frameRate);

      } else {
        // Set FPS empty if not playing a clip
        if ($(bottomLeft[0]).text().length > 0) {
            $(bottomLeft[0]).text("");
        }
      }

      var toolData = cornerstoneTools.getToolState(element, 'stack');
      if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
        return;
      }
      var stack = toolData.data[0];

      //-- 定位线
      window.cur_stackId = stack.seriesIndex;
      // debugger
      window.cur_space_vector = stack.space_vector;
      reloadStackScroll(element);
      //--//

      $(topRight[1]).text(stack.seriesDescription);
      // Update Image number overlay
      $(bottomLeft[2]).text("图片 # " + (stack.currentImageIdIndex + 1) + "/" + stack.imageIds.length);
  }
  // Add a CornerstoneNewImage event listener on the 'element' (viewer) (?)
  $(element).on("CornerstoneNewImage", onNewImage);

  // On image rendered
  function onImageRendered(e, eventData) {
    // Set zoom overlay text
    $(bottomRight[0]).text("缩放:" + eventData.viewport.scale.toFixed(2));
    // Set WW/WL overlay text
    $(bottomRight[1]).text("窗宽/窗位:" + Math.round(eventData.viewport.voi.windowWidth) + "/" + Math.round(eventData.viewport.voi.windowCenter));
    // Set render time overlay text
    $(bottomLeft[1]).text("渲染时间:" + eventData.renderTimeInMs.toFixed(8) + " ms");
  }
  // Add a CornerstoneImageRendered event listener on the 'element' (viewer) (?)
  $(element).on("CornerstoneImageRendered", onImageRendered);
}

// 重置定位线
function resetReferenceLine() {
  forEachViewport(function(element) {
    window.line_synchronizer.remove(element);
  });
}
