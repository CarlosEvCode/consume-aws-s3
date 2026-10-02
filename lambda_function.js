exports.handler = async (event) => {
    console.log("=== EVENTO RECIBIDO DESDE S3 ===");
    console.log(JSON.stringify(event, null, 2));

    if (event.Records) {
        for (const record of event.Records) {
            const bucket = record.s3.bucket.name;
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
            const size = record.s3.object.size;

            console.log(`-> Procesando archivo: "${key}" del bucket: "${bucket}" (${size} bytes)`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Archivo procesado exitosamente" })
    };
};