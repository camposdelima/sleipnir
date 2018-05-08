    (function() {
        // const exchangeName = 'bitfinex';
        // const symbol ='BTC/USD';
        const delay = 5000;

		var Class =  class PairTrader {            
            constructor(logger, exchangeBuilder, timer, calendarFactory, exchangeName, symbol, currencyAvailable) {
                this.logger = logger;                
                this.exchange =  exchangeBuilder.build(exchangeName);
                this.timer = timer;
                // this.calendarFactory = calendarFactory;
                this.symbol = symbol;
                this.portfolio = {
                    'currency': currencyAvailable
                    ,'asset' : 0
                };
            }

            // async watch(callback) {
            //     callback(this);
            //     // this.timer.scheduleLoop(delay, () => callback(this));
            // //    var balance = await this.exchange.fetchBalance();

            // //     console.log(balance);
            //     // this.logger.debug({'price': ticker.last});

            // }

            async getPortfolio() {
                return this.portfolio;
            }

            async getLastPrice() {
                var ticker = await this.exchange.fetchTicker(this.symbol);
                return ticker.last;
            }


            async getFees() {   
                var fees = await this.exchange.getFees();                                
                return fees;
            }

            async calculateFees(desiredAmount) {
                var fees = await this.getFees();
                console.log(fees);
                var feeValue = fees.trading.maker;
                var feesAmount = desiredAmount * feeValue;

                return feesAmount;
            }

            async subtractFees(desiredAmount) {
                var feesAmount = await this.calculateFees(desiredAmount);
                var netAmount = desiredAmount-feesAmount;
                this.logger.debug({
                    "desiredAmount": desiredAmount,
                    "netAmount": netAmount.toFixed(9),
                    "feesAmount": feesAmount.toFixed(9)
                });
                return netAmount;
            }

            async includeFees(desiredAmount) {
                var feesAmount = await this.calculateFees(desiredAmount);
                var rawAmount = desiredAmount+feesAmount;
                this.logger.debug({
                    "desiredAmount": desiredAmount,
                    "rawAmount": rawAmount.toFixed(9),
                    "feesAmount": feesAmount.toFixed(9)
                });
                return rawAmount;
            }

            async buy(assetAmount) {
                //BUYL
                var price = await this.getLastPrice();
                this.exchange.createLimitBuyOrder(this.symbol, assetAmount, price);
                
                // var actualAssetAmount = await this.extractFees(assetAmount);
                var assetAmountWithFees = await this.includeFees(assetAmount);
                var cost = assetAmountWithFees * price;
                
                
                // var actualAssetAmount = await this.extractFees(assetAmount);

                this.portfolio.currency-= cost;
                this.portfolio.asset += assetAmount;
                await this.updatePortfolio();
            }

            async sell(assetAmount) {    
                var price = await this.getLastPrice();

                this.exchange.createLimitSellOrder(this.symbol, assetAmount, price);
                
                var actualAssetAmount = await this.subtractFees(assetAmount);
                var revenue = actualAssetAmount * price;
                
                this.portfolio.asset -= assetAmount;
                

                var custody = this.calculateCustody(price);
                revenue -= custody;
                this.portfolio.custody = custody;
                this.portfolio.currency += revenue;


                await this.updatePortfolio();
            }

            calculateCustody(price) {
                var hasCustody = this.portfolio.asset < 0;
                
                if(!hasCustody) {
                    return 0;
                }

                var custody = Math.abs(this.portfolio.asset * price);
                return (this.portfolio.custody || 0 )+ custody;
            }

            async close() {
                var isLong = this.portfolio.asset > 0;
                var assetAmount = Math.abs(this.portfolio.asset);

                if(isLong)
                    this.sell(assetAmount);
                else
                    this.buy(assetAmount);
            }


            async updatePortfolio() {
                this.logger.info(await this.getPortfolio());   
            }
		};
  
        Class.$inject = [   "logger", "exchangeBuilder", "timer",
                            "calendarFactory", "exchangeName",
                            "symbol", "currencyAvailable"
                        ];

		module.exports = Class;
})();
