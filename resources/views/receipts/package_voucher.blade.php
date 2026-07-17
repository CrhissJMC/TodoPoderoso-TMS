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
        .tracking-box { border: 2px solid #000; padding: 5px; margin: 10px 0; font-size: 12px; font-weight: bold; }
        .totals { text-align: right; font-weight: bold; font-size: 12px; margin-top: 5px; }
        .footer { font-size: 8px; margin-top: 10px; }
    </style>
</head>
<body>

    <div class="logo">TODO PODEROSO</div>
    <div class="subtitle">EMPRESA DE TRANSPORTES S.A.C.<br>R.U.C. 20123456789</div>
    
    <div class="divider"></div>
    <div class="center-title">VOUCHER DE ENCOMIENDA</div>
    <div class="divider"></div>

    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">REMITENTE:</span>
            <span class="info-value">{{ substr(strtoupper($package->sender->name), 0, 20) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">DESTINATARIO:</span>
            <span class="info-value">{{ substr(strtoupper($package->receiver->name), 0, 20) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">FECHA REGISTRO:</span>
            <span class="info-value">{{ date('Y-m-d H:i') }}</span>
        </div>
    </div>

    <div class="divider"></div>
    <div class="center-title">DATOS DEL ENVÍO</div>
    
    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">ORIGEN:</span>
            <span class="info-value">{{ strtoupper($package->trip->route->origin->name) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">DESTINO:</span>
            <span class="info-value">{{ strtoupper($package->trip->route->destination->name) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">TIPO/PESO:</span>
            <span class="info-value">{{ strtoupper($package->package_type) }} / {{ $package->weight_kg }} KG</span>
        </div>
    </div>

    <!-- CÓDIGO DE SEGUIMIENTO (TRACKING) DESTACADO -->
    <div class="tracking-box">
        CÓDIGO DE RASTREO:<br>
        <span style="font-size: 16px;">{{ $package->tracking_code }}</span>
    </div>

    <div class="divider"></div>

    <div style="text-align: left;">
        <div class="info-row">
            <span class="info-label">CAJERO:</span>
            <span class="info-value">{{ substr(strtoupper($package->createdBy->name), 0, 15) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">MÉTODO PAGO:</span>
            <span class="info-value">EFECTIVO</span>
        </div>
    </div>

    <div class="divider"></div>
    
    <div class="totals">
        TOTAL FLETE: S/ {{ number_format($package->price, 2) }}
    </div>

    <div class="divider"></div>

    <div class="footer">
        RASTREE SU ENCOMIENDA ONLINE CON SU CÓDIGO EN:<br>
        <strong>www.todopoderoso.com.pe/rastreo</strong>
        <br><br>
        LA EMPRESA NO SE RESPONSABILIZA POR MERCADERÍA NO DECLARADA O MAL EMPACADA.
    </div>

</body>
</html>
