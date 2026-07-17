<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; margin: 0; padding: 5px; width: 100%; text-align: center; }
        .logo { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
        .subtitle { font-size: 9px; margin-bottom: 5px; }
        .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
        .info-row { display: flex; justify-content: space-between; text-align: left; font-size: 9px; margin-bottom: 3px; }
        .info-label { font-weight: bold; display: inline-block; width: 45%; }
        .info-value { display: inline-block; width: 50%; }
        .center-title { font-weight: bold; font-size: 12px; margin: 5px 0; }
        .totals { text-align: right; font-weight: bold; font-size: 12px; margin-top: 5px; }
        .footer { font-size: 8px; margin-top: 10px; }
        .qr-placeholder { margin-top: 5px; font-size: 10px; color: #555; }
    </style>
</head>
<body>

    <div class="logo">TODO PODEROSO</div>
    <div class="subtitle">EMPRESA DE TRANSPORTES S.A.C.<br>R.U.C. 20123456789</div>
    
    <div class="divider"></div>
    <div class="center-title">VOUCHER DE VENTA</div>
    <div class="center-title">N° {{ $ticket->ticket_code }}</div>
    <div class="divider"></div>

    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">CLIENTE:</span>
            <span class="info-value">{{ substr(strtoupper($ticket->client->name), 0, 20) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">DNI/RUC:</span>
            <span class="info-value">{{ $ticket->client->document_number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">FECHA EMISIÓN:</span>
            <span class="info-value">{{ date('Y-m-d H:i') }}</span>
        </div>
    </div>

    <div class="divider"></div>
    <div class="center-title">DATOS DEL VIAJE</div>
    
    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">ORIGEN:</span>
            <span class="info-value">{{ strtoupper($ticket->trip->route->origin->name) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">DESTINO:</span>
            <span class="info-value">{{ strtoupper($ticket->trip->route->destination->name) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">FECHA VIAJE:</span>
            <span class="info-value">{{ date('Y-m-d', strtotime($ticket->trip->trip_date)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">HORA:</span>
            <span class="info-value">{{ date('H:i', strtotime($ticket->trip->time)) }}</span>
        </div>
        <div class="info-row" style="font-size: 12px; font-weight: bold; text-align: center; margin-top: 5px;">
            ASIENTO N° {{ $ticket->seat_number }}
        </div>
    </div>

    <div class="divider"></div>

    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">CAJERO:</span>
            <span class="info-value">{{ substr(strtoupper($ticket->soldBy->name), 0, 15) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">MÉTODO PAGO:</span>
            <span class="info-value">{{ strtoupper($ticket->payment_method) }}</span>
        </div>
    </div>

    <div class="divider"></div>
    
    <div class="totals">
        TOTAL A PAGAR: S/ {{ number_format($ticket->fare, 2) }}
    </div>

    <div class="divider"></div>

    <div class="qr-placeholder">
        [ QR CODE ESTÁNDAR ]
    </div>

    <div class="footer">
        GRACIAS POR SU PREFERENCIA<br>
        Embarque 30 minutos antes del viaje.
    </div>

</body>
</html>
