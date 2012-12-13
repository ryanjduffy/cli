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