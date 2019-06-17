(function($, window, document, undefined) {
    $.fn.addMoreRow = function(options, callback) {
        // Default options
        var settings = $.extend({
            loaderDelay: 1000,
            removeButtoncontainer: '<div class="remove-container"></div>',
            removeButtonclass: 'btn btn-danger',
            removeButtonText: 'Remove'
        }, options);

        this.addEvents(settings, callback);
    };

    $.extend($.fn, {
        addEvents: function(settings, callback) {
            var self = this,
                containerId = settings.containerId,
                containerClass = settings.containerClass,
                containerIdPattern = settings.containerIdPattern,
                containerClassPattern = settings.containerClassPattern,
                removeButtonContainer = settings.removeButtoncontainer,
                removeButtonClass = settings.removeButtonclass + ' btn-remove',
                removeButtonText = settings.removeButtonText,
                divReindexPattern = settings.divReindexPattern;

            $(self).on('click', function() {
                var lastBlockId = $(`.${containerClass}`).length;
                var newBlockId = lastBlockId + 1;
                if (typeof settings.maxAllowedBlock != 'undefined' &&
                    lastBlockId >= settings.maxAllowedBlock) {
                    alert(`Can't add more than ${settings.maxAllowedBlock} block`);
                    return false;
                }
                self.bindLoader(settings, 'show');

                var $cloneHTML = $(`#${containerIdPattern}${lastBlockId}`).clone();

                self.reIndexInputs(settings, $cloneHTML, lastBlockId, newBlockId, 'add');

                if (typeof containerClassPattern != 'undefined') {
                    $cloneHTML.removeClass(`${containerClassPattern}${lastBlockId}`)
                        .addClass(`${containerClassPattern}${newBlockId}`);
                }

                $cloneHTML.attr('id', `${containerIdPattern}${newBlockId}`)
                    .attr('data-row', `${newBlockId}`)
                    .insertAfter(`#${containerIdPattern}${lastBlockId}`)
                    .find('.btn-remove').parent().remove();

                var buttonId = `${containerIdPattern}${newBlockId}_btn-remove`;
                var removeButton = `<button type="button" 
                            data-container="${containerIdPattern}${newBlockId}"
                            data-button-id="${buttonId}"
                            class="${removeButtonClass}">${removeButtonText}</button>`;

                $(`#${containerIdPattern}${newBlockId}`).prepend(removeButton);
                $(`button[data-button-id=${buttonId}]`).on('click', function() {
                    self.removeItem(this, self, settings, callback);
                }).wrap(removeButtonContainer);

                self.bindLoader(settings, 'hide');
                self.blur();

                if (typeof callback == 'function') {
                    callback.call(this, settings, newBlockId);
                }
            });
        },
        bindLoader: function(settings, eventType) {
            var self = this;
            if (eventType == 'show') {
                $('.preloader').css({
                    'display': 'block',
                    'opacity': '0.5'
                });
                self.prop("disabled", true);
            } else {
                setTimeout(function() {
                    $(".preloader").hide();
                    self.prop("disabled", false);
                }, settings.loaderDelay);
            }
        },
        removeItem: function(elem, addButtonSelf, settings, callback) {
            this.bindLoader(settings, 'show');
            var removeBlockId = $(elem).data('container');
            var removeButtonId = removeBlockId.replace(settings.containerIdPattern, '');
            $(`#${removeBlockId}`).remove();
            this.reIndexElements(addButtonSelf, settings, removeButtonId);
            this.bindLoader(settings, 'hide');
            if (typeof callback == 'function') {
                callback.call(elem, settings);
            }
        },
        reIndexInputs: function(settings, cloneElem, oldIndex, newIndex, action) {
            var divReindexPattern = settings.divReindexPattern;
            cloneElem.find('input, select, textarea, label').each(function() {
                if (!$(this).is('label')) {
                    if (typeof this.id != 'undefined') {
                        $(this).attr('id', this.id.replace(oldIndex, newIndex));
                    }
                    if (typeof this.name != 'undefined') {
                        $(this).attr('name', this.name.replace(oldIndex, newIndex));
                    }
                } else {
                    if (typeof $(this).attr('for') != 'undefined') {
                        $(this).attr('for', $(this).attr('for').replace(oldIndex, newIndex));
                    }
                }
                if (action == 'add') {
                    if ($.inArray($(this).attr('type'), ['radio', 'checkbox']) !== -1) {
                        $(this).prop('checked', false).removeAttr('checked');
                    } else {
                        $(this).val('');
                    }
                    if (!$(this).is('label') && $(this).hasClass('error')) {
                        $(this).removeClass('error');
                    }
                }
            });
            cloneElem.find('label.error').remove();
            if (typeof divReindexPattern != 'undefined' && divReindexPattern.length > 0) {
                $.each(divReindexPattern, function(index, reindexDiv) {
                    cloneElem.find(`#${reindexDiv}${oldIndex}`)
                        .attr('id', `${reindexDiv}${newIndex}`);
                    cloneElem.find(`.${reindexDiv}${oldIndex}`)
                        .removeClass(`${reindexDiv}${oldIndex}`)
                        .addClass(`${reindexDiv}${newIndex}`);
                });
            }
        },
        reIndexElements: function(addButtonSelf, settings, removeButtonId) {
            var containerId = settings.containerId,
                containerClass = settings.containerClass,
                containerIdPattern = settings.containerIdPattern,
                containerClassPattern = settings.containerClassPattern;

            $(`.${containerClass}`).each(function(index, element) {
                var $elem = $(element);
                var newIndex = index + 1;
                var currentIndex = (newIndex >= removeButtonId) ? newIndex + 1 : newIndex;

                addButtonSelf.reIndexInputs(settings, $elem, currentIndex, newIndex, 'remove');

                var buttonId = `${containerIdPattern}${newIndex}_btn-remove`;
                $elem.find('button.btn-remove')
                    .attr('data-container', `${containerIdPattern}${newIndex}`)
                    .attr('data-button-id', `${buttonId}`);

                if (typeof containerClassPattern != 'undefined') {
                    $elem.removeClass(`${containerClassPattern}${currentIndex}`)
                        .addClass(`${containerClassPattern}${newIndex}`);
                }

                $elem.attr('id', `${containerIdPattern}${newIndex}`)
                    .attr('data-row', `${newIndex}`);
            });
        }
    });
}(jQuery, window, document));