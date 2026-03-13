<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * @package App\Enums
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Enum degli stati del ciclo di vita di un Tenant Admin Bootstrap
 */
enum BootstrapStatus: string
{
    case Pending   = 'pending';
    case Invited   = 'invited';
    case Activated = 'activated';
    case Suspended = 'suspended';
    case Revoked   = 'revoked';

    /**
     * Etichetta leggibile per UI e log.
     */
    public function label(): string
    {
        return match($this) {
            self::Pending   => 'In attesa',
            self::Invited   => 'Invitato',
            self::Activated => 'Attivo',
            self::Suspended => 'Sospeso',
            self::Revoked   => 'Revocato',
        };
    }

    /**
     * Colore badge per UI (Tailwind/DaisyUI convention).
     */
    public function color(): string
    {
        return match($this) {
            self::Pending   => 'gray',
            self::Invited   => 'blue',
            self::Activated => 'green',
            self::Suspended => 'yellow',
            self::Revoked   => 'red',
        };
    }

    /**
     * Lo stato corrente permette di inviare un invito?
     * Solo pending e invited (reinvio) possono ricevere un invito.
     */
    public function canBeInvited(): bool
    {
        return match($this) {
            self::Pending, self::Invited => true,
            default                      => false,
        };
    }

    /**
     * Lo stato corrente può transitare ad activated?
     * Solo un bootstrap in stato invited può essere attivato.
     */
    public function canBeActivated(): bool
    {
        return $this === self::Invited;
    }

    /**
     * Lo stato corrente permette una sospensione?
     * Solo un admin attivo può essere sospeso.
     */
    public function canBeSuspended(): bool
    {
        return $this === self::Activated;
    }

    /**
     * Lo stato corrente permette una revoca?
     * Tutti tranne revoked possono essere revocati.
     */
    public function canBeRevoked(): bool
    {
        return $this !== self::Revoked;
    }
}
