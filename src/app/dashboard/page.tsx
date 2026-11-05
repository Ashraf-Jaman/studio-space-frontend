"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CalendarCheck, CalendarDays, Check, Clock, Compass, Eye, Plus, Store, XCircle } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;
type Booking = { _id: string; status: string; startTime: string; endTime: string; totalPrice: number; studio?: { name?: string; location?: string } };
type Studio = { _id: string; ownerId: string; name: string; location: string; pricePerHour: number; images?: string[]; isAvailable: boolean };

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const owner = (user as (typeof user & { role?: string }) | undefined)?.role === "studio_owner";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyBooking, setBusyBooking] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    if (!isPending && !user) router.replace("/login");
  }, [isPending, user, router]);

  useEffect(() => {
    if (!user?.id || !API) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await authClient.token();
        if (error || !data?.token) return;
        const path = owner ? "/bookings/owner/recent" : "/bookings/my";
        const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${data.token}` }, cache: "no-store" });
        const json = await response.json();
        if (!cancelled && response.ok && json.success && Array.isArray(json.data)) setBookings(json.data);
      } catch { /* Dashboard shortcuts remain usable if stats are unavailable. */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.id, owner]);

  useEffect(() => {
    if (!owner || !user?.id || !API) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`${API}/studios`, { cache: "no-store" });
        const json = await response.json();
        if (cancelled || !response.ok || !json.success || !Array.isArray(json.data)) return;
        setStudios(json.data.filter((studio: Studio) => studio.ownerId === user.id));
      } catch { /* Keep the listing area available with its empty state. */ }
    })();
    return () => { cancelled = true; };
  }, [owner, user?.id]);

  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const title = owner ? "Studio owner dashboard" : "Customer dashboard";

  const confirmBooking = async (bookingId: string) => {
    if (!API) return;
    setBusyBooking(bookingId);
    setBookingMessage("");
    try {
      const { data, error } = await authClient.token();
      if (error || !data?.token) throw new Error("Please log in again to confirm this booking.");
      const response = await fetch(`${API}/bookings/${bookingId}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Could not confirm booking.");
      setBookings((current) => current.map((booking) => booking._id === bookingId ? { ...booking, status: "confirmed" } : booking));
      setBookingMessage("Booking confirmed.");
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : "Could not confirm booking.");
    } finally {
      setBusyBooking(null);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!API || !window.confirm("Cancel this booking?")) return;
    setBusyBooking(bookingId);
    setBookingMessage("");
    try {
      const { data, error } = await authClient.token();
      if (error || !data?.token) throw new Error("Please log in again to cancel this booking.");
      const response = await fetch(`${API}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Could not cancel booking.");
      setBookings((current) => current.map((booking) => booking._id === bookingId ? { ...booking, status: "cancelled" } : booking));
      setBookingMessage("Booking cancelled.");
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : "Could not cancel booking.");
    } finally {
      setBusyBooking(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#050c16] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6">
        <DashboardSidebar active="dashboard" />
        <section>
          <div className="mb-7 rounded-2xl border border-slate-800 bg-[#091523] p-6 sm:p-8">
            <p className="text-sm font-semibold text-orange-400">Welcome{user?.name ? `, ${user.name}` : ""}</p>
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-slate-400">{owner ? "Add your studio and respond to customer booking requests." : "Find a studio, request a booking, and track the owner’s confirmation."}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-[#0b1726] p-5">
              <div className="flex items-center gap-3"><CalendarCheck className="text-orange-400" /><div><p className="text-sm text-slate-400">{owner ? "Recent requests" : "Your bookings"}</p><p className="text-2xl font-bold">{loading ? "…" : bookings.length}</p></div></div>
              {owner && <p className="mt-3 text-sm text-slate-400">{loading ? "" : `${pendingCount} waiting for your confirmation`}</p>}
            </article>
            <article className="rounded-xl border border-slate-800 bg-[#0b1726] p-5">
              <div className="flex items-center gap-3">{owner ? <Building2 className="text-orange-400" /> : <Compass className="text-orange-400" />}<div><p className="text-sm text-slate-400">{owner ? "Your studio" : "Discover spaces"}</p><p className="text-lg font-semibold">{owner ? "Grow your listing" : "Book a creative space"}</p></div></div>
              <Link href={owner ? "/dashboard#my-listings" : "/studios"} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300">{owner ? "View my listings" : "Browse studios"}{owner ? <ArrowRight size={16} /> : <Store size={16} />}</Link>
            </article>
          </div>

          <section className="mt-7">
            <div className="mb-4"><h2 className="text-xl font-bold">{owner ? "Booking Requests" : "My Bookings"}</h2><p className="mt-1 text-sm text-slate-400">{owner ? "Review customer requests and confirm pending bookings." : "See your booking dates and confirmation status."}</p></div>
            {bookingMessage && <p role="status" className="mb-3 text-sm text-orange-300">{bookingMessage}</p>}
            {loading ? (
              <div className="h-24 animate-pulse rounded-xl border border-slate-800 bg-[#0b1726]" />
            ) : bookings.length ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <article key={booking._id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#091523] p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{booking.studio?.name || "Studio booking"}</h3>
                      {booking.studio?.location && <p className="mt-1 truncate text-sm text-slate-400">{booking.studio.location}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><CalendarDays size={13} />{new Date(booking.startTime).toLocaleDateString("en-BD", { dateStyle: "medium" })}</span><span className="inline-flex items-center gap-1"><Clock size={13} />{new Date(booking.startTime).toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" })} – {new Date(booking.endTime).toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" })}</span><span className="font-semibold text-orange-400">৳{booking.totalPrice.toLocaleString("en-BD")}</span></div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" : booking.status === "pending" ? "bg-amber-500/10 text-amber-300" : "bg-slate-700 text-slate-300"}`}>{booking.status}</span>
                      {owner && booking.status === "pending" && <button onClick={() => void confirmBooking(booking._id)} disabled={busyBooking === booking._id} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{busyBooking === booking._id ? "Confirming…" : <><Check size={14} />Confirm</>}</button>}
                      <button onClick={() => setExpandedBooking((current) => current === booking._id ? null : booking._id)} aria-expanded={expandedBooking === booking._id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-orange-500"><Eye size={14} />{expandedBooking === booking._id ? "Hide details" : "Booking details"}</button>
                      {!owner && booking.status === "pending" && <button onClick={() => void cancelBooking(booking._id)} disabled={busyBooking === booking._id} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"><XCircle size={14} />{busyBooking === booking._id ? "Cancelling…" : "Cancel booking"}</button>}
                    </div>
                    {expandedBooking === booking._id && <div className="basis-full border-t border-slate-800 pt-3 text-sm text-slate-300"><p><span className="text-slate-500">Booking ID:</span> {booking._id}</p><p className="mt-1"><span className="text-slate-500">Start:</span> {new Date(booking.startTime).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-1"><span className="text-slate-500">End:</span> {new Date(booking.endTime).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-1"><span className="text-slate-500">Total:</span> ৳{booking.totalPrice.toLocaleString("en-BD")}</p></div>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-[#091523] px-5 py-8 text-center text-sm text-slate-400">{owner ? "No booking requests yet." : "You have not booked a studio yet."}</div>
            )}
          </section>

          {owner && (
            <section id="my-listings" className="mt-7 scroll-mt-24">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div><h2 className="text-xl font-bold">My Studio Listings</h2><p className="mt-1 text-sm text-slate-400">Studios you have added to StudioSpace.</p></div>
                <Link href="/studios/new" className="inline-flex w-fit items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold hover:bg-orange-600"><Plus size={16} />Add a Studio</Link>
              </div>
              {studios.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {studios.map((studio) => (
                    <article key={studio._id} className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1726]">
                      {studio.images?.[0] ? <img src={studio.images[0]} alt={studio.name} className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-slate-900 text-slate-500"><Building2 size={32} /></div>}
                      <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{studio.name}</h3><span className={`shrink-0 rounded-full px-2 py-1 text-xs ${studio.isAvailable ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-300"}`}>{studio.isAvailable ? "Available" : "Unavailable"}</span></div><p className="mt-1 truncate text-sm text-slate-400">{studio.location}</p><p className="mt-3 text-sm font-semibold text-orange-400">৳{studio.pricePerHour.toLocaleString("en-BD")} / hour</p><Link href={`/studios/${studio._id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-orange-400">View listing<ArrowRight size={15} /></Link></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-[#091523] px-5 py-10 text-center"><Building2 className="mx-auto mb-3 text-slate-500" /><p className="font-semibold">No studio listings yet</p><p className="mt-1 text-sm text-slate-400">Add your first studio to start receiving booking requests.</p></div>
              )}
            </section>
          )}

        </section>
      </div>
    </main>
  );
}
