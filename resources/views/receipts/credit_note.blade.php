<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; margin: 0; padding: 20px; }
        .header { width: 100%; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .logo-container { width: 50%; float: left; }
        .logo-container h1 { color: #8B0000; margin: 0; font-size: 32px; font-weight: bold; font-style: italic; }
        .logo-container p { margin: 2px 0; font-size: 10px; }
        .doc-container { width: 40%; float: right; border: 2px solid #000; text-align: center; padding: 10px; }
        .doc-container h2 { margin: 5px 0; font-size: 14px; }
        .doc-container h3 { margin: 0; font-size: 16px; font-weight: bold; }
        .clear { clear: both; }
        
        .mod-section { width: 100%; border: 1px solid #000; margin-bottom: 10px; }
        .mod-title { font-weight: bold; padding: 5px; border-bottom: 1px solid #000; font-size: 12px; }
        .mod-content { padding: 5px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 3px; font-size: 10px; }
        .info-table td strong { display: inline-block; width: 120px; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000; }
        .items-table th { border: 1px solid #000; background: #fff; padding: 5px; font-size: 10px; text-align: left; }
        .items-table td { border-left: 1px solid #000; border-right: 1px solid #000; padding: 5px; text-align: left; vertical-align: top; }
        .items-table td.center { text-align: center; }
        .items-table .bottom-border { border-bottom: 1px solid #000; }
        
        .footer-amount { font-weight: bold; margin-bottom: 10px; font-size: 11px; text-transform: uppercase; }
        
        .totals-section { width: 100%; }
        .notes-col { width: 100%; }
        .notes-box { border: 1px solid #000; padding: 5px; margin-bottom: 10px; font-size: 9px; text-align: center; }
        
        .totals-col { width: 35%; float: right; }
        .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .totals-table td { border: 1px solid #000; padding: 3px 5px; font-size: 10px; }
        .totals-table td.label { text-align: left; }
        .totals-table td.value { text-align: right; }
        
        .qr-section { text-align: center; margin-top: 20px; font-size: 8px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-container">
            <h1>Todo Poderoso</h1>
            <p>EMPRESA DE TRANSPORTES TODO PODEROSO S.A.C</p>
            <p>AV. PRINCIPAL 123 - LIMA</p>
            <p>Fecha de Emisión: <strong>{{ date('d/m/Y') }}</strong></p>
        </div>
        <div class="doc-container">
            <h2>NOTA DE CRÉDITO<br>ELECTRÓNICA</h2>
            <h2>R.U.C.: 20123456789</h2>
            <h3>{{ $receiptNumber }}</h3>
        </div>
        <div class="clear"></div>
    </div>

    <div class="mod-section">
        <div class="mod-title">Documento que modifica:</div>
        <div class="mod-content">
            <div style="float: left; width: 60%;">
                <table class="info-table">
                    <tr><td><strong>Comprobante Original</strong></td><td>: {{ $originalDocument }}</td></tr>
                    <tr><td><strong>Señor(es)</strong></td><td>: {{ strtoupper($ticket->client->name) }}</td></tr>
                    <tr><td><strong>RUC / DNI</strong></td><td>: {{ $ticket->client->document_number }}</td></tr>
                    <tr><td><strong>Tipo de Moneda</strong></td><td>: SOLES</td></tr>
                    <tr><td><strong>Motivo o Sustento</strong></td><td>: ANULACIÓN O CANCELACIÓN DE BOLETO</td></tr>
                </table>
            </div>
            <div style="float: right; width: 38%;">
                <table class="totals-table">
                    <tr><td colspan="2" style="text-align: center; font-weight: bold; background: #f0f0f0;">DESCUENTO GLOBAL</td></tr>
                    <tr><td class="label">Valor Venta:</td><td class="value">S/ {{ number_format($ticket->fare, 2) }}</td></tr>
                    <tr><td class="label">ISC:</td><td class="value">S/ 0.00</td></tr>
                    <tr><td class="label">IGV:</td><td class="value">S/ 0.00</td></tr>
                    <tr><td class="label"><strong>Importe Total:</strong></td><td class="value"><strong>S/ {{ number_format($ticket->fare, 2) }}</strong></td></tr>
                </table>
            </div>
            <div class="clear"></div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Cantidad</th>
                <th width="65%">Descripción</th>
                <th width="20%" class="center">Valor Unitario</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>CANCELACIÓN DE BOLETO DE VIAJE - RUTA {{ strtoupper($ticket->trip->route->name) }} - ASIENTO {{ $ticket->seat_number }}</td>
                <td class="center">{{ number_format($ticket->fare, 2) }}</td>
            </tr>
            <tr class="bottom-border" style="height: 100px;">
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer-amount">
        SON: {{ $amountWords }}
    </div>

    <div class="totals-section">
        <div class="notes-col">
            <div class="notes-box">
                Esta es una representación impresa de la nota de crédito electrónica, generada en el Sistema de SUNAT. Puede verificarla utilizando su clave SOL.
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="qr-section">
        <p>Su comprobante electrónico podrá ser consultado en nuestra página web WWW.TODOPODEROSO.COM.PE</p>
    </div>

</body>
</html>
