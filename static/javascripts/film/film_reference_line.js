//-- 定位线
window.referenceLineArr = [];
window.cur_stackId = undefined;
window.cur_space_vector = undefined;

// 播放同步
function reloadStackScroll(element) {
  if (window.cur_space_vector == undefined) {
    return;
  };

  current_space_vector = $(element).data("space_vector");
  var temp_space_vector = "";
  forEachViewport(function(temp_element) {
    // debugger
    temp_space_vector = $(temp_element).data("space_vector");

    // 添加定位线
    window.line_synchronizer.add(temp_element);

    if (temp_space_vector != null && temp_space_vector == current_space_vector) {
      window.scroll_synchronizer.add(temp_element);
      // window.image_scroll_synchronizer.add(temp_element);
      // window.position_offset_synchronizer.add(temp_element);

      // 不显示定位线
      cornerstoneTools.referenceLines.tool.disable(temp_element);
    } else {
      window.scroll_synchronizer.remove(temp_element);
      // window.image_scroll_synchronizer.remove(temp_element);
      // window.position_offset_synchronizer.remove(temp_element);

      // 显示定位线
      cornerstoneTools.referenceLines.tool.enable(temp_element, window.line_synchronizer);

    }
  });

};

// 获取图片定位线数据
function addRefrenceLine(image) {
  if (!image || image.frameOfReferenceUID == null) {
    return;
  }
  var tiop_arr = image.imageOrientationPatient.split(",");
  tiop_arr = tiop_arr.map(function(item) {
    return parseFloat(item);
  });
  var tipp_arr = image.imagePositionPatient.split(",");
  tipp_arr = tipp_arr.map(function(item) {
    return parseFloat(item);
  });
  var tps = parseFloat(image.pixelSpacing);
  var trl = window.referenceLineArr.find(function(item) {
    return (image.imageId.indexOf(item.imageId) > -1);
  });
  if (trl) {
    return
  }
  window.referenceLineArr.push({
    stackId: image.stackId,
    imageId: image.imageId,
    frameOfReferenceUID: image.frameOfReferenceUID,
    rows: parseFloat(image.rows),
    columns: parseFloat(image.columns),
    rowCosines: new cornerstoneMath.Vector3(tiop_arr[0], tiop_arr[1], tiop_arr[2]),
    columnCosines: new cornerstoneMath.Vector3(tiop_arr[3], tiop_arr[4], tiop_arr[5]),
    imagePositionPatient: new cornerstoneMath.Vector3(tipp_arr[0], tipp_arr[1], tipp_arr[2]),
    columnPixelSpacing: tps,
    rowPixelSpacing: tps,
    space_vector: (tiop_arr[0] + "," + tiop_arr[1] + "," + tiop_arr[2] + ";" + tiop_arr[3] + "," + tiop_arr[4] + "," + tiop_arr[5])
  });
};

// 获得定位线的方法
function getRefrenceLine(type, imageId) {
  var temp_rl = undefined;
  var temp_imageid = imageId.replace("dicomweb:", "");
  // debugger
  if (type === 'imagePlane' && window.cur_space_vector != undefined) {
    temp_rl = window.referenceLineArr.find(function(item) {
      return (temp_imageid == item.imageId);
    });
  }
  return temp_rl;
};
