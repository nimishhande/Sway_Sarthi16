import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/success/$bookingId")({
  head: ({ params }) => ({
    meta: [
      { title: `Booking ${params.bookingId} submitted — Sway Sarthi Cars Rental` },
      { name: "description", content: "Your rental booking and documents have been submitted successfully." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { bookingId } = Route.useParams();
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-card p-8 sm:p-10 text-center shadow-card border">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-brand text-white shadow-card">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold">Thank you!</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Your rental documents have been submitted successfully. Our team will contact you shortly.
          </p>
          <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 bg-accent/30 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Booking ID</p>
            <p className="mt-1 text-3xl font-bold tracking-wider text-primary">{bookingId}</p>
            <p className="mt-2 text-xs text-muted-foreground">Please save this for your reference.</p>
          </div>
          <Link to="/" className="mt-8 inline-flex rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Submit another booking
          </Link>
        </div>
      </div>
    </main>
  );
}
