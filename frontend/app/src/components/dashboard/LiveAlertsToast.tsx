"use client";

import { useSubscription } from "@apollo/client";
import { toast } from "sonner";
import { LIVE_ALERTS_SUB } from "../../lib/apollo/subscriptions";

export function LiveAlertsToast() {
  useSubscription(LIVE_ALERTS_SUB, {
    onData: ({ data }: any) => {
      const alert = data.data?.liveAlerts;
      if (alert) {
        toast(alert.message, {
          description: `Severity ${alert.severity}`,
        });
      }
    },
  });

  return null;
}