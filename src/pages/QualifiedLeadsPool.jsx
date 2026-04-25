import { useCallback, useEffect, useState } from "react";
import { Layers3, Plus, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  getManagerOffers,
  getQualifiedLeadsPool as loadQualifiedLeadsPool,
} from "../services/api";
import CreateOfferModal from "../components/CreateOfferModal";
import OffersManagementTable from "../components/OffersManagementTable";

const QUALIFIED_OPTIONS = [
  "",
  "qualified-level-1",
  "qualified-level-2",
  "qualified-level-3",
];

export default function QualifiedLeadsPool() {
  const { showNotification } = useOutletContext();
  const [leadFilters, setLeadFilters] = useState({
    search: "",
    appointmentStatus: "",
    page: 1,
    limit: 8,
  });
  const [offerFilters, setOfferFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [qualifiedLeads, setQualifiedLeads] = useState([]);
  const [qualifiedPagination, setQualifiedPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [offers, setOffers] = useState([]);
  const [offersPagination, setOffersPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const refreshQualifiedLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const data = await loadQualifiedLeadsPool(leadFilters);
      setQualifiedLeads(data.items || []);
      setQualifiedPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Failed to load qualified leads", error);
      showNotification("Failed to load qualified leads", "error");
    } finally {
      setIsLoadingLeads(false);
    }
  }, [leadFilters, showNotification]);

  const refreshOffers = useCallback(async () => {
    setIsLoadingOffers(true);
    try {
      const data = await getManagerOffers(offerFilters);
      setOffers(data.items || []);
      setOffersPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Failed to load offers", error);
      showNotification("Failed to load offers", "error");
    } finally {
      setIsLoadingOffers(false);
    }
  }, [offerFilters, showNotification]);

  useEffect(() => {
    refreshQualifiedLeads();
  }, [refreshQualifiedLeads]);

  useEffect(() => {
    refreshOffers();
  }, [refreshOffers]);

  const handleOfferCreated = () => {
    refreshQualifiedLeads();
    refreshOffers();
  };

  const handleOfferCancelled = () => {
    refreshQualifiedLeads();
    refreshOffers();
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-blue-50 p-8 shadow-lg dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Layers3 className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Client Dashboard Marketplace
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Convert qualified caller leads into governed client offers with controlled
              masking, expiry, and payment lifecycle tracking.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/90 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Qualified Pool
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {qualifiedPagination.total}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/90 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Offers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {offersPagination.total}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/90 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Active
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {offers.filter((offer) => offer.status === "offered").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Qualified Leads Pool
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Select only qualified leads and convert them into client-ready offers.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={leadFilters.search}
                onChange={(event) =>
                  setLeadFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                placeholder="Search qualified leads"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <select
              value={leadFilters.appointmentStatus}
              onChange={(event) =>
                setLeadFilters((prev) => ({
                  ...prev,
                  appointmentStatus: event.target.value,
                  page: 1,
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">All qualified levels</option>
              {QUALIFIED_OPTIONS.filter(Boolean).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {isLoadingLeads ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Loading qualified leads...
            </div>
          ) : qualifiedLeads.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No qualified leads available for the current filters.
            </div>
          ) : (
            qualifiedLeads.map((lead) => {
              const hasActiveOffer = Boolean(lead.currentOffer);
              return (
                <article
                  key={lead._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {lead.businessName || "Unnamed lead"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {lead.contactName || "No contact"} • {lead.city || "Unknown"},{" "}
                        {lead.state || "Unknown"}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      {lead.appointmentStatus}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>Interest level: {lead.interestLevel || "Not set"}</p>
                    <p>Lead for: {lead.leadFor || "Not specified"}</p>
                    <p>Setup: {lead.currentSetup || "Not specified"}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    {hasActiveOffer ? (
                      <div className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                        Active offer assigned to {lead.currentOffer?.client?.name || lead.currentOffer?.client?.email || "client"}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        Ready to assign
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={hasActiveOffer}
                      onClick={() => setSelectedLead(lead)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Create Offer
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {qualifiedPagination.page} of {qualifiedPagination.pages || 1}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={leadFilters.page <= 1}
              onClick={() =>
                setLeadFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={leadFilters.page >= (qualifiedPagination.pages || 1)}
              onClick={() =>
                setLeadFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <OffersManagementTable
        offers={offers}
        filters={offerFilters}
        onFiltersChange={setOfferFilters}
        pagination={offersPagination}
        onPageChange={(page) =>
          setOfferFilters((prev) => ({ ...prev, page }))
        }
        onOfferCancelled={handleOfferCancelled}
        showNotification={showNotification}
        isLoading={isLoadingOffers}
      />

      <CreateOfferModal
        isOpen={Boolean(selectedLead)}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onCreated={handleOfferCreated}
        showNotification={showNotification}
      />
    </div>
  );
}
