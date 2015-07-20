var Validator = function(form, options) {
    var self = this;
    self.$form = $(form);
    self.options = $.extend({
        groupClass: 'field-group',
        validEvent: 'blur.validator change.validator',
        tipEvent: 'focus.validator',
        errorClass: 'field-error',
        msgClass: 'field-msg',
        eventCenter: window
    }, options);
    self.$groups = $(self.options.groupClass, self.$form);
    self.selector = 'input:not([novalidate]), select:not([novalidate]), textarea:not([novalidate])';
    self.$fields = $(self.selector, self.$form);
    self.init();
};
Validator.prototype = {
    constructor: Validator,
    init: function() {
        var self = this;
        self.$form.on(self.options.validEvent, self.selector, function() {
            var target = $(this);
            self.validate(target, self.gatherOpt(target));
        })
        .on(self.options.tipEvent, self.selector, function() {
            var target = $(this);
            self.notify(target, 'info', target.attr('info'));
        });
    },
    gatherOpt: function(target) {
        var self = this;
        var opt = {};
        opt.target = target;
        opt.state = '';
        opt.brothers = target.parents('.' + self.options.groupClass).find(self.selector);
        var brotherIndex = opt.brothers.index(target);
        opt.brothers.splice(brotherIndex, 1);
        opt.rules = {};

        if(target.attr('required')){
            opt.rules['empty'] = {
                pattern: '^.+$',
                err: target.attr('empty')
            };
        }
        if(target.attr('pattern')){
            opt.rules['invalid'] = {
                pattern: target.attr('pattern'),
                err: target.attr('invalid')
            };
        }
        if(target.attr('custom')){
            opt.rules['custom'] = {
                pattern: target.attr('custom'),
                err: target.attr('cmsg')
            };
        }
        target.data(opt);
        return opt;
    },
    validate: function(target, options) {
        var self = this;
        var valid = true;
        var def;
        $.each(options.rules, function(k, v) {
            var value = $.trim(target.val());
            if(k === 'custom'){
                def = $.Deferred();
                $(self.options.eventCenter).trigger(v.pattern, [{'def': def, 'target': target}]);
                def.fail(function () {
                    self.notify(target, k, v.err);
                });
            }else if(!new RegExp(v.pattern).test(value)){
                self.notify(target, k, v.err);
                valid = false;
                return false;
            }
        });
        function test() {
            if(valid){
                if(options.brothers.length) {
                    var hasBadBrothers;
                    $.each(options.brothers, function(k, v) {
                        var $v = $(v);
                        var state = $v.data('state');
                        if(state === 'empty' || state === 'invalid'){
                            self.notify($v, state, $v.data('rules')[state].err);
                            hasBadBrothers = true;
                            return false;
                        }
                    });
                    if(hasBadBrothers) return false;
                }
                self.notify(target, 'pass');
            }
        }
        if(def){
            $.when(def).then(function(data) {
                test();
            });
        }else{
            test();
        }
    },
    notify: function(target, type, content) {
        var self = this;
        switch(type) {
            case 'empty':
            case 'invalid':
            case 'custom':
                target.removeClass(self.options.passClass + ' ' + self.options.infoClass).addClass(self.options.errorClass);
                break;
            case 'pass':
                target.removeClass(self.options.errorClass + ' ' + self.options.infoClass).addClass(self.options.passClass);
                break;
            case 'info':
                target.removeClass(self.options.errorClass + ' ' + self.options.passClass).addClass(self.options.infoClass);
                break;
        }
        target.data('state', type);
        target.parents('.' + self.options.groupClass).find('.' + self.options.msgClass).html(content || '');
    }
};
