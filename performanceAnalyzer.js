(function() {

		var Class =  class PortfolioComparer {            
            constructor(logger) {
                this.logger = logger;
            }

            compare(base, compared) {
                console.log(base);
                console.log(compared);
            }

		};  
  
        Class.$inject = ["logger"];
		module.exports = Class;
})();
