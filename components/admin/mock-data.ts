export const dashboardStats = [
  { title: "Published blogs", value: "24", change: "+12% this month", trend: "up" as const },
  { title: "Open positions", value: "8", change: "36 applications", trend: "up" as const },
  { title: "Unread messages", value: "12", change: "4 received today", trend: "up" as const },
  { title: "Subscribers", value: "2,486", change: "+8.2% this month", trend: "up" as const },
];

export const blogs = [
  { id: 1, title: "Building resilient cloud platforms in 2026", category: "Cloud", status: "Published", date: "Aug 01, 2026" },
  { id: 2, title: "A practical guide to enterprise AI adoption", category: "AI & Data", status: "Published", date: "Jul 28, 2026" },
  { id: 3, title: "Modernizing legacy applications without disruption", category: "Engineering", status: "Draft", date: "Jul 24, 2026" },
  { id: 4, title: "The new standard for secure product delivery", category: "Security", status: "Review", date: "Jul 19, 2026" },
  { id: 5, title: "How design systems accelerate transformation", category: "Design", status: "Published", date: "Jul 12, 2026" },
];

export const products = [
  { id: 1, name: "CITIS Flow", category: "Workflow automation", status: "Active", updated: "Aug 02, 2026" },
  { id: 2, name: "InsightIQ", category: "Analytics platform", status: "Active", updated: "Jul 29, 2026" },
  { id: 3, name: "SecureEdge", category: "Cloud security", status: "Beta", updated: "Jul 22, 2026" },
  { id: 4, name: "ConnectHub", category: "Integration platform", status: "Draft", updated: "Jul 14, 2026" },
];

export const careers = [
  { id: 1, title: "Senior Full Stack Engineer", department: "Engineering", location: "Bengaluru · Hybrid", applications: 18, status: "Open", date: "Jul 30, 2026" },
  { id: 2, title: "Cloud Solutions Architect", department: "Cloud", location: "Bengaluru · Hybrid", applications: 11, status: "Open", date: "Jul 26, 2026" },
  { id: 3, title: "Product Designer", department: "Design", location: "Remote · India", applications: 7, status: "Open", date: "Jul 21, 2026" },
  { id: 4, title: "Data Engineering Lead", department: "Data & AI", location: "Hyderabad · Hybrid", applications: 0, status: "Draft", date: "Jul 18, 2026" },
  { id: 5, title: "Growth Marketing Manager", department: "Marketing", location: "Bengaluru", applications: 24, status: "Closed", date: "Jun 29, 2026" },
];

export const testimonials = [
  { id: 1, name: "Ananya Rao", company: "Northstar Finance", quote: "CITIS transformed our release process and delivery confidence.", status: "Published" },
  { id: 2, name: "David Miller", company: "Acme Retail", quote: "A deeply capable team that always keeps business outcomes in focus.", status: "Published" },
  { id: 3, name: "Meera Shah", company: "Verde Health", quote: "Our new platform is faster, safer, and simpler for every user.", status: "Review" },
  { id: 4, name: "Carlos Mendes", company: "Orbit Logistics", quote: "The partnership helped us scale across three new markets.", status: "Draft" },
];

export const clients = [
  { id: 1, name: "Northstar Finance", industry: "Financial Services", status: "Visible", added: "Jul 18, 2026", initials: "NF" },
  { id: 2, name: "Acme Retail", industry: "Retail", status: "Visible", added: "Jul 12, 2026", initials: "AR" },
  { id: 3, name: "Verde Health", industry: "Healthcare", status: "Visible", added: "Jun 26, 2026", initials: "VH" },
  { id: 4, name: "Orbit Logistics", industry: "Logistics", status: "Hidden", added: "Jun 19, 2026", initials: "OL" },
  { id: 5, name: "Elevate Energy", industry: "Energy", status: "Visible", added: "May 30, 2026", initials: "EE" },
];

export const caseStudies = [
  { id: 1, title: "Real-time risk decisions at enterprise scale", client: "Northstar Finance", service: "Data & AI", status: "Published", date: "Jul 25, 2026" },
  { id: 2, title: "A unified commerce experience across 400 stores", client: "Acme Retail", service: "Digital Engineering", status: "Published", date: "Jul 14, 2026" },
  { id: 3, title: "Rebuilding patient journeys around trust", client: "Verde Health", service: "Experience Design", status: "Review", date: "Jul 08, 2026" },
  { id: 4, title: "Cloud migration with zero operational downtime", client: "Orbit Logistics", service: "Cloud", status: "Draft", date: "Jun 28, 2026" },
];

export const messages = [
  { id: 1, name: "Priya Nair", email: "priya@auroratech.io", subject: "Cloud modernization partnership", preview: "We are evaluating partners for a multi-year cloud program...", time: "10 min ago", status: "Unread" },
  { id: 2, name: "James Wilson", email: "james@meridian.co", subject: "Product engineering inquiry", preview: "Our team is planning a new B2B platform for Q4...", time: "2 hours ago", status: "Unread" },
  { id: 3, name: "Rohan Kulkarni", email: "rohan@openlane.in", subject: "Data platform consultation", preview: "Could we arrange a discovery call to discuss our data estate?", time: "Yesterday", status: "Read" },
  { id: 4, name: "Sara Ahmed", email: "sara@wellnesslab.com", subject: "Healthcare app development", preview: "We found your healthcare work and would like to learn more...", time: "Jul 31", status: "Read" },
  { id: 5, name: "Leon Tan", email: "leon@pacificlogix.sg", subject: "Regional technology partner", preview: "We are expanding into India and looking for a technology partner.", time: "Jul 29", status: "Archived" },
];

export const subscribers = [
  { id: 1, email: "maya@northstar.io", source: "Blog", subscribed: "Aug 03, 2026", status: "Subscribed" },
  { id: 2, email: "oliver@acmeretail.com", source: "Footer", subscribed: "Aug 02, 2026", status: "Subscribed" },
  { id: 3, email: "anika@productworks.in", source: "Case study", subscribed: "Aug 01, 2026", status: "Subscribed" },
  { id: 4, email: "sam@cloudnine.dev", source: "Blog", subscribed: "Jul 30, 2026", status: "Subscribed" },
  { id: 5, email: "hello@fieldnotes.co", source: "Footer", subscribed: "Jul 28, 2026", status: "Unsubscribed" },
];

export const applications = [
  { name: "Aditya Menon", role: "Senior Full Stack Engineer", time: "18 min ago", initials: "AM" },
  { name: "Sofia D'Souza", role: "Product Designer", time: "1 hour ago", initials: "SD" },
  { name: "Vikram Singh", role: "Cloud Solutions Architect", time: "Yesterday", initials: "VS" },
];

export const mediaItems = [
  { id: 1, name: "cloud-platform-hero.jpg", type: "JPG", size: "1.8 MB", color: "from-blue-600 to-cyan-400" },
  { id: 2, name: "team-collaboration.jpg", type: "JPG", size: "2.4 MB", color: "from-indigo-500 to-violet-400" },
  { id: 3, name: "citis-mark.svg", type: "SVG", size: "18 KB", color: "from-slate-700 to-blue-700" },
  { id: 4, name: "data-dashboard.png", type: "PNG", size: "846 KB", color: "from-cyan-500 to-emerald-400" },
  { id: 5, name: "office-bengaluru.jpg", type: "JPG", size: "3.1 MB", color: "from-amber-500 to-orange-400" },
  { id: 6, name: "security-pattern.svg", type: "SVG", size: "42 KB", color: "from-rose-500 to-purple-500" },
];
