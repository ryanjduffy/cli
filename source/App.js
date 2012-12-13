enyo.kind({
    name: "ex.Console",
    kind: "Control",
    fit:true,
    handlers:{
        onChangePrompt:"promptChanged"
    },
    components: [
        {name: "console", kind: "cli.CommandLine", classes:"enyo-fit", onCommand: "inspectCommand", commands: [
            {kind: "ex.Calc"},
            {kind: "google.Search"}
        ]}
    ],
    create:function() {
        this.inherited(arguments);
        this.$.console.execCommand("help");
    },
    promptChanged:function(source, event) {
        this.$.console.setPrompt(event.prompt+">");
    },
    inspectCommand: function(source, command) {}
});