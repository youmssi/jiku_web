"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * Picks one item from a list in a popover with a search field, the shadcn
 * Radix combobox (Popover + Command). The list filters itself by label, or,
 * with [onSearchChange], hands the typed text to the caller, which loads the
 * matching [items]. Choosing the selected item again clears the choice.
 */
function Combobox<T>({
  value,
  onValueChange,
  items,
  itemKey,
  itemLabel,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  onSearchChange,
  disabled,
  id,
  className,
}: {
  value: T | null
  onValueChange: (item: T | null) => void
  items: readonly T[]
  itemKey: (item: T) => string
  itemLabel: (item: T) => string
  placeholder: string
  searchPlaceholder?: string
  emptyMessage: React.ReactNode
  onSearchChange?: (search: string) => void
  disabled?: boolean
  id?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const selectedKey = value === null ? null : itemKey(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between font-normal",
            value === null && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {value === null ? placeholder : itemLabel(value)}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-48 p-0"
        align="start"
      >
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            value={search}
            onValueChange={(next) => {
              setSearch(next)
              onSearchChange?.(next)
            }}
            placeholder={searchPlaceholder ?? placeholder}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const key = itemKey(item)
                return (
                  <CommandItem
                    key={key}
                    value={`${itemLabel(item)} ${key}`}
                    data-checked={key === selectedKey}
                    onSelect={() => {
                      onValueChange(key === selectedKey ? null : item)
                      setOpen(false)
                    }}
                  >
                    {itemLabel(item)}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
