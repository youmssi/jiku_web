import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays, CalendarPlus, Inbox, ListOrdered, MapPin, PenLine } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { localeRedirect } from "@/i18n/redirect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { organizerRole } from "@/components/shared/organizer-nav";
import { NewEventDialog } from "@/components/modules/event";
import { CreateServiceButton } from "@/components/modules/services";
import { getOrganizerContext } from "@/components/modules/identity/server";
import {
  eventDashboardRoute,
  eventEditRoute,
  ROUTES,
  serviceLineRoute,
} from "@/lib/constants";
import { DEFAULT_TIMEZONE } from "@/lib/timezones";
import {
  loadTodayOverview,
  type ServiceToday,
  type TodayEvent,
  type TodayOverview,
} from "@/components/modules/dashboard/today.queries";

type Translator = Awaited<ReturnType<typeof getTranslations<"shell.today">>>;
type Formatter = Awaited<ReturnType<typeof getFormatter>>;

const DRAFTS_SHOWN = 3;

/**
 * The organizer's home: what needs an answer, today's line for every service,
 * and the events coming up, with both creation flows one click away. A brand
 * new organization sees a two-way choice instead of empty panels.
 */
export async function TodayView() {
  const context = await getOrganizerContext();
  if (!context) {
    return localeRedirect(ROUTES.LOGIN);
  }
  const [overview, t, tRoles, format] = await Promise.all([
    loadTodayOverview(),
    getTranslations("shell.today"),
    getTranslations("common.roles"),
    getFormatter(),
  ]);
  const role = organizerRole(context.role);
  const name = (context.fullName ?? context.email).split(/\s+/)[0];
  const today = format.dateTime(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: overview.services[0]?.timezone ?? DEFAULT_TIMEZONE,
  });
  const firstRun = overview.eventCount === 0 && overview.serviceCount === 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("greeting", { name })}</h1>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {t("subtitle", {
              date: today,
              role: role ? tRoles(role) : context.role,
              organization: context.brandName,
            })}
          </p>
        </div>
        {firstRun ? null : (
          <div className="flex flex-wrap gap-2">
            <CreateServiceButton variant="outline" />
            <NewEventDialog />
          </div>
        )}
      </header>

      {firstRun ? (
        <FirstRun t={t} />
      ) : (
        <>
          <Attention overview={overview} t={t} />
          <div className="grid gap-8 lg:grid-cols-5">
            <TodayLines overview={overview} t={t} format={format} />
            <UpcomingEvents events={overview.upcomingEvents} t={t} format={format} />
          </div>
        </>
      )}

      <p className="text-sm text-muted-foreground">
        {t.rich("help", { strong: (chunks) => <strong>{chunks}</strong> })}
      </p>
    </div>
  );
}

function FirstRun({ t }: { t: Translator }) {
  return (
    <section aria-labelledby="first-run-title" className="flex flex-col gap-4">
      <div>
        <h2 id="first-run-title" className="text-lg font-medium">{t("start.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("start.description")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CalendarDays className="mb-2 size-5 text-muted-foreground" aria-hidden />
            <CardTitle>{t("start.eventsTitle")}</CardTitle>
            <CardDescription>{t("start.eventsDescription")}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <NewEventDialog />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <ListOrdered className="mb-2 size-5 text-muted-foreground" aria-hidden />
            <CardTitle>{t("start.servicesTitle")}</CardTitle>
            <CardDescription>{t("start.servicesDescription")}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <CreateServiceButton />
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function Attention({ overview, t }: { overview: TodayOverview; t: Translator }) {
  const requests = overview.services.filter((service) => service.pendingRequests > 0);
  const drafts = overview.draftEvents.slice(0, DRAFTS_SHOWN);
  const moreDrafts = overview.draftEvents.length - drafts.length;
  if (requests.length === 0 && drafts.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="attention-title" className="flex flex-col gap-3">
      <h2 id="attention-title" className="text-lg font-medium">{t("attention.title")}</h2>
      <ItemGroup className="gap-2">
        {requests.map((service) => (
          <Item key={service.id} variant="outline">
            <ItemMedia variant="icon">
              <Inbox />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t("attention.requests", { count: service.pendingRequests })}</ItemTitle>
              <ItemDescription>{service.name}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button asChild size="sm">
                <Link href={serviceLineRoute(service.id)}>{t("attention.requestsAction")}</Link>
              </Button>
            </ItemActions>
          </Item>
        ))}
        {drafts.map((event) => (
          <Item key={event.id} variant="outline">
            <ItemMedia variant="icon">
              <PenLine />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t("attention.draft", { name: event.name })}</ItemTitle>
              <ItemDescription>{t("attention.draftDescription")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button asChild size="sm" variant="outline">
                <Link href={eventEditRoute(event.id)}>{t("attention.draftAction")}</Link>
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      {moreDrafts > 0 ? (
        <Link href={ROUTES.EVENTS} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          {t("attention.moreDrafts", { count: moreDrafts })}
        </Link>
      ) : null}
    </section>
  );
}

function SectionTitle({
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 id={id} className="text-lg font-medium">{title}</h2>
        <Button asChild variant="ghost" size="sm" className="-mr-2 shrink-0">
          <Link href={href}>
            {linkLabel}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TodayLines({ overview, t, format }: { overview: TodayOverview; t: Translator; format: Formatter }) {
  return (
    <section aria-labelledby="lines-title" className="flex flex-col gap-3 lg:col-span-3">
      <SectionTitle
        id="lines-title"
        title={t("lines.title")}
        description={t("lines.description")}
        href={ROUTES.SERVICES}
        linkLabel={t("lines.all")}
      />
      {overview.services.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListOrdered />
            </EmptyMedia>
            <EmptyTitle>{t("lines.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("lines.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateServiceButton />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {overview.services.map((service) => (
            <ServiceLineCard key={service.id} service={service} t={t} format={format} />
          ))}
        </div>
      )}
    </section>
  );
}

function ServiceLineCard({ service, t, format }: { service: ServiceToday; t: Translator; format: Formatter }) {
  const { line } = service;
  const figures = line
    ? [
        { label: t("lines.waiting"), value: line.waiting, strong: line.waiting > 0 },
        { label: t("lines.serving"), value: line.serving, strong: false },
        { label: t("lines.done"), value: line.done, strong: false },
        { label: t("lines.expected"), value: line.expected, strong: false },
      ]
    : [];
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>
          {!line
            ? t("lines.unavailable")
            : line.nextStartsAt
              ? t("lines.next", {
                  time: format.dateTime(new Date(line.nextStartsAt), {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: service.timezone,
                  }),
                })
              : t("lines.noNext")}
        </CardDescription>
        {service.pendingRequests > 0 ? (
          <CardAction>
            <Badge variant="secondary">{t("lines.requests", { count: service.pendingRequests })}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      {line ? (
        <CardContent>
          <dl className="grid grid-cols-4 gap-2 text-center">
            {figures.map((figure) => (
              <div key={figure.label} className="rounded-md bg-muted/60 px-1 py-2">
                <dd className={figure.strong ? "text-xl font-semibold text-primary" : "text-xl font-semibold"}>
                  {figure.value}
                </dd>
                <dt className="text-xs text-muted-foreground">{figure.label}</dt>
              </div>
            ))}
          </dl>
        </CardContent>
      ) : null}
      <CardFooter>
        <Button asChild size="sm" className="w-full">
          <Link href={serviceLineRoute(service.id)}>{t("lines.open")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function UpcomingEvents({ events, t, format }: { events: TodayEvent[]; t: Translator; format: Formatter }) {
  return (
    <section aria-labelledby="events-title" className="flex flex-col gap-3 lg:col-span-2">
      <SectionTitle
        id="events-title"
        title={t("events.title")}
        description={t("events.description")}
        href={ROUTES.EVENTS}
        linkLabel={t("events.all")}
      />
      {events.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarPlus />
            </EmptyMedia>
            <EmptyTitle>{t("events.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("events.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewEventDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <ItemGroup className="gap-2">
          {events.map((event) => (
            <UpcomingEventItem key={event.id} event={event} t={t} format={format} />
          ))}
        </ItemGroup>
      )}
    </section>
  );
}

function UpcomingEventItem({ event, t, format }: { event: TodayEvent; t: Translator; format: Formatter }) {
  const start = new Date(event.startDateTime ?? "");
  const dayOf = (date: Date) =>
    format.dateTime(date, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: event.timezone });
  const isToday = dayOf(start) === dayOf(new Date());
  return (
    <Item asChild variant="outline">
      <Link href={eventDashboardRoute(event.id)}>
        <ItemContent>
          <ItemTitle>
            {event.name}
            {isToday ? <Badge>{t("events.today")}</Badge> : null}
          </ItemTitle>
          <ItemDescription>
            {format.dateTime(start, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: event.timezone,
            })}
            {event.location ? (
              <>
                {" · "}
                <MapPin className="inline size-3 align-[-1px]" aria-hidden /> {event.location}
              </>
            ) : null}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ArrowRight className="size-4 text-muted-foreground" aria-label={t("events.open")} />
        </ItemActions>
      </Link>
    </Item>
  );
}
