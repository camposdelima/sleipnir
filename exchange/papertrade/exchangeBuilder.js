(function() {

    var Class = class ExchangeBuilder {            
        constructor(logger, exchange) {
            this.logger = logger;
            this.exchange = exchange;
        }
        
        build(exchangeName) {
            return this.exchange;
        }


    };

    Class.$inject = ["logger", "exchange"];
    module.exports = Class;
})();
