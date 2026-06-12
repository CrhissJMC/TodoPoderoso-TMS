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
            'plate'          => [
                'required', 'string', 'max:20',
                Rule::unique('vehicles', 'plate')
                    ->ignore($vehicleId)
                    ->whereNull('deleted_at'),
            ],
            'brand'          => ['required', 'string', 'max:100'],
            'model'          => ['required', 'string', 'max:100'],
            'year'           => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            
            // NUEVO: Validaciones de Asientos
            'capacity_seats' => ['required', 'integer', 'min:1'],
            'sellable_seats' => ['required', 'integer', 'min:0', 'lte:capacity_seats'],
            
            'type'           => ['required', 'string', Rule::in(Vehicle::types())],
            'status'         => ['required', 'string', Rule::in(Vehicle::statuses())],
            'color'          => ['nullable', 'string', 'max:50'],
            'observations'   => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'plate.required'          => 'La placa es obligatoria.',
            'plate.unique'            => 'Ya existe un vehículo con esta placa.',
            'brand.required'          => 'La marca es obligatoria.',
            'model.required'          => 'El modelo es obligatorio.',
            
            // NUEVOS MENSAJES
            'capacity_seats.required' => 'La cantidad total de asientos es obligatoria.',
            'capacity_seats.min'      => 'Debe tener al menos 1 asiento.',
            'sellable_seats.required' => 'Debe indicar los asientos vendibles.',
            'sellable_seats.lte'      => 'Los asientos vendibles no pueden superar la capacidad total del vehículo.',
            
            'type.required'           => 'El tipo de vehículo es obligatorio.',
            'status.required'         => 'El estado es obligatorio.',
            'year.min'                => 'El año no es válido.',
            'year.max'                => 'El año no puede ser en el futuro.',
        ];
    }
}