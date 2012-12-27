enyo.kind({
    name:"cli.Loader",
    kind:"cli.Command",
    command:"load",
    create:function() {
        this.inherited(arguments);
        enyo.kind.features.push(enyo.bind(this, "inspectKind"));
    },
    inspectKind:function(ctor, props) {
        var c = new ctor();
        if(c instanceof cli.Command) {
            var e = {command:ctor.prototype.command, kind:ctor.prototype.kindName};
            this._commands.push({content:"Loaded " + e.kind + " for command " + e.command});
            // have to defer a moment because the feature is called just before setObject so the command doesn't yet exist
            enyo.asyncMethod(this, function() {
                this.bubble("onLoadCommand", e);
            });
        }
        c.destroy();
    },
    commandHandler:function(source, command) {
        if(this.hasArgument(command, "url")) {
            this._commands = [];
            enyo.runtimeLoading = true;
            var me = this;
            enyo.machine.script(command.args.url, function() {
                me.doCommandResponse({response:me._commands});
            }, function() {
                me.doCommandError({message:"load failed"});
            });
        } else {
            this.doCommandError({message:this.command + " -url [url]"});
        }
    }
});