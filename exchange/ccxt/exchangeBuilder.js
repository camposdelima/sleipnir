(function() {

    var Class = class ExchangeBuilder {            
        constructor(logger, ccxt) {
            this.logger = logger;
            this.ccxt = ccxt;
        }
        
        build(exchangeName) {
            return new this.ccxt[exchangeName]();
        }


    };

    Class.$inject = ["logger", "ccxt"];
    module.exports = Class;
})();
