<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'origin' => ['required', 'string', 'max:100'],
            'destination' => ['required', 'string', 'max:100'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'base_fare' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],

            // Paradas intermedias (opcionales)
            'stops' => ['nullable', 'array', 'max:20'],
            'stops.*.stop_name' => ['required_with:stops', 'string', 'max:100'],
            'stops.*.minutes_from_origin' => ['nullable', 'integer', 'min:1'],
            'stops.*.fare_from_origin' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la ruta es obligatorio.',
            'origin.required' => 'El origen es obligatorio.',
            'destination.required' => 'El destino es obligatorio.',
            'base_fare.required' => 'La tarifa base es obligatoria.',
            'base_fare.min' => 'La tarifa no puede ser negativa.',
            'estimated_minutes.max' => 'La duración no puede superar 24 horas.',
            'stops.*.stop_name.required_with' => 'Cada parada debe tener un nombre.',
            'stops.max' => 'Se permiten máximo 20 paradas intermedias.',
        ];
    }
}
