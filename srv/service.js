const cds = require('@sap/cds');
const xlsx = require('xlsx');
module.exports = cds.service.impl(async function () {
    
    // --- Wipe Data Logic (Fast Truncate before UI5 Upload) ---
    this.on('wipeData', async (req) => {
        const { entityName } = req.data;

        if (!this.entities[entityName]) {
            return req.error(400, `Entity ${entityName} does not exist.`);
        }

        try {
            // Instantly delete all records from the target table
            await DELETE.from(this.entities[entityName]);
            return true;
        } catch (error) {
            return req.error(500, `Failed to clear table: ${error.message}`);
        }
    });

    
    // --- 1. Download Template Logic ---
    this.on('downloadTemplate', async (req) => {
        const { entityName } = req.data;
        
        
        // Validate entity existence
        if (!this.entities[entityName]) {
            return req.error(400, `Entity ${entityName} does not exist in the service.`);
        }

        const entity = this.entities[entityName];
        
        // Extract column names from the entity metadata (ignoring CAP metadata fields)
        const columns = Object.keys(entity.elements).filter(col => !col.startsWith('_'));

        // Generate the Excel Workbook
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([columns]);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

        // Write to buffer and return as Base64 string
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer.toString('base64');
    });

    // --- 2. Upload Excel Logic ---
    this.on('uploadExcel', async (req) => {
        const { entityName, fileContent } = req.data;

        if (!this.entities[entityName]) {
            return req.error(400, `Entity ${entityName} does not exist in the service.`);
        }

        try {
            // Convert Base64 payload back to a buffer
            const buffer = Buffer.from(fileContent, 'base64');
            
            // Parse the Excel file
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert sheet to JSON array
            const data = xlsx.utils.sheet_to_json(worksheet);

            if (!data || data.length === 0) {
                return req.error(400, "The uploaded Excel file is empty.");
            }

            // Execute UPSERT to handle both new inserts and existing record updates
            const tx = cds.transaction(req);
            await tx.run(UPSERT.into(this.entities[entityName]).entries(data));

            return `Success: ${data.length} records processed for ${entityName}.`;

        } catch (error) {
            req.error(500, `Failed to process Excel file: ${error.message}`);
        }
    });
});