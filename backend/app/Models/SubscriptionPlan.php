<?php

declare(strict_types=1);

/**
 * @package App\Models
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 3.4)
 * @date 2026-02-25
 * @purpose Model piani di abbonamento NATAN-LOC — tabella subscription_plans
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class SubscriptionPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'subscription_plans';

    protected $fillable = [
        'project_id',
        'name',
        'slug',
        'description',
        'price_monthly_eur',
        'price_annual_eur',
        'max_users',
        'max_documents',
        'max_queries_monthly',
        'features',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'features'            => 'array',
        'price_monthly_eur'   => 'decimal:2',
        'price_annual_eur'    => 'decimal:2',
        'max_users'           => 'integer',
        'max_documents'       => 'integer',
        'max_queries_monthly' => 'integer',
        'display_order'       => 'integer',
        'is_active'           => 'boolean',
        'deleted_at'          => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class, 'plan_id');
    }

    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class, 'plan_id')
                    ->where('status', 'active');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForProject(Builder $query, int $projectId): Builder
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('price_monthly_eur');
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getActiveSubscriptionsCountAttribute(): int
    {
        return $this->relationLoaded('activeSubscriptions')
            ? $this->activeSubscriptions->count()
            : $this->activeSubscriptions()->count();
    }
}
