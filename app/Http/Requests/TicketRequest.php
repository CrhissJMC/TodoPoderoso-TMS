<?php

namespace App\Http\Requests;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class TicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $ticketId = $this->route('ticket')?->id;
        $tripId   = $this->input('trip_id');

        return [
            'trip_id'         => ['required', 'exists:trips,id'],

            // Datos del pasajero (se busca por DNI o se crea uno nuevo)
            'passenger_id'    => ['nullable', 'exists:passengers,id'],
            'passenger_name'  => ['required_without:passenger_id', 'string', 'max:150'],
            'passenger_dni'   => ['required', 'string', 'max:20'],
            'passenger_phone' => ['nullable', 'string', 'max:30'],

            'seat_number'   => [
                'required', 'integer', 'min:1',
                Rule::unique('tickets', 'seat_number')
                    ->where('trip_id', $tripId)
                    ->where('ticket_status', '!=', 'anulado')
                    ->ignore($ticketId)
                    ->whereNull('deleted_at'),
            ],
            'boarding_stop' => ['required', 'string', 'max:100'],
            'dropoff_stop'  => ['required', 'string', 'max:100'],
            'fare'          => ['required', 'numeric', 'min:0'],
            'payment_method'=> ['required', 'string', Rule::in(Ticket::paymentMethods())],
            'payment_status'=> ['required', 'string', Rule::in(Ticket::paymentStatuses())],
        ];
    }

    public function messages(): array
    {
        return [
            'trip_id.required'           => 'El viaje es obligatorio.',
            'passenger_dni.required'     => 'El DNI del pasajero es obligatorio.',
            'passenger_name.required_without' => 'El nombre del pasajero es obligatorio.',
            'seat_number.required'       => 'El número de asiento es obligatorio.',
            'seat_number.unique'         => 'Este asiento ya fue vendido para este viaje.',
            'boarding_stop.required'     => 'La parada de abordaje es obligatoria.',
            'dropoff_stop.required'      => 'La parada de bajada es obligatoria.',
            'fare.required'              => 'La tarifa es obligatoria.',
            'payment_method.required'    => 'El método de pago es obligatorio.',
            'payment_status.required'    => 'El estado de pago es obligatorio.',
        ];
    }

    // Validación extra: el asiento no puede exceder la capacidad vendible del vehículo
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $tripId = $this->input('trip_id');
            $seat   = $this->input('seat_number');

            if (! $tripId || ! $seat) return;

            $trip = \App\Models\Trip::with('vehicle')->find($tripId);

            if ($trip?->vehicle && $seat > $trip->vehicle->sellable_seats) {
                $validator->errors()->add(
                    'seat_number',
                    "El vehículo asignado solo tiene {$trip->vehicle->sellable_seats} asientos vendibles."
                );
            }

            if ($trip && in_array($trip->status, ['completado', 'cancelado'])) {
                $validator->errors()->add(
                    'trip_id',
                    'No se pueden vender boletos para un viaje completado o cancelado.'
                );
            }
        });
    }
}
