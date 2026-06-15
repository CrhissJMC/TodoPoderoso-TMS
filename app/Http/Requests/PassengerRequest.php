<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PassengerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $passengerId = $this->route('passenger')?->id;

        return [
            'full_name' => ['required', 'string', 'max:150'],
            'dni'       => [
                'required', 'string', 'max:20',
                Rule::unique('passengers', 'dni')
                    ->ignore($passengerId)
                    ->whereNull('deleted_at'),
            ],
            'phone'     => ['nullable', 'string', 'max:30'],
            // Regla de email eliminada
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'El nombre completo es obligatorio.',
            'dni.required'       => 'El DNI es obligatorio.',
            'dni.unique'         => 'Ya existe un pasajero registrado con este DNI.',
            // Mensaje de email eliminado
        ];
    }
}