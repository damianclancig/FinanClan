
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(className)}
      classNames={{
        months: "flex flex-col sm:flex-row",
        month: "flex flex-col relative",
        month_caption: "flex justify-center items-center h-10",
        caption_label: "text-sm font-medium",
        nav: "flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background p-0 opacity-50 hover:opacity-100 absolute left-[10px] top-[8px] z-20 flex items-center justify-center"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background p-0 opacity-50 hover:opacity-100 absolute right-[10px] top-[8px] z-20 flex items-center justify-center"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between px-1",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
        week: "flex w-full mt-2 justify-between px-1",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
