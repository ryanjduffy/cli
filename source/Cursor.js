enyo.kind({
    name:"cli.Cursor",
    kind:"Control",
    classes:"cursor",
    content:"&nbsp;",
    allowHtml:true,
    published:{
        position:0,
        insert:false
    },
    create:function() {
        this.inherited(arguments);
        this.insertChanged();
    },
    rendered:function() {
        this.inherited(arguments);
        if(this.hasNode()) {
            this.size = this.getBounds().width;
            this.applyStyle("width", this.size+"px");
            this.positionChanged();
        }
    },
    insertChanged:function() {
        this.addRemoveClass("insert", this.insert);
        
        this.show();
        this.animate();
    },
    positionChanged:function() {
        this.applyStyle("left", this.position*this.size + "px");
        
        this.show();
        this.animate();
    },
    animate:function() {
        enyo.job("animate"+this.id, enyo.bind(this, function() {
            this.setShowing(!this.showing);
            this.animate();
        }), 500);
    },
    toggleInsert:function() {
        this.setInsert(!this.insert);
    }
});
