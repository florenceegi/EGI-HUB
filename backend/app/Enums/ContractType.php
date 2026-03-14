<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * @package App\Enums
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - Contracts)
 * @date 2026-03-14
 * @purpose Tipologia contratto EGI
 */
enum ContractType: string
{
    case Saas               = 'saas';
    case Pilot              = 'pilot';
    case Trial              = 'trial';
    case Custom             = 'custom';
    case Verticalizzazione  = 'verticalizzazione';

    public function label(): string
    {
        return match($this) {
            self::Saas              => 'SaaS',
            self::Pilot             => 'Pilota',
            self::Trial             => 'Trial',
            self::Custom            => 'Personalizzato',
            self::Verticalizzazione => 'Verticalizzazione',
        };
    }

    /** Tipi validi per contratti a livello di Tenant */
    public static function tenantTypes(): array
    {
        return [self::Saas->value, self::Pilot->value, self::Trial->value, self::Custom->value];
    }

    /** Tipi validi per contratti a livello di Progetto */
    public static function projectTypes(): array
    {
        return [self::Verticalizzazione->value, self::Custom->value];
    }
}
