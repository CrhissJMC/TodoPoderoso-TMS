<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trip_id'        => ['required', 'exists:trips,id'],
            'passenger_id'   => ['required', 'exists:passengers,id'],
            'seat_number'    => ['required', 'integer', 'min:1'],
            'boarding_stop'  => ['required', 'string', 'max:100'],
            'dropoff_stop'   => ['required', 'string', 'max:100'],
            'fare'           => ['required', 'numeric', 'min:0'],
            'payment_status' => ['required', 'string', 'in:pagado,pendiente'],
            'payment_method' => ['required', 'string', 'in:efectivo,yape,plin,tarjeta,transferencia'],
            'ticket_status'  => ['nullable', 'string', 'in:valido,anulado,utilizado'],
        ];
    }

    public function messages(): array
    {
        return [
            'trip_id.required'      => 'Debe seleccionar un viaje.',
            'passenger_id.required' => 'Debe seleccionar un pasajero.',
            'seat_number.required'  => 'El número de asiento es obligatorio.',
            'fare.required'         => 'La tarifa es obligatoria.',
        ];
    }
}