import React from "react";
import { NetworkStatus } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Wifi, WifiOff, Globe } from "lucide-react";

interface NetworkWidgetProps {
  network: NetworkStatus | null;
}

export const NetworkWidget: React.FC<NetworkWidgetProps> = ({ network }) => {
  if (!network) return null;

  return (
    <Card className="p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Network</span>
        </div>
        <Badge variant={network.is_connected ? "success" : "danger"}>
          {network.is_connected ? "Connected" : "Offline"}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            {network.is_connected ? (
              <Wifi className="w-5 h-5 text-cyan-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white truncate max-w-[150px]">
              {network.ssid || "No Network"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {network.ip_address || "No IP assigned"}
            </span>
          </div>
        </div>

        {network.is_connected && (
          <div className="text-right">
            <span className="text-xs font-mono text-cyan-300 font-medium">
              {network.signal_strength}%
            </span>
            <span className="block text-[10px] text-slate-400">Signal</span>
          </div>
        )}
      </div>
    </Card>
  );
};
