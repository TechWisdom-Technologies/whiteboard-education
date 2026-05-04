import { useState, useMemo } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { costOfLivingData, countries } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Utensils, Bus, Zap, Music, Calculator } from "lucide-react";

const expenseIcons: Record<string, typeof Home> = { rent: Home, food: Utensils, transport: Bus, utilities: Zap, entertainment: Music };

export default function CostCalculator() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const availableCountries = [...new Set(costOfLivingData.map((d) => d.country))];
  const availableCities = costOfLivingData.filter((d) => d.country === country).map((d) => d.city);
  const selected = costOfLivingData.find((d) => d.country === country && d.city === city);
  const total = selected ? selected.rent + selected.food + selected.transport + selected.utilities + selected.entertainment : 0;

  const expenses = selected ? [
    { label: "Rent", value: selected.rent, icon: Home },
    { label: "Food", value: selected.food, icon: Utensils },
    { label: "Transport", value: selected.transport, icon: Bus },
    { label: "Utilities", value: selected.utilities, icon: Zap },
    { label: "Entertainment", value: selected.entertainment, icon: Music },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1 bg-muted/30">
        <div className="intro-surface py-12 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-3 text-[#ffa300]" />
          <h1 className="text-3xl font-extrabold mb-2">Cost of Living Calculator</h1>
          <p className="text-primary-foreground/70">Estimate your monthly expenses in your dream study destination</p>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger>
                  <SelectContent>{availableCountries.map((c) => <SelectItem key={c} value={c}>{countries.find((co) => co.name === c)?.flag_icon} {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Select value={city} onValueChange={setCity} disabled={!country}>
                  <SelectTrigger><SelectValue placeholder={country ? "Select city..." : "Select a country first"} /></SelectTrigger>
                  <SelectContent>{availableCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selected && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {expenses.map((e) => (
                  <Card key={e.label}>
                    <CardContent className="p-5 text-center">
                      <e.icon className="h-6 w-6 mx-auto mb-2 text-[#ffa300]" />
                      <p className="text-xs text-muted-foreground mb-1">{e.label}</p>
                      <p className="text-xl font-extrabold">${e.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-[#ffa300]/30">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Total</p>
                  <p className="text-4xl font-extrabold text-[#ffa300]">${total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">≈ ${(total * 12).toLocaleString()} per year</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
