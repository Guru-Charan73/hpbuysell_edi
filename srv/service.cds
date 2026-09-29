using hp.buysell.edilookup from '../db/schema';

@requires: 'authenticated-user'
service EDILookupService {

    // -------------------------------------------------------------
    // Database Entities (Viewers can read; Admins can fully manage)
    // -------------------------------------------------------------
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity ShipToIDProject as projection on edilookup.ShipToIDProject;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity EDIOFF as projection on edilookup.EDIOFF;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity Redirect as projection on edilookup.Redirect;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity MESCODMESFCT as projection on edilookup.MESCODMESFCT;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity EDI810OUT as projection on edilookup.EDI810OUT;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity EMSContainer as projection on edilookup.EMSContainer;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity EDI856DatesMapping as projection on edilookup.EDI856DatesMapping;
    
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity CarrierCodes850 as projection on edilookup.CarrierCodes850;

    // -------------------------------------------------------------
    // Actions & Functions
    // -------------------------------------------------------------

    // Only Admins can trigger data-altering actions
    @restrict: [{ grant: 'WRITE', to: 'Admin' }]
    action uploadExcel(entityName: String, fileContent: String) returns String;
    
    @restrict: [{ grant: 'WRITE', to: 'Admin' }]
    action wipeData(entityName: String) returns Boolean;
    
    // Both Viewers and Admins can download the template
    @restrict: [
        { grant: 'READ', to: 'Viewer' },
        { grant: 'READ', to: 'Admin' }
    ]
    function downloadTemplate(entityName: String) returns String;
}