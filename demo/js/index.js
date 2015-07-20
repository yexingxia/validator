
function init() {
    var _form = $("form");
    var _fields = $(".autovalid", _form);
    var _validator = new Validator(_form);
    // $.each(_fields, function(k, v) {
    //     var $v = $(v);
    //     var value = $.trim($v.val());
    //     var opts = {
    //         required: $.trim($v.attr('required')),
    //         pattern: $.trim($v.attr('pattern'))
    //     };
    //     if(!!opts.required){
    //         if(!value.length) {
    //             alert('empty');
    //             return false;
    //         }
    //     }
    //     if(opts.pattern.length) {
    //         var reg = new RegExp(opts.pattern);
    //         if(!reg.test(value)) {
    //             alert('pattern not match');
    //             return false;
    //         }
    //     }
    // });
    $(window).on('same.pwd1', function(e, data) {
        var pwd2 = $.trim(data.target.val());
        var pwd1 = $.trim($('#pwd1').val());
        var def = data.def;
        if(pwd1 !== pwd2) {
            def.reject();
        }else{
            def.resolve();
        }
    }).on('repeat.name', function(e, data) {
        var def = data.def;
        $.ajax({
            url: "/account/user/check?key=account_company_name",
            data: {value: $.trim(data.target.val())},
            dataType: "json"
        }).done(function (data) {
            if (data && data.ret != 0) {
                def.reject();
            } else {
                def.resolve();
            }
        }).fail(function () {
            def.resolve();
        });
    });
}





bindEvent(window, 'load', init);

function bindEvent(target, type, callback) {
    if(window.addEventListener) {
        return target.addEventListener(type, callback, false);
    }else{
        return target.attachEvent('on' + type, callback);
    }
}
