import { strict as assert } from "node:assert";
import { test } from "node:test";
import { maskAnalyticsUrl } from "./analytics-privacy.ts";

test("a guest, operator or order page keeps its route but not its secret", () => {
  assert.equal(maskAnalyticsUrl("https://jiku.example/invitation/abc123"), "https://jiku.example/invitation/:token");
  assert.equal(maskAnalyticsUrl("https://jiku.example/en/checkin/k9x"), "https://jiku.example/en/checkin/:token");
  assert.equal(maskAnalyticsUrl("https://jiku.example/orders/zz1"), "https://jiku.example/orders/:token");
  assert.equal(maskAnalyticsUrl("/r/clinic/bookings/b42"), "/r/:token/bookings/:token");
});

test("the API calls behind those pages are masked too", () => {
  assert.equal(maskAnalyticsUrl("https://api.example/api/v1/rsvp/abc/confirm"), "https://api.example/api/v1/rsvp/:token/confirm");
  assert.equal(maskAnalyticsUrl("/api/v1/auth/invitations/t0k"), "/api/v1/auth/invitations/:token");
  assert.equal(maskAnalyticsUrl("/api/v1/line/l1/tickets/A12/call"), "/api/v1/line/:token/tickets/:token/call");
  assert.equal(maskAnalyticsUrl("/api/v1/operator-codes/123456"), "/api/v1/operator-codes/:token");
});

test("a traced request keeps its method", () => {
  assert.equal(maskAnalyticsUrl("GET https://api.example/api/v1/checkin/k9x/roster"), "GET https://api.example/api/v1/checkin/:token/roster");
});

test("query strings and record ids never leave", () => {
  assert.equal(maskAnalyticsUrl("/reset-password?token=secret#x"), "/reset-password");
  assert.equal(
    maskAnalyticsUrl("/events/123e4567-e89b-12d3-a456-426614174000/guests"),
    "/events/:id/guests",
  );
  assert.equal(maskAnalyticsUrl("/use-cases"), "/use-cases");
});
