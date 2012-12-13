enyo.kind({
    name:"cli.Cursor",
    kind:"Control",
    classes:"cursor",
    published:{
        size:0.625,
        position:0,
        insert:false
    },
    create:function() {
        this.inherited(arguments);
        this.sizeChanged();
        this.insertChanged();
    },
    insertChanged:function() {
        this.addRemoveClass("insert", this.insert);
        
        this.show();
        this.animate();
    },
    sizeChanged:function() {
        this.applyStyle("width", this.size+"em");
        this.positionChanged();
    },
    positionChanged:function() {
        this.applyStyle("left", this.position*this.size + "em");
        
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