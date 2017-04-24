//日期转换
function formatDateTime(date) {
  if (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  } else {
    return '';
  }
};

function resMsg(code, message, data, page) {
  if (page) {
    return {
      code: code,
      message: message,
      data: data || [],
      page: page
    }
  } else {
    return {
      code: code,
      message: message,
      data: data || {}
    }
  }
}

exports.formatDateTime = formatDateTime;
exports.resMsg = resMsg;
