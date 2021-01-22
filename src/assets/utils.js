var ajaxfn = function(url, type, datatype, data, fn) {
	/*异步调用函数*/
	$.ajax({
		"url": url,
		"type": type,
		"async": true,
		"xhrFields": {
			"withCredentials": true
		},
		"dataType": datatype,
		"data": data,
		"success": function(res) {
			fn(res);
		},
		"error": function(XMLHttpRequest, textStatus, errorThrown) {
			var result = XMLHttpRequest.status + "," + XMLHttpRequest.readyState + "," + textStatus;
			fn(result);
		}
	});
};
var IsPC = function() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone",
		"SymbianOS", "Windows Phone",
		"iPad", "iPod"
	];
	var flag = true; /* pc端是true,手机端是false */
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}();
export {
	ajaxfn,
	IsPC
}
