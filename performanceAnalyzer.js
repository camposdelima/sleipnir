(function() {

		var Class =  class PerformanceAnalyzer {
            constructor(logger, calendarFactory, trader) {
                this.logger = logger;
				this.trader = trader;
				this.calendarFactory = calendarFactory;
				this.evaluation = {}
				this.evaluate();
            }

			async evaluate() {
				let totalVolume = this.trader.totalVolume;
				let totalOrders = this.trader.orders.sell + this.trader.orders.buy;
				let portfolio = await this.trader.getPortfolio();
				let realized = portfolio.currency;
				let unrealized = portfolio.custody + portfolio.assetEvaluation;

				let balance = realized+unrealized;
				let currentTime = this.calendarFactory.get().format();


				this.evaluation.startTime = this.evaluation.startTime || currentTime;
				this.evaluation.startBalance = this.evaluation.startBalance || balance;

				this.evaluation = {... this.evaluation,
					'totalVolume': totalVolume,
					'totalOrders': totalOrders,
					'endTime': currentTime,
					'finalBalance': balance,
					'realized': realized,
					'unrealized': unrealized,
					'return': (balance - this.evaluation.startBalance),
					'rate': ((balance / this.evaluation.startBalance) - 1)
				};

				//this.logger.debug(this.evaluation);;
			}

			async getEvaluation() {
				await this.evaluate();
				return { ...this.evaluation,
					'realized': this.evaluation.realized.toFixed(2),
					'unrealized': this.evaluation.unrealized.toFixed(2),
					'return': this.evaluation.return.toFixed(2),
					'rate': this.evaluation.rate.toFixed(2),
					'rate%': (this.evaluation.rate * 100).toFixed(2) + '%'
				};
			}
		};

        Class.$inject = ["logger", "calendarFactory", "trader"];
		module.exports = Class;
})();
