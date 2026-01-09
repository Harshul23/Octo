import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcw,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { WiRefresh } from "react-icons/wi";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Reset to current month
  const resetToCurrentMonth = () => {
    setCurrentMonth(new Date())
  }
  

  return (
    <div className="relative">

      <div className="absolute -top-2 right-2">
        <span className="text-xl top-2 right-88 absolute text-stone-300">Calender</span>
      </div>

      {/* Reset to Current Month Button */}
      <div className="absolute -top-2 right-2">
        <Button
          onClick={resetToCurrentMonth}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 z-10 mt-2 rounded-2xl hover:text-white hover:bg-transparent"
          title="Reset to current month"
        >
          <WiRefresh className="size-7" />
          Today
        </Button>
      </div>

      <DayPicker
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-background group/calendar p-0 [--cell-size:--spacing(8)] [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("rounded-3xl w-full bg-black mx-0 py-3 my-1 mt-8 border-3 border-solid border-neutral-700", defaultClassNames.root),
          months: cn("flex gap-4 flex-col h-full scroll-auto overflow-hidden py-2 md:flex-row relative rounded-2xl bg-black", defaultClassNames.months),
          month: cn("flex flex-col w-full gap-2 bg-black rounded-2xl text-white p-2", defaultClassNames.month),
          nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 bg-white p-0 my-3 mx-4 select-none",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 bg-white p-0 my-3 mx-4 select-none",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex items-center justify-center h-(--cell-size) bg-black w-full px-(--cell-size)",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn("absolute bg-popover inset-0", defaultClassNames.dropdown),
          caption_label: cn("select-none font-medium", captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-2 [&>svg]:text-muted-foreground [&>svg]:size-1.5", defaultClassNames.caption_label),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-2", defaultClassNames.week),
          week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
          week_number: cn(
            "text-[0.8rem] select-none text-muted-foreground",
            defaultClassNames.week_number
          ),
          day: cn(
            "relative w-[3.9em] h-[3em]  p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
            props.showWeekNumber
              ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md flex justify-center items-center"
              : "[&:first-child[data-selected=true]_button]:rounded-l-md flex justify-center items-center",
            defaultClassNames.day
          ),
          range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
          today: cn(
            "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside
          ),
          disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (<ChevronLeftIcon className={cn("size-4", className)} {...props} />);
            }

            if (orientation === "right") {
              return (<ChevronRightIcon className={cn("size-4", className)} {...props} />);
            }

            return (<ChevronDownIcon className={cn("size-4", className)} {...props} />);
          },
          DayButton: (props) => (
            <CalendarDayButton {...props} />
          ),
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div
                  className="flex size-(--cell-size) rounded-2xl bg-black items-center justify-center text-center">
                  {children}
                </div>
              </td>
            );
          },
          ...components,
        }}
        {...props} />
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 hover:bg-accent hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70 transition-colors",
        defaultClassNames.day,
        className
      )}
      {...props} />
  );
}

export { Calendar, CalendarDayButton }
export default Calendar
