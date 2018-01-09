    
    ko.bindingHandlers.currencyFormat = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ko.utils.registerEventHandler(element, 'keyup', function (event) {
                var observable = valueAccessor();
                observable(formatInput(element.value));
                observable.notifySubscribers(5);
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).val(value);
        }
    };
    
    function formatInput(value) {
        value += '';
        value = value.replace(/,/g, '');
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(value)) {
            value = value.replace(rgx, '$1' + ',' + '$2');
        }
        return value;
    }
    
    ko.applyBindings(new TestViewModel());