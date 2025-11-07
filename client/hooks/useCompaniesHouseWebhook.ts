import { useEffect, useCallback } from 'react';

export interface WebhookUpdate {
  incorporationId: string;
  companyNumber: string;
  authCode: string;
  status: 'approved' | 'rejected' | 'processing';
  timestamp: string;
}

export function useCompaniesHouseWebhook(
  onUpdate: (data: WebhookUpdate) => void,
  onError?: (error: string) => void
) {
  const pollWebhookStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/companies-house/webhook-status');
      if (!response.ok) return;

      const data = await response.json();
      
      if (data.updates && data.updates.length > 0) {
        data.updates.forEach((update: WebhookUpdate) => {
          onUpdate(update);
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (onError) onError(errorMsg);
    }
  }, [onUpdate, onError]);

  useEffect(() => {
    const interval = setInterval(pollWebhookStatus, 5000);

    pollWebhookStatus();

    return () => clearInterval(interval);
  }, [pollWebhookStatus]);
}

export function storeWebhookUpdate(update: WebhookUpdate): void {
  const updates = JSON.parse(localStorage.getItem('ch-webhook-updates') || '[]');
  updates.push(update);
  localStorage.setItem('ch-webhook-updates', JSON.stringify(updates));
}

export function getWebhookUpdates(): WebhookUpdate[] {
  return JSON.parse(localStorage.getItem('ch-webhook-updates') || '[]');
}

export function clearWebhookUpdate(incorporationId: string): void {
  const updates = JSON.parse(localStorage.getItem('ch-webhook-updates') || '[]');
  const filtered = updates.filter((u: WebhookUpdate) => u.incorporationId !== incorporationId);
  localStorage.setItem('ch-webhook-updates', JSON.stringify(filtered));
}
