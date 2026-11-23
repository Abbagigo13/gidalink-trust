import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { getPublicPropertiesByIds } from "../../services/properties";
import { getFavoriteIds, removeFavorite } from "../../services/workflow";
import { errorMessage, useAsync } from "../useAsync";
import { naira } from "../format";
import { EmptyState, ErrorNote, Loading, PageHeader, StatusBadge } from "../ui";

export default function Saved() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data, error, loading, reload } = useAsync(async () => {
    const ids = await getFavoriteIds(userId);
    return getPublicPropertiesByIds(ids);
  }, userId);
  const [actionError, setActionError] = useState("");

  const remove = async (propertyId: string) => {
    setActionError("");
    try {
      await removeFavorite(userId, propertyId);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader kicker="YOUR SHORTLIST" title={<>Places you've <em>saved.</em></>} />
      <ErrorNote message={error || actionError} />
      {loading && <Loading />}
      {data && data.length === 0 && (
        <EmptyState
          title="No saved properties yet"
          body="Tap the heart on any listing on the home page to keep it here. Saved properties follow your account across devices."
        />
      )}
      <div className="listing-rows">
        {data?.map((p) => (
          <article className="dash-card listing-row" key={p.id} data-testid="saved-row">
            <img className="listing-thumb" src={p.image_urls[0]} alt="" />
            <div>
              <h3>{p.title}</h3>
              <p>
                {[p.neighbourhood, p.city].filter(Boolean).join(", ")} ·{" "}
                <span className="num">{naira(p.price_ngn)}</span>
              </p>
              <div style={{ marginTop: 8 }}><StatusBadge status={p.status} /></div>
            </div>
            <div className="row-actions">
              <button className="btn-ghost" onClick={() => remove(p.id)}>
                <Heart size={15} fill="currentColor" /> Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
