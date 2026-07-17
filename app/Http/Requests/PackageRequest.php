<?php

namespace App\Http\Requests;

use App\Models\Package;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sender_id' => ['nullable', 'exists:clients,id'],
            'sender_name' => ['required_without:sender_id', 'string', 'max:150'],
            'sender_document_type' => ['required', 'string', 'in:DNI,RUC,CE,PASAPORTE'],
            'sender_document_number' => ['required', 'string', 'max:20'],
            'sender_phone' => ['nullable', 'string', 'max:30'],

            'receiver_id' => ['nullable', 'exists:clients,id'],
            'receiver_name' => ['required_without:receiver_id', 'string', 'max:150'],
            'receiver_document_type' => ['required', 'string', 'in:DNI,RUC,CE,PASAPORTE'],
            'receiver_document_number' => ['required', 'string', 'max:20'],
            'receiver_phone' => ['nullable', 'string', 'max:30'],
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100'],
            'trip_id' => ['nullable', 'exists:trips,id'],
            'package_type' => ['required', 'string', Rule::in(Package::packageTypes())],
            'weight' => ['nullable', 'numeric', 'min:0.01', 'max:999'],
            'dimensions' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', Rule::in(Package::paymentMethods())],
            'payment_status' => ['required', 'string', Rule::in(Package::paymentStatuses())],
            'observations' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'sender_document_type.required' => 'El tipo de documento del remitente es obligatorio.',
            'sender_document_number.required' => 'El número de documento del remitente es obligatorio.',
            'sender_name.required_without' => 'El nombre del remitente es obligatorio.',
            'receiver_document_type.required' => 'El tipo de documento del destinatario es obligatorio.',
            'receiver_document_number.required' => 'El número de documento del destinatario es obligatorio.',
            'receiver_name.required_without' => 'El nombre del destinatario es obligatorio.',
            'origin.required' => 'El origen es obligatorio.',
            'destination.required' => 'El destino es obligatorio.',
            'package_type.required' => 'El tipo de paquete es obligatorio.',
            'price.required' => 'El precio es obligatorio.',
            'payment_method.required' => 'El método de pago es obligatorio.',
            'payment_status.required' => 'El estado de pago es obligatorio.',
            'weight.min' => 'El peso debe ser mayor a 0.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->trip_id) {
                $trip = \App\Models\Trip::with('route.stops')->find($this->trip_id);
                if ($trip) {
                    $locations = collect([$trip->route->origin])
                        ->merge($trip->route->stops->pluck('stop_name'))
                        ->merge([$trip->route->destination])
                        ->values()
                        ->all();
                    
                    $originIndex = array_search($this->origin, $locations);
                    $destinationIndex = array_search($this->destination, $locations);

                    if ($originIndex === false || $destinationIndex === false) {
                        $validator->errors()->add('trip_id', 'El origen o destino no pertenecen a la ruta de este viaje.');
                    } elseif ($originIndex >= $destinationIndex) {
                        $validator->errors()->add('destination', 'El destino debe ser una parada posterior al origen en la ruta seleccionada.');
                    }
                }
            }
        });
    }
}
