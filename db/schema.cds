namespace hp.buysell.edilookup;

/** Source tab: ShipToIDProject | PK: soldToId, shipToCodeInEdiMessage */
entity ShipToIDProject {
  key soldToId               : String(10);  // Sold to ID
      soldToName             : String(40);  // Sold to Name
  key shipToCodeInEdiMessage : String(15);  // Ship to code in EDI message
      sapShipToCode          : String(10);  // SAP Ship To Code
      wbs                    : String(24);  // WBS (Expanded to standard SAP length)
}

/** Source tab: EDIOFF | PK: ediFormat, messageId, direction, bpIdLegacy, companyCode, projectId */
entity EDIOFF {
  key ediFormat              : String(10);  // EDI Format
  key messageId              : String(10);  // Message ID
  key direction              : String(3);   // Direction
  key bpIdLegacy             : String(10);  // BP ID Legacy
  key companyCode            : String(4);   // Company Code
  key projectId              : String(10);  // Project ID
      routingAction          : String(15);  // Routing Action
}

/** Source tab: Redirect | PK: ediFormat, messageId, direction, bpIdLegacy, companyCode, projectId */
entity Redirect {
  key ediFormat              : String(3);   // EDI Format
  key messageId              : String(3);   // Message ID
  key direction              : String(3);   // Direction
  key bpIdLegacy             : String(10);  // BP ID Legacy
  key companyCode            : String(4);   // Company Code
  key projectId              : String(10);  // Project ID
      routingAction          : String(10);  // Routing Action
      networkAddress         : String(60);  // Network Address
      isa05Isa06             : String(20);  // ISA05 ISA06
      isa07Isa08             : String(15);  // ISA07 ISA08
      gs02                   : String(15);  // GS02
      gs03                   : String(10);  // GS03
      dataElementDelimiter   : String(2);   // Data element delimiter
      dataSubelementDelimiter: String(2);   // Data subelement delimiter
      segmentDelimiter       : String(15);  // Segment delimiter
}

/** Source tab: MESCODMESFCT | PK: isa05Isa06, isa07Isa08, gs02, gs03, st01, gs08, partnNumber */
entity MESCODMESFCT {
  key isa05Isa06                 : String(20);   // ISA05 ISA06
  key isa07Isa08                 : String(15);   // ISA07 ISA08
  key gs02                       : String(15);   // GS02
  key gs03                       : String(15);   // GS03
  key st01                       : String(10);   // ST01
  key gs08                       : String(10);   // GS08
  key partnNumber                : String(15);   // Partn.number
      companyCodeName            : String(60);   // Company code name
      existingE1edka1Re          : String(150);  // EXISTING E1EDKA1 RE (Expanded to fit 140-char Excel values)
      reMapValueOfE1edka1ReName1 : String(30);   // RE-Map value of E1EDKA1 RE NAME1
      mescod                     : String(3);    // MESCOD
      mesfct                     : String(3);    // MESFCT
      oldSystem                  : String(3);    // Old System
      companyCode                : String(4);    // Company code
}

/** Source tab: EDI810OUT | PK: ediType, companyCode, plant, qualf, idocSegment */
entity EDI810OUT {
  key ediType                : String(10);  // EDI Type
  key companyCode            : String(4);   // Company Code
  key plant                  : String(4);   // Plant (Expanded to standard SAP length)
      ediCode                : String(10);  // EDI Code
  key qualf                  : String(3);   // QUALF
      value                  : String(10);  // Value
  key idocSegment            : String(2);   // Idoc segment: VAT ID begins with (lookup A9 / SE value)
}

/** Source tab: EMSContainer | PK: recordType, region, startDate, endDate */
entity EMSContainer {
  key recordType             : String(10);  // Record Type
  key region                 : String(10);  // Region
  key startDate              : String(10);  // Start Date
  key endDate                : String(10);  // End Date
      containerId            : String(20);  // Container ID
}

/** Source tab: EDI856DatesMapping | PK: partnerCode, poBusinessModel, incotermCodePo, incotermCodeSo */
entity EDI856DatesMapping {
  key partnerCode            : String(10);  // Partner Code
  key poBusinessModel        : String(10);  // PO Business Model
  key incotermCodePo         : String(3);   // Incoterm Code PO
  key incotermCodeSo         : String(3);   // Incoterm Code SO
      uiSupplierShipDate     : String(30);  // UI Supplier Ship Date
      uiSupplierDeliveryDate : String(30);  // UI Supplier Delivery Date
      uiHpShipDate           : String(30);  // UI HP Ship Date
      uiHpDeliveryDate       : String(30);  // UI HP Delivery Date
}

/** Source tab: CarrierCodes850 | PK: supplierIdInUiPo, carrierCodeInUiPo, poSeriesBeginWith */
entity CarrierCodes850 {
  key supplierIdInUiPo       : String(10);  // Supplier ID in UI PO
  key carrierCodeInUiPo      : String(10);  // Carrier Code in UI PO
  key poSeriesBeginWith      : String(3);   // PO series begin with
      ediCarrierCode         : String(10);  // EDI Carrier Code
      description            : String(30);  // Description
}