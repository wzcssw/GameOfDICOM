function filterEvent( ob, ev ) {
  if (ev.type == "touchstart") {
    ob.off('click').on('click', function(e){ e.preventDefault(); });
  }
}

// 安装工具条功能
function setupButtons(studyViewer) {
    // Get the button elements
    var buttons = $(studyViewer).find('.image_btn');

    // Tool button event handlers that set the new active tool

    // WW/WL
    $(buttons[0]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.wwwc.activate(element, 1);
            cornerstoneTools.wwwcTouchDrag.activate(element);
        });
    });

    // Invert
    $(buttons[1]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            var viewport = cornerstone.getViewport(element);
            // Toggle invert
            if (viewport.invert === true) {
                viewport.invert = false;
            } else {
                viewport.invert = true;
            }
            cornerstone.setViewport(element, viewport);
        });
    });

    // Zoom
    $(buttons[2]).on('touchstart click', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.zoom.activate(element, 5); // 5 is right mouse button and left mouse button
            cornerstoneTools.zoomTouchDrag.activate(element);
        });
    });

    // Pan
    $(buttons[3]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.pan.activate(element, 3); // 3 is middle mouse button and left mouse button
            cornerstoneTools.panTouchDrag.activate(element);
        });
    });

    // Stack scroll
    $(buttons[4]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.stackScroll.activate(element, 1);
            cornerstoneTools.stackScrollTouchDrag.activate(element);
        });
    });

    // Length measurement
    $(buttons[5]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.length.activate(element, 1);
            cornerstoneTools.lengthTouch.activate(element);
        });
    });

    // Angle measurement
    $(buttons[6]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.angle.activate(element, 1);
            cornerstoneTools.angleTouch.activate(element);
        });
    });

    // Pixel probe
    $(buttons[7]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.probe.activate(element, 1);
            cornerstoneTools.probeTouch.activate(element);
        });
    });

    // Elliptical ROI
    $(buttons[8]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.ellipticalRoi.activate(element, 1);
            cornerstoneTools.ellipticalRoiTouch.activate(element);
        });
    });

    // Rectangle ROI
    $(buttons[9]).on('click touchstart', function() {
        filterEvent( $(this), event );

        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.rectangleRoi.activate(element, 1);
            cornerstoneTools.rectangleRoiTouch.activate(element);
        });
    });

    // Play clip
    $(buttons[10]).on('click touchstart', function() {
        filterEvent( $(this), event );

        setActiveImg(this);
        forEachViewport(function(element) {
            var stackState = cornerstoneTools.getToolState(element, 'stack');
            var frameRate = stackState.data[0].frameRate;
            // Play at a default 10 FPS if the framerate is not specified
            if (frameRate === undefined) {
                frameRate = 2;
            }
            cornerstoneTools.playClip(element, frameRate);
        });
    });

    // Stop clip
    $(buttons[11]).on('click touchstart', function() {
        setActiveImg(this);
        forEachViewport(function(element) {
            cornerstoneTools.stopClip(element);
        });
    });

    $(buttons[12]).on('click touchstart', function() {
        disableAllTools();
        setActiveImg(this);
        forEachViewport(function(element) {
            var toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
            toolStateManager.clear(element)
            cornerstone.updateImage(element);
        });
    });

    $(buttons[13]).on('click touchstart', function() {
        disableAllTools();
        forEachViewport(function(element) {
            var canvas = $(element).children().get(0);
            var enabledElement = cornerstone.getEnabledElement(element);
            var viewport = cornerstone.getDefaultViewport(canvas, enabledElement.image)
            cornerstone.setViewport(element, viewport);
        });
    });

};

// 初始化工具条设置
function disableAllTools() {
  forEachViewport(function(element) {
    cornerstoneTools.wwwc.disable(element);
    cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(element, 1);
    cornerstoneTools.length.deactivate(element, 1);
    cornerstoneTools.angle.deactivate(element, 1);
    cornerstoneTools.ellipticalRoi.deactivate(element, 1);
    cornerstoneTools.rectangleRoi.deactivate(element, 1);
    cornerstoneTools.stackScroll.deactivate(element, 1);

    cornerstoneTools.wwwcTouchDrag.deactivate(element);
    cornerstoneTools.panTouchDrag.deactivate(element);
    cornerstoneTools.zoomTouchDrag.deactivate(element);
    cornerstoneTools.probeTouch.deactivate(element);
    cornerstoneTools.lengthTouch.deactivate(element);
    cornerstoneTools.angleTouch.deactivate(element);
    cornerstoneTools.ellipticalRoiTouch.deactivate(element);
    cornerstoneTools.rectangleRoiTouch.deactivate(element);
    cornerstoneTools.stackScrollTouchDrag.deactivate(element);

    cornerstoneTools.rotateTouchDrag.deactivate(element);
    cornerstoneTools.rotateTouch.disable(element);
    cornerstoneTools.magnifyTouchDrag.disable(element);

    cornerstoneTools.probe.deactivate(element, 1);
    cornerstoneTools.length.deactivate(element, 1);
    cornerstoneTools.probeTouch.deactivate(element);
    cornerstoneTools.lengthTouch.deactivate(element);

  });
}

function setActiveImg(self) {
  $(self).siblings().find('i').css('color', '#1ebab9');
  $(self).find('i').css('color', '#fff');
}
