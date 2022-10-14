({
    handleFire : function(component, event, helper) {
        component.set("v.openModal", true);
    },

    handleParams : function(component, event, helper) {
        let params = event.getParam('arguments').value;
        if (params) {
            component.set("v.params", params);
        }
    }
})
