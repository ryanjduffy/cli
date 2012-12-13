enyo.kind({
    name: "cli.CommandParser",
    kind: "Component",
    published: {
        context: ""
    },
    events: {
        onCommand: ""
    },
    create:function() {
        this.inherited(arguments);
        this.commands = {};
    },
    addCommand:function(c) {
        this.commands[c.command] = c.handler;
    },
    parse: function(s) {
        
        var parts = s.match(/([\-:][\w]+|"[^"]+"|[^ ]+)/g),
            c = {
                command: parts[0],
                args: {},
                argList: []
            };
        
        for (var i = 1; i < parts.length; i++) {
            var p = parts[i],
                p2 = parts[i + 1];
            
            p = p && p.replace(/(^"|"$)/g,"");
            p2 = p2 && p2.replace(/(^"|"$)/g,"");

            c.argList.push(p);
            if (p.charAt(0) === "-" && p.length > 1) {
                var parm = p.substring(1);
                if (p2 && p2.charAt(0) !== "-") {
                    if (c.args[parm]) {
                        if (enyo.isArray(c.args[parm])) {
                            c.args[parm].push(p2);
                        } else {
                            c.args[parm] = [c.args[parm], p2];
                        }
                    } else {
                        c.args[parm] = p2;
                    }
                    c.argList.push(p2);
                    i++;
                } else {
                    c.args[parm] = "";
                }
            }
        }

        var stop = false;
        c.stop = function() {
            stop = true;
        }
        c.context = this.context;

        // send event to allow global command handling first
        this.doCommand(c);
        
        if(!stop && this.commands[c.command]) {
            this.commands[c.command].execute(this, c);
        } else {
            throw new (function CommandNotFound(command) {
                this.message = "Command not found: " + command;
            })(c.command);
        }
    }
});