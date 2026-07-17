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
        .info-section { width: 100%; margin-bottom: 10px; display: table; }
        .info-col { width: 50%; display: table-cell; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 2px; }
        .info-table td strong { display: inline-block; width: 100px; }
        .box-title { background: #dcdcdc; font-weight: bold; padding: 2px 5px; border: 1px solid #000; font-size: 10px; }
        .pax-box { border: 1px solid #000; margin-bottom: 10px; }
        .pax-box table { width: 100%; border-collapse: collapse; }
        .pax-box td { padding: 3px 5px; font-size: 9px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .items-table th { border: 1px solid #000; background: #dcdcdc; padding: 5px; font-size: 10px; text-align: center; }
        .items-table td { border-left: 1px solid #000; border-right: 1px solid #000; padding: 5px; text-align: center; height: 350px; vertical-align: top; }
        .items-table td.desc { text-align: left; }
        .items-table .bottom-border { border-bottom: 1px solid #000; }
        .footer-amount { border: 1px solid #000; padding: 5px; margin-bottom: 10px; font-weight: bold; }
        .totals-section { width: 100%; }
        .notes-col { width: 60%; float: left; }
        .notes-box { border: 2px solid #000; padding: 5px; margin-bottom: 10px; font-size: 9px; text-align: justify; }
        .totals-col { width: 35%; float: right; }
        .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .totals-table td { border: 1px solid #000; padding: 3px 5px; }
        .totals-table td:last-child { text-align: right; }
        .qr-section { text-align: center; margin-top: 20px; font-size: 8px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-container">
            <h1>Todo Poderoso</h1>
            <p>EMPRESA DE TRANSPORTES TODO PODEROSO S.A.C</p>
            <p>AV. PRINCIPAL 123 - LIMA</p>
        </div>
        <div class="doc-container">
            <h2>R.U.C.: 20123456789</h2>
            <h2>FACTURA ELECTRÓNICA</h2>
            <h3>N° {{ $receiptNumber }}</h3>
        </div>
        <div class="clear"></div>
    </div>

    <div class="info-section">
        <div class="info-col">
            <table class="info-table">
                <tr><td><strong>Señores</strong></td><td>: {{ strtoupper($ticket->client->name) }}</td></tr>
                <tr><td><strong>R.U.C.</strong></td><td>: {{ $ticket->client->document_number }}</td></tr>
                <tr><td><strong>Fecha Emision</strong></td><td>: {{ date('Y-m-d') }} &nbsp; <strong>Hora:</strong> {{ date('H:i:s') }}</td></tr>
                <tr><td><strong>Telefono</strong></td><td>: {{ $ticket->client->phone ?? '-' }}</td></tr>
            </table>
        </div>
        <div class="info-col">
            <table class="info-table">
                <tr><td><strong>Moneda</strong></td><td>: SOLES</td></tr>
                <tr><td><strong>Condicion Pago</strong></td><td>: CONTADO</td></tr>
                <tr><td><strong>Vendedor</strong></td><td>: {{ strtoupper($ticket->soldBy->name) }}</td></tr>
                <tr><td><strong>Medio de Pago</strong></td><td>: {{ strtoupper($ticket->payment_method) }}</td></tr>
            </table>
        </div>
    </div>

    <div class="box-title" style="width: 150px;">DESTINATARIO / PAX</div>
    <div class="pax-box">
        <table>
            <tr>
                <td width="60%">
                    <strong>NOMBRE:</strong> {{ strtoupper($ticket->client->name) }}<br>
                    <strong>DNI/RUC:</strong> {{ $ticket->client->document_number }}<br>
                    <strong>DIRECCIÓN:</strong> {{ strtoupper($ticket->client->address ?? '-') }}
                </td>
                <td width="40%">
                    <strong>ORIGEN:</strong> {{ strtoupper($ticket->trip->route->origin) }} &nbsp;&nbsp; <strong>DESTINO:</strong> {{ strtoupper($ticket->trip->route->destination) }}<br>
                    <strong>FE. VIAJE:</strong> {{ date('Y-m-d', strtotime($ticket->trip->trip_date)) }} &nbsp;&nbsp; <strong>HORA VIAJE:</strong> {{ date('H:i', strtotime($ticket->trip->time)) }}<br>
                    <strong>ASIENTO:</strong> {{ $ticket->seat_number }}
                </td>
            </tr>
        </table>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th width="8%">CODIGO</th>
                <th width="8%">CANT</th>
                <th width="8%">UND</th>
                <th width="44%">DESCRIPCIÓN</th>
                <th width="8%">NRO</th>
                <th width="12%">PV UNIT</th>
                <th width="12%">IMPORTE</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>001</td>
                <td>1</td>
                <td>NIU</td>
                <td class="desc">
                    SERV. TRANSP. RUTA <br>
                    {{ strtoupper($ticket->trip->route->origin) }} - {{ strtoupper($ticket->trip->route->destination) }} <br>
                    NR {{ $ticket->ticket_code }}
                </td>
                <td>{{ $ticket->seat_number }}</td>
                <td>{{ number_format($ticket->fare, 2) }}</td>
                <td>{{ number_format($ticket->fare, 2) }}</td>
            </tr>
            <tr class="bottom-border" style="height: auto;">
                <td colspan="7" style="height: 0; padding: 0;"></td>
            </tr>
        </tbody>
    </table>

    <div class="footer-amount">
        {{ $amountWords }}
    </div>

    <div class="totals-section">
        <div class="notes-col">
            <div class="notes-box">
                <strong>NOTA:</strong> EL PASAJERO RESPONDE POR EL MAL USO DEL AMBIENTE Y EQUIPOS. LOS DANOS Y/O PERDIDAS SERAN ASUMIDOS A CUENTA DEL PASAJERO. <br>
                ESTE BOLETO SOLO ES VÁLIDO PARA LA FECHA Y HORA INDICADA.
            </div>
            <div class="notes-box">
                <strong>OBSERVACIONES:</strong><br>
                Estimado Cliente por favor imprimir 2 copias de este documento y presentelo al momento del embarque. Embarque 30 minutos antes de hora de viaje.
            </div>
        </div>
        <div class="totals-col">
            <table class="totals-table">
                <tr><td>Dscto Global</td><td>: S/</td><td>0.00</td></tr>
                <tr><td>Total Gravado</td><td>: S/</td><td>0.00</td></tr>
                <tr><td>Total No Gravado</td><td>: S/</td><td>0.00</td></tr>
                <tr><td>Total Exonerado</td><td>: S/</td><td>{{ number_format($ticket->fare, 2) }}</td></tr>
                <tr><td>IGV (18%)</td><td>: S/</td><td>0.00</td></tr>
                <tr><td><strong>Monto Total</strong></td><td><strong>: S/</strong></td><td><strong>{{ number_format($ticket->fare, 2) }}</strong></td></tr>
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <div class="qr-section">
        <p>Representación impresa de la Factura Electrónica Autorizado mediante la RS N° 0180050002160 /Sunat</p>
        <p>Su comprobante electrónico podrá ser consultado en nuestra página web WWW.TODOPODEROSO.COM.PE</p>
    </div>

</body>
</html>
