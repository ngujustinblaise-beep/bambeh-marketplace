// @ts-nocheck
/**
 * AD CREATION FORM COMPONENT — Form for creating advertisements to promote items.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, DollarSign, TrendingUp, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AdDuration, AdPlacement, AdCreationFormData, AD_PRICING, PLACEMENT_PRICING } from '@/types/ads';
import { AnyItem } from '@/types/items';

interface AdCreationFormProps {
  items: AnyItem[];
  isSubscriber: boolean;
  onSubmit: (data: AdCreationFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export default function AdCreationForm({ items, isSubscriber, onSubmit, onCancel, className = '' }: AdCreationFormProps) {
  const { t } = useTranslation();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [duration, setDuration]             = useState<string>('week');
  const [placement, setPlacement]           = useState<string>('featured_grid');
  const [autoRenew, setAutoRenew]           = useState(false);
  const [startDate]                         = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [error, setError]                   = useState<string>('');

  const selectedItem = items.find(item => item.id === selectedItemId);

  const calculateCost = (): number => {
    const durationPricing = AD_PRICING.find(p => p.duration === duration);
    const placementPricing = PLACEMENT_PRICING.find(p => p.placement === placement);
    if (!durationPricing || !placementPricing) return 0;
    const basePrice = isSubscriber ? durationPricing.subscriberPrice : durationPricing.nonSubscriberPrice;
    return Math.ceil(basePrice * placementPricing.multiplier);
  };

  const calculateSavings = (): number => {
    const durationPricing = AD_PRICING.find(p => p.duration === duration);
    const placementPricing = PLACEMENT_PRICING.find(p => p.placement === placement);
    if (!durationPricing || !placementPricing) return 0;
    return Math.ceil((durationPricing.nonSubscriberPrice - durationPricing.subscriberPrice) * placementPricing.multiplier);
  };

  const getDurationDays = (): number => ({ day: 1, week: 7, month: 30 }[duration] ?? 7);

  const cost = calculateCost();
  const savings = isSubscriber ? calculateSavings() : 0;
  const endDate = new Date(startDate.getTime() + getDurationDays() * 24 * 60 * 60 * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) { setError(t('ads.errors.selectItem')); return; }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({ itemId: selectedItemId, duration, placement, startDate, autoRenew } as AdCreationFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ads.errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Alert><Info className="h-4 w-4" /><AlertDescription>{t('ads.noItems')}</AlertDescription></Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('ads.createAdvertisement')}</h2>
        <p className="text-gray-600 mt-1">{t('ads.boostVisibility')}</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {isSubscriber && (
        <Alert className="bg-teal-50 border-teal-200">
          <TrendingUp className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-teal-800">{t('ads.subscriberBenefit')} — {t('ads.save')} {t('ads.upTo')} 80%!</AlertDescription>
        </Alert>
      )}

      {/* Select Item */}
      <div className="space-y-2">
        <Label htmlFor="item">{t('ads.selectItem')} <span className="text-red-500">*</span></Label>
        <Select value={selectedItemId} onValueChange={setSelectedItemId}>
          <SelectTrigger><SelectValue placeholder={t('ads.chooseItem')} /></SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <div className="flex items-center gap-2"><Badge variant="outline">{item.type}</Badge><span>{item.title}</span></div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label>{t('ads.duration')} <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-3 gap-3">
          {AD_PRICING.map((pricing) => (
            <button key={pricing.duration} type="button" onClick={() => setDuration(pricing.duration)}
              className={`p-4 rounded-lg border-2 transition-all ${duration === pricing.duration ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-center">
                <p className="font-semibold capitalize text-gray-900">{pricing.duration}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {isSubscriber ? (
                    <span>
                      {pricing.subscriberPrice} ZC
                      <span className="text-xs text-gray-500 block">-{pricing.discount}%</span>
                    </span>
                  ) : (
                    `${pricing.nonSubscriberPrice} ZC`
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Placement */}
      <div className="space-y-2">
        <Label>{t('ads.placement')} <span className="text-red-500">*</span></Label>
        <Select value={placement} onValueChange={(v) => setPlacement(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PLACEMENT_PRICING.map((p) => (
              <SelectItem key={p.placement} value={p.placement}>
                <div className="flex items-center justify-between gap-4">
                  <span className="capitalize">{p.placement.replace('_', ' ')}</span>
                  <Badge variant="secondary">{p.multiplier}x</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-600">{PLACEMENT_PRICING.find(p => p.placement === placement)?.description}</p>
      </div>

      {/* Auto-renewal */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="autoRenew" className="cursor-pointer">{t('ads.autoRenew')}</Label>
          <p className="text-sm text-gray-600">{t('ads.autoRenewDescription')}</p>
        </div>
        <Switch id="autoRenew" checked={autoRenew} onCheckedChange={setAutoRenew} />
      </div>

      {/* Item Preview */}
      {selectedItem && (
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('ads.itemPreview')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {selectedItem.images?.[0] && <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-20 h-20 object-cover rounded-lg" />}
              <div>
                <h3 className="font-semibold text-gray-900">{selectedItem.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{selectedItem.description}</p>
                <Badge className="mt-2">{selectedItem.type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      <Card className="border-2 border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />{t('ads.costSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{t('ads.duration')}:</span>
            <span className="font-semibold capitalize">{duration} ({getDurationDays()} {t('ads.days')})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{t('ads.placement')}:</span>
            <span className="font-semibold capitalize">{placement.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{t('ads.startDate')}:</span>
            <span className="font-semibold">{startDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{t('ads.endDate')}:</span>
            <span className="font-semibold">{endDate.toLocaleDateString()}</span>
          </div>
          {isSubscriber && savings > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>{t('ads.savings')}:</span>
              <span className="font-semibold">{savings} ZC</span>
            </div>
          )}
          <div className="pt-3 border-t border-teal-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">{t('ads.totalCost')}:</span>
              <span className="text-2xl font-bold text-teal-600">{cost} ZC</span>
            </div>
          </div>
          {autoRenew && <p className="text-sm text-gray-600 text-center">{t('ads.autoRenewNotice')}</p>}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">{t('common.cancel')}</Button>
        )}
        <Button type="submit" disabled={isSubmitting || !selectedItemId} className="flex-1 bg-teal-600 hover:bg-teal-700">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('ads.creating')}</>
          ) : (
            <><Calendar className="w-4 h-4 mr-2" />{t('ads.createAd')} — {cost} ZC</>
          )}
        </Button>
      </div>
    </form>
  );
}






