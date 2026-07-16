<?php

namespace App\Http\Requests;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicleId = $this->route('vehicle')?->id;

        return [
            'plate' => [
                'required',
                'string',
                'max:8',
                'regex:/^[A-Z0-9\-]+$/',
                Rule::unique('vehicles', 'plate')
                    ->ignore($vehicleId)
                    ->whereNull('deleted_at'),
            ],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'mtc_category' => ['required', 'string', 'max:10'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],

            // Validaciones de Asientos (CORREGIDO: 'lt' en lugar de 'lte')
            'capacity_seats' => ['required', 'integer', 'min:1'],
            'sellable_seats' => ['required', 'integer', 'min:0', 'lt:capacity_seats'],

            'type' => ['required', 'string', Rule::in(Vehicle::types())],
            'status' => ['required', 'string', Rule::in(Vehicle::statuses())],
            'color' => ['nullable', 'string', 'max:50'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'plate.required' => 'La placa es obligatoria.',
            'plate.regex' => 'La placa solo debe contener letras mayúsculas, números y guiones (Ej: ABC-123).',
            'plate.max' => 'La placa no puede tener más de 8 caracteres.',
            'plate.unique' => 'Ya existe un vehículo con esta placa.',

            'brand.required' => 'La marca es obligatoria.',
            'model.required' => 'El modelo es obligatorio.',
            'mtc_category.required' => 'La categoría MTC es obligatoria.',

            'capacity_seats.required' => 'La cantidad total de asientos es obligatoria.',
            'capacity_seats.min' => 'Debe tener al menos 1 asiento.',
            'sellable_seats.required' => 'Debe indicar los asientos vendibles.',

            // MENSAJE CORREGIDO Y EXPLICATIVO PARA EL USUARIO
            'sellable_seats.lt' => 'Los asientos vendibles deben ser menores a la capacidad total del vehículo (se debe reservar obligatoriamente el asiento del conductor).',

            'type.required' => 'El tipo de vehículo es obligatorio.',
            'status.required' => 'El estado es obligatorio.',
            'year.min' => 'El año no es válido.',
            'year.max' => 'El año no puede ser en el futuro.',
        ];
    }
}
