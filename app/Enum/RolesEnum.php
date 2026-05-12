<?php

namespace App\Enum;

enum RolesEnum: string
{
    case SUPER_ADMIN = 'Super Admin';
    case ADMIN = 'Admin';
    case LIBRARIAN = 'Librarian';
    case IMMERSION = 'Immersion';
    case ENCODER = 'Encoder';
}
