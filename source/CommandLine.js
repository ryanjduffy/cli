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
        onRegisterCommand:"registerCommand"
    },
    components: [
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
        {kind: "cli.Help"}
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
    map: function(e) {
        var codes = {
            188: [",", "<"],
            190: [".", ">"],
            191: ["/", "?"],
            192: ["`", "~"],
            219: ["[", "{"],
            220: ["\\", "|"],
            221: ["]", "}"],
            222: ["'", "\""],
            59: [";", ":"],
            186: [";", ":"],
            61: ["=", "+"],
            187: ["=", "+"],
            107: ["=", "+"],
            189: ["-", "_"],
            109: ["-", "_"],
            48: ["0", ")"],
            49: ["1", "!"],
            50: ["2", "@"],
            51: ["3", "#"],
            52: ["4", "$"],
            53: ["5", "%"],
            54: ["6", "^"],
            55: ["7", "&"],
            56: ["8", "*"],
            57: ["9", "("],
            32: [" ", " "]
        };
        
        if (e.keyCode >= 65 && e.keyCode <= 90) {
            return String.fromCharCode(e.shiftKey ? e.keyCode : e.keyCode + 32);
        } else if (codes[e.keyCode]) {
            return codes[e.keyCode][e.shiftKey ? 1 : 0];
        }
    },
    keyPressed: function(e) {
        var c = this.map(e);
        switch (e.keyCode) {
            case 8:
                this.input.pop();
                break;
            case 13:
                this.execCommand(this.input.join(""))
                break;
            case 37: // left
                this.offsetCursor(-1);
                break;
            case 38: // up
                this.loadCommandHistory(1);
                break;
            case 39:
                this.offsetCursor(1);
                break;
            case 40: // down
                this.loadCommandHistory(-1);
                break;
            case 45:
                this.$.cursor.toggleInsert();
                break;
            default:
                this.push(c);
        }
        
        //this.log(e.keyCode, c);
        
        this.displayInput();
        e.preventDefault();
    },
    push:function(c) {
        if(!c) return;
        //this.log(this.input, this.input.length+this.cursorOffset);
        
        var index = this.input.length+this.cursorOffset;
        if(this.$.cursor.getInsert()) {
            this.input.splice(index, 0, c);
        } else {
            this.offsetCursor(1);
            this.input[index] = c;
        }
    },
    loadCommandHistory:function(n) {
        this.cursorOffset = 0;
        this.commandHistoryIndex = Math.max(-1, Math.min(this.commandHistory.length-1, this.commandHistoryIndex+n));
        var cmd = this.commandHistory[this.commandHistoryIndex];
        this.input = (cmd) ? cmd.match(/./g) : [];
    },
    execCommand: function(cmd) {
        
        this.cursorOffset = 0;
        this.commandHistoryIndex = -1;
        this.commandHistory.unshift(cmd);
        
        this.$.log.createComponent({
            content: this.prompt + cmd
        }).render();
        
        this.input = [];
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