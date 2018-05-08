(function() {
    const tickerTemplate = require('./ticker.json');
    const feesTemplate = require('./fees.json')
    const initialBalance = 100;
    var Class = class Exchange {            
        constructor(logger, calendar) {
            this.logger = logger;
            this.calendar = calendar;
            this.fees = feesTemplate;
        }

        async getFees() {
            return this.fees;
        }
        
        async fetchTicker(symbol) {
            var now = this.calendar;
            var ticker = {...tickerTemplate,
                    "last": tickerTemplate.last+(Math.random() * 1000),
                    "symbol":symbol,
                    "timestamp": now.valueOf(),
                    "datetime": now.format() };        

            return ticker;
        }

        // async calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
            
        // }
        
        async fetchBalance() {
            return initialBalance;
        }

        async createLimitBuyOrder(symbol, amount, price, params) {
            this.logger.info("Buy " +amount+" "+symbol+" @"+price);
        }


        async createLimitSellOrder(symbol, amount, price, params) {
            this.logger.info("Sell " +amount+" "+symbol+" @"+price);
        }

    };

    Class.$inject = ["logger", "calendar"];
    module.exports = Class;
})();