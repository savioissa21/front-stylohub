"use client";

import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

// Popular icons to show by default
const POPULAR_ICONS = [
  "Instagram", "Youtube", "Twitter", "Facebook", "Linkedin", "Github", 
  "MessageCircle", "Send", "Mail", "Globe", "ShoppingCart", "Zap", 
  "Heart", "Star", "Camera", "Music", "Video", "Play", "Headphones",
  "Smartphone", "Laptop", "Coffee", "Gift", "Ticket", "CreditCard",
  "DollarSign", "Briefcase", "User", "Users", "MapPin"
];

export function IconPicker({ onSelect, selectedIcon }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const allIconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => typeof (LucideIcons as any)[key] === "function" || typeof (LucideIcons as any)[key] === "object"
    );
  }, []);

  const filteredIcons = useMemo(() => {
    if (!search) return POPULAR_ICONS;
    
    return allIconNames
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 30); // Limit results for performance
  }, [search, allIconNames]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <Input
          placeholder="Buscar ícone (ex: email, whatsapp...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-background border-border"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredIcons.map((iconName) => {
          const Icon = (LucideIcons as any)[iconName];
          if (!Icon) return null;

          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:scale-105 active:scale-95",
                selectedIcon === iconName
                  ? "border-stylo-gold bg-stylo-gold/10 text-stylo-gold"
                  : "border-border hover:border-stylo-gold/50 bg-muted/30 text-muted-foreground"
              )}
              title={iconName}
            >
              <Icon size={20} />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-5 py-8 text-center text-xs text-muted-foreground">
            Nenhum ícone encontrado para "{search}"
          </div>
        )}
      </div>
      
      {!search && (
        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-medium opacity-50">
          Ícones sugeridos
        </p>
      )}
    </div>
  );
}
