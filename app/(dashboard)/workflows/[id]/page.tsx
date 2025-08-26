"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cell, Pie, Tooltip, PieChart, Legend } from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function parseDigest(digest: unknown) {
  if (typeof digest !== "string") {
    console.warn("Digest is not a string:", digest);
    return {};
  }

  const info: Record<string, string | string[]> = {};

  try {
    const parts = digest.split(", ").map((p) => p.trim());

    // First part: "AAPL: sector=Technology"
    const [tickerPart, restPart] = parts[0].split(": ");
    info["ticker"] = tickerPart?.trim();

    if (restPart && restPart.includes("=")) {
      const [key, val] = restPart.split("=");
      info[key.trim()] = val?.trim();
    }

    // Process the rest
    parts.slice(1).forEach((part) => {
      if (!part || typeof part !== "string") return;

      if (part.includes("=")) {
        const [key, val] = part.split("=");
        if (!key) return;

        if (key.trim() === "trends") {
          // Example: trends=['neutral']
          info[key.trim()] = val
            .replace(/[\[\]']/g, "")
            .split(/\s+/)
            .filter(Boolean);
        } else {
          info[key.trim()] = val.replace(/['\[\]]/g, "").trim();
        }
      }
    });
  } catch (e) {
    console.error("Error parsing digest:", e, digest);
  }

  return info;
}

export function CompanyDigests({ company_digests }: { company_digests: Record<string, string> }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(company_digests).map(([ticker, digest]) => {
        const info = parseDigest(digest);
        return (
          <AccordionItem key={ticker} value={ticker}>
<AccordionTrigger className="text-lg font-semibold">
  {info["ticker"]}
  {info["sector"] && (
    <span className="ml-2 text-sm text-muted-foreground">
      ({info["sector"]})
    </span>
  )}
</AccordionTrigger>

<AccordionContent>
  <div className="grid gap-2 text-sm p-2 rounded-md border bg-muted/40">
    <p><strong>Sector:</strong> {info["sector"]}</p>
    <p><strong>Beta:</strong> {info["beta"]}</p>
    <p><strong>P/E Ratio:</strong> {info["pe"]}</p>
    <p><strong>News:</strong> {info["news"]}</p>
    <div className="flex gap-2 mt-2">
      {(info["trends"] as string[])?.map((t, i) => (
        <Badge
          key={i}
          variant={t === "positive" ? "default" : t === "negative" ? "destructive" : "outline"}
        >
          {t}
        </Badge>
      ))}
    </div>
  </div>
</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
export default function WildcardPage() {
  const [data, setData] = useState<any>(null);
  const params = useParams<{ slug: string[] }>();
  console.log("Params:", params.id);
  useEffect(() => {
    // if (!params?.slug) {
    //   console.warn("Slug is missing!");
    //   return;
    // }
    
    const slugPath = Array.isArray(params.slug)
      ? params.slug.join("/")
      : params.slug;


    fetch(`http://127.0.0.1:8000/optimize/result/${params.id}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Backend error:", err));
  }, [params.slug]);

  if (!data) {
    return <div>Loading portfolio analysis...</div>;
  }
  
  const { portfolio_metrics, company_digests, market_context, issues_found } =
  data.analysis_bundle;
const { actions, rationale, risk_impact, alternatives } = data.optimization_plan;

const weightData = Object.entries(portfolio_metrics.weights).map(([name, value]) => ({
  name,
  value,
}));

const sectorData = Object.entries(portfolio_metrics.sector_weights).map(
  ([name, value]) => ({ name, value })
);

return (
  <div className="p-8 grid gap-6">
    {/* Portfolio Overview */}
    <Card>
      <CardHeader>
        <CardTitle>📊 Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div>
          <p>Total Value: ${portfolio_metrics.total_value}</p>
          <p>Beta: {portfolio_metrics.est_portfolio_beta.toFixed(2)}</p>
          <p>Concentration Index: {portfolio_metrics.concentration_index.toFixed(3)}</p>
        </div>
        <div className="flex gap-6">
          <PieChart width={200} height={200}>
            <Pie data={weightData} dataKey="value" nameKey="name" outerRadius={80}>
              {weightData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <PieChart width={200} height={200}>
            <Pie data={sectorData} dataKey="value" nameKey="name" outerRadius={80}>
              {sectorData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </CardContent>
    </Card>

{/* Company Digests */}
<div className="mt-6">
  <h2 className="text-xl font-semibold mb-2">🏢 Company Digests</h2>
  <CompanyDigests company_digests={data.analysis_bundle.company_digests} />
</div>

    {/* Market Context + Issues */}
    <Card>
      <CardHeader>
        <CardTitle>🌍 Market Context</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{market_context}</p>
        <div className="mt-4 flex gap-2">
          {issues_found.map((issue, i) => (
            <Badge key={i} variant="destructive">
              {issue}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Optimization Plan */}
    <Card>
      <CardHeader>
        <CardTitle>⚡ Optimization Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-6">
          {actions.map((a, i) => (
            <li key={i}>
              {a.action.toUpperCase()} {a.ticker} → Target Weight:{" "}
              {(a.target_weight * 100).toFixed(1)}% (${a.est_trade_value.toFixed(2)})
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{rationale}</p>
      </CardContent>
    </Card>

    {/* Risk Impact */}
    <Card>
      <CardHeader>
        <CardTitle>⚖️ Risk Impact</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div>
          <p>HHI Before: {risk_impact.hhi_before.toFixed(3)}</p>
          <p>HHI After: {risk_impact.hhi_after.toFixed(3)}</p>
          <p>Beta Before: {risk_impact.beta_before.toFixed(2)}</p>
          <p>Beta After: {risk_impact.beta_after.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>

    {/* Alternatives */}
    <Card>
      <CardHeader>
        <CardTitle>🔀 Alternative Strategies</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        {Object.entries(alternatives).map(([strategy, weights]) => (
          <Card key={strategy} className="p-4 w-1/2">
            <CardTitle className="capitalize">{strategy}</CardTitle>
            <ul className="mt-2 text-sm">
              {Object.entries(weights).map(([ticker, weight]) => (
                <li key={ticker}>
                  {ticker}: {(weight * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </CardContent>
    </Card>
  </div>
);
}