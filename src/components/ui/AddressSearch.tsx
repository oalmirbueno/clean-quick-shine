import { useState, useEffect, useRef } from "react";
import { useGeocode } from "@/hooks/useGeocode";
import { InputField } from "@/components/ui/InputField";
import { Search, MapPin, Loader2 } from "lucide-react";

interface AddressSearchProps {
  onSelect: (address: {
    display_name: string;
    lat: number;
    lng: number;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) => void;
  placeholder?: string;
  initialValue?: string;
}

export function AddressSearch({ onSelect, placeholder = "Buscar endereço...", initialValue = "" }: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading, searchAddress, clearSuggestions } = useGeocode();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchAddress]);

  useEffect(() => {
    if (suggestions.length > 0) setShowSuggestions(true);
  }, [suggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (suggestion: any) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    clearSuggestions();

    onSelect({
      display_name: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      street: suggestion.address?.road || "",
      number: suggestion.address?.house_number || "",
      neighborhood: suggestion.address?.suburb || "",
      city: suggestion.address?.city || suggestion.address?.town || "",
      state: suggestion.address?.state || "",
      postalCode: suggestion.address?.postcode || "",
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <InputField
        icon={loading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <Search className="w-5 h-5 text-muted-foreground" />}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="w-full flex items-start gap-3 p-3 hover:bg-accent transition-colors text-left border-b border-border last:border-0"
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
