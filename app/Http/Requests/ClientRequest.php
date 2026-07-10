<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client') ? $this->route('client')->id : null;

        return [
            'name' => ['required', 'string', 'max:150'],
            'document_type' => ['required', 'string', 'in:DNI,RUC,CE,PASAPORTE'],
            'document_number' => ['required', 'string', 'max:20', 'unique:clients,document_number,'.$clientId],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }
}
