<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TripRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'schedule_id'  => ['nullable', 'exists:schedules,id'],
            'route_id'     => ['required', 'exists:routes,id'],
            'vehicle_id'   => ['nullable', 'exists:vehicles,id'],
            'driver_id'    => ['nullable', 'exists:drivers,id'],
            'trip_date'    => ['required', 'date'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'route_id.required'  => 'La ruta es obligatoria.',
            'route_id.exists'    => 'La ruta seleccionada no existe.',
            'trip_date.required' => 'La fecha del viaje es obligatoria.',
            'trip_date.date'     => 'La fecha no es válida.',
        ];
    }
}
