var validator, vOpt, testEvent, result;

/**
 * 测试输入在单个规则下的有效性
 * @param  {object} assert   [description]
 * @param  {string} ruleType [description]
 * @param  {object} $tester  [description]
 * @param  {object} $msg     [description]
 * @param  {string} value    [description]
 * @param  {boolean} async    optional
 */
function testByOneRule ( assert, ruleType, $tester, $msg, value, async ) {
    var rule = $tester.data( 'rules' )[ ruleType ];
    var actualMsg;
    var expectMsg = rule && rule.err || $tester.attr( ruleType ) || '';

    if ( ruleType === 'info' ) {
        $tester.trigger( vOpt.tipEvent );
        actualMsg = $msg.text();
        ok( actualMsg === expectMsg, '【ONE】<' + vOpt.tipEvent + '> show info' );
    } else {
        $tester.val( value );
        $tester.trigger( testEvent );
        if( async ) {

        } else {
            actualMsg = $msg.text();

            if ( ruleType === 'correct' ) {
                ok( !$tester.hasClass( vOpt.errorClass ) && actualMsg === expectMsg, '【ONE】<' + testEvent + '> ' + ruleType + ': input( \'' + value + '\' ) remove error class and error msg' );
            } else {
                if ( rule ) {
                    ok( $tester.hasClass( vOpt.errorClass ) && actualMsg === expectMsg, '【ONE】<' + testEvent + '> ' + ruleType + ': input( \'' + value + '\' ) mark error class and msg' );
                } else {
                   ok ( true, '【ONE】<' + testEvent + '> ' + ruleType + ': no rule set');
                }
            }
        }

    }
}
/**
 * 测试输入在全部规则下的有效性
 * @param  {object} assert   [description]
 * @param  {object} $tester  [description]
 * @param  {object} $msg     [description]
 * @param  {string} value    [description]
 * @param  {boolean} async    optional
 */
function testByAllRules ( assert, $tester, $msg, value, info ) {
    var rules = $tester.data( 'rules' );
    var actualMsg;
    var expectMsg;
    var prefix = '【ALL】输入\'' + value + '\'('+ (info || '') + ') => ';
    result = '';

    function test ( ruleType ) {
        expectMsg = rules[ruleType] && rules[ruleType].err || $tester.attr( ruleType ) || '';
        actualMsg = $msg.text();
        // if ( !rules[ruleType] ) return 'no ' + ruleType + ' rule';
        if ( $tester.hasClass( vOpt.errorClass ) && actualMsg == expectMsg ) return ruleType + ' error';
        return '';
    }
    // click action
    $tester.trigger( vOpt.tipEvent );
    // info
    expectMsg = $tester.attr( 'info' );
    if ( expectMsg ) {
        actualMsg = $msg.text();
        if ( actualMsg !== expectMsg ) {
            result = 'info error';
            return false;
        }
    }
    // input action
    $tester.val( value );
    $tester.trigger( testEvent );
    // empty
    result = test ( 'empty' );
    if ( result.length ) {
        result = prefix + result;
        return false;
    }
    // invalid
    result = test ( 'invalid' );
    if ( result.length ) {
        result = prefix + result;
        return false;
    }
    // custom
    result = test ( 'custom' );
    if ( result.length ) {
        result = prefix + result;
        return false;
    }
    // correct
    else {
        result = prefix + 'correct';
        return true;
    }
}

QUnit.extend( QUnit.assert, { testByOneRule: testByOneRule } );

QUnit.testStart( function ( test ) {
    console.log(test.name);
    validator = new Validator( $('.valid-form') );
    vOpt = validator.options;
    testEvent = 'blur';
    $.each(validator.$fields , function ( k, v ) {
        validator.gatherOpt( $(v) );
    } );
} );

test( '简单输入框 - ' + $('input', '.simple-test').attr('info'), function( assert ) {
    // expect( 8 );

    var $group = $( '.simple-test' );
    var $tester = $group.find( 'input' );
    var $msg = $group.find( '.field-msg' );

    /*test by all-rules*/
    notOk( testByAllRules(assert, $tester, $msg, '', '空'), result );
    notOk( testByAllRules(assert, $tester, $msg, '  ', '多个空格'), result );
    notOk( testByAllRules(assert, $tester, $msg, 'a', '字母'), result );
    notOk( testByAllRules(assert, $tester, $msg, '1a', '数字+字母'), result );
    notOk( testByAllRules(assert, $tester, $msg, '&', '特殊符号'), result );
    ok( testByAllRules(assert, $tester, $msg, ' 1', '空格+数字'), result );
    ok( testByAllRules(assert, $tester, $msg, '111111111111111111111111111111111111', '多个数字'), result );

    /*test by single-rule*/
    // // info
    // testByOneRule( assert, 'info', $tester, $msg, '' );

    // // empty
    // testByOneRule( assert, 'empty', $tester, $msg, '' );

    // // invalid
    // testByOneRule( assert, 'invalid', $tester, $msg, 'a' );

    // // custom
    // testByOneRule( assert, 'custom', $tester, $msg, 'a' );

    // // correct
    // testByOneRule( assert, 'correct', $tester, $msg, '111' );
});

test( '密码输入框 - ' + $('input', '.password1').attr('info'), function( assert ) {
    // expect( 5 );

    var $group = $( '.password1' );
    var $tester = $group.find( 'input' );
    var $msg = $group.find( '.field-msg' );

    /*test by single-rule*/
    notOk( testByAllRules(assert, $tester, $msg, '', '空'), result );
    notOk( testByAllRules(assert, $tester, $msg, '      ', '足够位数的空格'), result );
    notOk( testByAllRules(assert, $tester, $msg, 'a', '小于6位'), result );
    ok( testByAllRules(assert, $tester, $msg, '1a&？符号', '最小6位'), result );
    ok( testByAllRules(assert, $tester, $msg, '&？乱七八糟_+', '特殊符号'), result );
    ok( testByAllRules(assert, $tester, $msg, ' 1a&？符号', '空格+有效值'), result );
    notOk( testByAllRules(assert, $tester, $msg, '111111111111111111111111111111111111', '超过12位'), result );
});

test( '密码确认框 - ' + $('input', '.password2').attr('info'), function( assert ) {
    // expect( 9 );

    var $group = $( '.password2' );
    var $tester = $group.find( 'input' );
    var $msg = $group.find( '.field-msg' );

    var $pwd1 = $('#pwd1');
    $pwd1.val('111111');
    validator.eventCenter.on('same.pwd1', function(e, data) {
        var pwd2 = $.trim(data.target.val());
        var pwd1 = $.trim($pwd1.val());
        var def = data.def;

        if(pwd1 !== pwd2) {
            def.reject();
        }else{
            def.resolve(true);
        }
    });

    /*test by all-rules*/
    notOk( testByAllRules(assert, $tester, $msg, '', '空'), result );
    notOk( testByAllRules(assert, $tester, $msg, '      ', '足够位数的空格'), result );
    notOk( testByAllRules(assert, $tester, $msg, 'a', '小于6位'), result );
    notOk( testByAllRules(assert, $tester, $msg, '1a&？符号', '最小6位-与password1不一致'), result );
    notOk( testByAllRules(assert, $tester, $msg, '&？乱七八糟_+', '特殊符号-与password1不一致'), result );
    notOk( testByAllRules(assert, $tester, $msg, ' 1a&？符号', '空格+有效值-与password1不一致'), result );
    notOk( testByAllRules(assert, $tester, $msg, '111111111111111111111111111111111111', '超过12位'), result );
    ok( testByAllRules(assert, $tester, $msg, '111111', '与password1一致'), result );
});

test( '组合框 - [' + $('#combo-1').attr('info') + ']-[' + $('#combo-2').attr('info') + ']-[' + $('#combo-3').attr('info') + ']', function( assert ) {
    var $group = $( '.combo' );
    var $tester = $group.find( 'input:not([novalidate])' );
    var $msg = $group.find( '.field-msg' );

    function combotest(testCase) {
        var msg = [];
        $.each( $tester, function ( k, v ) {
            var $v = $(v);
            var curCase = testCase[k];
            ok( testByAllRules( assert, $v, $msg, curCase.value, curCase.info) === curCase.result, result);
            msg.push(result);
        } );
        var errPos = $tester.filter('.field-error').attr('id');
        ok( true, msg.join(' & ') + '  ==   ' + (errPos ? 'error at <' + errPos + '>' : 'no error') );
    }
    var emptyCase = [
        { value: '', info: '空', result: false },
        { value: '', info: '空', result: false },
        { value: '', info: '空', result: false }
    ];
    combotest(emptyCase);

    var invalidCase = [
        { value: 'aa', info: '非数字', result: false },
        { value: 'a', info: '位数不够', result: false },
        { value: '&*', info: '特殊字符', result: false }
    ];
    combotest(invalidCase);

    var mixCase = [
        { value: 'aa', info: '非数字', result: false },
        { value: 'a', info: '位数不够', result: false },
        { value: '__', info: '2位下划线', result: true }
    ];
    combotest(mixCase);

    var mixCase2 = [
        { value: '1', info: '一位数字', result: true },
        { value: 'a', info: '位数不够', result: false },
        { value: '&*', info: '特殊字符', result: false }
    ];
    combotest(mixCase2);

    var mixCase3 = [
        { value: '1', info: '一位数字', result: true },
        { value: 'a', info: '位数不够', result: false },
        { value: '__', info: '2位下划线', result: true }
    ];
    combotest(mixCase3);

    var correctCase = [
        { value: '1', info: '一位数字', result: true },
        { value: 'aaaaaa', info: '6位字母', result: true },
        { value: '__', info: '2位下划线', result: true }
    ];
    combotest(correctCase);
});

test( '下拉框 - 只能选下拉列表有的项', function( assert ) {
    var $group = $( '.select' );
    var $tester = $group.find( 'select' );
    var $msg = $group.find( '.field-msg' );

    notOk( testByAllRules(assert, $tester, $msg, '  ', '多个空格'), result );
    ok( testByAllRules(assert, $tester, $msg, 'a1', '下拉列表项'), result );
    notOk( testByAllRules(assert, $tester, $msg, 'a 1', '非下拉列表项'), result );
});

test( '提交校验全部', function( assert ) {
    var $group = $('.field-group:not([novalidate])');
    var selector = $( 'input:not([novalidate]), select' );
    var testCase = [ '123', '1a1a1a1', 'aa1', '', '1a1a1a1', 'aa1', '', '1a1a1a1', 'aa1', '' ];
    var submitBtn = $('#submitBtn');

    submitBtn.on('click', function(e, info) {
        if(info === 'all pass') {
            ok(validator.validateAll(), '校验' + info + '，' + (validator.$fields.filter('.field-error').eq(0).data('state') ? validator.$fields.filter('.field-error').eq(0).data('state') + ' error focus at 【' + validator.$fields.filter('.field-error').eq(0).attr('name') + '】' : 'no error'));
        }else{
            notOk(validator.validateAll(), '校验' + info + '，' + validator.$fields.filter('.field-error').eq(0).data('state') + ' error focus at 【' + validator.$fields.filter('.field-error').eq(0).attr('name') + '】');
        }
        e.preventDefault();
    });
    validator.eventCenter.on('same.pwd1', function(e, data) {
        var pwd2 = $.trim(data.target.val());
        var pwd1 = $.trim($('input', '.password1').val());
        var def = data.def;

        if(pwd1 !== pwd2) {
            def.reject();
        }else{
            def.resolve(true);
        }
    });
    submitBtn.trigger('click', ['全空']);


    validator.$fields.eq(0).val('111');
    submitBtn.trigger('click', ['简单输入框 pass']);

    validator.$fields.eq(1).val('111');
    submitBtn.trigger('click', ['密码输入框 invalid']);

    validator.$fields.eq(1).val('111111');
    submitBtn.trigger('click', ['密码输入框 pass']);

    validator.$fields.eq(2).val('1111');
    submitBtn.trigger('click', ['密码确认框 invalid']);

    validator.$fields.eq(2).val('111112');
    submitBtn.trigger('click', ['密码确认框 !== 密码输入框']);

    validator.$fields.eq(2).val('111111');
    submitBtn.trigger('click', ['密码确认框 === 密码输入框']);

    validator.$fields.eq(3).val('111111');
    submitBtn.trigger('click', ['自定义验证 pass']);

    validator.$fields.eq(2).val('1111112');
    submitBtn.trigger('click', ['密码确认框又输错了']);

    validator.$fields.eq(2).val('111111');
    validator.$fields.eq(4).val('a3');
    validator.$fields.eq(5).val('111');
    validator.$fields.eq(6).val('aaaaaa');
    validator.$fields.eq(7).val('a3');
    validator.$fields.eq(8).val('2015-01-01');
    submitBtn.trigger('click', ['all pass']);
    // var counter = 0;

    // $.each ( $group, function ( k, v ) {
    //     var $v = $(v);
    //     var $tester = $v.find(selector);
    //     var $msg = $v.find('.field-msg');
    //     $.each($tester, function(i, j){
    //         ok( true, testByAllRules(assert, $(j), $msg, testCase[counter]));
    //         counter++;
    //     });
    // } );
});

// test( 'ajax', function( assert ) {
//     //expect( 2 );
//     var done = assert.async();
//     var $group = $( '.ajax' );
//     var $tester = $group.find( 'input' );
//     var $msg = $group.find( '.field-msg' );

//     ok( true, testByAllRules(assert, $tester, $msg, '  '));

//     $tester.val('a');
//     validator.eventCenter.on('repeat.name', function(e, data) {
//         var def = data.def;
//         var target = data.target;
//         $.ajax({
//             url: '../test/async.json',
//             // data: {value: $.trim(data.target.val())},
//             dataType: 'json'
//         }).done(function (data) {
//             if (data && data.ret === $.trim(target.val())) {
//                 ok(true, 'repeat name');
//                 def.reject();
//             } else {
//                 ok(true, 'valid name');
//                 def.resolve();
//             }
//             done();
//         }).fail(function () {
//             ok(true, 'valid name');
//             def.resolve();
//             done();
//         });
//     });

//     validator.eventCenter.trigger( 'repeat.name', { def: $.Deferred(), target: $tester } );

// });
