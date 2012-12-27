//* Using the great code from https://github.com/silentmatt/js-expression-eval
enyo.kind({
    name:"ex.Calc",
    command:"calc",
    kind:"cli.Command",
    create:function() {
        this.inherited(arguments);
        this.variables = {};
    },
    commandHandler:function(sender, command) {
        if(this.hasArgument(command, "h")) {
            this.doCommandError({
                message:"Mathematical Expression Evaluator (from <a href=\"https://github.com/silentmatt/js-expression-eval\" target=\"blank\">https://github.com/silentmatt/js-expression-eval</a>)<br>Usage: " + this.command + " [-s variable=value] [expression]"
            });
        } else if(this.hasArgument(command, "s")) {
            var s$ = enyo.isArray(command.args.s) ? command.args.s : [command.args.s];
            for(var i=0;i<s$.length;i++) {
                var s = s$[i].split("=");
                if(s[0]) {
                    if(s[1]) {
                        var x = parseFloat(s[1]);
                        if(isNaN(x)) {
                            this.doCommandError({message:s[0] + " was not a number"});
                            return;
                        } else {
                            this.variables[s[0]] = x;
                        }
                    } else {
                        delete this.variables[s[0]];
                    }
                }
            }
            
            var resp = [];
            for(var v in this.variables) {
                resp.push({content:v+"="+this.variables[v]});
            }
            
            this.doCommandResponse({response:resp});
        } else {
            var ex = Parser.parse(command.argList.join(" ")).simplify(this.variables),
                vars = ex.variables(),
                response;
            
            if(vars.length === 0) {
                response = ex.evaluate();
            } else {
                response = ex.toString();
            }
            
            this.doCommandResponse({
                response:[{content:response}]
            });
        }
    }
});
