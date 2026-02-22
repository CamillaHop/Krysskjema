import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showSearch?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Velg…",
  required,
  showSearch = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
    setSearch("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
    if (e.key === "Enter" && filtered.length === 1) {
      e.preventDefault();
      handleSelect(filtered[0].value);
    }
  }

  return (
    <div className={`custom-select ${open ? "open" : ""}`} ref={ref}>
      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          tabIndex={-1}
          className="custom-select-hidden"
          onChange={() => {}}
        />
      )}

      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedLabel ? "" : "placeholder"}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className="custom-select-chevron"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="custom-select-dropdown" role="listbox">
          {showSearch && (
            <div className="custom-select-search-wrap">
              <input
                ref={inputRef}
                type="text"
                className="custom-select-search"
                placeholder="Søk…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
          <ul className="custom-select-options">
            {filtered.length === 0 && (
              <li className="custom-select-empty">Ingen treff</li>
            )}
            {filtered.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={`custom-select-option ${
                  o.value === value ? "selected" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(o.value);
                }}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
