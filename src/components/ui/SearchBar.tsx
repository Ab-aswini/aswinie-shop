import { Search as SearchIcon } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
}

export function SearchBar({ 
  placeholder = "Search shops & products...", 
  value, 
  onChange,
  onFocus 
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <SearchIcon className="w-5 h-5 text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}
