/**
 * @require common:widget/ui/validator/validator.less
 */

var $ = $ || require('common:widget/ui/jquery/jquery.js');

var Validator = function(form, options) {
    var self = this;
    self.eventCenter = $(self);
    self.$form = $(form);
    self.options = $.extend({
        groupClass: 'field-group',
        blurValidEvent: 'blur.validator change.validator',
        changeValidEvent: 'input.validator propertychange.validator',
        tipEvent: 'focus.validator',
        errorClass: 'field-error',
        msgClass: 'field-msg'
    }, options);
    self.$groups = $(self.options.groupClass, self.$form);
    self.blurSelector = 'input:not([novalidate]), textarea:not([novalidate])';
    self.changeSelector = 'select:not([novalidate])';
    self.selector = self.blurSelector + ' ' + self.changeSelector;
    self.$fields = $(self.selector, self.$form);
    self.init();
};
Validator.prototype = {
    constructor: Validator,
    init: function() {
        var self = this;
        self.$form.on(self.options.blurValidEvent, self.blurSelector, function() {
            var target = $(this);
            self.validate(target, self.gatherOpt(target));
        })
        .on(self.options.changeValidEvent, self.changeSelector, function() {
            var target = $(this);
            self.validate(target, self.gatherOpt(target));
        })
        .on(self.options.tipEvent, self.selector, function() {
            var target = $(this);
            self.notify(target, 'info', target.attr('info'));
        });
    },
    gatherOpt: function(target, extra) {
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
        target.data($.extend(opt, extra));
        return opt;
    },
    throwException: function(target, type, action, value) {
        this.eventCenter.trigger('error.validator', [{
            target: target,
            log: {
                mod: target.parents('[log-mod]').attr('log-mod'),
                position: target.attr('name'),
                action: action,
                type: type,
                value: value
            }
        }]);
    },
    validate: function(target, options) {
        var self = this;
        var valid = true;
        var def;
        var action = options.action || 'blur';
        $.each(options.rules, function(k, v) {
            var value = $.trim(target.val());
            if(k === 'custom'){
                def = $.Deferred();
                self.eventCenter.trigger(v.pattern, [{'def': def, 'target': target}]);
                def.fail(function () {
                    self.notify(target, k, v.err);
                    self.throwException(target, k, action, value);
                });
            }else if(!new RegExp(v.pattern).test(value)){
                if(value.length || k !== 'invalid') {
                    self.notify(target, k, v.err);
                    self.throwException(target, k, action, value);
                    valid = false;
                    return false;
                }
            }
        });
        function test() {
            if(valid){
                if(options.brothers.length) {
                    var hasBadBrothers;
                    $.each(options.brothers, function(k, v) {
                        var $v = $(v);
                        var state = $v.data('state');
                        var value = $.trim($v.val());
                        if(state === 'empty' || state === 'invalid'){
                            self.notify($v, state, $v.data('rules')[state].err);
                            self.throwException($v, state, action, value);
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
    validateAll: function (fieldContainer) {
        var self = this;
        var result = true;
        if(fieldContainer && fieldContainer.length) {

        }else{
            fieldContainer = self.$form;
        }
        $(self.selector, fieldContainer).each(function (k, v) {
            var target = $(v);
            self.validate(target, self.gatherOpt(target, {action: 'submit'}));
            if(target.data('state') !== 'pass') {
                result = false;
                target[0].scrollIntoView(false);
                return false;
            }
        });
        return result;
    },
    notify: function(target, type, content) {
        var self = this;
        var group = target.parents('.' + self.options.groupClass);
        switch(type) {
            case 'empty':
            case 'invalid':
            case 'custom':
                target.removeClass(self.options.passClass + ' ' + self.options.infoClass).addClass(self.options.errorClass);
                group.addClass(self.options.groupClass + '-error');
                break;
            case 'pass':
                target.removeClass(self.options.errorClass + ' ' + self.options.infoClass).addClass(self.options.passClass);
                group.removeClass(self.options.groupClass + '-error');
                break;
            case 'info':
                target.removeClass(self.options.errorClass + ' ' + self.options.passClass).addClass(self.options.infoClass);
                group.removeClass(self.options.groupClass + '-error');
                break;
        }
        if(type !== 'info') {
            target.data('state', type);
            // console.log(target[0].name + ': ' + target.data('state'));
        }
        group.find('.' + self.options.msgClass).html(content || '');
    }
};

module.exports = Validator;
