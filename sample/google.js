enyo.kind({
    name: "google.Search",
    kind: "cli.Command",
    command: "google",
    appId: "AIzaSyB3cw_4PXUfu5ifTxdKGqasYGqHANisYeQ",
    cx: "006141722805653119788:mykgrzier4g",
    host: "https://www.googleapis.com/customsearch/v1",
    commandHandler: function(sender, command) {
        if(command.argList.length === 0 || command.args.h) {
            this.help();
        } else if (!!command.args.v) {
            this.view(command.args.v-1);
        } else if (command.args.q) {
            this.query(command.args.q);
        } else if (this.hasArgument(command, "next")) {
            this.next();
        }
    },
    view:function(index) {
        if(this._lastResponse) {
            var i = this._lastResponse.items[index];
            if(i) {
                window.open(i.link, "_blank");
                this.doCommandResponse({});
            } else {
                this.doCommandError({message:"Result #" + (index+1) + " was not found"});
            }
        } else {
            this.doCommandError({message:"No buffered query"});
        }
    },
    help:function() {
        this.doCommandError({message:"Usage: " + this.command + " [-q <query>] [-next] [-v <result number> ]"});
    },
    next:function() {
        if (this._lastResponse) {
            var np = this._lastResponse.queries.nextPage;
            if (np) {
                this.query(np[0].searchTerms, np[0].count, np[0].startIndex);
            } else {
                this.doCommandError({
                    message: "No more results"
                });
            }
        } else {
            this.doCommandError({
                message: "No buffered query.  Use " + this.command + " -q <search terms>"
            });
        }
    },
    query: function(terms, count, startIndex) {
        var count = count || 10,
            startIndex = startIndex || 1,
            url = this.host + "?alt=json&key=" + this.appId + "&cx=" + this.cx + "&q=" + encodeURIComponent(terms) + "&num=" + count + "&start=" + startIndex,
            x = new enyo.Ajax({
                method: "GET",
                url: url
            });
        x.go().response(this, function(sender, response) {
            this._lastResponse = response;
            var items = [],
                start = response.queries.request[0].startIndex;
            for (var i = 0; i < response.items.length; i++) {
                items.push({
                    content: (i + start) + ":  " + response.items[i].htmlTitle,
                    allowHtml: true,
                    style: "overflow:hidden;text-overflow:ellipsis;height:1em;"
                });
            }

            this.doCommandResponse({response:items});
        });
    }
});