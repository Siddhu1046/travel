import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import world from "world-atlas/countries-110m.json";

const STATUS = {
  completed: {
    label: "Completed",
    color: "#38d996",
    soft: "rgba(56,217,150,.13)",
  },
  upcoming: {
    label: "Planned / Upcoming",
    color: "#ff9f43",
    soft: "rgba(255,159,67,.13)",
  },
  wishlist: {
    label: "To Be Planned",
    color: "#a875ff",
    soft: "rgba(168,117,255,.13)",
  },
};

const trips = [
  {
    id: "andhra-2020",
    name: "Andhra Pradesh",
    short: "AP",
    status: "completed",
    dates: "07–11 Jan 2020",
    place: "Visakhapatnam & Coastal AP",
    coords: [83.2185, 17.6868],
    summary: "Simhachalam, Kailasagiri, RK Beach, Lambasingi, Bheemili, Annavaram and more.",
    spend: 0,
    members: ["Siddhu"],
    icon: "🌊",
  },
  {
    id: "goa-2023",
    name: "Goa",
    short: "GOA",
    status: "completed",
    dates: "03–06 Dec 2023",
    place: "Madgaon · Calangute · Baga",
    coords: [74.124, 15.2993],
    summary: "First flight, kayaking, beaches, Aguada Fort, Cola Beach and the Goa coastline.",
    spend: 0,
    members: ["Siddhu"],
    icon: "🌴",
  },
  {
    id: "karnataka-2023",
    name: "Karnataka",
    short: "KA",
    status: "completed",
    dates: "04–09 Dec 2023",
    place: "Gokarna · Murudeshwar · Hampi",
    coords: [75.0967, 15.3647],
    summary: "Gokarna, Yana Caves, Murudeshwar, Dudhsagar Falls and Hampi.",
    spend: 0,
    members: ["Siddhu"],
    icon: "🏛️",
  },
  {
    id: "netrani",
    name: "Netrani Island",
    short: "NETRANI",
    status: "upcoming",
    dates: "Planning",
    place: "Karnataka coast",
    coords: [74.752, 14.1],
    summary: "Our next adventure — itinerary, crew and budget still being shaped.",
    spend: 0,
    members: ["Siddhu", "Mani"],
    icon: "🤿",
  },
  {
    id: "dandeli",
    name: "Dandeli",
    short: "DANDELI",
    status: "wishlist",
    dates: "Idea",
    place: "Karnataka",
    coords: [74.618, 15.266],
    summary: "A trip idea we're keeping on the board until we turn it into a plan.",
    spend: 0,
    members: ["Siddhu", "Mani"],
    icon: "🌿",
  },
];

const route = [
  [78.4867, 17.385],
  [74.124, 15.2993],
  [75.0967, 15.3647],
];

function App() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(trips[3]);
  const [showPanel, setShowPanel] = useState(true);

  const filteredTrips = useMemo(
    () => trips.filter((trip) => filter === "all" || trip.status === filter),
    [filter]
  );

  const counts = useMemo(
    () =>
      trips.reduce(
        (acc, trip) => ({ ...acc, [trip.status]: acc[trip.status] + 1 }),
        { completed: 0, upcoming: 0, wishlist: 0 }
      ),
    []
  );

  const selectTrip = (trip) => {
    setSelected(trip);
    setShowPanel(true);
  };

  return (
    <main className="site">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">S×M</span>
          <div>
            <strong>OUR JOURNEY</strong>
            <span>Siddhu × Mani</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="live-dot" />
          <span>Travel log · 2020—now</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A map of where we've been & where we're going</p>
          <h1>Every trip gets a<br /><em>place on the map.</em></h1>
          <p className="hero-text">
            One shared space for our completed journeys, upcoming plans and
            places still waiting to become an adventure.
          </p>

          <div className="legend">
            {Object.entries(STATUS).map(([key, value]) => (
              <button
                key={key}
                className={`legend-item ${filter === key ? "active" : ""}`}
                onClick={() => setFilter(filter === key ? "all" : key)}
                type="button"
              >
                <span
                  className="legend-dot"
                  style={{ "--dot": value.color }}
                />
                <span>{value.label}</span>
                <b>{counts[key]}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="map-wrap">
          <div className="map-grid" />
          <div className="map-caption">
            <span>INDIA</span>
            <span>TRIP STATUS MAP</span>
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [78.5, 21.5], scale: 920 }}
            className="map"
          >
            <Geographies geography={world}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isIndia = geo.properties?.name === "India";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isIndia ? "#dbe6e0" : "#172536"}
                      stroke={isIndia ? "#94aaa0" : "#27384b"}
                      strokeWidth={isIndia ? 0.8 : 0.35}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            <Line
              from={route[0]}
              to={route[1]}
              stroke="#587266"
              strokeWidth={1.4}
              strokeDasharray="4 5"
              strokeLinecap="round"
            />
            <Line
              from={route[1]}
              to={route[2]}
              stroke="#587266"
              strokeWidth={1.4}
              strokeDasharray="4 5"
              strokeLinecap="round"
            />

            {filteredTrips.map((trip) => {
              const meta = STATUS[trip.status];
              return (
                <Marker
                  key={trip.id}
                  coordinates={trip.coords}
                  onClick={() => selectTrip(trip)}
                  className="trip-marker"
                >
                  <g className="marker-hit">
                    <circle r={16} fill={meta.soft} className={trip.status === "upcoming" ? "pulse" : ""} />
                    <circle r={9} fill="#07111f" stroke={meta.color} strokeWidth={3} />
                    <circle r={4} fill={meta.color} />
                  </g>
                  <text
                    textAnchor="middle"
                    y={29}
                    className="marker-label"
                    fill="#eef6f1"
                  >
                    {trip.short}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>

          <div className="map-scale">
            <span>●</span> completed &nbsp;&nbsp; <span>●</span> upcoming &nbsp;&nbsp; <span>●</span> idea
          </div>
        </div>
      </section>

      <section className="trip-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The story so far</p>
            <h2>Our trips</h2>
          </div>
          <div className="stats">
            <div><b>{counts.completed}</b><span>completed</span></div>
            <div><b>{counts.upcoming}</b><span>upcoming</span></div>
            <div><b>{counts.wishlist}</b><span>to plan</span></div>
          </div>
        </div>

        <div className="trip-grid">
          {filteredTrips.map((trip) => {
            const meta = STATUS[trip.status];
            const active = selected?.id === trip.id;
            return (
              <button
                type="button"
                className={`trip-card ${active ? "selected" : ""}`}
                key={trip.id}
                onClick={() => selectTrip(trip)}
                style={{ "--status": meta.color }}
              >
                <div className="trip-card-top">
                  <span className="trip-icon">{trip.icon}</span>
                  <span className="status-pill">{meta.label}</span>
                </div>
                <h3>{trip.name}</h3>
                <p>{trip.place}</p>
                <div className="trip-card-bottom">
                  <span>{trip.dates}</span>
                  <span>View →</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {showPanel && selected && (
        <aside className="detail-panel" aria-label="Selected trip details">
          <button
            className="close-panel"
            type="button"
            onClick={() => setShowPanel(false)}
            aria-label="Close trip details"
          >
            ×
          </button>
          <div className="panel-status" style={{ "--status": STATUS[selected.status].color }}>
            <span className="panel-dot" />
            {STATUS[selected.status].label}
          </div>
          <span className="panel-icon">{selected.icon}</span>
          <p className="eyebrow">{selected.dates}</p>
          <h2>{selected.name}</h2>
          <p className="panel-place">{selected.place}</p>
          <p className="panel-summary">{selected.summary}</p>

          <div className="panel-row">
            <div>
              <span>CREW</span>
              <strong>{selected.members.join(" · ")}</strong>
            </div>
            <div>
              <span>TRIP CODE</span>
              <strong>{selected.short}</strong>
            </div>
          </div>

          {selected.status === "upcoming" && (
            <div className="next-step">
              <span>NEXT STEP</span>
              <strong>Build the itinerary →</strong>
              <small>Add day-by-day plans, budget, stays, transport and members here.</small>
            </div>
          )}

          {selected.status === "completed" && (
            <div className="next-step completed-step">
              <span>MEMORY</span>
              <strong>Trip archived ✓</strong>
              <small>Photos, places visited and actual spending will live here.</small>
            </div>
          )}

          {selected.status === "wishlist" && (
            <div className="next-step wishlist-step">
              <span>WHEN WE'RE READY</span>
              <strong>Turn this idea into a trip →</strong>
              <small>Choose dates, build the route and invite the crew.</small>
            </div>
          )}
        </aside>
      )}

      <footer>
        <span>BUILT FOR TWO TRAVELERS</span>
        <span>•</span>
        <span>PLANS → JOURNEYS → MEMORIES</span>
      </footer>
    </main>
  );
}

export default App;