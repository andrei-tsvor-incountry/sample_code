({
    init : function(component, event, helper) {
        let InCountry = component.find('InCountry');
        let storage = InCountry.create();
        component.set('v.storage', storage);
        // custom code ...
    },

    yourAction : function(component, event, helper) {
        let storage = component.get('v.storage');
        // custom code for the action
    },

    anotherAction : function(cmp, event, helper) {
        let storage = component.get('v.storage');
        // custom code for the action
    }
})
