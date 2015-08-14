
function init() {
    var _form = $('form');
    var _validator = new Validator(_form);
    var _datepicker = $('#datepicker');

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
        var target = data.target;
        $.ajax({
            url: '../test/async.json',
            // data: {value: $.trim(data.target.val())},
            dataType: 'json'
        }).done(function (data) {
            if (data && data.ret === $.trim(target.val())) {
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
    var _input = $('#aaa');
    var _select = $('#bbb');
    var dataArr = ['a1', 'a2', 'a3'];
    _select.on('change', function() {
        _input.val(_select.val());
    });
    _input.on('blur', function() {
        _select.trigger('validator-force');
    }).autocomplete({
        autoFocus: true,
        source: dataArr,
        change: function(event, ui) {
            if(!ui.item) {
                _input.val(_select.val());
                console.log('not in the list');
            }
        },
        select: function(event, ui) {
            _select.val(ui.item.value);
            _select.trigger('validator-force');
        }
    });
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
