import { forwardRef, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COUNTRY_DIAL_CODES } from "@/data/countryDialCodes";
import { countrySearchMatches, getLocalizedCountryNames } from "@/lib/countrySearch";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  onBlur?: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

const displayNames = new Intl.DisplayNames(["fr"], { type: "region" });
const flag = (code: string) => code.toUpperCase().replace(/[A-Z]/g, letter => String.fromCodePoint(127397 + letter.charCodeAt(0)));
const digits = (value: string) => String(value || "").replace(/\D/g, "");

const countries = COUNTRY_DIAL_CODES.map(country => ({
  ...country,
  name: displayNames.of(country.code) || country.code,
  search: `${getLocalizedCountryNames(country.code)} ${country.code} ${country.dialCode} ${country.code === "CI" ? "Cote d Ivoire Cote ivoire Ivoire Ivory Coast Ivory-Coast Ivorie" : ""}`,
})).sort((a, b) => a.name.localeCompare(b.name, "fr"));

const CountryPhoneInput = forwardRef<HTMLInputElement, Props>(function CountryPhoneInput(
  { value = "", onChange, disabled, required, placeholder = "Numéro de téléphone", className, name, id, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid },
  ref
) {
  const defaultCountry = countries.find(country => country.code === "CI") || countries[0];
  const [selectedCode, setSelectedCode] = useState(defaultCountry.code);
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    if (lastEmitted.current === value) {
      lastEmitted.current = null;
      return;
    }
    if (!value) {
      setLocalNumber("");
      setSelectedCode(defaultCountry.code);
      return;
    }
    const matching = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find(country => value.startsWith(country.dialCode));
    if (matching) {
      setSelectedCode(matching.code);
      setLocalNumber(value.slice(matching.dialCode.length));
    } else {
      setLocalNumber(value);
    }
  }, [value]);

  const selected = countries.find(country => country.code === selectedCode) || defaultCountry;
  const emit = (country: typeof countries[number], raw: string) => {
    setSelectedCode(country.code);
    setLocalNumber(raw);
    const valueToSave = digits(raw) ? country.dialCode + digits(raw) : "";
    lastEmitted.current = valueToSave;
    onChange(valueToSave);
  };

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className || ""}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" role="combobox" aria-label="Rechercher un pays et son indicatif" aria-expanded={open} disabled={disabled} className="h-10 w-[116px] shrink-0 justify-between px-2">
            <span className="flex min-w-0 items-center gap-1"><span aria-hidden="true">{flag(selected.code)}</span><span>{selected.dialCode}</span></span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(340px,calc(100vw-24px))] p-0">
          <Command filter={(option, search) => countrySearchMatches(option, search)}>
            <CommandInput placeholder="Pays, nom local, variante ou indicatif..." />
            <CommandList>
              <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
              <CommandGroup>
                {countries.map(country => (
                  <CommandItem key={country.code} value={`${country.name} ${country.search} ${country.dialCode}`} onSelect={() => { emit(country, localNumber); setOpen(false); }}>
                    <Check className={`mr-2 h-4 w-4 ${selected.code === country.code ? "opacity-100" : "opacity-0"}`} />
                    <span className="mr-2" aria-hidden="true">{flag(country.code)}</span>
                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    <span className="ml-2 text-muted-foreground">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input ref={ref} id={id} name={name} type="tel" inputMode="tel" autoComplete="tel" value={localNumber} onChange={event => emit(selected, event.target.value)} onBlur={onBlur} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} disabled={disabled} required={required} placeholder={placeholder} className="min-w-0 flex-1" />
    </div>
  );
});

export default CountryPhoneInput;
