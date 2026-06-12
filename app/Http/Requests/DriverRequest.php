<?php

namespace App\Http\Requests;

use App\Models\Driver;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Carbon\Carbon;

class DriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $driverId = $this->route('driver')?->id;

        return [
            'name'           => ['required', 'string', 'max:150'],
            'license_number' => [
                'required', 'string', 'max:50',
                Rule::unique('drivers', 'license_number')
                    ->ignore($driverId)->whereNull('deleted_at'),
            ],
            'license_type'   => ['required', 'string', Rule::in(Driver::licenseTypes())],
            'license_expiry' => ['nullable', 'date', 'after:2000-01-01'],
            'phone'          => ['required', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:150'],
            'dni'            => [
                'nullable', 'string', 'max:20',
                Rule::unique('drivers', 'dni')
                    ->ignore($driverId)->whereNull('deleted_at'),
            ],
            'status'         => ['required', 'string', Rule::in(Driver::statuses())],
            'vehicle_id'     => ['nullable', 'exists:vehicles,id'],
            
            // NUEVO: Reglas para los contratos
            'contract_type'  => ['required', 'string', Rule::in(Driver::contractTypes())],
            'rental_fee'     => ['nullable', 'numeric', 'min:0', 'required_if:contract_type,alquiler'],
            
            'observations'   => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'El nombre es obligatorio.',
            'license_number.required' => 'El número de licencia es obligatorio.',
            'license_number.unique'   => 'Ya existe un conductor con esta licencia.',
            'phone.required'          => 'El teléfono es obligatorio.',
            'status.required'         => 'El estado es obligatorio.',
            'dni.unique'              => 'Ya existe un conductor con este DNI.',
            'vehicle_id.exists'       => 'El vehículo seleccionado no existe.',
            'rental_fee.required_if'  => 'Debe ingresar una tarifa si la modalidad es alquiler.',
        ];
    }

    // NUEVO: Candado de Seguridad (Inteligencia del sistema)
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $expiryDate = $this->input('license_expiry');
                $status = $this->input('status');

                if ($expiryDate && Carbon::parse($expiryDate)->isPast()) {
                    if (in_array($status, ['activo', 'en_viaje'])) {
                        $validator->errors()->add(
                            'status', 
                            'Por seguridad, no puedes activar a un conductor con la licencia vencida.'
                        );
                    }
                }
            }
        ];
    }
}