sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/unified/FileUploader",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, MessageBox, Dialog, Button, FileUploader, BusyIndicator) {
    "use strict";

    return Controller.extend("com.hp.buysell.edilookup.controller.Main", {
        
        onInit: function () {
            if (typeof XLSX === "undefined") {
                var script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
                script.type = "text/javascript";
                document.head.appendChild(script);
            }
            
            // Centralized Configuration Map
            this._sheetConfig = {
                "ShipToIDProject": {
                    entity: "ShipToIDProject",
                    dataRowStartIndex: 2,
                    keys: ["soldToId", "shipToCodeInEdiMessage"],
                    mapping: { 0: "soldToId", 1: "soldToName", 2: "shipToCodeInEdiMessage", 3: "sapShipToCode", 4: "wbs" }
                },
                "EDIOFF": {
                    entity: "EDIOFF",
                    dataRowStartIndex: 2,
                    keys: ["ediFormat", "messageId", "direction", "bpIdLegacy", "companyCode", "projectId"],
                    mapping: { 0: "ediFormat", 1: "messageId", 2: "direction", 3: "bpIdLegacy", 4: "companyCode", 5: "projectId", 6: "routingAction" }
                },
                "Redirect": {
                    entity: "Redirect",
                    dataRowStartIndex: 2,
                    keys: ["ediFormat", "messageId", "direction", "bpIdLegacy", "companyCode", "projectId"],
                    mapping: { 0: "ediFormat", 1: "messageId", 2: "direction", 3: "bpIdLegacy", 4: "companyCode", 5: "projectId", 6: "routingAction", 7: "networkAddress", 8: "isa05Isa06", 9: "isa07Isa08", 10: "gs02", 11: "gs03", 12: "dataElementDelimiter", 13: "dataSubelementDelimiter", 14: "segmentDelimiter" }
                },
                "MESCODMESFCT": { 
                    entity: "MESCODMESFCT",
                    dataRowStartIndex: 2,
                    keys: ["isa05Isa06", "isa07Isa08", "gs02", "gs03", "st01", "gs08", "partnNumber"],
                    mapping: { 0: "isa05Isa06", 1: "isa07Isa08", 2: "gs02", 3: "gs03", 4: "st01", 5: "gs08", 6: "partnNumber", 7: "companyCodeName", 8: "existingE1edka1Re", 9: "reMapValueOfE1edka1ReName1", 10: "mescod", 11: "mesfct", 12: "oldSystem", 13: "companyCode" }
                },
                "EDI810OUT": {
                    entity: "EDI810OUT",
                    dataRowStartIndex: 2,
                    keys: ["ediType", "companyCode", "plant", "qualf", "idocSegment"],
                    mapping: { 0: "ediType", 1: "companyCode", 2: "plant", 3: "ediCode", 4: "qualf", 5: "value", 6: "idocSegment" }
                },
                "EMSContainer": {
                    entity: "EMSContainer",
                    dataRowStartIndex: 2,
                    keys: ["recordType", "region", "startDate", "endDate"],
                    mapping: { 0: "recordType", 1: "region", 2: "startDate", 3: "endDate", 4: "containerId" }
                },
                "EDI856DatesMapping": {
                    entity: "EDI856DatesMapping",
                    dataRowStartIndex: 1, 
                    keys: ["partnerCode", "poBusinessModel", "incotermCodePo", "incotermCodeSo"],
                    mapping: { 0: "partnerCode", 1: "poBusinessModel", 2: "incotermCodePo", 3: "incotermCodeSo", 4: "uiSupplierShipDate", 5: "uiSupplierDeliveryDate", 6: "uiHpShipDate", 7: "uiHpDeliveryDate" }
                },
                "CarrierCodes850": {
                    entity: "CarrierCodes850",
                    dataRowStartIndex: 2,
                    keys: ["supplierIdInUiPo", "carrierCodeInUiPo", "poSeriesBeginWith"],
                    mapping: { 0: "supplierIdInUiPo", 1: "carrierCodeInUiPo", 2: "poSeriesBeginWith", 3: "ediCarrierCode", 4: "description" }
                }
            };
        },

        onUploadExcel: function () {
            if (!this.oUploadDialog) {
                this.oUploadDialog = new Dialog({
                    title: "Upload EDI Data",
                    content: new FileUploader({
                        id: "excelUploader",
                        fileType: ["xlsx", "xls"],
                        tooltip: "Upload your multi-tab Excel file",
                        width: "100%"
                    }),
                    beginButton: new Button({
                        type: "Emphasized",
                        text: "Upload",
                        press: this._handleUploadProcess.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oUploadDialog.close();
                            var oFileUploader = sap.ui.core.Fragment.byId(this.getView().getId(), "excelUploader") || sap.ui.getCore().byId("excelUploader");
                            oFileUploader.clear();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this.oUploadDialog);
            }
            this.oUploadDialog.open();
        },

        _handleUploadProcess: function () {
            var oFileUploader = sap.ui.core.Fragment.byId(this.getView().getId(), "excelUploader") || sap.ui.getCore().byId("excelUploader");
            var oFile = oFileUploader.FUEl.files[0];

            if (!oFile) {
                MessageToast.show("Please select a file first.");
                return;
            }

            this.oUploadDialog.close();
            BusyIndicator.show(0);

            var oReader = new FileReader();
            
            oReader.onload = function (e) {
                try {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, { type: 'array' });
                    this._processWorkbookAndUpload(workbook);
                } catch (err) {
                    BusyIndicator.hide();
                    MessageBox.error("Failed to parse the Excel file. Please ensure it is not corrupted.");
                } finally {
                    oFileUploader.clear();
                }
            }.bind(this);

            oReader.onerror = function () {
                BusyIndicator.hide();
                MessageToast.show("Error reading the file.");
            };

            oReader.readAsArrayBuffer(oFile);
        },

        _deleteAllRecords: function (sEntity) {
            return new Promise(function (resolve) {
                var oModel = this.getView().getModel();
                
                oModel.callFunction("/wipeData", {
                    method: "POST",
                    urlParameters: { entityName: "'" + sEntity + "'" },
                    success: function () { resolve(); },
                    error: function (oError) {
                        console.warn("Wipe action failed for " + sEntity + ". Proceeding.", oError);
                        resolve(); 
                    }
                });
            }.bind(this));
        },

        _processWorkbookAndUpload: function (workbook) {
            sap.ui.core.BusyIndicator.show(0);
            var aDeletePromises = [];

            // 1. Wipe old data
            workbook.SheetNames.forEach(function (sheetName) {
                var config = this._sheetConfig[sheetName];
                if (config) {
                    aDeletePromises.push(this._deleteAllRecords(config.entity));
                }
            }.bind(this));

            // 2. Insert new data
            Promise.all(aDeletePromises)
                .then(function () {
                    this._insertNewData(workbook);
                }.bind(this))
                .catch(function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("Failed to clear existing data. Upload aborted.");
                });
        },

        _insertNewData: function (workbook) {
            var oModel = this.getView().getModel();
            oModel.setUseBatch(true);
            
            //  Single transaction group
            var sGroupId = "ExcelUploadBatch";
            oModel.setDeferredGroups([sGroupId]);
            
            var bHasData = false;

            workbook.SheetNames.forEach(function (sheetName) {
                var config = this._sheetConfig[sheetName];
                
                if (config) {
                    var aRawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    
                    for (var i = 0; i < aRawData.length; i++) {
                        var rawRow = aRawData[i];
                        if (!rawRow || rawRow.length === 0) continue; 

                        var sCol0 = rawRow[0] !== undefined ? String(rawRow[0]).trim() : "";
                        var sCol1 = rawRow[1] !== undefined ? String(rawRow[1]).trim() : "";
                        var sCol0Low = sCol0.toLowerCase();
                        var sCol1Low = sCol1.toLowerCase();

                        // UNIVERSAL HEADER SKIP
                        if (sCol0 === "0" || sCol0 === "0.0") continue;
                        if (sCol0 === config.mapping[0] || sCol1 === config.mapping[1]) continue;
                        if (
                            sCol0Low === "edi format" || sCol0Low === "partner code" || 
                            sCol0Low === "sold to id" || sCol0Low === "record type" || 
                            sCol0Low === "supplier id in ui po" || sCol0Low === "isa05 isa06" || 
                            sCol0Low === "edi type" || sCol1Low === "po business model"
                        ) {
                            continue;
                        }

                        // Ensure row has actual data
                        var bHasRealData = false;
                        for (var colCheck in config.mapping) {
                            if (rawRow[colCheck] !== undefined && rawRow[colCheck] !== null && String(rawRow[colCheck]).trim() !== "") {
                                bHasRealData = true;
                                break;
                            }
                        }

                        if (!bHasRealData) continue;

                        var oPayload = {};

                        for (var colIndex in config.mapping) {
                            var capProperty = config.mapping[colIndex];
                            var cellValue = rawRow[colIndex];
                            var isValueEmpty = (cellValue === undefined || cellValue === null || String(cellValue).trim() === "");

                            if (isValueEmpty) {
                                oPayload[capProperty] = config.keys.includes(capProperty) ? "*" : "";
                            } else {
                                oPayload[capProperty] = String(cellValue).trim();
                            }
                        }

                        oModel.create("/" + config.entity, oPayload, { groupId: sGroupId });
                        bHasData = true;
                    }
                }
            }.bind(this));

            if (!bHasData) {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("No valid data found to upload.");
                return;
            }

            // Submit the massive batch and handle Business-Friendly Error Translation
            oModel.submitChanges({
                groupId: sGroupId,
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    var bIsError = false;
                    var aResponses = oData.__batchResponses;
                    var aHumanReadableErrors = [];

                    // HELPER: Parses the OData error JSON and translates it
                    var fnProcessErrorBody = function (sBody) {
                        try {
                            var oParsed = JSON.parse(sBody);
                            var aDetails = oParsed.error && oParsed.error.innererror ? oParsed.error.innererror.errordetails : [];
                            
                            if (aDetails && aDetails.length > 0) {
                                aDetails.forEach(function(detail) {
                                    var sCol = detail.target ? detail.target : "Unknown";
                                    var sMsg = detail.message;
                                    
                                    // Translate SAP jargon
                                    sMsg = sMsg.replace("Value ", "Data in '").replace(" is not a valid", "' exceeds the limit for");
                                    
                                    // Reverse lookup to find the Tab Name
                                    var sTabName = "Unknown Tab";
                                    Object.keys(this._sheetConfig).forEach(function(tab) {
                                        var mapping = this._sheetConfig[tab].mapping;
                                        for (var key in mapping) {
                                            if (mapping[key] === sCol) sTabName = tab;
                                        }
                                    }.bind(this));

                                    var sFinalError = "• Tab [" + sTabName + "] -> " + sMsg;
                                    if (!aHumanReadableErrors.includes(sFinalError)) {
                                        aHumanReadableErrors.push(sFinalError);
                                    }
                                }.bind(this));
                            } else if (oParsed.error && oParsed.error.message) {
                                aHumanReadableErrors.push("• " + oParsed.error.message.value);
                            }
                        } catch (e) {
                            aHumanReadableErrors.push("• Invalid data structure detected.");
                        }
                    }.bind(this);

                    // Evaluate Responses
                    if (aResponses && aResponses.length > 0) {
                        aResponses.forEach(function (oResponse) {
                            if (oResponse.response && oResponse.response.statusCode >= 400) {
                                bIsError = true;
                                fnProcessErrorBody(oResponse.response.body);
                            } else if (oResponse.__changeResponses) {
                                oResponse.__changeResponses.forEach(function(change) {
                                    if (change.response && change.response.statusCode >= 400) {
                                        bIsError = true;
                                        fnProcessErrorBody(change.response.body);
                                    }
                                });
                            }
                        });
                    }

                    if (bIsError) {
                        var sErrorMessage = "The upload was aborted to protect database integrity. 0 records were saved.\n\nPlease fix the following issues in your Excel file and try again:\n\n" + aHumanReadableErrors.join("\n");
                        sap.m.MessageBox.error(sErrorMessage, { title: "Upload Failed - Action Required" });
                    } else {
                        sap.m.MessageBox.success("Old data dropped. New data uploaded successfully!", { title: "Upload Complete" });
                    }
                    
                    oModel.refresh(true); 
                }.bind(this),
                error: function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("A critical network error occurred during the batch upload. No data was saved.");
                }
            });
        },
        
        onDownloadExcel: function () {
            var oModel = this.getView().getModel();
            sap.ui.core.BusyIndicator.show(0);

            var aPromises = [];
            var workbook = XLSX.utils.book_new();

            Object.keys(this._sheetConfig).forEach(function (sheetName) {
                var config = this._sheetConfig[sheetName];
                
                var aIndices = Object.keys(config.mapping);
                var aProperties = Object.values(config.mapping);

                var p = new Promise(function (resolve) {
                    oModel.read("/" + config.entity, {
                        success: function (oData) {
                            var aResults = oData.results;
                            var aoaData = [
                                aIndices,    // Row 0: Hidden numeric indices
                                aProperties  // Row 1: Visible column headers
                            ];

                            if (aResults && aResults.length > 0) {
                                aResults.forEach(function(row) {
                                    var dataRow = [];
                                    aProperties.forEach(function(prop) {
                                        dataRow.push(row[prop] !== null && row[prop] !== undefined ? String(row[prop]) : "");
                                    });
                                    aoaData.push(dataRow);
                                });
                            }

                            var worksheet = XLSX.utils.aoa_to_sheet(aoaData);
                            
                            // 1. Hide the 0...n numeric row
                            worksheet['!rows'] = [{ hidden: true }];

                            // 2. Auto-size columns
                            var aColWidths = [];
                            for (var col = 0; col < aProperties.length; col++) {
                                var iMaxWidth = 10; 
                                for (var row = 1; row < aoaData.length; row++) { 
                                    var cellValue = aoaData[row][col];
                                    if (cellValue) {
                                        var iValLength = String(cellValue).length;
                                        if (iValLength > iMaxWidth) iMaxWidth = iValLength;
                                    }
                                }
                                aColWidths.push({ wch: iMaxWidth + 2 });
                            }
                            
                            worksheet['!cols'] = aColWidths;
                            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
                            resolve();
                        },
                        error: function () {
                            var aoaData = [aIndices, aProperties];
                            var worksheet = XLSX.utils.aoa_to_sheet(aoaData);
                            
                            worksheet['!rows'] = [{ hidden: true }];
                            
                            var aColWidths = aProperties.map(function(prop) {
                                return { wch: Math.max(10, String(prop).length + 2) };
                            });
                            worksheet['!cols'] = aColWidths;
                            
                            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
                            resolve();
                        }
                    });
                });
                aPromises.push(p);
            }.bind(this));

            Promise.all(aPromises).then(function () {
                sap.ui.core.BusyIndicator.hide();
                XLSX.writeFile(workbook, "EDI_Lookup_Export.xlsx");
                sap.m.MessageToast.show("Data export complete.");
            }).catch(function () {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageBox.error("An error occurred while compiling the Excel file.");
            });
        }
    });
});