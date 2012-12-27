enyo.kind({
    name: "cli.Prompt",
    kind: "cli.Command",
    command:"prompt", 
    commandHandler:function(source, command) {
        if(command.argList.length !== 1) {
            this.doCommandError({message:"prompt new-prompt"});
        } else {
            this.bubble("onChangePrompt", {prompt:command.argList[0]});
            this.doCommandResponse();
        }
    }
});

enyo.kind({
    name:"cli.Echo",
    kind:"cli.Command",
    command:"echo",
    commandHandler:function(source, command) {
        this.doCommandResponse({response:[{content:command.argList.join(" ")}]});
    }
});

enyo.kind({
    name:"cli.Help",
    kind:"cli.Command",
    command:"help",
    commandHandler:function(source, command) {
        var response = [{content:"Available Commands"}];
        var c$ = [];
        for(var k in source.commands) {
            c$.push(k);
        }
        
        c$.sort();
        for(var i=0,c;c=c$[i];i++) {
            response.push({content:"* "+c});
        }
        
        this.doCommandResponse({response:response});
    }
});

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

// Patch for ENYO-1797
enyo.machine.script = function(inSrc, onLoad, onError) {
    if (!enyo.runtimeLoading) {
        document.write('<scri' + 'pt src="' + inSrc + '"' + (onLoad ? ' onload="' + onLoad + '"' : '') + (onError ? ' onerror="' + onError + '"' : '') + '></scri' + 'pt>');
    } else {
        var script = document.createElement('script');
        script.src = inSrc;
        script.onload = onLoad;
        script.onerror = onError;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
};