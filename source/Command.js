enyo.kind({
    name: "cli.Command",
    kind: "Component",
    events: {
        onRegisterCommand:"",
        onUnregisterCommand:"",
        onCommandResponse: "",
        onCommandError: ""
    },
    create:function() {
        this.inherited(arguments);
        if(this.command) {
            this.doRegisterCommand({command:this.command, handler:this});
        }
    },
    destroy:function() {
        this.doUnregisterCommand({command:this.command});
        this.inherited(arguments);
    },
    execute: function(sender, event) {
        if (!this.command || (this.command && this.command === event.command)) {
            if (enyo.isString(this.commandHandler) && this.owner[this.commandHandler]) {
                this.owner[this.commandHandler](sender, event);
            } else if (enyo.isFunction(this.commandHandler)) {
                this.commandHandler(sender, event);
            }
        }
    },
    commandHandler: function(sender, event) {},
    hasArgument:function(command, arg) {
        return typeof(command.args[arg]) !== "undefined";
    }
});