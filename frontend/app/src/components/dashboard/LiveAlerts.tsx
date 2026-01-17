"use client";

import { useSubscription } from "@apollo/client";
import { LIVE_ALERTS_SUB } from "../../lib/apollo/subscriptions";
import { useRouteStore } from "../../stores/routeStore";
import { toast } from "sonner";

export function LiveAlerts() {
    const selectedRouteId = useRouteStore((s) => s.selectedRouteId);
    const setSelectedRouteId = useRouteStore((s) => s.setSelectedRouteId);

    useSubscription(LIVE_ALERTS_SUB, {
        variables: { routeId: selectedRouteId },
        onData: ({ data }: any) => {
            const alert = data.data.liveAlerts;

            toast(alert.message, {
                duration: 5000,
                action: {
                    label: "View",
                    onClick: () => {
                        setSelectedRouteId(alert.routeId);
                    },
                },
            });
        },
    });

    return null;
}
