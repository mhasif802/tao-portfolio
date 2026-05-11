import { useState } from "react";

const RAO = 1_000_000_000;

const DEMO_DATA = {
  coldkey: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  positions: [
    { netuid: 1, subnet_name: "Apex", hotkey_name: "Rizzo (Insured)", stake_alpha: 4821.3, stake_tao: 5.12, apy: 18.4, value_tao: 5.12 },
    { netuid: 4, subnet_name: "Targon", hotkey_name: "Foundry", stake_alpha: 2310.7, stake_tao: 2.87, apy: 14.2, value_tao: 2.87 },
    { netuid: 18, subnet_name: "Cortex", hotkey_name: "OTF", stake_alpha: 1540.2, stake_tao: 2.21, apy: 22.1, value_tao: 2.21 },
    { netuid: 8, subnet_name: "Proprioception", hotkey_name: "Latent", stake_alpha: 890.5, stake_tao: 1.55, apy: 11.8, value_tao: 1.55 },
    { netuid: 11, subnet_name: "Dippy Roleplay", hotkey_name: "Nakamoto", stake_alpha: 640.1, stake_tao: 1.09, apy: 9.3, value_tao: 1.09 },
  ],
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function truncate(addr) {
  if (!addr) return "";
  return addr.slice(0, 8) + "…" + addr.slice(-6);
}

function fmt(n, d = 2) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function ApyBadge({ apy }) {
  const color = apy >= 20 ? "#166534" : apy >= 12 ? "#065f46" : "#374151";
  const bg = apy >= 20 ? "#dcfce7" : apy >= 12 ? "#d1fae5" : "#f3f4f6";
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 9999 }}>
      {fmt(apy, 1)}%
    </span>
  );
}

function BarChart({ positions }) {
  const max = Math.max(...positions.map((p) => p.value_tao));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {positions.map((p) => (
        <div key={p.netuid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#6b7280", width: 110, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            SN{p.netuid} {p.subnet_name}
          </span>
          <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div
              style={{
                width: `${(p.value_tao / max) * 100}%`,
                height: "100%",
                background: "#374151",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#374151", minWidth: 64, textAlign: "right", fontFamily: "monospace" }}>
            τ {fmt(p.value_tao)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchPortfolio() {
    setError(""); setLoading(true); setData(null); setIsDemo(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolio`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Server error ${res.status}`);
      }
      const json = await res.json();
      const positions = (json.data || []).map((d) => ({
        netuid: d.netuid,
        subnet_name: d.subnet_name || `Subnet ${d.netuid}`,
        hotkey_name: d.hotkey_name || truncate(d.hotkey?.ss58),
        stake_alpha: Number(d.balance) / RAO,
        stake_tao: Number(d.balance_as_tao) / RAO,
        apy: d.apy ? d.apy * 100 : null,
        value_tao: Number(d.balance_as_tao) / RAO,
      })).sort((a, b) => b.value_tao - a.value_tao);
      setData({ coldkey: json.coldkey || "", positions });
    } catch (e) {
      setError(e.message || "Failed to fetch portfolio.");
    } finally { setLoading(false); }
  }

  function loadDemo() {
    setData(DEMO_DATA);
    setIsDemo(true);
    setError("");
  }

  function copyAddress() {
    if (!data?.coldkey) return;
    navigator.clipboard.writeText(data.coldkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const totalValue = data?.positions?.reduce((s, p) => s + p.value_tao, 0) ?? 0;
  const avgApy = data?.positions?.filter((p) => p.apy).length
    ? data.positions.filter((p) => p.apy).reduce((s, p) => s + p.apy, 0) / data.positions.filter((p) => p.apy).length
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", maxWidth: 720, margin: "0 auto", padding: "2rem 1rem", color: "#111827" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.3px" }}>τ Portfolio</h1>
          <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "monospace" }}>Bittensor Subnet Staking</span>
        </div>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Live subnet stake positions — credentials secured server-side.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button
          onClick={fetchPortfolio}
          disabled={loading}
          style={{ flex: 1, background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}
        >
          {loading ? "Loading…" : "Load Portfolio"}
        </button>
        <button
          onClick={loadDemo}
          style={{ padding: "10px 18px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}
        >
          Demo
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}

      {isDemo && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#92400e", marginBottom: "1.25rem" }}>
          Showing demo data. Deploy the backend with your credentials to see live positions.
        </div>
      )}

      {data && (
        <>
          {data.coldkey && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151", background: "#f3f4f6", padding: "4px 10px", borderRadius: 6 }}>
                {truncate(data.coldkey)}
              </span>
              <button onClick={copyAddress} style={{ fontSize: 12, color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {[
              { label: "Total Value", value: `τ ${fmt(totalValue)}` },
              { label: "Subnets", value: data.positions.length },
              { label: "Avg APY", value: avgApy ? `${fmt(avgApy, 1)}%` : "N/A" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px", fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.5px" }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Stake Positions</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Subnet", "Validator", "Stake (α)", "Value (τ)", "APY"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: ["Stake (α)", "Value (τ)", "APY"].includes(h) ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.positions.map((p, i) => (
                    <tr key={p.netuid} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", marginRight: 6 }}>SN{p.netuid}</span>
                        {p.subnet_name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>{p.hotkey_name}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", color: "#374151" }}>{fmt(p.stake_alpha, 1)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>τ {fmt(p.value_tao)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {p.apy != null ? <ApyBadge apy={p.apy} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #e5e7eb", background: "#f9fafb" }}>
                    <td colSpan={3} style={{ padding: "10px 16px", fontWeight: 600, fontSize: 12, color: "#6b7280" }}>Total</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>τ {fmt(totalValue)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Allocation</h2>
            <BarChart positions={data.positions} />
          </div>

          <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", marginTop: "1.5rem" }}>
            Data via TaoStats API · Credentials secured server-side · Read-only
          </p>
        </>
      )}
    </div>
  );
}
