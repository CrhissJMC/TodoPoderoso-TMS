<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'route_id' => ['required', 'exists:routes,id'],
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'departure_time' => ['required', 'date_format:H:i'],
            'days_of_week' => ['required', 'array', 'min:1'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'route_id.required' => 'La ruta es obligatoria.',
            'route_id.exists' => 'La ruta seleccionada no existe.',
            'departure_time.required' => 'La hora de salida es obligatoria.',
            'departure_time.date_format' => 'El formato de hora debe ser HH:MM.',
            'days_of_week.required' => 'Selecciona al menos un día.',
            'days_of_week.min' => 'Selecciona al menos un día.',
        ];
    }

    // Convertir array de días a string antes de guardar
    protected function passedValidation(): void
    {
        $this->merge([
            'days_of_week' => implode(',', $this->days_of_week),
        ]);
    }
}
