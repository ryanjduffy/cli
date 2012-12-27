enyo.kind({
    name: "cli.CommandLine",
    kind: "Control",
    whitespace:/^\s*$/,
    published: {
        prompt: "cli>",
        input: 0,
        commands: "",
        context: ""
    },
    events: {
        onCommand: ""
    },
    handlers: {
        onCommandResponse: "commandResponse",
        onCommandError: "commandError",
        onRegisterCommand:"registerCommand",
        onUnregisterCommand:"unregisterCommand",
        onLoadCommand:"loadCommand",
        ontap:"focusInput"
    },
    components: [
        {name:"inputProxy", kind:"enyo.Input", style:"position:absolute;left:-10000px", oninput:"inputProxyChanged"},
        {name: "scroller", kind: "Scroller", style:"height:100%;width:100%", components: [
            {name: "log"},
            {style:"position:relative", components:[
                {name: "input", kind: "Control"},
                {name:"cursor", kind:"cli.Cursor"}
            ]}
        ]},
        {name: "client", kind: "cli.CommandParser", onCommand: "doCommand"}
    ],
    internalCommands:[
        {kind: "cli.Prompt"},
        {kind: "cli.Echo"},
        {kind: "cli.Help"},
        {kind: "cli.Loader"}
    ],
    create: function() {
        this.inherited(arguments);
        this.input = [];
        this.commandHistory = [];
        this.commandHistoryIndex = 0;
        this.cursorOffset = 0;
        
        this.displayInput();
        
        enyo.dispatcher.listen(document, "keydown", enyo.bind(this, "keyPressed"));

        this.contextChanged();
        this.commandsChanged();
    },
    rendered:function() {
        this.inherited(arguments);
        this.focusInput();
    },
    focusInput:function() {
        this.$.inputProxy.focus();
    },
    inputProxyChanged:function(source, event) {
        this.input = this.$.inputProxy.getValue().split('');
        this.displayInput();
    },
    contextChanged: function() {
        this.$.client.setContext(this.context);
    },
    commandsChanged: function() {
        this.$.client.destroyComponents();
        if (enyo.isArray(this.commands)) {
            var commands = this.internalCommands.concat(this.commands);
            this.$.client.createComponents(commands, {
                owner: this.$.client
            });
        }
    },
    loadCommand:function(source, event) {
        this.$.client.createComponent({kind:event.kind, command:event.command, owner: this.$.client});
    },
    displayInput:function() {
        this.$.input.setContent(this.prompt + this.input.join(""));
        this.$.cursor.setPosition(this.prompt.length + this.input.length+this.cursorOffset);
    },
    offsetCursor:function(i) {
        this.cursorOffset = Math.min(0, Math.max(this.cursorOffset+i, -this.input.length));
        this.displayInput();
    },
    registerCommand:function(source, command) {
        this.$.client.addCommand(command);
    },
    unregisterCommand:function(source, command) {
        this.$.client.removeCommand(command);
    },
    keyPressed: function(e) {
        switch (e.keyCode) {
            case 13:
                this.execCommand(this.input.join(""))
                break;
            case 38: // up
                this.loadCommandHistory(1);
                break;
            case 40: // down
                this.loadCommandHistory(-1);
                break;
            case 45:
                this.$.cursor.toggleInsert();
                break;
            case 37: // left
                this.offsetCursor(-1);
                return;
            case 39:
                this.offsetCursor(1);
                return;
            default:
                return;
        }
        
        this.displayInput();
        e.preventDefault();
    },
    loadCommandHistory:function(n) {
        this.cursorOffset = 0;
        this.commandHistoryIndex = Math.max(-1, Math.min(this.commandHistory.length-1, this.commandHistoryIndex+n));
        var cmd = this.commandHistory[this.commandHistoryIndex];
        this.input = (cmd) ? cmd.match(/./g) : [];

        this.$.inputProxy.setValue(this.input.join(""));
    },
    execCommand: function(cmd) {
        
        this.cursorOffset = 0;
        this.commandHistoryIndex = -1;
        this.commandHistory.unshift(cmd);
        
        this.$.log.createComponent({
            content: this.prompt + cmd
        }).render();
        
        this.input = [];
        this.$.inputProxy.setValue("");
        if(!this.whitespace.test(cmd)) {
            this.$.input.hide();
            try {
                this.$.client.parse(cmd);
            } catch (e) {
                this.$.log.createComponent({
                    content:e.message
                }).render();
                this.$.input.show();
            }
        } else {
            // be sure to scroll if the user just hits enter with no command
            this.$.scroller.scrollToBottom();
        }
    },
    commandResponse: function(source, event) {
        this.$.log.createComponents(event.response);
        
        this.commandComplete();
    },
    commandError: function(source, error) {
        this.$.log.createComponent({
            content: error.message,
            classes: "error",
            allowHtml: true
        });
        
        this.commandComplete();
    },
    commandComplete:function() {
        this.$.log.render();
        this.$.input.show();
        
        this.$.scroller.scrollToBottom();
    }
});