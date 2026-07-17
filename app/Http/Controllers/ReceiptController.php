<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Ticket;
use App\Utils\NumberToLetters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Generar Voucher de Ticket (Boleto)
     */
    public function ticketVoucher(Ticket $ticket)
    {
        $ticket->load(['client', 'trip.route.origin', 'trip.route.destination', 'soldBy']);
        
        $data = [
            'ticket' => $ticket,
            'title' => 'Voucher - ' . $ticket->ticket_code,
        ];

        // Se usa un tamaño personalizado similar a una ticketera (ej: 80mm ancho)
        $pdf = Pdf::loadView('receipts.voucher', $data)
                  ->setPaper([0, 0, 226.77, 800], 'portrait'); // 80mm ~ 226.77 pt

        return $pdf->stream($ticket->ticket_code . '_voucher.pdf');
    }

    /**
     * Generar Boleta de Ticket (Estándar SUNAT)
     */
    public function ticketBoleta(Ticket $ticket)
    {
        $ticket->load(['client', 'trip.route.origin', 'trip.route.destination', 'soldBy']);
        
        // Formatear N° Boleta basado en ID (Ej: B001-000045)
        $boletaNumber = 'B001-' . str_pad($ticket->id, 8, '0', STR_PAD_LEFT);
        $amountWords = NumberToLetters::convert($ticket->fare);

        $data = [
            'ticket' => $ticket,
            'receiptNumber' => $boletaNumber,
            'amountWords' => $amountWords,
            'title' => 'Boleta - ' . $boletaNumber,
        ];

        $pdf = Pdf::loadView('receipts.boleta', $data)
                  ->setPaper('A4', 'portrait');

        return $pdf->stream($boletaNumber . '.pdf');
    }

    /**
     * Generar Factura de Ticket (Estándar SUNAT)
     */
    public function ticketFactura(Ticket $ticket)
    {
        $ticket->load(['client', 'trip.route.origin', 'trip.route.destination', 'soldBy']);
        
        // Formatear N° Factura basado en ID (Ej: F001-000045)
        $facturaNumber = 'F001-' . str_pad($ticket->id, 8, '0', STR_PAD_LEFT);
        $amountWords = NumberToLetters::convert($ticket->fare);

        $data = [
            'ticket' => $ticket,
            'receiptNumber' => $facturaNumber,
            'amountWords' => $amountWords,
            'title' => 'Factura - ' . $facturaNumber,
        ];

        $pdf = Pdf::loadView('receipts.factura', $data)
                  ->setPaper('A4', 'portrait');

        return $pdf->stream($facturaNumber . '.pdf');
    }

    /**
     * Generar Voucher de Encomienda (Package)
     */
    public function packageVoucher(Package $package)
    {
        $package->load(['sender', 'receiver', 'trip.route.origin', 'trip.route.destination', 'createdBy']);
        
        $data = [
            'package' => $package,
            'title' => 'Voucher - ' . $package->tracking_code,
        ];

        $pdf = Pdf::loadView('receipts.package_voucher', $data)
                  ->setPaper([0, 0, 226.77, 800], 'portrait'); 

        return $pdf->stream($package->tracking_code . '_voucher.pdf');
    }

    /**
     * Generar Boleta de Encomienda
     */
    public function packageBoleta(Package $package)
    {
        $package->load(['sender', 'receiver', 'trip.route.origin', 'trip.route.destination', 'createdBy']);
        
        $boletaNumber = 'B001-' . str_pad($package->id, 8, '0', STR_PAD_LEFT);
        $amountWords = NumberToLetters::convert($package->price);

        $data = [
            'package' => $package,
            'receiptNumber' => $boletaNumber,
            'amountWords' => $amountWords,
            'title' => 'Boleta - ' . $boletaNumber,
        ];

        $pdf = Pdf::loadView('receipts.package_boleta', $data)
                  ->setPaper('A4', 'portrait');

        return $pdf->stream($boletaNumber . '.pdf');
    }

    /**
     * Generar Factura de Encomienda
     */
    public function packageFactura(Package $package)
    {
        $package->load(['sender', 'receiver', 'trip.route.origin', 'trip.route.destination', 'createdBy']);
        
        $facturaNumber = 'F001-' . str_pad($package->id, 8, '0', STR_PAD_LEFT);
        $amountWords = NumberToLetters::convert($package->price);

        $data = [
            'package' => $package,
            'receiptNumber' => $facturaNumber,
            'amountWords' => $amountWords,
            'title' => 'Factura - ' . $facturaNumber,
        ];

        $pdf = Pdf::loadView('receipts.package_factura', $data)
                  ->setPaper('A4', 'portrait');

        return $pdf->stream($facturaNumber . '.pdf');
    }
}
