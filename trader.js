    (function() {
        const delay = 5000;

		var Class =  class PairTrader {
            constructor(logger, exchangeBuilder, timer, calendarFactory, exchangeName, symbol, currencyAvailable) {
                this.logger = logger;
                this.exchange =  exchangeBuilder.build(exchangeName);
                this.timer = timer;
                this.symbol = symbol;
                this.portfolio = {
                    'currency': currencyAvailable
                    ,'asset' : 0
                    ,'custody': 0
                };
                this.totalVolume = 0;
                this.orders = {
                    'buy': 0,
                    'sell': 0
                }
            }

            async getPortfolio() {
                return { ...this.portfolio,
                    assetEvaluation: await this.evaluateAssetAmount( this.portfolio.asset ),
                };
            }

            async getLastPrice() {
                let ticker = await this.exchange.fetchTicker(this.symbol);
                return ticker.last;
            }

            async evaluateAssetAmount(assetAmount) {
                let price = await this.getLastPrice();
                return assetAmount * price;
            }


            async getFees() {
                let fees = await this.exchange.getFees();
                return fees;
            }

            async calculateFees(desiredAmount) {
                let fees = await this.getFees();
                let feeValue = fees.trading.maker;
                let feesAmount = desiredAmount * feeValue;

                return feesAmount;
            }

            async subtractFees(desiredAmount) {
                let feesAmount = await this.calculateFees(desiredAmount);
                let netAmount = desiredAmount-feesAmount;
                this.logger.debug({
                    "desiredAmount": desiredAmount,
                    "netAmount": netAmount.toFixed(9),
                    "feesAmount": feesAmount.toFixed(9)
                });
                return netAmount;
            }

            async includeFees(desiredAmount) {
                let feesAmount = await this.calculateFees(desiredAmount);
                let rawAmount = desiredAmount+feesAmount;
                this.logger.debug({
                    "desiredAmount": desiredAmount,
                    "rawAmount": rawAmount.toFixed(9),
                    "feesAmount": feesAmount.toFixed(9)
                });
                return rawAmount;
            }


            async buy(assetAmount) {
                this.checkAssetAmount(assetAmount);

                let price = await this.getLastPrice();
                let cost = await this.calculateCost(assetAmount, price);

                this.applyBuyOrder(assetAmount, price);
                this.bill(cost);

                await this.updatePortfolio();
            }

            applyBuyOrder(assetAmount, price) {
                this.exchange.createLimitBuyOrder(this.symbol, assetAmount, price);
                this.portfolio.asset += assetAmount;
                this.totalVolume += assetAmount;
                this.orders.buy++;
            }

            bill(cost) {

                if(this.hasCustody()) {
                   this.applyCustodyCredited(cost);
                   return;
                }

                this.portfolio.currency -= cost;
            }

            applyCustodyCredited(cost) {
                this.portfolio.custody -= cost;

                if(this.hasCustody() && this.portfolio.asset < 0)
                    return;

                this.portfolio.currency += this.portfolio.custody;
                this.portfolio.custody = 0;
            }

            async calculateCost(assetAmount, price) {
                let assetAmountWithFees = await this.includeFees(assetAmount);
                return assetAmountWithFees * price;
            }


            async sell(assetAmount) {
                this.checkAssetAmount(assetAmount);

                let price = await this.getLastPrice();
                let revenue = await this.calculateRevenue(assetAmount, price);

                this.applySellBill(revenue, price, assetAmount);
                this.applySellOrder(assetAmount, price);

                await this.updatePortfolio();
            }

            applySellOrder(assetAmount, price) {
                this.exchange.createLimitSellOrder(this.symbol, assetAmount, price);
                this.portfolio.asset -= assetAmount;
                this.totalVolume += assetAmount;
                this.orders.sell++;
            }

            applySellBill(revenue, price, assetAmount) {
                let custodyDebited = this.calculateCustodyDebited(price, assetAmount);

                let actualRevenue = revenue - custodyDebited;
                this.portfolio.custody += custodyDebited;
                this.portfolio.currency += actualRevenue;
            }

            async calculateRevenue(assetAmount, price) {
                let actualAssetAmount = await this.subtractFees(assetAmount);
                return actualAssetAmount * price;
            }

            calculateCustodyDebited(price, assetAmount) {
                let netAsset = this.portfolio.asset-assetAmount;

                let isAssetLoan = netAsset < 0;

                if(!isAssetLoan)
                    return 0;

                let loanAmount = this.calculateLoanAmount(netAsset);
                let custodyDebited = Math.abs(loanAmount * price);
                return custodyDebited;
            }

            calculateLoanAmount(netAsset) {
                let hasLoan = this.portfolio.asset < 0;
                if(hasLoan)
                    return netAsset - this.portfolio.asset
                else
                    return netAsset;
            }

            async close() {
                let assetAmount = Math.abs(this.portfolio.asset);
                this.checkAssetAmount(assetAmount);

                if(this.isLong())
                    await this.sell(assetAmount);
                else
                    await this.buy(assetAmount);
            }

            checkAssetAmount(assetAmount) {
                if(assetAmount <= 0)
                    throw new Error("Trying trade invalid quantity: "+assetAmount.toString()+".");
            }

            hasCustody() {
                return this.portfolio.custody > 0;
            }

            isLong() {
                return this.portfolio.asset > 0;
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
