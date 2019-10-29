/**
 * @Description: 模仿jQuery封装简单的ajax功能。
 * @Author: kill370354@qq.com
 **/

var Ajax = {};
(function($) {
    function ajax(options) {
        var str;
        var xmlHttpRequest;
        var timer;
        if (window.XMLHttpRequest) {
            xmlHttpRequest = new XMLHttpRequest();
        } else {
            xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        var source = {
            type: "GET",
            processData: true,
            contentType: "application/x-www-form-urlencoded"
        };
        options = mergeObject(source, options);
        if (options.contentType.replace(/(^\s*)|(\s*$)/g, "") === "application/json") {
            options.processData = false;
        }
        xmlHttpRequest = mergeObject(xmlHttpRequest, options.xhrFields);
        if (options.type.toUpperCase() === "GET") {
            str = param(mergeObject(urlorQuerytoObject(options.url), options.data));
            if (options.url.indexOf("?") !== -1) {
                options.url = options.url.substr(0, options.url.indexOf("?"));
            }
            xmlHttpRequest.open("GET", options.url + "?" + str, true);
            xmlHttpRequest.send(null);
        } else {
            xmlHttpRequest.open(options.type.toUpperCase(), options.url, true);
            xmlHttpRequest.setRequestHeader("Content-type", options.contentType);
            if (options.processData) {
                str = param(options.data);
            } else {
                str = options.data;
            }
            xmlHttpRequest.send(str);
        }
        xmlHttpRequest.onreadystatechange = function() {
            var textStatus = "";
            if (xmlHttpRequest.readyState === 4) {
                clearInterval(timer);
                if ((xmlHttpRequest.status >= 200 && xmlHttpRequest.status < 300) || xmlHttpRequest.status === 304) {
                    if (xmlHttpRequest.status === 304) {
                        textStatus = "notmodified";
                    } else {
                        textStatus = "success";
                    }
                    try {
                        // 如果是JSON格式，自动转换为JSON对象
                        options.success(JSON.parse(xmlHttpRequest.responseText), textStatus);
                    } catch (e) {
                        options.success(xmlHttpRequest.responseText, textStatus);
                    }
                } else {
                    textStatus = "error";
                    if (typeof options.error === "function") {
                        options.error(xmlHttpRequest, textStatus);
                    }
                }
                if (typeof options.complete === "function") {
                    options.complete(xmlHttpRequest, textStatus);
                }
            }
        };
        //判断是否超时
        if (typeof options.timeout === "number") {
            timer = setTimeout(function() {
                if (typeof options.error === "function") {
                    options.error(xmlHttpRequest, "timeout");
                    options.complete(xmlHttpRequest, "timeout");
                }
                if (typeof options.complete === "function") {
                    options.complete(xmlHttpRequest, "timeout");
                }
                xmlHttpRequest.abort();
            }, options.timeout);
        }
    }

    // 合并对象
    function mergeObject(target) {
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }

    // 把url中的查询字符串转为对象，主要是想当方式为get时，用data对象的参数覆盖掉url中的参数
    function urlorQuerytoObject(urlorQuery) {
        var queryArr = [];
        var urlSplit = urlorQuery.split("?");
        queryArr[0] = urlSplit[0];
        if (urlSplit[1]) {
            queryArr[0] = urlSplit[1];
        }
        queryArr = queryArr[0].split("&");
        var obj = {};
        var i = 0;
        var temp;
        var key;
        var value;
        while (i < queryArr.length) {
            temp = queryArr[i].split("=");
            key = temp[0];
            value = temp[1];
            obj[key] = value;
            i++;
        }
        return obj;
    }

    // 序列化参数
    // 转载自 https://www.jianshu.com/p/0ca22d53feea
    function param(obj, traditional) {
        if (traditional === "undefined") {
            traditional = false;
        }
        var rbracket = /\[\]$/,
            op = Object.prototype,
            ap = Array.prototype,
            aeach = ap.forEach,
            ostring = op.toString;

        function isFunction(it) {
            return ostring.call(it) === "[object Function]";
        }

        function isArray(it) {
            return ostring.call(it) === "[object Array]";
        }

        function isObject(it) {
            return ostring.call(it) === "[object Object]";
        }

        function buildParams(prefix, obj, traditional, add) {
            var name;
            if (isArray(obj)) {
                // Serialize array item.
                aeach.call(obj, function(v, i) {
                    if (traditional || rbracket.test(prefix)) {
                        // Treat each array item as a scalar.
                        add(prefix, v);
                    } else {
                        // Item is non-scalar (array or object), encode its numeric index.
                        buildParams(
                            prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
                            v,
                            traditional,
                            add
                        );
                    }
                });
            } else if (!traditional && isObject(obj)) {
                // Serialize object item.
                for (name in obj) {
                    buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
                }
            } else {
                // Serialize scalar item.
                add(prefix, obj);
            }
        }

        // Serialize an array of form elements or a set of
        // key/values into a query string
        function jollyparam(a, traditional) {
            var prefix,
                s = [],
                add = function(key, valueOrFunction) {
                    // If value is a function, invoke it and use its return value
                    var value = isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
                };
            // If an array was passed in, assume that it is an array of form elements.
            if (isArray(a)) {
                // Serialize the form elements
                aeach.call(a, function(item) {
                    add(item.name, item.value);
                });
            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for (prefix in a) {
                    buildParams(prefix, a[prefix], traditional, add);
                }
            }
            // Return the resulting serialization
            return s.join("&");
        }

        return jollyparam(obj, traditional);
    }

    $ = {
        get: function(url, data, success) {
            return ajax({ url: url, data: data, success: success });
        },
        post: function(url, data, success) {
            return ajax({
                type: "POST",
                url: url,
                data: data,
                success: success
            });
        },
        ajax: ajax,
        param: param,
        urlorQuerytoObject: urlorQuerytoObject,
        mergeObject: mergeObject
    };

    // 满足 JQuery 的使用习惯
    if (typeof window.$ === "undefined") {
        window.$ = $;
    }
})(Ajax);
