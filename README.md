[github](https://github.com/kill370354/my-ajax-imitate-jq)

# 用法

```
// get请求
$.get("", {}, function(data) {});

// post请求
$.post("", {}, function(data) {});

// 更完整的ajax
$.ajax({
    type: "post", // 非必须，默认 get
    url: "",
    data: {  },
    xhrFields: {
    // 非必须，自定义 XHR 对象属性
        withCredentials: true
    },
    processData: true, // 非必须，默认 true
    contentType: "application/x-www-form-urlencoded", // 非必须，默认 application/x-www-form-urlencoded
    success: function(responseData, textStatus) {
        // textStatus : "success"、"notmodified"
    },
    // timeout: 1, // 非必须，超时毫秒数，如果设置了，超时且存在error函数则会调用
    error: function(xhr, textStatus) {
        // 非必须
        // textStatus: "error"、"timeout"
    },
    complete: function(xhr, textStatus) {
        // 非必须，无论成败最后均调用
        // textStatus:  "success"、"notmodified"、"error"、"timeout"
    }
});
```


# 注意

- 如果 `$` 符号不能使用，请用 `Ajax` 替代，这个变量名若仍有冲突，请修改源代码首尾两行。
- 如果返回的是json格式的字符串，会自动将字符串转为json对象传给success函数参数，其他情况均为字符串。

    
