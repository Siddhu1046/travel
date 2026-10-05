import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import world from "world-atlas/countries-110m.json";

const STATUS = {
  completed: { label: "Completed", color: "#38d996", soft: "rgba(56,217,150,.14)" },
  upcoming: { label: "Upcoming", color: "#ff9f43", soft: "rgba(255,159,67,.14)" },
  wishlist: { label: "To Be Planned", color: "#a875ff", soft: "rgba(168,117,255,.14)" }
};

const INITIAL_TRIPS = [
  { id:"ap", name:"Andhra Pradesh", short:"AP", status:"completed", startDate:"2020-01-07", endDate:"2020-01-11", place:"Visakhapatnam & Coastal AP", coords:[83.2185,17.6868], summary:"Simhachalam, Kailasagiri, RK Beach, Lambasingi, Bheemili and more.", budget:0, members:["Siddhu"], capacity:8, icon:"🌊" },
  { id:"goa", name:"Goa", short:"GOA", status:"completed", startDate:"2023-12-03", endDate:"2023-12-06", place:"Madgaon · Calangute · Baga", coords:[74.124,15.2993], summary:"First flight, kayaking, beaches, Aguada Fort and the coastline.", budget:0, members:["Siddhu"], capacity:8, icon:"🌴" },
  { id:"ka", name:"Karnataka", short:"KA", status:"completed", startDate:"2023-12-04", endDate:"2023-12-09", place:"Gokarna · Murudeshwar · Hampi", coords:[75.0967,15.3647], summary:"Gokarna, Yana Caves, Murudeshwar, Dudhsagar Falls and Hampi.", budget:0, members:["Siddhu"], capacity:8, icon:"🏛️" },
  { id:"netrani", name:"Netrani Island", short:"NETRANI", status:"upcoming", startDate:"2026-11-14", endDate:"2026-11-16", place:"Karnataka coast", coords:[74.752,14.1], summary:"Our next adventure — diving, island views and a coastal escape.", budget:12000, members:["Siddhu","Mani"], capacity:8, icon:"🤿" },
  { id:"dandeli", name:"Dandeli", short:"DANDELI", status:"wishlist", startDate:"", endDate:"", place:"Karnataka", coords:[74.618,15.266], summary:"A wild trip idea waiting for dates, crew and a route.", budget:10000, members:["Siddhu","Mani"], capacity:8, icon:"🌿" }
];

const INITIAL_STORIES = [
  { id:1, author:"Siddhu", title:"The first flight", text:"Goa felt unreal. The first flight, coastline and that feeling of finally going somewhere together.", status:"approved", date:"2023-12-06" },
  { id:2, author:"Mani", title:"Waiting for the next one", text:"Netrani is on the board. Now we just need to make the plan real.", status:"pending", date:"2026-10-05" }
];

const INITIAL_MEDIA = [
  { id:1, type:"photo", title:"Coastal memories", trip:"Goa", url:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80" },
  { id:2, type:"photo", title:"The Karnataka road", trip:"Karnataka", url:"https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=1200&q=80" },
  { id:3, type:"photo", title:"Sea days", trip:"Andhra Pradesh", url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" }
];

function useStore(key, initial) {
  const [v,setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; } });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key,v]);
  return [v,setV];
}
function daysUntil(d) { return d ? Math.max(0, Math.ceil((new Date(d+"T00:00:00")-new Date())/86400000)) : null; }
function dateText(d) { return d ? new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(d+"T00:00:00")) : "Date not set"; }

export default function App() {
  const [trips,setTrips] = useStore("travel-trips",INITIAL_TRIPS);
  const [stories,setStories] = useStore("travel-stories",INITIAL_STORIES);
  const [media,setMedia] = useStore("travel-media",INITIAL_MEDIA);
  const [registrations,setRegistrations] = useStore("travel-registrations",{});
  const [page,setPage] = useState("home");
  const [role,setRole] = useState("user");
  const [selected,setSelected] = useState(INITIAL_TRIPS[3]);
  const [filter,setFilter] = useState("all");
  const [toast,setToast] = useState("");
  const [name,setName] = useState("");
  const [draft,setDraft] = useState(null);
  const [alertsOpen,setAlertsOpen] = useState(true);
  const [story,setStory] = useState({title:"",text:""});
  const counts = useMemo(() => trips.reduce((a,t)=>({...a,[t.status]:a[t.status]+1}),{completed:0,upcoming:0,wishlist:0}),[trips]);
  const upcoming = trips.filter(t=>t.status==="upcoming"&&t.startDate).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  const nearest = upcoming[0];
  const soon = upcoming.filter(t => daysUntil(t.startDate) <= 30);
  const pop = m => { setToast(m); setTimeout(()=>setToast(""),3000); };
  const openTrip = t => { setSelected(t); setPage("trip"); };
  const register = t => {
    if(!name.trim()) return pop("Enter your name first.");
    const list = registrations[t.id] || [];
    if(list.includes(name.trim())) return pop("You are already registered.");
    setRegistrations({...registrations,[t.id]:[...list,name.trim()]});
    setName(""); pop("Registered for "+t.name+" ✓");
  };
  const submitStory = e => {
    e.preventDefault();
    if(!story.title.trim()||!story.text.trim()) return;
    setStories([{id:Date.now(),author:"Siddhu",title:story.title,text:story.text,status:"pending",date:new Date().toISOString().slice(0,10)},...stories]);
    setStory({title:"",text:""}); pop("Story sent to admin for approval.");
  };
  const approve = (id,status) => { setStories(stories.map(s=>s.id===id?{...s,status}:s)); pop(status==="approved"?"Story published.":"Story rejected."); };
  const saveTrip = e => {
    e.preventDefault(); const f=new FormData(e.currentTarget);
    const next={...draft,name:f.get("name"),place:f.get("place"),status:f.get("status"),startDate:f.get("startDate"),endDate:f.get("endDate"),budget:Number(f.get("budget")||0),capacity:Number(f.get("capacity")||1),summary:f.get("summary")};
    setTrips(trips.map(t=>t.id===next.id?next:t)); setSelected(next); setDraft(null); pop("Trip details updated.");
  };

  return <main className="site">
    <header className="topbar">
      <button className="brand" onClick={()=>setPage("home")}><span className="brand-mark">S×M</span><span><strong>OUR JOURNEY</strong><small>Siddhu × Mani</small></span></button>
      <nav>{["home","trips","memories","stories"].map(p=><button className={page===p?"active":""} onClick={()=>setPage(p)} key={p}>{p}</button>)}{role==="admin"&&<button className={page==="admin"?"active admin":""} onClick={()=>setPage("admin")}>Admin</button>}<button className="role" onClick={()=>{const n=role==="user"?"admin":"user";setRole(n);setPage(n==="admin"?"admin":"home")}}>{role==="user"?"Admin mode":"User mode"}</button></nav>
    </header>
    {toast&&<div className="toast">{toast}</div>}\n    {alertsOpen && soon.length>0 && <div className="alert-bg"><div className="alert-box"><button className="x" onClick={()=>setAlertsOpen(false)}>×</button><p className="eyebrow">TRIP ALERT</p><h2>Your next adventure is getting close.</h2>{soon.map(t=><button className="alert-trip" key={t.id} onClick={()=>{setAlertsOpen(false);openTrip(t)}}><span>{t.icon}</span><b>{t.name}</b><small>{daysUntil(t.startDate)} days · ₹{t.budget.toLocaleString("en-IN")} · {(registrations[t.id]||t.members).length}/{t.capacity} going</small></button>)}</div></div>}
    {page==="home"&&<Home trips={trips} counts={counts} filter={filter} setFilter={setFilter} openTrip={openTrip} nearest={nearest} registrations={registrations}/>}
    {page==="trips"&&<TripList trips={trips} counts={counts} filter={filter} setFilter={setFilter} openTrip={openTrip}/>}
    {page==="trip"&&selected&&<TripPage trip={selected} registrations={registrations} name={name} setName={setName} register={()=>register(selected)} back={()=>setPage("trips")}/>}
    {page==="memories"&&<Gallery media={media} role={role} setMedia={setMedia}/>}
    {page==="stories"&&<Stories stories={stories.filter(s=>s.status==="approved")} story={story} setStory={setStory} submit={submitStory}/>}
    {page==="admin"&&role==="admin"&&<Admin trips={trips} stories={stories} onEdit={setDraft} approve={approve} media={media} setMedia={setMedia} setTrips={setTrips}/>}
    {draft&&<div className="modal-bg"><form className="modal" onSubmit={saveTrip}><button type="button" className="x" onClick={()=>setDraft(null)}>×</button><p className="eyebrow">ADMIN · EDIT TRIP</p><h2>{draft.name}</h2><label>Name<input name="name" defaultValue={draft.name}/></label><label>Place<input name="place" defaultValue={draft.place}/></label><div className="two"><label>Status<select name="status" defaultValue={draft.status}><option value="completed">Completed</option><option value="upcoming">Upcoming</option><option value="wishlist">Wishlist</option></select></label><label>Capacity<input name="capacity" type="number" defaultValue={draft.capacity}/></label></div><div className="two"><label>Start<input name="startDate" type="date" defaultValue={draft.startDate}/></label><label>End<input name="endDate" type="date" defaultValue={draft.endDate}/></label></div><label>Budget ₹<input name="budget" type="number" defaultValue={draft.budget}/></label><label>Summary<textarea name="summary" defaultValue={draft.summary}/></label><button className="primary">Save trip</button></form></div>}
    <footer>PRIVATE TRAVEL HUB · PLANS → JOURNEYS → MEMORIES</footer>
  </main>;
}

function Map({trips,filter,openTrip}) {
  const route=[[78.4867,17.385],[74.124,15.2993],[75.0967,15.3647]];
  const shown=trips.filter(t=>filter==="all"||t.status===filter);
  return <div className="map-wrap"><div className="map-caption">INDIA · INTERACTIVE TRAVEL MAP <span>CLICK DESTINATIONS</span></div><ComposableMap projection="geoMercator" projectionConfig={{center:[78.5,21.5],scale:930}} className="map" preserveAspectRatio="xMidYMid meet"><Geographies geography={world}>{({geographies})=>geographies.map(g=><Geography key={g.rsmKey} geography={g} fill={g.properties?.name==="India"?"#dbe6e0":"#142131"} stroke={g.properties?.name==="India"?"#849b90":"#26384a"} strokeWidth={g.properties?.name === "India" ? .75 : .3} style={{default:{outline:"none"},hover:{outline:"none"},pressed:{outline:"none"}}}/>)}</Geographies><Line from={route[0]} to={route[1]} stroke="#5d756b" strokeWidth={1.2} strokeDasharray="4 5"/><Line from={route[1]} to={route[2]} stroke="#5d756b" strokeWidth={1.2} strokeDasharray="4 5"/>{shown.map(t=>{const s=STATUS[t.status];return <Marker key={t.id} coordinates={t.coords} onClick={()=>openTrip(t)}><g className="marker-hit"><circle r="18" fill={s.soft} className={t.status==="upcoming"?"pulse":""}/><circle r="9" fill="#07111d" stroke={s.color} strokeWidth="3"/><circle r="4" fill={s.color}/></g><text textAnchor="middle" y="29" className="marker-label">{t.short}</text></Marker>})}</ComposableMap><div className="map-note">🟢 completed · 🟠 upcoming · 🟣 wishlist</div></div>;
}

function Home({trips,counts,filter,setFilter,openTrip,nearest,registrations}) {
  return <section><div className="hero"><div className="hero-copy"><p className="eyebrow">A living map of where we've been & where we're going</p><h1>Every trip gets a<br/><em>place on the map.</em></h1><p className="hero-text">Trips, people, budgets, stories and memories — one shared travel space.</p><div className="legend">{Object.entries(STATUS).map(([k,s])=><button key={k} className={filter===k?"legend-item active":"legend-item"} onClick={()=>setFilter(filter===k?"all":k)}><i style={{"--dot":s.color}}/>{s.label}<b>{counts[k]}</b></button>)}</div></div><Map trips={trips} filter={filter} openTrip={openTrip}/></div>{nearest&&<section className="countdown"><div><p className="eyebrow">NEXT ADVENTURE</p><h2>{nearest.icon} {nearest.name}</h2><p>{dateText(nearest.startDate)} · {nearest.place}</p></div><strong>{daysUntil(nearest.startDate)}<small>DAYS TO GO</small></strong><div className="count-info"><b>{(registrations[nearest.id]||nearest.members).length}/{nearest.capacity}</b><span>going</span><b>₹{nearest.budget.toLocaleString("en-IN")}</b><span>budget</span></div><button className="primary" onClick={()=>openTrip(nearest)}>Open & register →</button></section>}<section className="trip-section"><div className="section-heading"><div><p className="eyebrow">THE JOURNEY</p><h2>Our trips</h2></div><div className="stats">{Object.entries(counts).map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div></div><div className="trip-grid">{trips.filter(t=>filter==="all"||t.status===filter).map(t=><TripCard key={t.id} trip={t} click={()=>openTrip(t)}/>)}</div></section></section>;
}

function TripCard({trip,click}) { const s=STATUS[trip.status]; return <button className="trip-card" style={{"--status":s.color}} onClick={click}><div className="trip-card-top"><span className="trip-icon">{trip.icon}</span><span className="status-pill">{s.label}</span></div><h3>{trip.name}</h3><p>{trip.place}</p><div className="trip-card-bottom">{dateText(trip.startDate)} <span>View →</span></div></button>; }

function TripList({trips,counts,filter,setFilter,openTrip}) { return <section className="page"><p className="eyebrow">DESTINATION INDEX</p><h1>Trips & plans</h1><div className="filterbar">{["all","completed","upcoming","wishlist"].map(k=><button className={filter===k?"active":""} onClick={()=>setFilter(k)} key={k}>{k} {k!=="all"&&counts[k]}</button>)}</div><div className="big-grid">{trips.filter(t=>filter==="all"||t.status===filter).map(t=><TripCard key={t.id} trip={t} click={()=>openTrip(t)}/>)}</div></section>; }

function TripPage({trip,registrations,name,setName,register,back}) { const people=registrations[trip.id]||trip.members; return <section className="page"><button className="back" onClick={back}>← Back</button><div className="trip-page-head"><div><span className="giant-icon">{trip.icon}</span><p className="eyebrow">{STATUS[trip.status].label}</p><h1>{trip.name}</h1><p className="hero-text">{trip.summary}</p></div><div className="date-box"><b>{dateText(trip.startDate)}</b><span>{trip.endDate?"→ "+dateText(trip.endDate):"Planning stage"}</span></div></div><div className="detail-grid"><article className="info-card">📍<b>LOCATION</b><h3>{trip.place}</h3><p>Route and day-by-day itinerary.</p></article><article className="info-card">💰<b>BUDGET</b><h3>₹{trip.budget.toLocaleString("en-IN")}</h3><p>Planned budget for the trip.</p></article><article className="info-card">👥<b>CREW</b><h3>{people.length} / {trip.capacity}</h3><p>{people.join(" · ")}</p></article></div>{trip.status==="upcoming"&&<section className="register-card"><div><p className="eyebrow">JOIN THIS TRIP</p><h2>{daysUntil(trip.startDate)} days to go</h2><p>Reserve your place in the crew.</p></div><div className="register-form"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/><button className="primary" onClick={register}>Register →</button></div></section>}<h2>Who's going</h2><div className="people">{people.map((p,i)=><div className="person" key={i}><span>{p[0]}</span><b>{p}</b>{i===0&&<small>organizer</small>}</div>)}</div></section>; }

function Gallery({media,role,setMedia}) { const add=()=>{if(role!=="admin")return;const url=prompt("Paste image/video URL");if(url)setMedia([{id:Date.now(),type:/mp4|webm/i.test(url)?"video":"photo",title:"New memory",trip:"Our journey",url},...media]);};return <section className="page"><div className="page-head"><div><p className="eyebrow">OUR ARCHIVE</p><h1>Memories</h1><p className="hero-text">Photos, videos and moments we never want to forget.</p></div>{role==="admin"&&<button className="primary" onClick={add}>+ Add media</button>}</div><div className="gallery">{media.map(m=><article className="memory" key={m.id}>{m.type==="video"?<video src={m.url} controls/>:<img src={m.url} alt={m.title}/>}<div><b>{m.title}</b><span>{m.trip}</span></div></article>)}</div></section>; }

function Stories({stories,story,setStory,submit}) { return <section className="page"><p className="eyebrow">FROM THE CREW</p><h1>Stories & experiences</h1><p className="hero-text">Anyone can write. Admin approval keeps the public wall clean.</p><form className="story-form" onSubmit={submit}><input placeholder="Story title" value={story.title} onChange={e=>setStory({...story,title:e.target.value})}/><textarea placeholder="Tell us what happened..." value={story.text} onChange={e=>setStory({...story,text:e.target.value})}/><button className="primary">Submit for approval →</button></form><div className="stories">{stories.map(s=><article className="story" key={s.id}><small>{s.author} · {dateText(s.date)}</small><h2>{s.title}</h2><p>{s.text}</p></article>)}</div></section>; }

function Admin({trips,stories,onEdit,approve,media,setMedia,setTrips}) { const pending=stories.filter(s=>s.status==="pending"); const add=()=>{const url=prompt("Paste image/video URL");if(url)setMedia([{id:Date.now(),type:/mp4|webm/i.test(url)?"video":"photo",title:"New memory",trip:"Our journey",url},...media]);};return <section className="page admin-page"><p className="eyebrow">CONTROL CENTER</p><h1>Admin dashboard</h1><p className="hero-text">Update trips, dates, budgets, crew, memories and community stories.</p><div className="admin-stats"><div><b>{trips.length}</b><span>trips</span></div><div><b>{trips.filter(t=>t.status==="upcoming").length}</b><span>upcoming</span></div><div><b>{pending.length}</b><span>pending stories</span></div><div><b>{media.length}</b><span>memories</span></div></div><h2>Trip management</h2><div className="admin-list">{trips.map(t=><div className="admin-row" key={t.id}><span>{t.icon}</span><div><b>{t.name}</b><small>{t.place} · {t.startDate||"no date"} · ₹{t.budget.toLocaleString("en-IN")}</small></div><select value={t.status} onChange={e=>setTrips(trips.map(x=>x.id===t.id?{...x,status:e.target.value}:x))}><option value="completed">Completed</option><option value="upcoming">Upcoming</option><option value="wishlist">Wishlist</option></select><button onClick={()=>onEdit(t)}>Edit</button></div>)}</div><h2>Story approvals</h2>{pending.length?<div className="admin-list">{pending.map(s=><div className="admin-row" key={s.id}><div><b>{s.title}</b><small>{s.author} · {s.text}</small></div><button className="approve" onClick={()=>approve(s.id,"approved")}>Approve</button><button className="reject" onClick={()=>approve(s.id,"rejected")}>Reject</button></div>)}</div>:<div className="empty">No stories waiting for approval.</div>}<h2>Gallery control</h2><button className="primary" onClick={add}>+ Add photo / video</button></section>; }
