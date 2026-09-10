"use client";

import * as React from "react";
import { CalendarDays, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { EventWizard } from "./event-wizard";
import { emptyEventValues } from "./schema";

const STEPS = [
  { label: "Event details", icon: <CalendarDays /> },
  { label: "Event settings", icon: <Settings2 /> },
];

/**
 * Event creation in a dialog (sidebar-13 pattern): a slim sidebar lists the
 * wizard steps, the wizard itself fills the remaining space. Saving a draft
 * navigates to the event's edit page, which closes the dialog.
 */
export function NewEventDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New event</Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[640px] md:max-w-[820px]">
        <DialogTitle className="sr-only">Create an event</DialogTitle>
        <DialogDescription className="sr-only">
          Name your event and configure its settings.
        </DialogDescription>
        <SidebarProvider className="min-h-0 items-start">
          <Sidebar collapsible="none" className="hidden w-48 md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {STEPS.map((item, index) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          isActive={step === index}
                          onClick={() => setStep(index)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex max-h-[80vh] min-h-[480px] flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6">
              <EventWizard
                initialValues={emptyEventValues}
                step={step}
                onStepChange={setStep}
              />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
