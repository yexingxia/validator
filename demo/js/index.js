
function init() {
    var _form = $('form');
    var _fields = $('.autovalid', _form);
    var _validator = new Validator(_form);
    var _datepicker = $('#datepicker');
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
    _validator.eventCenter.on('same.pwd1', function(e, data) {
        var pwd2 = $.trim(data.target.val());
        var pwd1 = $.trim($('#pwd1').val());
        var def = data.def;
        // setTimeout(function(){
            if(pwd1 !== pwd2) {
                def.reject();
            }else{
                def.resolve(true);
            }
        // }, 3000);

    }).on('repeat.name', function(e, data) {
        var def = data.def;
        $.ajax({
            url: '/account/user/check?key=account_company_name',
            data: {value: $.trim(data.target.val())},
            dataType: 'json'
        }).done(function (data) {
            if (data && data.ret != 0) {
                def.reject();
            } else {
                def.resolve();
            }
        }).fail(function () {
            def.resolve();
        });
    }).on('validator-error', function(e, data) {
        console.log(data);
    });

    _form.on('click', '#submitBtn', function() {
        if(_validator.validateAll()) {
            alert('pass');
        }else{
            alert('fail');
            return false;
        }
    });
    document.getElementById('aaa').oninput = function() {
        $('select').val(this.value);
        $('select').trigger('validator-force');
    };
    $('select').on('validator-force', function() {
        console.log(1);
    });
    _datepicker.datetimepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
        language: 'zh-CN',
        todayHighlight: true,
        minView: 'month'
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
