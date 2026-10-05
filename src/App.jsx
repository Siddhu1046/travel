import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
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
  const [requests,setRequests] = useStore("travel-requests",[]);
  const [page,setPage] = useStore("travel-page","home");
  const [role,setRole] = useStore("travel-role","user");
  const [selected,setSelected] = useState(INITIAL_TRIPS[3]);
  const [filter,setFilter] = useState("all");
  const [toast,setToast] = useState("");
  const [name,setName] = useState("");
  const [draft,setDraft] = useState(null);
  const [newTripOpen,setNewTripOpen] = useState(false);
  const [alertsOpen,setAlertsOpen] = useState(true);
  const [adminOpen,setAdminOpen] = useState(false);
  const [adminPassword,setAdminPassword] = useState("");
  const [theme,setTheme] = useStore("travel-theme","dark");
  const [story,setStory] = useState({title:"",text:""});
  const [requestOpen,setRequestOpen] = useState(false);
  const [request,setRequest] = useState({name:"",destination:"",tripId:"",date:"",people:"2",instagram:"",phone:"",message:""});
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
  const submitRequest = e => {
    e.preventDefault();
    if(!request.name.trim()||!request.destination.trim()||!request.phone.trim()) return pop("Name, destination and phone are required.");
    setRequests([{id:Date.now(),...request,status:"pending",submittedAt:new Date().toISOString()},...requests]);
    setRequest({name:"",destination:"",tripId:"",date:"",people:"2",instagram:"",phone:"",message:""});
    setRequestOpen(false); pop("Trip request received — admin will review it.");
  };
  const reviewRequest = (id,status) => {
    const target=requests.find(r=>r.id===id);
    setRequests(requests.map(r=>r.id===id?{...r,status}:r));
    if(status==="approved" && target?.tripId){
      const list=registrations[target.tripId]||[];
      const approvedNames=Array.from({length:Number(target.people)||1},(_,i)=>i===0?target.name.trim():target.name.trim()+" +"+i);
      setRegistrations({...registrations,[target.tripId]:Array.from(new Set([...list,...approvedNames]))});
    }
    pop(status==="approved"?"Trip request approved and added to the trip ✓":"Trip request rejected.");
  };
  const saveTrip = e => {
    e.preventDefault(); const f=new FormData(e.currentTarget);
    let itinerary=[]; try { itinerary=JSON.parse(f.get("itinerary")||"[]"); } catch { return pop("Itinerary must be valid JSON."); }
    const gallery=(f.get("gallery")||"").split("\n").map(x=>x.trim()).filter(Boolean);
    const next={...draft,name:f.get("name"),place:f.get("place"),status:f.get("status"),startDate:f.get("startDate"),endDate:f.get("endDate"),budget:Number(f.get("budget")||0),capacity:Number(f.get("capacity")||1),summary:f.get("summary"),experience:f.get("experience"),itinerary,gallery,possibleDates:(f.get("possibleDates")||"").split("\n").map(x=>x.trim()).filter(Boolean)};

    setTrips(trips.map(t=>t.id===next.id?next:t)); setSelected(next); setDraft(null); pop("Trip details updated.");
  };

  return <main className={"site "+(theme==="light"?"theme-light":"theme-dark")}>
    <header className="topbar">
      <button className="brand" onClick={()=>setPage("home")}><span className="brand-mark">S×M</span><span><strong>OUR JOURNEY</strong><small>Siddhu × Mani</small></span></button>
      <nav>{["home","trips","calendar","memories","stories"].map(p=><button className={page===p?"active":""} onClick={()=>setPage(p)} key={p}>{p}</button>)}<button className="theme-toggle" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label="Toggle theme">{theme==="dark"?"☀ Light":"☾ Dark"}</button>{role==="admin"?<button className={page==="admin"?"active admin":""} onClick={()=>setPage("admin")}>Admin Dashboard</button>:<button className="role" onClick={()=>setAdminOpen(true)}>Admin Login</button>}{role==="admin"&&<button className="role" onClick={()=>{setRole("user");setPage("home")}}>User mode</button>}</nav>
    </header>
    {toast&&<div className="toast">{toast}</div>}\n    {alertsOpen && soon.length>0 && <div className="alert-bg"><div className="alert-box"><button className="x" onClick={()=>setAlertsOpen(false)}>×</button><p className="eyebrow">TRIP ALERT</p><h2>Your next adventure is getting close.</h2>{soon.map(t=><button className="alert-trip" key={t.id} onClick={()=>{setAlertsOpen(false);openTrip(t)}}><span>{t.icon}</span><b>{t.name}</b><small>{daysUntil(t.startDate)} days · ₹{t.budget.toLocaleString("en-IN")} · {(registrations[t.id]||t.members).length}/{t.capacity} going</small></button>)}</div></div>}
    {page==="home"&&<Home trips={trips} counts={counts} filter={filter} setFilter={setFilter} openTrip={openTrip} nearest={nearest} registrations={registrations} requests={requests} theme={theme}/>}
    {page==="trips"&&<TripList trips={trips} counts={counts} filter={filter} setFilter={setFilter} openTrip={openTrip} requests={requests}/>}\n    {page==="calendar"&&<CalendarPage trips={trips} openTrip={openTrip} theme={theme}/>}
    {page==="trip"&&selected&&<TripPage trip={selected} registrations={registrations} requests={requests} name={name} setName={setName} register={()=>register(selected)} back={()=>setPage("trips")}/>}
    {page==="memories"&&<Gallery media={media} role={role} setMedia={setMedia}/>}
    {page==="stories"&&<Stories stories={stories.filter(s=>s.status==="approved")} story={story} setStory={setStory} submit={submitStory}/>}
    {page==="admin"&&role==="admin"&&<Admin trips={trips} registrations={registrations} stories={stories} onEdit={setDraft} approve={approve} media={media} setMedia={setMedia} setTrips={setTrips} setStories={setStories} requests={requests} reviewRequest={reviewRequest} setRequests={setRequests} onCreate={()=>setNewTripOpen(true)}/>}
    {adminOpen&&<div className="modal-bg"><form className="modal" onSubmit={e=>{e.preventDefault();if(adminPassword==="admin123"){setRole("admin");setPage("admin");setAdminOpen(false);setAdminPassword("");pop("Admin access granted ✓")}else pop("Wrong admin password.")}}><button type="button" className="x" onClick={()=>{setAdminOpen(false);setAdminPassword("")}}>×</button><p className="eyebrow">SECURE AREA</p><h2>Admin login</h2><p className="hero-text">Enter the admin password to open the control center.</p><label>Password<input autoFocus type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="Admin password"/></label><button className="primary">Enter dashboard →</button><small style={{opacity:.55}}>Demo password: admin123</small></form></div>}
    {draft&&<div className="modal-bg"><form className="modal" onSubmit={saveTrip}><button type="button" className="x" onClick={()=>setDraft(null)}>×</button><p className="eyebrow">ADMIN · EDIT TRIP</p><h2>{draft.name}</h2><label>Name<input name="name" defaultValue={draft.name}/></label><label>Place<input name="place" defaultValue={draft.place}/></label><div className="two"><label>Status<select name="status" defaultValue={draft.status}><option value="completed">Completed</option><option value="upcoming">Upcoming</option><option value="wishlist">Wishlist</option></select></label><label>Capacity<input name="capacity" type="number" defaultValue={draft.capacity}/></label></div><div className="two"><label>Start<input name="startDate" type="date" defaultValue={draft.startDate}/></label><label>End<input name="endDate" type="date" defaultValue={draft.endDate}/></label></div><label>Budget ₹<input name="budget" type="number" defaultValue={draft.budget}/></label><label>Summary<textarea name="summary" defaultValue={draft.summary}/></label><label>Experience / story<textarea name="experience" defaultValue={draft.experience||""} placeholder="What happened on this trip?"/></label><ItineraryEditor initial={draft.itinerary||[{day:"01",title:"Arrival",text:"Start the journey."},{day:"02",title:"Explore",text:"Main experiences."},{day:"03",title:"Return",text:"Final memories and journey home."}]} /><label>Gallery URLs <small>one URL per line</small><textarea name="gallery" defaultValue={(draft.gallery||[]).join("\n")} placeholder="https://..."/></label><label>Possible dates <small>one date per line — useful for wishlist planning</small><textarea name="possibleDates" defaultValue={(draft.possibleDates||[]).join("\n")} placeholder="2026-12-12\n2027-01-09"/></label><button className="primary">Save trip</button></form></div>}
    {newTripOpen&&<div className="modal-bg"><form className="modal" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const id=Date.now();const trip={id,possibleDates:(f.get("possibleDates")||"").split("\n").map(x=>x.trim()).filter(Boolean),name:f.get("name"),short:(f.get("short")||"TRIP").toUpperCase(),status:f.get("status"),startDate:f.get("startDate"),endDate:f.get("endDate"),place:f.get("place"),coords:[Number(f.get("lng")||78.5),Number(f.get("lat")||21.5)],summary:f.get("summary"),budget:Number(f.get("budget")||0),members:[],capacity:Number(f.get("capacity")||8),icon:f.get("icon")||"🧭",experience:f.get("experience")||"",itinerary:[],gallery:[]};setTrips([...trips,trip]);setNewTripOpen(false);pop("New trip created.");}}><button type="button" className="x" onClick={()=>setNewTripOpen(false)}>×</button><p className="eyebrow">ADMIN · NEW TRIP</p><h2>Create a trip</h2><div className="two"><label>Name<input name="name" placeholder="Trip name"/></label><label>Short label<input name="short" placeholder="GOA"/></label></div><label>Place<input name="place" placeholder="Destination / route"/></label><div className="two"><label>Status<select name="status" defaultValue="wishlist"><option value="completed">Completed</option><option value="upcoming">Upcoming</option><option value="wishlist">Wishlist</option></select></label><label>Capacity<input name="capacity" type="number" defaultValue="8"/></label></div><div className="two"><label>Start<input name="startDate" type="date"/></label><label>End<input name="endDate" type="date"/></label></div><div className="two"><label>Longitude<input name="lng" type="number" step="any" defaultValue="78.5"/></label><label>Latitude<input name="lat" type="number" step="any" defaultValue="21.5"/></label></div><div className="two"><label>Budget ₹<input name="budget" type="number" defaultValue="0"/></label><label>Icon<input name="icon" placeholder="🌴"/></label></div><label>Summary<textarea name="summary" placeholder="Short trip description"/></label><label>Experience<textarea name="experience" placeholder="What makes this trip special?"/></label><label>Possible dates <small>one date per line</small><textarea name="possibleDates" placeholder="2026-12-12\n2027-01-09"/></label><button className="primary">Create trip →</button></form></div>}
    {requestOpen&&<div className="modal-bg"><form className="modal request-modal" onSubmit={submitRequest}><button type="button" className="x" onClick={()=>setRequestOpen(false)}>×</button><p className="eyebrow">PLAN WITH US</p><h2>Request a trip</h2><p className="hero-text">Tell us where you want to go and what kind of adventure you have in mind.</p><label>Trip / destination<select value={request.tripId} onChange={e=>{const id=e.target.value;const t=trips.find(x=>String(x.id)===id);setRequest({...request,tripId:id,destination:t?.name||request.destination})}}><option value="">New destination / custom trip</option>{trips.filter(t=>t.status!=="completed").map(t=><option key={t.id} value={t.id}>{t.name} · {t.status}</option>)}</select></label><div className="two"><label>Name<input value={request.name} onChange={e=>setRequest({...request,name:e.target.value})} placeholder="Your full name"/></label><label>Destination<input value={request.destination} onChange={e=>setRequest({...request,destination:e.target.value})} placeholder="Where to?"/></label></div><div className="two"><label>Phone number<input value={request.phone} onChange={e=>setRequest({...request,phone:e.target.value})} placeholder="+91 XXXXX XXXXX"/></label><label>Instagram ID<input value={request.instagram} onChange={e=>setRequest({...request,instagram:e.target.value})} placeholder="@yourhandle"/></label></div><div className="two"><label>Preferred date<input value={request.date} onChange={e=>setRequest({...request,date:e.target.value})} type="date"/></label><label>People<input value={request.people} onChange={e=>setRequest({...request,people:e.target.value})} type="number" min="1" placeholder="2"/></label></div><label>What are you looking for?<textarea value={request.message} onChange={e=>setRequest({...request,message:e.target.value})} placeholder="Beaches, mountains, road trip, budget, activities..."/></label><button className="primary">Send request →</button></form></div>}
    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><span className="brand-mark">S×M</span><div><strong>OUR JOURNEY</strong><p>Two people. A thousand roads.<br/>A map full of memories.</p></div></div><div><h4>EXPLORE</h4><button onClick={()=>setPage("trips")}>Trips & plans</button><button onClick={()=>setPage("memories")}>Memories</button><button onClick={()=>setPage("stories")}>Stories</button></div><div><h4>PLAN WITH US</h4><button onClick={()=>setRequestOpen(true)}>Request a trip</button><button onClick={()=>setPage("trips")}>Join an adventure</button><span>For collaborations · DM us</span></div><div><h4>FOLLOW</h4><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram · Siddhu</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram · Mani</a><a href="mailto:hello@ourjourney.travel">Email us</a></div></div><div className="footer-bottom"><span>© 2026 OUR JOURNEY · SIDDHU × MANI</span><span>PRIVATE TRAVEL HUB · PLANS → JOURNEYS → MEMORIES</span></div></footer>
  </main>;
}

function Map({trips,filter,openTrip,theme}) {
  const route=[[78.4867,17.385],[74.124,15.2993],[75.0967,15.3647]];
  const shown=trips.filter(t=>filter==="all"||t.status===filter);
  const light=theme==="light";
  const [zoom,setZoom]=useState(1);
  const [center,setCenter]=useState([78.5,21.5]);
  const [hovered,setHovered]=useState(null);
  return <div className="map-wrap">
    <div className="map-caption"><span>INDIA · INTERACTIVE TRAVEL MAP</span><span>DRAG · SCROLL · CLICK</span></div>
    <div className="map-tools"><button onClick={()=>setZoom(z=>Math.min(2.2,z+.2))}>+</button><button onClick={()=>setZoom(z=>Math.max(1,z-.2))}>−</button><button onClick={()=>{setZoom(1);setCenter([78.5,21.5])}}>Reset</button></div>
    {hovered&&<div className="map-tooltip"><span>{hovered.icon}</span><div><b>{hovered.name}</b><small>{STATUS[hovered.status].label} · {hovered.place}</small></div></div>}
    <ComposableMap projection="geoMercator" className="map" preserveAspectRatio="xMidYMid meet">
      <ZoomableGroup center={center} zoom={zoom} onMoveEnd={({coordinates,zoom})=>{setCenter(coordinates);setZoom(zoom)}} minZoom={1} maxZoom={2.4}>
        <Geographies geography={world}>{({geographies})=>geographies.map(g=><Geography key={g.rsmKey} geography={g} fill={g.properties?.name==="India"?(light?"#dfe8df":"#dbe6e0"):(light?"#f4f0e6":"#142131")} stroke={g.properties?.name==="India"?(light?"#71877b":"#849b90"):(light?"#d8d3c7":"#26384a")} strokeWidth={g.properties?.name==="India" ? .75 : .3} style={{default:{outline:"none"},hover:{outline:"none",fill:g.properties?.name==="India"?(light?"#d4e0d6":"#e2ebe5"):(light?"#eee9de":"#1a2b3c")},pressed:{outline:"none"}}}/>)}</Geographies>
        <Line from={route[0]} to={route[1]} stroke="#6b8579" strokeWidth={1.2} strokeDasharray="4 5"/>
        <Line from={route[1]} to={route[2]} stroke="#6b8579" strokeWidth={1.2} strokeDasharray="4 5"/>
        {shown.map(t=>{const s=STATUS[t.status];return <Marker key={t.id} coordinates={t.coords} onClick={()=>openTrip(t)} onMouseEnter={()=>setHovered(t)} onMouseLeave={()=>setHovered(null)}>
          <g className="marker-hit"><circle r="20" fill={s.soft} className={t.status==="upcoming"?"pulse":""}/><circle r="10" fill={light?"#fffdf8":"#07111d"} stroke={s.color} strokeWidth="3"/><circle r="4" fill={s.color}/></g><text textAnchor="middle" y="31" className="marker-label">{t.short}</text>
        </Marker>})}
      </ZoomableGroup>
    </ComposableMap>
    <div className="map-note">🟢 completed · 🟠 upcoming · 🟣 wishlist · scroll to explore</div>
  </div>;
}

function Home({trips,counts,filter,setFilter,openTrip,nearest,registrations,requests,theme}) {
  return <section><div className="hero"><div className="hero-copy"><p className="eyebrow">A living map of where we've been & where we're going</p><h1>Every trip gets a<br/><em>place on the map.</em></h1><p className="hero-text">Trips, people, budgets, stories and memories — one shared travel space.</p><div className="legend">{Object.entries(STATUS).map(([k,s])=><button key={k} className={filter===k?"legend-item active":"legend-item"} onClick={()=>setFilter(filter===k?"all":k)}><i style={{"--dot":s.color}}/>{s.label}<b>{counts[k]}</b></button>)}</div></div><Map trips={trips} filter={filter} openTrip={openTrip} theme={theme}/></div>{nearest&&<section className="countdown"><div><p className="eyebrow">NEXT ADVENTURE</p><h2>{nearest.icon} {nearest.name}</h2><p>{dateText(nearest.startDate)} · {nearest.place}</p></div><strong>{daysUntil(nearest.startDate)}<small>DAYS TO GO</small></strong><div className="count-info"><b>{(registrations[nearest.id]||nearest.members).length}/{nearest.capacity}</b><span>going</span><b>₹{nearest.budget.toLocaleString("en-IN")}</b><span>budget</span></div><button className="primary" onClick={()=>openTrip(nearest)}>Open & register →</button></section>}<section className="trip-section"><div className="section-heading"><div><p className="eyebrow">THE JOURNEY</p><h2>Our trips</h2></div><div className="stats">{Object.entries(counts).map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div></div><div className="trip-grid">{trips.filter(t=>filter==="all"||t.status===filter).map(t=><TripCard key={t.id} trip={t} click={()=>openTrip(t)} requests={requests}/>)}</div></section><ApprovedUpdates requests={requests} trips={trips} openTrip={openTrip}/></section>;
}

function TripCard({trip,click,requests=[]}) { const s=STATUS[trip.status]; const approved=requests.filter(r=>r.status==="approved"&&String(r.tripId)===String(trip.id)); return <button className="trip-card" style={{"--status":s.color}} onClick={click}><div className="trip-card-top"><span className="trip-icon">{trip.icon}</span><span className="status-pill">{s.label}</span></div><h3>{trip.name}</h3><p>{trip.place}</p><div className="trip-card-bottom">{dateText(trip.startDate)} <span>{approved.length?approved.length+" approved · ":""}View →</span></div></button>; }

function TripList({trips,counts,filter,setFilter,openTrip,requests}) { return <section className="page"><p className="eyebrow">DESTINATION INDEX</p><h1>Trips & plans</h1><div className="filterbar">{["all","completed","upcoming","wishlist"].map(k=><button className={filter===k?"active":""} onClick={()=>setFilter(k)} key={k}>{k} {k!=="all"&&counts[k]}</button>)}</div><div className="big-grid">{trips.filter(t=>filter==="all"||t.status===filter).map(t=><TripCard key={t.id} trip={t} click={()=>openTrip(t)}/>)}</div></section>; }

function TripPage({trip,registrations,requests,name,setName,register,back}) {
  const approved=requests.filter(r=>r.status==="approved"&&String(r.tripId)===String(trip.id));
  const people=Array.from(new Set([...(registrations[trip.id]||trip.members),...approved.map(r=>r.name)]));
  const completed=trip.status==="completed";
  const itinerary=trip.itinerary||[
    {day:"01",title:"Arrival & first impressions",text:"Reach the destination, settle in and begin exploring together."},
    {day:"02",title:"Explore the highlights",text:"Our main experiences, food stops and places worth remembering."},
    {day:"03",title:"The road home",text:"One last experience, photographs and the journey back."}
  ];
  const experience=trip.experience||"A trip becomes a memory through the people, places and small moments we share along the way.";
  return <section className="page trip-detail-page">
    <button className="back" onClick={back}>← Back to trips</button>
    <div className="trip-hero-detail"><div><span className="giant-icon">{trip.icon}</span><p className="eyebrow">{STATUS[trip.status].label} · {trip.place}</p><h1>{trip.name}</h1><p className="hero-text">{trip.summary}</p></div><div className="date-box"><b>{dateText(trip.startDate)}</b><span>{trip.endDate?"→ "+dateText(trip.endDate):"Planning stage"}</span></div></div>
    {completed?<><section className="experience-intro"><p className="eyebrow">THE EXPERIENCE</p><h2>What we lived, not just where we went.</h2><p>{experience}</p></section>
      <section className="detail-grid"><article className="info-card"><span className="detail-icon">🧭</span><b>JOURNEY</b><h3>{itinerary.length} chapters</h3><p>From departure to the moments we still talk about.</p></article><article className="info-card"><span className="detail-icon">👥</span><b>OUR TEAM</b><h3>{people.length} people</h3><p>{people.join(" · ")}</p></article><article className="info-card"><span className="detail-icon">📸</span><b>CAPTURED</b><h3>Drone + action cam</h3><p>Every road, view and chaotic little moment documented.</p></article></section>
      <section className="itinerary-section"><div className="section-heading"><div><p className="eyebrow">THE STORY</p><h2>Our itinerary</h2></div><span className="section-note">DAY BY DAY</span></div><div className="itinerary">{itinerary.map((x,i)=><article className="itinerary-item" key={i}><span>{x.day}</span><div><b>{x.title}</b><p>{x.text}</p></div></article>)}</div></section>
      <TripMemoryStrip trip={trip}/>
      <section className="team-section"><div><p className="eyebrow">THE CREW</p><h2>People who made it a memory.</h2></div><div className="people">{people.map((p,i)=><div className="person" key={i}><span>{p[0]}</span><b>{p}</b>{i===0&&<small>organizer</small>}</div>)}</div></section>
    </>:<><div className="detail-grid"><article className="info-card">📍<b>LOCATION</b><h3>{trip.place}</h3><p>Route and day-by-day itinerary.</p></article><article className="info-card">💰<b>BUDGET</b><h3>₹{trip.budget.toLocaleString("en-IN")}</h3><p>Planned budget for the trip.</p></article><article className="info-card">👥<b>CREW</b><h3>{people.length} / {trip.capacity}</h3><p>Places currently filled.</p></article></div>{trip.status==="upcoming"&&<section className="register-card"><div><p className="eyebrow">JOIN THIS TRIP</p><h2>{daysUntil(trip.startDate)} days to go</h2><p>Reserve your place in the crew.</p></div><div className="register-form"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/><button className="primary" onClick={register}>Register →</button></div></section>}<h2>Current crew</h2><div className="people">{people.map((p,i)=><div className="person" key={i}><span>{p[0]}</span><b>{p}</b>{i===0&&<small>organizer</small>}</div>)}</div></>}
  </section>;
}
function TripMemoryStrip({trip}) {
  const pics=(trip.gallery||[]).slice(0,4);
  return <section className="trip-gallery-section"><div className="section-heading"><div><p className="eyebrow">MEMORIES</p><h2>Frames from the journey</h2></div><span className="section-note">DRONE · ACTION CAM · PHOTOS</span></div>{pics.length?<div className="trip-photo-grid">{pics.map((p,i)=><img key={i} src={p} alt={trip.name+" memory "+(i+1)}/> )}</div>:<div className="empty memory-empty">Admin can add this trip's photos, drone frames and action-camera clips from the Gallery.</div>}</section>;
}

function Gallery({media,role,setMedia}) { const add=()=>{if(role!=="admin")return;const url=prompt("Paste image/video URL");if(url)setMedia([{id:Date.now(),type:/mp4|webm/i.test(url)?"video":"photo",title:"New memory",trip:"Our journey",url},...media]);};return <section className="page"><div className="page-head"><div><p className="eyebrow">OUR ARCHIVE</p><h1>Memories</h1><p className="hero-text">Photos, videos and moments we never want to forget.</p></div>{role==="admin"&&<button className="primary" onClick={add}>+ Add media</button>}</div><div className="gallery">{media.map(m=><article className="memory" key={m.id}>{m.type==="video"?<video src={m.url} controls/>:<img src={m.url} alt={m.title}/>}<div><b>{m.title}</b><span>{m.trip}</span></div></article>)}</div></section>; }

function Stories({stories,story,setStory,submit}) { return <section className="page"><p className="eyebrow">FROM THE CREW</p><h1>Stories & experiences</h1><p className="hero-text">Anyone can write. Admin approval keeps the public wall clean.</p><form className="story-form" onSubmit={submit}><input placeholder="Story title" value={story.title} onChange={e=>setStory({...story,title:e.target.value})}/><textarea placeholder="Tell us what happened..." value={story.text} onChange={e=>setStory({...story,text:e.target.value})}/><button className="primary">Submit for approval →</button></form><div className="stories">{stories.map(s=><article className="story" key={s.id}><small>{s.author} · {dateText(s.date)}</small><h2>{s.title}</h2><p>{s.text}</p></article>)}</div></section>; }

function Admin({trips,registrations,stories,onEdit,approve,media,setMedia,setTrips,setStories,requests,reviewRequest,setRequests,onCreate}) {
  const [tab,setTab]=useState("overview");
  const pendingStories=stories.filter(s=>s.status==="pending");
  const pendingRequests=requests.filter(r=>r.status==="pending");
  const addMedia=()=>{const url=prompt("Paste image/video URL");if(url)setMedia([{id:Date.now(),type:/mp4|webm/i.test(url)?"video":"photo",title:"New memory",trip:"Our journey",url},...media]);};
  const editStory=s=>{const title=prompt("Story title",s.title);if(title===null)return;const text=prompt("Story text",s.text);if(text===null)return;setStories(stories.map(x=>x.id===s.id?{...x,title,text,status:"pending",editedAt:new Date().toISOString()}:x));};
  const deleteStory=s=>{if(confirm("Remove this story permanently?"))setStories(stories.filter(x=>x.id!==s.id));};
  const editMedia=m=>{const title=prompt("Memory title",m.title);if(title===null)return;const trip=prompt("Trip name",m.trip);if(trip===null)return;setMedia(media.map(x=>x.id===m.id?{...x,title,trip}:x));};
  const deleteMedia=m=>{if(confirm("Delete this memory?"))setMedia(media.filter(x=>x.id!==m.id));};
  const requestHistory=requests;
  const removeRequest=r=>{if(confirm("Delete this request from history?"))setRequests(requests.filter(x=>x.id!==r.id));};
  const reopenRequest=r=>reviewRequest(r.id,"pending");
  return <section className="page admin-page">
    <div className="admin-hero"><div><p className="eyebrow">CONTROL CENTER · FULL ACCESS</p><h1>Manage the entire journey.</h1><p className="hero-text">Trips, applications, stories, memories, crew and public content — everything in one place.</p></div><button className="primary" onClick={onCreate}>+ Create trip</button></div>
    <div className="admin-command"><button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Overview</button><button className={tab==="trips"?"active":""} onClick={()=>setTab("trips")}>Trips</button><button className={tab==="requests"?"active":""} onClick={()=>setTab("requests")}>Requests <b>{pendingRequests.length}</b></button><button className={tab==="stories"?"active":""} onClick={()=>setTab("stories")}>Stories <b>{pendingStories.length}</b></button><button className={tab==="media"?"active":""} onClick={()=>setTab("media")}>Memories</button><button className={tab==="site"?"active":""} onClick={()=>setTab("site")}>Site controls</button></div>
    {(tab==="overview"||tab==="trips")&&<><div className="admin-stats"><div><b>{trips.length}</b><span>trips</span></div><div><b>{trips.filter(t=>t.status==="completed").length}</b><span>completed</span></div><div><b>{trips.filter(t=>t.status==="upcoming").length}</b><span>upcoming</span></div><div><b>{pendingRequests.length}</b><span>pending requests</span></div></div><h2>Trip management</h2><div className="admin-list">{trips.map(t=><div className="admin-row" key={t.id}><span>{t.icon}</span><div><b>{t.name}</b><small>{t.place} · {t.startDate||"no date"} · ₹{t.budget.toLocaleString("en-IN")}</small></div><select value={t.status} onChange={e=>setTrips(trips.map(x=>x.id===t.id?{...x,status:e.target.value}:x))}><option value="completed">Completed</option><option value="upcoming">Upcoming</option><option value="wishlist">Wishlist</option></select><button onClick={()=>onEdit(t)}>Edit all details</button></div>)}</div></>}
    {(tab==="overview"||tab==="requests")&&<><h2>Trip requests <span className="admin-count">{pendingRequests.length} pending</span></h2><div className="request-list">{requestHistory.length?requestHistory.map(r=><article className="request-card" key={r.id}><div className="request-card-head"><div><b>{r.name}</b><span>{r.destination} · {r.people||1} traveller{Number(r.people)!==1?"s":""}</span></div><span className={"request-status "+r.status}>{r.status.toUpperCase()}</span></div><div className="request-details"><span>📞 {r.phone}</span><span>◎ {r.instagram||"No Instagram"}</span><span>📅 {r.date?dateText(r.date):"Flexible date"}</span></div>{r.message&&<p>{r.message}</p>}<div className="request-actions">{r.status==="pending"?<><button className="approve" onClick={()=>reviewRequest(r.id,"approved")}>Approve</button><button className="reject" onClick={()=>reviewRequest(r.id,"rejected")}>Reject</button></>:<button onClick={reopenRequest}>Return to requests</button>}<button className="reject" onClick={()=>removeRequest(r)}>Delete</button></div></article>):<div className="empty">No trip requests yet.</div>}</div></>}
    {(tab==="overview"||tab==="stories")&&<><h2>Story moderation <span className="admin-count">{pendingStories.length} waiting</span></h2><div className="admin-list">{stories.length?stories.map(s=><div className="admin-row story-admin-row" key={s.id}><div><b>{s.title}</b><small>{s.author} · {s.status.toUpperCase()} · {s.text}</small></div>{s.status==="pending"?<><button className="approve" onClick={()=>approve(s.id,"approved")}>Approve</button><button className="reject" onClick={()=>approve(s.id,"rejected")}>Reject</button></>:<><button onClick={()=>editStory(s)}>Edit → requests</button><button className="reject" onClick={()=>deleteStory(s)}>Remove</button></>}</div>):<div className="empty">No stories yet.</div>}</div></>}
    {(tab==="overview"||tab==="media")&&<><h2>Memory library</h2><div className="admin-media-grid">{media.map(m=><article className="admin-media-card" key={m.id}>{m.type==="video"?<video src={m.url} controls/>:<img src={m.url} alt={m.title}/>}<b>{m.title}</b><small>{m.trip}</small><div><button onClick={()=>editMedia(m)}>Edit</button><button className="reject" onClick={()=>deleteMedia(m)}>Remove</button></div></article>)}</div><button className="primary" onClick={addMedia}>+ Add photo / video</button></>}
    {(tab==="overview"||tab==="site")&&<><h2>Site controls</h2><div className="site-control-grid"><article><b>Public experience</b><span>Edit trips, completed stories and memories anytime.</span></article><article><b>Moderation</b><span>Edited approved stories return to Requests for another review.</span></article><article><b>Applications</b><span>Approve, reject, reopen or remove trip requests.</span></article><article><b>Content library</b><span>Add, edit or remove photos and videos from the public archive.</span></article></div></>}
  </section>;
}
