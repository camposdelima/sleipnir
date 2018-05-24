(function() {

		var Class =  class PerformanceAnalyzer {
            constructor(logger, calendarFactory, trader) {
                this.logger = logger;
				this.trader = trader;
				this.calendarFactory = calendarFactory;
				this.result = {}
				this.evaluate();
            }

			async evaluate() {
				var portfolio = await this.trader.getPortfolio();
				var currency = portfolio.currency;
				var asset = portfolio.asset * 10;
				var balance = asset+currency;

				this.result.startTime = this.result.startTime || this.calendarFactory.get();
				this.result.startBalance = this.result.startBalance || balance;

				this.result = {
					'assetBalance': asset,
					'endTime': this.calendarFactory.get().format(),
					'finalBalance': balance,
					'currency': currency,
					'assetBalance': asset,
					'return': balance - this.startBalance,
					'rate': ((balance / this.startBalance) - 1).toFixed(2)
				};

				this.logger.info({
					balance: this.result.finalBalance,
					return: this.result.return,
					rate: this.result.rate
				});

				return this.result;
			}
		};

        Class.$inject = ["logger", "calendarFactory", "trader"];
		module.exports = Class;
})();
