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
                    ,'custody': 0
                };
                this.totalVolume = 0;
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
                return 10000;//ticker.last;
            }


            async getFees() {
                var fees = await this.exchange.getFees();
                return fees;
            }

            async calculateFees(desiredAmount) {
                var fees = await this.getFees();
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
                if(assetAmount < 0)
                    throw new Error("Trying buy negative quantity.");
                //BUYL
                let price = await this.getLastPrice();
                let cost = await this.calculateCost(assetAmount, price);

                this.applyBuyOrder(assetAmount, price);

                this.applyBuyCustody(cost, price);

                await this.updatePortfolio();
            }

            applyBuyOrder(assetAmount, price) {
                this.exchange.createLimitBuyOrder(this.symbol, assetAmount, price);
                this.portfolio.asset += assetAmount;
                this.totalVolume += assetAmount;
            }

            applyBuyCustody(cost) {
                if(this.portfolio.custody > 0) {
                    this.portfolio.custody -= cost;

                    if(this.portfolio.custody < 0) {
                        this.portfolio.currency += this.portfolio.custody;
                        this.portfolio.custody = 0;
                    }
                } else
                    this.portfolio.currency -= cost;

                //calcular diferenca aqui
            }

            async calculateCost(assetAmount, price) {
                let assetAmountWithFees = await this.includeFees(assetAmount);
                return assetAmountWithFees * price;
            }


            async sell(assetAmount) {
                if(assetAmount < 0)
                    throw new Error("Trying sell negative quantity.")

                let price = await this.getLastPrice();
                let revenue = await this.calculateRevenue(assetAmount, price);

                this.applyCustody(revenue, price, assetAmount);
                this.applySellOrder(assetAmount, price);

                await this.updatePortfolio();
            }

            applySellOrder(assetAmount, price) {
                this.exchange.createLimitSellOrder(this.symbol, assetAmount, price);
                this.portfolio.asset -= assetAmount;
                this.totalVolume += assetAmount;
            }

            applyCustody(revenue, price, assetAmount) {
                let currentCustody = this.calculateCurrentCustody(price, assetAmount);

                let actualRevenue = revenue - currentCustody;
                this.portfolio.custody += currentCustody;
                this.portfolio.currency += actualRevenue;
            }

            async calculateRevenue(assetAmount, price) {
                var actualAssetAmount = await this.subtractFees(assetAmount);
                return actualAssetAmount * price;
            }

            calculateCurrentCustody(price, assetAmount) {
                var currentAsset = this.portfolio.asset-assetAmount;

                var hasCustody = currentAsset < 0;

                if(!hasCustody) {
                    return 0;
                }

                //console.log({'current': this.portfolio.asset, 'sellAmount': assetAmount, 'loan': loanAssets, 'thatCustody': currentAsset-assetAmount } );
                var loanAssets = (this.portfolio.asset < 0)?currentAsset+assetAmount:currentAsset;


                var custody = Math.abs(loanAssets * price);
                return custody;
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
