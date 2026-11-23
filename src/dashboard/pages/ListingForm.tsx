import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, X } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import {
  createListing,
  getListing,
  getSubmissions,
  submitForReview,
  updateListing,
  uploadEvidence,
  uploadPropertyImage,
  type ListingInput,
} from "../../services/listings";
import { errorMessage, useAsync } from "../useAsync";
import { formatDate, nigerianStates } from "../format";
import { ErrorNote, Loading, PageHeader, StatusBadge } from "../ui";
import type { PropertyRow } from "../../types";

const optionalInt = z
  .string()
  .refine((v) => v === "" || /^\d{1,3}$/.test(v), "Enter a whole number");

const schema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters").max(140, "Title is too long"),
  description: z.string().min(30, "Describe the property in at least 30 characters"),
  listing_type: z.enum(["rent", "sale", "land"]),
  price_ngn: z
    .string()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, "Enter a price above zero"),
  price_period: z.string(),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  area_sqm: z
    .string()
    .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0), "Enter a valid size"),
  address: z.string().min(6, "Enter the full street address"),
  neighbourhood: z.string(),
  city: z.string().min(2, "Enter the city"),
  state: z.string().min(2, "Choose a state"),
  features: z.string(),
});

type FormValues = z.infer<typeof schema>;

const blank: FormValues = {
  title: "", description: "", listing_type: "rent", price_ngn: "", price_period: "year",
  bedrooms: "", bathrooms: "", area_sqm: "", address: "", neighbourhood: "",
  city: "", state: "", features: "",
};

function fromRow(row: PropertyRow): FormValues {
  return {
    title: row.title,
    description: row.description,
    listing_type: row.listing_type,
    price_ngn: String(row.price_ngn),
    price_period: row.price_period ?? "",
    bedrooms: row.bedrooms == null ? "" : String(row.bedrooms),
    bathrooms: row.bathrooms == null ? "" : String(row.bathrooms),
    area_sqm: row.area_sqm == null ? "" : String(row.area_sqm),
    address: row.address,
    neighbourhood: row.neighbourhood ?? "",
    city: row.city,
    state: row.state,
    features: row.features.join(", "),
  };
}

function toInput(v: FormValues): ListingInput {
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    listing_type: v.listing_type,
    price_ngn: Number(v.price_ngn),
    price_period: v.listing_type === "rent" ? v.price_period || "year" : null,
    bedrooms: v.bedrooms === "" ? null : Number(v.bedrooms),
    bathrooms: v.bathrooms === "" ? null : Number(v.bathrooms),
    area_sqm: v.area_sqm === "" ? null : Number(v.area_sqm),
    address: v.address.trim(),
    neighbourhood: v.neighbourhood.trim() || null,
    city: v.city.trim(),
    state: v.state,
    features: v.features.split(",").map((f) => f.trim()).filter(Boolean).slice(0, 20),
  };
}

export default function ListingForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();

  const listing = useAsync(
    () => (id ? getListing(id) : Promise.resolve(null)),
    id ?? "new"
  );

  if (editing && listing.loading) return <Loading />;
  if (editing && !listing.data) {
    return <ErrorNote message={listing.error || "Listing not found, or you do not have access."} />;
  }

  return (
    <>
      <PageHeader
        kicker={editing ? "EDIT LISTING" : "NEW LISTING"}
        title={editing ? <>Edit <em>listing.</em></> : <>List your <em>property.</em></>}
      >
        {listing.data && <StatusBadge status={listing.data.status} />}
      </PageHeader>

      <FormBody
        key={listing.data?.id ?? "new"}
        userId={userId}
        row={listing.data}
        onCreated={(newId) => navigate(`/app/listings/${newId}`, { replace: true })}
        onDone={() => navigate("/app/listings")}
        onReload={listing.reload}
      />
    </>
  );
}

function FormBody({
  userId, row, onCreated, onDone, onReload,
}: {
  userId: string;
  row: PropertyRow | null;
  onCreated: (id: string) => void;
  onDone: () => void;
  onReload: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: row ? fromRow(row) : blank,
  });
  const { register, handleSubmit, control, formState } = form;
  const type = useWatch({ control, name: "listing_type" });
  const [images, setImages] = useState<string[]>(row?.image_urls ?? []);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);

  const save = handleSubmit(async (values) => {
    setError("");
    setNotice("");
    try {
      if (row) {
        await updateListing(row.id, { ...toInput(values), image_urls: images });
        setNotice("Changes saved.");
        onReload();
      } else {
        const created = await createListing(userId, toInput(values));
        onCreated(created.id);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  });

  const addImages = async (files: FileList | null) => {
    if (!files || !row) return;
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 8 - images.length)) {
        urls.push(await uploadPropertyImage(userId, file));
      }
      const next = [...images, ...urls];
      await updateListing(row.id, { image_urls: next });
      setImages(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url: string) => {
    if (!row) return;
    const next = images.filter((u) => u !== url);
    try {
      await updateListing(row.id, { image_urls: next });
      setImages(next);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const locked = row ? !["draft", "rejected"].includes(row.status) : false;

  return (
    <div className="stack">
      <ErrorNote message={error} />
      {notice && <div className="form-alert form-alert-ok" role="status">{notice}</div>}
      {locked && (
        <div className="form-alert form-alert-error">
          This listing is {row?.status.replace("_", " ")} and can no longer be edited.
        </div>
      )}

      <form className="dash-card dash-form" onSubmit={save} noValidate data-testid="listing-form">
        <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16 }}>
          <div className="form-grid">
            <label className="span-2">
              Title
              <input {...register("title")} placeholder="e.g. Three-bedroom flat in Gwarinpa" />
              <Err m={formState.errors.title?.message} />
            </label>
            <label>
              Listing type
              <select {...register("listing_type")}>
                <option value="rent">Rent</option>
                <option value="sale">Buy</option>
                <option value="land">Land</option>
              </select>
            </label>
            <label>
              Price (₦)
              <input inputMode="decimal" {...register("price_ngn")} />
              <Err m={formState.errors.price_ngn?.message} />
            </label>
            {type === "rent" && (
              <label>
                Rent period
                <select {...register("price_period")}>
                  <option value="year">Per year</option>
                  <option value="month">Per month</option>
                </select>
              </label>
            )}
            {type !== "land" && (
              <>
                <label>
                  Bedrooms
                  <input inputMode="numeric" {...register("bedrooms")} />
                  <Err m={formState.errors.bedrooms?.message} />
                </label>
                <label>
                  Bathrooms
                  <input inputMode="numeric" {...register("bathrooms")} />
                  <Err m={formState.errors.bathrooms?.message} />
                </label>
              </>
            )}
            <label>
              Size (sqm, optional)
              <input inputMode="decimal" {...register("area_sqm")} />
              <Err m={formState.errors.area_sqm?.message} />
            </label>
            <label className="span-2">
              Street address
              <input {...register("address")} />
              <span className="hint">Shown only to staff and buyers whose inspection you accept.</span>
              <Err m={formState.errors.address?.message} />
            </label>
            <label>
              Neighbourhood
              <input {...register("neighbourhood")} />
            </label>
            <label>
              City
              <input {...register("city")} />
              <Err m={formState.errors.city?.message} />
            </label>
            <label>
              State
              <select {...register("state")}>
                <option value="">Choose a state</option>
                {nigerianStates.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Err m={formState.errors.state?.message} />
            </label>
            <label className="span-2">
              Description
              <textarea {...register("description")} />
              <Err m={formState.errors.description?.message} />
            </label>
            <label className="span-2">
              Features (comma separated)
              <input {...register("features")} placeholder="Parking, Fitted kitchen, Gated compound" />
            </label>
          </div>
        </fieldset>
        {!locked && (
          <div className="row-actions">
            <button className="primary-button" disabled={formState.isSubmitting} data-testid="save-listing">
              {formState.isSubmitting ? "Saving..." : row ? "Save changes" : "Create draft"}
            </button>
            <button type="button" className="btn-ghost" onClick={onDone}>Back to listings</button>
          </div>
        )}
      </form>

      {row && !locked && (
        <>
          <section className="dash-card">
            <h2>Photographs</h2>
            <p className="hint">JPG, PNG or WebP, up to 5 MB each, maximum 8. At least one is required.</p>
            <div className="thumb-grid" style={{ margin: "14px 0" }}>
              {images.map((url) => (
                <div className="thumb" key={url}>
                  <img src={url} alt="Listing" />
                  <button aria-label="Remove photo" onClick={() => removeImage(url)}><X size={14} /></button>
                </div>
              ))}
            </div>
            {images.length < 8 && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading}
                onChange={(e) => { void addImages(e.target.files); e.target.value = ""; }}
                data-testid="photo-input"
              />
            )}
            {uploading && <Loading label="Uploading" />}
          </section>

          <EvidenceCard row={row} userId={userId} onChange={onReload} onError={setError} />

          <section className="dash-card">
            <h2>Submit for verification</h2>
            <p className="hint">A verifier reviews your evidence. You cannot edit the listing while it is under review.</p>
            <button
              className="primary-button"
              style={{ marginTop: 12 }}
              data-testid="submit-review"
              onClick={async () => {
                setError("");
                try {
                  await submitForReview(row.id);
                  onDone();
                } catch (err) {
                  setError(errorMessage(err));
                }
              }}
            >
              Submit for review
            </button>
          </section>
        </>
      )}
    </div>
  );
}

function EvidenceCard({
  row, userId, onChange, onError,
}: {
  row: PropertyRow;
  userId: string;
  onChange: () => void;
  onError: (m: string) => void;
}) {
  const submissions = useAsync(() => getSubmissions(row.id), row.id);
  const [docType, setDocType] = useState("Certificate of Occupancy");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onError("");
    try {
      await uploadEvidence(userId, row.id, file, docType, notes);
      setNotes("");
      submissions.reload();
      onChange();
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const latestRejection = submissions.data?.find((s) => s.status === "rejected" && s.reviewer_notes);

  return (
    <section className="dash-card">
      <h2>Verification evidence</h2>
      <p className="hint">PDF, JPG or PNG up to 10 MB. Documents are private: only you and verifiers can open them.</p>
      {latestRejection && (
        <div className="form-alert form-alert-error" style={{ marginTop: 12 }}>
          Previous review: {latestRejection.reviewer_notes}
        </div>
      )}
      <div className="dash-form" style={{ margin: "14px 0" }}>
        <div className="form-grid">
          <label>
            Document type
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option>Certificate of Occupancy</option>
              <option>Deed of Assignment</option>
              <option>Survey plan</option>
              <option>Agent authorisation letter</option>
              <option>Utility bill</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Notes (optional)
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          disabled={busy}
          onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }}
          data-testid="evidence-input"
        />
      </div>
      {busy && <Loading label="Uploading" />}
      {submissions.data?.map((s) => (
        <p key={s.id} className="hint" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <FileText size={14} /> {s.document_type} · {s.status} · {formatDate(s.created_at)}
        </p>
      ))}
    </section>
  );
}

function Err({ m }: { m?: string }) {
  return m ? <span className="field-error" role="alert">{m}</span> : null;
}
