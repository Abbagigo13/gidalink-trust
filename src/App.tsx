
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./App.css";

type ListingType = "Rent" | "Buy" | "Land";
type View = "home" | "explore" | "saved";
type SortOption = "recommended" | "price-low" | "price-high" | "newest";
type PropertyStatus = "Verified" | "Demo verified" | "Pending review";

type Property = {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  period?: string;
  beds?: number;
  baths?: number;
  area: string;
  type: ListingType;
  status: PropertyStatus;
  image: string;
  tag?: string;
  description: string;
  features: string[];
  source: "database" | "demo";
};

const demoProperties: Property[] = [
  {
    id: "demo-1",
    title: "The Contemporary Residence",
    location: "Mabushi, Abuja",
    city: "Abuja",
    price: 8500000,
    period: "/ year",
    beds: 4,
    baths: 4,
    area: "Mabushi",
    type: "Rent",
    status: "Demo verified",
    tag: "Editor's pick",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    description:
      "A spacious contemporary home with generous natural light, calm interiors and room to settle in. This sample listing demonstrates the information a renter can review before arranging an inspection.",
    features: [
      "4 bedrooms",
      "4 bathrooms",
      "Parking",
      "Fitted kitchen",
      "Gated compound",
    ],
    source: "demo",
  },
  {
    id: "demo-2",
    title: "The Garden House",
    location: "Barnawa, Kaduna",
    city: "Kaduna",
    price: 4500000,
    period: "/ year",
    beds: 3,
    baths: 3,
    area: "Barnawa",
    type: "Rent",
    status: "Demo verified",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85",
    description:
      "A welcoming family home in Barnawa, with practical living spaces and a quiet residential feel. Listing details are sample content for the GidaLink Trust interface.",
    features: [
      "3 bedrooms",
      "3 bathrooms",
      "Garden",
      "Water supply",
      "Parking",
    ],
    source: "demo",
  },
  {
    id: "demo-3",
    title: "The Modern Residence",
    location: "Lekki Phase 1, Lagos",
    city: "Lagos",
    price: 185000000,
    beds: 5,
    baths: 5,
    area: "Lekki",
    type: "Buy",
    status: "Demo verified",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85",
    description:
      "A modern property concept in Lekki Phase 1, presented as an example of the purchase journey and property-detail experience.",
    features: [
      "5 bedrooms",
      "5 bathrooms",
      "Modern finish",
      "Parking",
      "Fitted kitchen",
    ],
    source: "demo",
  },
  {
    id: "demo-4",
    title: "The Open Plot",
    location: "Sabon Gari, Zaria",
    city: "Zaria",
    price: 12000000,
    area: "Sabon Gari",
    type: "Land",
    status: "Pending review",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85",
    description:
      "A sample land listing in Sabon Gari, Zaria. Buyers should independently confirm title documents, survey details, boundaries and ownership before making any payment.",
    features: [
      "Residential use",
      "Accessible location",
      "Title review pending",
    ],
    source: "demo",
  },
  {
    id: "demo-5",
    title: "The Quiet Courtyard",
    location: "Gwarinpa, Abuja",
    city: "Abuja",
    price: 6500000,
    period: "/ year",
    beds: 3,
    baths: 3,
    area: "Gwarinpa",
    type: "Rent",
    status: "Pending review",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=85",
    description:
      "A sample three-bedroom home in Gwarinpa. Verification has not been completed in this demo, so treat all listing information as illustrative.",
    features: [
      "3 bedrooms",
      "3 bathrooms",
      "Balcony",
      "Parking",
    ],
    source: "demo",
  },
  {
    id: "demo-6",
    title: "The Lagos Townhouse",
    location: "Ajah, Lagos",
    city: "Lagos",
    price: 95000000,
    beds: 4,
    baths: 4,
    area: "Ajah",
    type: "Buy",
    status: "Pending review",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85",
    description:
      "A sample townhouse purchase listing. Use the detail view to inspect how property facts, features and trust status will be presented.",
    features: [
      "4 bedrooms",
      "4 bathrooms",
      "Family lounge",
      "Parking",
    ],
    source: "demo",
  },
  {
    id: "demo-7",
    title: "The Hillside Parcel",
    location: "Rayfield, Jos",
    city: "Jos",
    price: 18000000,
    area: "Rayfield",
    type: "Land",
    status: "Pending review",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85",
    description:
      "An illustrative land listing in Rayfield, Jos. Confirm the survey plan, title, access road and any planning restrictions with qualified local professionals.",
    features: [
      "Residential use",
      "Road access to be confirmed",
      "Title review pending",
    ],
    source: "demo",
  },
  {
    id: "demo-8",
    title: "The City Apartment",
    location: "Wuse 2, Abuja",
    city: "Abuja",
    price: 7200000,
    period: "/ year",
    beds: 2,
    baths: 2,
    area: "Wuse 2",
    type: "Rent",
    status: "Demo verified",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85",
    description:
      "A compact city apartment concept in Wuse 2. This sample content helps demonstrate filtering and saved-property workflows.",
    features: [
      "2 bedrooms",
      "2 bathrooms",
      "Fitted kitchen",
      "Central location",
    ],
    source: "demo",
  },
];

const money = (amount: number) =>
  "₦" + new Intl.NumberFormat("en-NG").format(amount);

function mapDatabaseProperty(row: any): Property {
  const listingType: ListingType =
    row.listing_type === "sale"
      ? "Buy"
      : row.listing_type === "land"
        ? "Land"
        : "Rent";

  const images = Array.isArray(row.image_urls)
    ? row.image_urls
    : [];

  const features = Array.isArray(row.features)
    ? row.features
    : [];

  const neighbourhood = row.neighbourhood || "";

  return {
    id: String(row.id),
    title: row.title,
    location: [neighbourhood, row.city].filter(Boolean).join(", "),
    city: row.city || "",
    price: Number(row.price_ngn) || 0,
    period: row.price_period
      ? `/ ${row.price_period}`
      : undefined,
    beds: row.bedrooms ?? undefined,
    baths: row.bathrooms ?? undefined,
    area: neighbourhood,
    type: listingType,
    status: "Verified",
    image:
      images[0] ||
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    description:
      row.description || "No property description provided yet.",
    features,
    source: "database",
  };
}

function App() {
  const [activeType, setActiveType] = useState<ListingType>("Rent");
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [selectedProperty, setSelectedProperty] =
    useState<Property | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("Any");
  const [verification, setVerification] = useState("All statuses");
  const [sort, setSort] = useState<SortOption>("recommended");

  const [databaseProperties, setDatabaseProperties] =
    useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [databaseError, setDatabaseError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      setLoadingProperties(true);
      setDatabaseError("");

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "verified")
        .order("published_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("GIDALINK PROPERTY ERROR:", error);
        setDatabaseError(
          "Live listings could not be loaded. Showing sample properties instead."
        );
        setDatabaseProperties([]);
      } else {
        const mapped = (data || []).map(mapDatabaseProperty);
        setDatabaseProperties(mapped);
      }

      setLoadingProperties(false);
    }

    loadProperties();

    return () => {
      active = false;
    };
  }, []);

  const allProperties =
    databaseProperties.length > 0
      ? databaseProperties
      : demoProperties;

  const usingDemoData = databaseProperties.length === 0;

  const filteredProperties = useMemo(() => {
    const filtered = allProperties.filter((property) => {
      const matchesSaved =
        view !== "saved" || favorites.includes(property.id);

      if (view === "saved") return matchesSaved;

      const matchesType = property.type === activeType;

      const query = location.trim().toLowerCase();

      const searchableText =
        `${property.location} ${property.city} ${property.area} Nigeria`;

      const matchesLocation =
        !query || searchableText.toLowerCase().includes(query);

      const matchesMin =
        !minPrice || property.price >= Number(minPrice);

      const matchesMax =
        !maxPrice || property.price <= Number(maxPrice);

      const matchesBeds =
        minBeds === "Any" ||
        (property.beds ?? 0) >= Number(minBeds);

      const matchesVerification =
        verification === "All statuses" ||
        property.status === verification;

      return (
        matchesType &&
        matchesLocation &&
        matchesMin &&
        matchesMax &&
        matchesBeds &&
        matchesVerification
      );
    });

    if (sort === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    return filtered;
  }, [
    allProperties,
    activeType,
    location,
    minPrice,
    maxPrice,
    minBeds,
    verification,
    sort,
    view,
    favorites,
  ]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const changeType = (type: ListingType) => {
    setActiveType(type);
    setSearched(false);
  };

  const resetFilters = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("Any");
    setVerification("All statuses");
    setSort("recommended");
    setSearched(false);
  };

  const openExplore = () => {
    setView("explore");
    setMenuOpen(false);

    window.setTimeout(() => {
      document
        .getElementById("explore")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const openSaved = () => {
    setView("saved");
    setMenuOpen(false);

    window.setTimeout(() => {
      document
        .getElementById("explore")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const runSearch = () => {
    setView("explore");
    setSearched(true);

    document
      .getElementById("explore")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const propertyGrid = (
    <>
      {filteredProperties.length > 0 ? (
        <div className="property-grid">
          {filteredProperties.map((property) => (
            <article
              className="property-card enhanced-property-card"
              key={property.id}
            >
              <button
                className="property-open"
                onClick={() => setSelectedProperty(property)}
                aria-label={`View ${property.title}`}
              >
                <div className="property-image-wrap">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="property-image"
                    loading="lazy"
                  />

                  {property.tag && (
                    <span className="property-tag">
                      {property.tag}
                    </span>
                  )}

                  <span
                    className={`status-chip ${
                      property.status === "Verified" ||
                      property.status === "Demo verified"
                        ? "status-demo"
                        : "status-pending"
                    }`}
                  >
                    <ShieldCheck size={13} />
                    {property.status}
                  </span>
                </div>
              </button>

              <button
                className={`favorite-button ${
                  favorites.includes(property.id) ? "favorited" : ""
                }`}
                onClick={() => toggleFavorite(property.id)}
                aria-label={
                  favorites.includes(property.id)
                    ? "Remove from saved"
                    : "Save property"
                }
              >
                <Heart
                  size={18}
                  fill={
                    favorites.includes(property.id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

              <div className="property-info">
                <div className="property-location">
                  <MapPin size={13} />
                  {property.location}
                </div>

                <button
                  className="property-title-button"
                  onClick={() => setSelectedProperty(property)}
                >
                  <h3>{property.title}</h3>
                </button>

                <div className="property-meta">
                  {property.beds && (
                    <span>
                      <BedDouble size={15} />
                      {property.beds} beds
                    </span>
                  )}

                  {property.baths && (
                    <span>
                      <Bath size={15} />
                      {property.baths} baths
                    </span>
                  )}

                  <span>{property.type}</span>
                </div>

                <div className="property-footer">
                  <div>
                    <strong>{money(property.price)}</strong>
                    <span>{property.period}</span>
                  </div>

                  <button
                    className="card-details-link"
                    onClick={() => setSelectedProperty(property)}
                  >
                    View details
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state enhanced-empty-state">
          <Building2 size={34} />

          <h3>
            {view === "saved"
              ? "No saved properties yet"
              : "No properties found"}
          </h3>

          <p>
            {view === "saved"
              ? "Tap the heart on a property to keep it here for later."
              : "Try another location, adjust your filters or choose a different category."}
          </p>

          <button
            className="primary-button"
            onClick={() => {
              resetFilters();
              setView("explore");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </>
  );

  return (
    <main>
      <header className="navbar">
        <button
          className="brand brand-button"
          onClick={() => {
            setView("home");
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-symbol">G.</span>
          <span>
            gidalink<span className="brand-light">trust</span>
          </span>
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <button onClick={openExplore}>Explore properties</button>

          <a href="#trust" onClick={() => setMenuOpen(false)}>
            How trust works
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About us
          </a>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={openSaved}>
            Saved ({favorites.length})
          </button>

          <button
            className="primary-button nav-cta"
            onClick={() =>
              alert(
                "Property submissions will be enabled in the next development step."
              )
            }
          >
            List your property
            <ArrowUpRight size={15} />
          </button>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {view === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="eyebrow-line" />
                A BETTER WAY TO FIND HOME
              </div>

              <h1>
                Find a place.
                <br />
                <em>Feel at home.</em>
              </h1>

              <p className="hero-description">
                Discover exceptional properties across Nigeria. Every
                detail matters. Every connection deserves trust.
              </p>

              <div className="search-panel">
                <div className="search-tabs">
                  {(["Rent", "Buy", "Land"] as ListingType[]).map(
                    (type) => (
                      <button
                        key={type}
                        className={
                          activeType === type
                            ? "search-tab active"
                            : "search-tab"
                        }
                        onClick={() => changeType(type)}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>

                <div className="search-fields">
                  <div className="location-field">
                    <MapPin size={19} />

                    <div>
                      <label htmlFor="location">LOCATION</label>

                      <input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, neighbourhood or area"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") runSearch();
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className="filter-button"
                    onClick={() => setLocation("")}
                    aria-label="Clear location"
                  >
                    <X size={17} />
                    <span>Clear</span>
                  </button>

                  <button className="search-button" onClick={runSearch}>
                    <Search size={18} />
                    Search
                  </button>
                </div>
              </div>

              <div className="hero-footnote">
                <ShieldCheck size={16} />
                <span>
                  Discover properties with transparent verification.
                </span>
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-image-overlay" />

              <div className="image-caption">
                <span>01 / DISCOVER</span>
                <span>Spaces worth coming home to.</span>
              </div>

              <div className="hero-image-mark">G.</div>
            </div>

            <div className="hero-bottom">
              <span>MADE FOR THE WAY NIGERIA LIVES.</span>
              <ArrowDownRight size={19} />
            </div>
          </section>

          <section className="intro-section" id="about">
            <div className="section-kicker">
              THE GIDALINK DIFFERENCE
            </div>

            <div className="intro-grid">
              <h2>
                More than a listing.
                <br />
                <em>A little more peace of mind.</em>
              </h2>

              <div className="intro-copy">
                <p>
                  Finding a property should be an exciting experience,
                  not an exercise in uncertainty. We're bringing
                  discovery, transparency and accountability into one
                  place.
                </p>

                <a href="#trust" className="text-link">
                  Discover how we build trust
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      <section
        className={`properties-section ${
          view !== "home" ? "standalone-explore" : ""
        }`}
        id="explore"
      >
        <div className="properties-heading">
          <div>
            <div className="section-kicker">
              {view === "saved"
                ? "YOUR SHORTLIST"
                : view === "explore"
                  ? "PROPERTY DIRECTORY"
                  : "CURATED FOR YOU"}
            </div>

            <h2>
              {view === "saved" ? (
                <>
                  Places you've <em>saved.</em>
                </>
              ) : view === "explore" ? (
                <>
                  Find your <em>place.</em>
                </>
              ) : (
                <>
                  Spaces to <em>discover.</em>
                </>
              )}
            </h2>

            <p>
              {view === "saved"
                ? "Your favourite properties, gathered in one place."
                : "Explore a selection of properties across Nigeria."}
            </p>
          </div>

          {view === "home" ? (
            <button
              className="text-link desktop-link"
              onClick={openExplore}
            >
              Explore all properties
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="text-link desktop-link"
              onClick={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ArrowLeft size={16} />
              Back to home
            </button>
          )}
        </div>

        <div className="listing-toolbar">
          {view !== "saved" && (
            <div className="listing-types">
              {(["Rent", "Buy", "Land"] as ListingType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => changeType(type)}
                    className={
                      activeType === type
                        ? "listing-type selected"
                        : "listing-type"
                    }
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          )}

          <div className="toolbar-right">
            <span className="result-count">
              {filteredProperties.length} PROPERTIES
            </span>

            {view !== "saved" && (
              <button
                className={`advanced-filter-button ${
                  filtersOpen ? "filter-active" : ""
                }`}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal size={16} />
                Filters
                <ChevronDown size={14} />
              </button>
            )}
          </div>
        </div>

        {view !== "saved" && filtersOpen && (
          <div className="advanced-filters">
            <div className="filter-field">
              <label htmlFor="filter-location">LOCATION</label>
              <input
                id="filter-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or neighbourhood"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="min-price">MINIMUM PRICE (₦)</label>
              <input
                id="min-price"
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="No minimum"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="max-price">MAXIMUM PRICE (₦)</label>
              <input
                id="max-price"
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="No maximum"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="beds">BEDROOMS</label>
              <select
                id="beds"
                value={minBeds}
                onChange={(e) => setMinBeds(e.target.value)}
              >
                <option>Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="verification">TRUST STATUS</label>
              <select
                id="verification"
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
              >
                <option>All statuses</option>
                <option>Verified</option>
                <option>Demo verified</option>
                <option>Pending review</option>
              </select>
            </div>

            <div className="filter-field sort-field">
              <label htmlFor="sort">SORT BY</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as SortOption)
                }
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="newest">Recently added</option>
              </select>
            </div>

            <button
              className="reset-filter-button"
              onClick={resetFilters}
            >
              Reset all
            </button>
          </div>
        )}

        {view !== "saved" && searched && (
          <div className="search-feedback">
            <Search size={15} />
            Showing {activeType.toLowerCase()} properties
            {location
              ? ` matching "${location}".`
              : " across Nigeria."}
          </div>
        )}

        {databaseError && (
          <div className="search-feedback">
            {databaseError}
          </div>
        )}

        {loadingProperties && (
          <div className="search-feedback">
            Loading property listings...
          </div>
        )}

        {!loadingProperties && usingDemoData && (
          <div className="search-feedback">
            Showing illustrative sample properties. Live verified
            listings will appear here when available.
          </div>
        )}

        {view === "home" ? (
          <div className="home-property-grid">{propertyGrid}</div>
        ) : (
          propertyGrid
        )}

        {view === "home" && (
          <div className="properties-bottom">
            <span>
              Thoughtfully selected. Transparently presented.
            </span>

            <button onClick={openExplore}>
              View the property directory
              <ArrowUpRight size={17} />
            </button>
          </div>
        )}
      </section>

      {view === "home" && (
        <>
          <section className="trust-section" id="trust">
            <div className="trust-visual">
              <div className="trust-visual-inner">
                <ShieldCheck size={52} strokeWidth={1.2} />
                <span>TRUST IS NOT A PROMISE.</span>
                <strong>It's a process.</strong>
              </div>
            </div>

            <div className="trust-content">
              <div className="section-kicker">
                THE TRUST STANDARD
              </div>

              <h2>
                Confidence should be
                <br />
                <em>part of the address.</em>
              </h2>

              <p>
                We make verification information visible, explain
                what has been reviewed, and provide a way to report
                suspicious listings. So you can make more informed
                decisions.
              </p>

              <div className="trust-points">
                <div>
                  <Check size={17} />
                  Clear verification statuses
                </div>
                <div>
                  <Check size={17} />
                  Accountable review process
                </div>
                <div>
                  <Check size={17} />
                  Community reporting tools
                </div>
              </div>

              <a href="#explore" className="text-link">
                Explore with confidence
                <ArrowUpRight size={16} />
              </a>
            </div>
          </section>

          <section className="closing-section">
            <div className="section-kicker">
              YOUR NEXT CHAPTER STARTS HERE
            </div>

            <h2>
              Somewhere feels
              <br />
              <em>like somewhere.</em>
            </h2>

            <button className="closing-button" onClick={openExplore}>
              Find your next home
              <ArrowUpRight size={17} />
            </button>
          </section>
        </>
      )}

      <footer className="footer">
        <button
          className="brand footer-brand brand-button"
          onClick={() => {
            setView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-symbol">G.</span>
          <span>
            gidalink<span className="brand-light">trust</span>
          </span>
        </button>

        <span>
          Property discovery, with trust at its heart.
        </span>

        <span>© 2026 GidaLink Trust</span>
      </footer>

      {selectedProperty && (
        <div
          className="detail-backdrop"
          role="presentation"
          onClick={() => setSelectedProperty(null)}
        >
          <section
            className="property-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="detail-close"
              onClick={() => setSelectedProperty(null)}
              aria-label="Close details"
            >
              <X size={20} />
            </button>

            <div className="detail-image">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
              />
            </div>

            <div className="detail-body">
              <div className="property-location">
                <MapPin size={14} />
                {selectedProperty.location}
              </div>

              <div className="detail-heading-row">
                <div>
                  <div className="section-kicker">
                    {selectedProperty.type.toUpperCase()} LISTING
                  </div>

                  <h2 id="detail-title">
                    {selectedProperty.title}
                  </h2>
                </div>

                <button
                  className={`detail-favorite ${
                    favorites.includes(selectedProperty.id)
                      ? "favorited"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFavorite(selectedProperty.id)
                  }
                >
                  <Heart
                    size={18}
                    fill={
                      favorites.includes(selectedProperty.id)
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {favorites.includes(selectedProperty.id)
                    ? "Saved"
                    : "Save"}
                </button>
              </div>

              <div className="detail-price">
                {money(selectedProperty.price)}
                <span>{selectedProperty.period}</span>
              </div>

              <div className="detail-status">
                <ShieldCheck size={16} />
                {selectedProperty.status}
                <span>
                  •{" "}
                  {selectedProperty.source === "database"
                    ? "Supabase listing"
                    : "Sample data only"}
                </span>
              </div>

              <p>{selectedProperty.description}</p>

              <h3>Property features</h3>

              <div className="feature-list">
                {selectedProperty.features.map((feature) => (
                  <span key={feature}>
                    <Check size={14} />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="detail-disclaimer">
                {selectedProperty.source === "demo"
                  ? "This is an illustrative demo listing, not a live offer. GidaLink Trust has not independently verified this property. Do not send money based on demo information."
                  : "This listing has a verified status in GidaLink Trust. Still inspect the property and independently confirm all relevant documents before making payment."}
              </div>

              <button
                className="primary-button detail-action"
                onClick={() =>
                  alert(
                    "Inspection requests will be enabled in the next development step."
                  )
                }
              >
                Request an inspection
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
