(function() {
	
		var Class =  class Engine {    
			constructor () {             
                var intravenous = require("eflex-intravenous");   
                var dependencies = require('./dependencies.json');
                
                this.container = intravenous.create();
                
                for (var key in dependencies) {
                    var src = dependencies[key];
                    var dependency = require(src);
                    this.container.register(key, dependency );
                };
            } 
            
            execute(executableDependencyName) {
                this.container.get(executableDependencyName).execute();
            }
		};
	
		module.exports = Class;
})();