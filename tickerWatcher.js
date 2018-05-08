(function() {
        const exchangeName = 'bitfinex';
        const symbol ='BTC/USD';
        const delay = 5000;

		var Class =  class Main {            
            constructor(logger, exchangeBuilder, timer, calendar) {
                this.logger = logger;   
                this.exchange =  exchangeBuilder.build(exchangeName);
                this.timer = timer;
                this.calendar = calendar;
            }

            //IExecutable
            execute() {
                this.timer.scheduleLoop(delay, () => this.watch());
            }

            async watch() {
                var ticker = await this.exchange.fetchTicker(symbol); 
                
                this.logger.debug({'price': ticker.last});
            }
		};  
  
        Class.$inject = ["logger", "exchangeBuilder", "timer", "calendar"];
		module.exports = Class;
})();
