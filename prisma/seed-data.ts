/**
 * Seed content for Think Tank.
 *
 * Posts are authored as structured blocks rather than raw HTML so the seed can
 * emit both a Tiptap document (`contentJson`) and a plain-text rendering
 * (`content`) from one source. The plain text is what feeds the search vector
 * and the excerpt.
 */

export type Block =
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "quote"; text: string }
    | { type: "code"; language: string; text: string };

export type SeedUser = {
    key: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    bio: string;
    github?: string;
    linkedin?: string;
};

export type SeedPost = {
    /** Base filename expected in seed/images/posts (extension agnostic). */
    image: string;
    authorKey: string;
    title: string;
    tags: string[];
    link?: string;
    /** Days before "now" that this post was published. */
    daysAgo: number;
    body: Block[];
};

export const seedUsers: SeedUser[] = [
    {
        key: "varad",
        name: "Varad Patil",
        email: "varadapatil123@gmail.com",
        role: "ADMIN",
        bio: "Full-stack developer and the person who keeps this place running. Mostly Next.js, Postgres and an unreasonable number of side projects.",
        github: "https://github.com/DevVaradPatil",
        linkedin: "https://www.linkedin.com/in/varad-patil-9a1b3b229/",
    },
    {
        key: "ananya",
        name: "Ananya Deshpande",
        email: "ananya.deshpande@example.com",
        role: "USER",
        bio: "Final-year CSE. Applied ML, mostly in healthcare and agriculture. Interested in models small enough to run where the internet isn't.",
        github: "https://github.com/",
    },
    {
        key: "rohan",
        name: "Rohan Mehta",
        email: "rohan.mehta@example.com",
        role: "USER",
        bio: "Electronics and embedded systems. I like things that move, buzz, or occasionally catch fire on the workbench.",
        github: "https://github.com/",
    },
    {
        key: "priya",
        name: "Priya Nair",
        email: "priya.nair@example.com",
        role: "USER",
        bio: "Design and frontend. I care a lot about the gap between what a system does and what people think it does.",
        linkedin: "https://www.linkedin.com/",
    },
    {
        key: "karthik",
        name: "Karthik Raman",
        email: "karthik.raman@example.com",
        role: "USER",
        bio: "Data science student. Open datasets, messy CSVs, and the occasional chart that changes someone's mind.",
        github: "https://github.com/",
    },
    {
        key: "sneha",
        name: "Sneha Iyer",
        email: "sneha.iyer@example.com",
        role: "USER",
        bio: "Environmental engineering. Working on waste systems that people will actually use, which turns out to be the hard part.",
        linkedin: "https://www.linkedin.com/",
    },
    {
        key: "aditya",
        name: "Aditya Kulkarni",
        email: "aditya.kulkarni@example.com",
        role: "USER",
        bio: "Security enthusiast. I break student projects so someone less friendly doesn't. Currently deep in web app security.",
        github: "https://github.com/",
    },
    {
        key: "meera",
        name: "Meera Joshi",
        email: "meera.joshi@example.com",
        role: "USER",
        bio: "Mobile and AR developer. Flutter by day, Unity when I should be sleeping.",
        github: "https://github.com/",
    },
];

export const seedPosts: SeedPost[] = [
    {
        image: "crop-advisory",
        authorKey: "ananya",
        title: "Kisan Mitra: An Offline-First Crop Advisory App for Small Farmers",
        tags: ["Machine Learning", "Flutter", "Agriculture", "Offline First"],
        daysAgo: 6,
        body: [
            { type: "p", text: "Most agri-advisory apps assume a stable connection. In the villages we visited around Satara, that assumption breaks immediately — network coverage was intermittent at best, and data was something people rationed. Kisan Mitra is our attempt at an advisory tool that is useful with the phone in aeroplane mode." },
            { type: "h2", text: "The core constraint" },
            { type: "p", text: "Everything a farmer needs during a field visit has to already be on the device. That ruled out server-side inference, which is how most crop disease classifiers work. The model had to ship inside the app." },
            { type: "p", text: "We started with a MobileNetV3 backbone fine-tuned on the PlantVillage dataset, then quantised it to 8-bit integers. That took the model from 14 MB to just under 4 MB, with accuracy dropping from 94.1% to 92.7% on our held-out set — a trade we were happy to make." },
            { type: "h2", text: "What we got wrong first" },
            { type: "p", text: "Our initial dataset was almost entirely lab-quality leaf photographs on plain backgrounds. Real photos from a farmer's phone have soil, shadows, other leaves, and a thumb in the corner. Accuracy in the field was closer to 60% before we augmented aggressively and collected around 800 of our own photos in actual conditions." },
            { type: "quote", text: "The model was never the hard part. Getting representative data was." },
            { type: "h2", text: "Sync strategy" },
            { type: "ul", items: [
                "Advisory content and the model ship with the APK",
                "Diagnoses are queued locally in SQLite with a pending flag",
                "A background worker drains the queue whenever connectivity returns",
                "Nothing in the primary flow ever awaits the network",
            ]},
            { type: "p", text: "Next up is Marathi voice output, because a surprising number of our testers preferred listening over reading a diagnosis on a small screen." },
        ],
    },
    {
        image: "retinopathy-scan",
        authorKey: "ananya",
        title: "Detecting Diabetic Retinopathy with a Lightweight CNN",
        tags: ["Deep Learning", "Healthcare", "Python", "Computer Vision"],
        daysAgo: 34,
        body: [
            { type: "p", text: "Diabetic retinopathy is one of the leading causes of preventable blindness, and screening is largely a bottleneck problem — there are far more diabetic patients than there are ophthalmologists to examine them. This project looks at whether a small model can act as a triage filter." },
            { type: "h2", text: "Framing the problem correctly" },
            { type: "p", text: "We deliberately did not build a five-class severity grader. For triage, the only decision that matters is whether this patient needs to see a specialist. Collapsing to binary referable / non-referable made the class balance far more workable and the metric far more honest." },
            { type: "h2", text: "Results" },
            { type: "ul", items: [
                "Sensitivity: 0.91 — the number that actually matters for screening",
                "Specificity: 0.84",
                "AUC: 0.94 on the held-out test set",
                "Inference: ~180 ms on a mid-range laptop CPU",
            ]},
            { type: "p", text: "Sensitivity was weighted deliberately. A false positive costs someone an unnecessary appointment. A false negative costs someone their sight. We tuned the decision threshold accordingly rather than optimising for accuracy, which would have quietly favoured the majority class." },
            { type: "h2", text: "Honest limitations" },
            { type: "p", text: "Our training data came from public datasets captured on higher-end fundus cameras. We have no evidence this generalises to the cheaper handheld devices a rural screening camp would realistically use, and we did not have access to one to find out. Until that is tested, this is a coursework project and nothing more." },
        ],
    },
    {
        image: "ar-campus-navigation",
        authorKey: "meera",
        title: "Indoor AR Wayfinding for a College Campus",
        tags: ["AR", "Unity", "Mobile", "ARCore"],
        daysAgo: 12,
        body: [
            { type: "p", text: "GPS stops being useful the moment you walk through a door, which is exactly when a new student needs directions most. Our campus has four connected blocks and a room numbering scheme that appears to have been generated randomly, so this felt worth solving." },
            { type: "h2", text: "Why not just use beacons" },
            { type: "p", text: "Bluetooth beacons were the obvious answer, but they need hardware, permissions, and someone to replace batteries forever. We went with marker-based relocalisation instead: small printed codes at corridor junctions that the camera recognises to re-anchor the AR session." },
            { type: "p", text: "Between markers we rely on ARCore's motion tracking. Drift accumulates at roughly a metre every thirty seconds of walking, which sounds bad until you realise the markers are never more than twenty metres apart." },
            { type: "h2", text: "The pathfinding is boring on purpose" },
            { type: "p", text: "We modelled the campus as a weighted graph — nodes at junctions, doors and stairwells — and ran plain A*. Stairs carry a higher weight than corridors, and there is a toggle that makes them impassable for wheelchair routing, which turned into the feature people actually cared about in testing." },
            { type: "quote", text: "Two of our five testers said the accessibility toggle was the reason they would use it. We had built it as an afterthought." },
            { type: "h2", text: "Still to fix" },
            { type: "ul", items: [
                "Arrows sometimes render through walls — needs proper occlusion meshes",
                "Battery drain is severe, around 18% for a ten-minute session",
                "The marker printouts need to survive a monsoon",
            ]},
        ],
    },
    {
        image: "smart-irrigation",
        authorKey: "rohan",
        title: "Solar-Powered Smart Irrigation with Soil Moisture Sensors",
        tags: ["IoT", "Arduino", "Sustainability", "Sensors"],
        daysAgo: 58,
        body: [
            { type: "p", text: "The pitch was simple: water the plants when they need it, not when a timer says so. The execution involved considerably more corrosion than expected." },
            { type: "h2", text: "The sensor problem nobody mentions" },
            { type: "p", text: "Cheap resistive soil moisture sensors work beautifully for about three weeks. Then electrolysis eats the exposed traces and readings drift into nonsense. We lost a month of data before we understood what was happening." },
            { type: "p", text: "Capacitive sensors solved it — they have no exposed conductor in contact with the soil. They cost roughly four times as much and are worth every rupee." },
            { type: "code", language: "cpp", text: "// Only power the sensor while sampling.\n// Continuous excitation accelerates corrosion and\n// wastes current we do not have to spare.\ndigitalWrite(SENSOR_POWER, HIGH);\ndelay(50);                       // settle\nint raw = analogRead(SENSOR_PIN);\ndigitalWrite(SENSOR_POWER, LOW);" },
            { type: "h2", text: "Power budget" },
            { type: "ul", items: [
                "20 W panel with a 12 V 7 Ah sealed lead-acid battery",
                "ESP32 in deep sleep between readings, waking every 30 minutes",
                "Average draw around 4 mA, peaking near 240 mA when the valve opens",
                "Survived nine consecutive overcast days during testing",
            ]},
            { type: "h2", text: "Did it save water" },
            { type: "p", text: "Against a fixed twice-daily schedule on an adjacent plot, we used 31% less water over six weeks with no visible difference in plant health. That figure comes from one small plot in one season, so treat it as encouraging rather than conclusive." },
        ],
    },
    {
        image: "portal-ux-case-study",
        authorKey: "priya",
        title: "Redesigning Our College Portal: A UX Case Study",
        tags: ["UX", "Design", "Figma", "Research"],
        daysAgo: 21,
        body: [
            { type: "p", text: "Every student complains about the portal. I wanted to find out whether the complaints pointed at anything specific, or whether it was just ambient frustration with an old system." },
            { type: "h2", text: "What the research actually said" },
            { type: "p", text: "I ran think-aloud sessions with eleven students on four common tasks. The headline finding surprised me: people were not confused by the visual design, which is what everyone complains about. They were confused by the information architecture." },
            { type: "ul", items: [
                "9 of 11 could not find their attendance record within two minutes",
                "Every participant tried the navigation bar first; the link lives in a sidebar submenu",
                "7 mentioned they normally ask a friend rather than look it up",
                "Average of 6.2 clicks to reach exam results, against a theoretical minimum of 2",
            ]},
            { type: "quote", text: "\"I know it's in here somewhere, I just click around until I hit it.\" — participant 4, describing the system she uses every week." },
            { type: "h2", text: "The redesign" },
            { type: "p", text: "I restructured around the four things students actually do — attendance, results, fees, timetable — and put them on the landing screen as cards with live values rather than as links. Everything else moved behind a single More section." },
            { type: "p", text: "On a clickable Figma prototype, median time-to-attendance dropped from 74 seconds to 9. That is a prototype number with a small sample and all the usual caveats, but the direction is not subtle." },
            { type: "h2", text: "What I would do differently" },
            { type: "p", text: "I designed desktop-first out of habit. Around 80% of portal traffic is mobile. I had to rework most of the layout, and it would have been faster to start where the users are." },
        ],
    },
    {
        image: "air-quality-dashboard",
        authorKey: "karthik",
        title: "Predicting Local Air Quality with Open Data and XGBoost",
        tags: ["Data Science", "Python", "XGBoost", "Open Data"],
        daysAgo: 45,
        body: [
            { type: "p", text: "CPCB publishes hourly air quality readings for monitoring stations across India. I wanted to see how far ahead you can usefully forecast PM2.5 for a single station using only public data." },
            { type: "h2", text: "Features that mattered" },
            { type: "p", text: "Feature importance was dominated by lag terms, which is unsurprising for a time series — but the weather variables earned their place, particularly wind speed and boundary layer height." },
            { type: "ul", items: [
                "Lagged PM2.5 at 1, 3, 6, 12 and 24 hours",
                "Rolling mean and standard deviation over 24 hours",
                "Wind speed and direction from the nearest IMD station",
                "Hour of day and day of week, cyclically encoded",
                "A binary festival flag — Diwali week is genuinely its own regime",
            ]},
            { type: "h2", text: "How well it worked" },
            { type: "p", text: "At a six-hour horizon, RMSE was 18.4 µg/m³ against a persistence baseline of 27.1. At 24 hours the model degraded to 34.2, barely better than the baseline's 36.8. Short-horizon forecasting works; day-ahead needs meteorological forecasts I did not have." },
            { type: "h2", text: "The mistake worth sharing" },
            { type: "p", text: "My first version had suspiciously good results. I had used a random train/test split on time series data, so the model was interpolating between known points rather than extrapolating forward. Switching to a chronological split cut apparent performance nearly in half — and made it real." },
            { type: "quote", text: "If your time series model looks great, check your split before you celebrate." },
        ],
    },
    {
        image: "qr-waste-bins",
        authorKey: "sneha",
        title: "A Zero-Waste Campus: Tracking Segregation with QR Bins",
        tags: ["Sustainability", "IoT", "Campus", "Waste Management"],
        daysAgo: 28,
        body: [
            { type: "p", text: "Our campus had colour-coded bins for two years and a segregation rate somewhere near zero. The bins were never the problem. Nobody had any reason to care which one they used." },
            { type: "h2", text: "Measure first" },
            { type: "p", text: "Before changing anything we spent two weeks doing manual waste audits — sorting and weighing the contents of twelve bins daily. Grim work, but it gave us a baseline: 11% correct segregation, and a clear picture of what was going wrong where." },
            { type: "h2", text: "What we built" },
            { type: "p", text: "Each bin got a QR code. Scanning it before disposal logs the throw against your student ID and shows a live leaderboard by hostel block. Housekeeping staff scan a second code after collection to record whether the bin's contents were correctly sorted." },
            { type: "ul", items: [
                "Segregation accuracy rose from 11% to 63% over eight weeks",
                "Participation peaked in week 3, then settled at roughly 40% of residents",
                "Block-level competition drove far more engagement than individual scores",
            ]},
            { type: "h2", text: "The part that did not work" },
            { type: "p", text: "Individual points were gamed almost immediately — people scanned bins without throwing anything to farm the leaderboard. We removed individual scoring entirely and kept only block-level aggregates, which are much harder to game and turned out to motivate people more anyway." },
            { type: "quote", text: "Any metric a student can see, a student will try to beat. Design for that from the start." },
        ],
    },
    {
        image: "web-security-pentest",
        authorKey: "aditya",
        title: "Hardening a Student Web App: What a Pentest Taught Us",
        tags: ["Security", "Web", "Node.js", "Authentication"],
        daysAgo: 9,
        body: [
            { type: "p", text: "A friend asked me to look over the event management app his club had been running all semester. With written permission and a staging copy, I spent a weekend on it. What I found was not exotic — it was the same handful of mistakes almost every student project makes." },
            { type: "h2", text: "Finding 1: the API trusted the client's user ID" },
            { type: "p", text: "The endpoint that created an event took an organiserId straight from the request body and wrote it to the database. Changing one field in the request let me create events as any user on the platform. The fix is one line — derive identity from the session, never from the payload." },
            { type: "h2", text: "Finding 2: an endpoint returned entire user records" },
            { type: "p", text: "The member search returned full rows from the users table, password hashes included, straight to the browser. Nobody noticed because the UI only rendered names. The data was in the network tab the whole time." },
            { type: "quote", text: "Your UI deciding not to display a field is not access control." },
            { type: "h2", text: "Finding 3: no authorisation on delete" },
            { type: "p", text: "The delete endpoint checked that you were logged in. It did not check that the thing you were deleting was yours. Any authenticated user could delete any event by ID." },
            { type: "h2", text: "The pattern" },
            { type: "ul", items: [
                "Authentication answers who are you; authorisation answers may you do this. Most projects only implement the first.",
                "Select the fields you mean to expose. Never return a whole row by default.",
                "Anything reachable from the browser is a public API, whatever your framework calls it.",
            ]},
            { type: "p", text: "All three were fixed within a week. None of them required deep security knowledge to find — just a habit of opening the network tab and asking what happens if I change this." },
        ],
    },
    {
        image: "music-streaming-app",
        authorKey: "varad",
        title: "Melodia: A Music Streaming PWA Built with Next.js",
        tags: ["Next.js", "React", "TypeScript", "PWA"],
        link: "https://spotify-2-o.vercel.app/",
        daysAgo: 74,
        body: [
            { type: "p", text: "I wanted to understand how streaming apps stay responsive while shuffling megabytes of audio around, so I built one. Melodia does playlists, search, a persistent player and offline caching." },
            { type: "h2", text: "Keeping the player alive across navigation" },
            { type: "p", text: "The obvious problem with a music app in a routed SPA is that navigating must not restart playback. The answer was to hoist a single audio element into the root layout and drive it through context, so route changes never unmount it." },
            { type: "code", language: "tsx", text: "// One <audio> for the whole app, mounted above the router outlet.\n// Routes read and control it through context — they never own it.\nconst PlayerContext = createContext<PlayerApi | null>(null);\n\nexport function PlayerProvider({ children }: PropsWithChildren) {\n  const audioRef = useRef<HTMLAudioElement>(null);\n  // ...\n  return (\n    <PlayerContext.Provider value={api}>\n      <audio ref={audioRef} preload=\"metadata\" />\n      {children}\n    </PlayerContext.Provider>\n  );\n}" },
            { type: "h2", text: "Streaming, not downloading" },
            { type: "p", text: "Serving whole MP3s meant a long wait before the first note. Switching to HTTP range requests let the browser buffer progressively, which took time-to-first-audio from around 3 seconds to under 400 ms on a throttled connection." },
            { type: "h2", text: "What I would change" },
            { type: "ul", items: [
                "Search re-queries on every keystroke; it badly needs debouncing",
                "The service worker caches too eagerly and can serve stale playlists",
                "No gapless playback — noticeable on live albums",
            ]},
        ],
    },
    {
        image: "line-following-robot",
        authorKey: "rohan",
        title: "Line-Following Robot with PID Control — and Why Ours Kept Oscillating",
        tags: ["Robotics", "Arduino", "Control Systems", "PID"],
        daysAgo: 89,
        body: [
            { type: "p", text: "Every electronics student builds a line follower. Ours worked on the third weekend, and the two weekends before that taught me more than the working version did." },
            { type: "h2", text: "The oscillation" },
            { type: "p", text: "Our first PID controller made the robot weave violently down a straight line — overshooting, correcting, overshooting harder. The classic diagnosis is too much proportional gain, so we reduced Kp. It got worse in a different way: sluggish on corners, still wobbling on straights." },
            { type: "h2", text: "The actual cause" },
            { type: "p", text: "The problem was not the gains. It was the sampling rate. We were reading five IR sensors and doing a floating-point PID computation inside a loop that also drove a serial debug print. That print was blocking for roughly 40 ms, so our control loop ran at about 22 Hz — far too slow to correct smoothly at the speed we were driving." },
            { type: "quote", text: "We spent two weekends tuning gains for a problem that was actually a blocked control loop." },
            { type: "p", text: "Removing the serial print took the loop to over 500 Hz. The original gains, which we had abandoned, worked almost perfectly at that rate." },
            { type: "h2", text: "Final configuration" },
            { type: "ul", items: [
                "Kp 0.8, Ki 0.0, Kd 12.0 — derivative does the real work here",
                "Five-sensor array, weighted position from -4 to +4",
                "Control loop above 500 Hz with no blocking calls",
                "Integral term left at zero; it only wound up on sharp turns",
            ]},
            { type: "p", text: "If your control system misbehaves, measure your loop rate before you touch the gains." },
        ],
    },
    {
        image: "placement-data-viz",
        authorKey: "karthik",
        title: "Scraping and Visualising 10 Years of Campus Placement Data",
        tags: ["Data Visualization", "Python", "Pandas", "Web Scraping"],
        daysAgo: 52,
        body: [
            { type: "p", text: "Our placement cell publishes an annual PDF report. Ten years of them sat on the website, and nobody had ever looked at them together. So I did." },
            { type: "h2", text: "Getting the data out" },
            { type: "p", text: "The PDFs were inconsistent in almost every way that matters — table layouts changed three times, two years were scanned images rather than text, and company names appeared in at least four spellings each. Extraction with pdfplumber got me most of the way; the scanned years needed OCR and a lot of manual correction." },
            { type: "p", text: "Normalising company names took longer than the rest of the pipeline combined. Fuzzy matching with a manually curated alias table got roughly 94% of records grouped correctly, and I hand-fixed the rest." },
            { type: "h2", text: "What showed up" },
            { type: "ul", items: [
                "Median package grew 6.2% annually, close to flat once inflation is accounted for",
                "The mean is dragged upward every year by two or three outlier offers — the median tells a very different story",
                "Core engineering roles fell from 41% of placements to 12% over the decade",
                "The 2020 dip recovered fully by 2022",
            ]},
            { type: "quote", text: "The headline number every year is the highest package. It describes one student's outcome and almost nobody else's." },
            { type: "h2", text: "On publishing this" },
            { type: "p", text: "I aggregated everything to cohort level and published no individual records, even though the source PDFs sometimes named students. Just because data is technically public does not mean republishing it in a more usable form is harmless." },
        ],
    },
    {
        image: "dev-portfolio",
        authorKey: "varad",
        title: "My DevVerse: Building a Portfolio That Actually Gets Replies",
        tags: ["Portfolio", "Next.js", "Career", "Design"],
        link: "https://varadportfolio.web.app/",
        daysAgo: 103,
        body: [
            { type: "p", text: "My first portfolio was a wall of skill bars claiming I was 85% proficient in React. It got no replies. This is what changed when I rebuilt it." },
            { type: "h2", text: "Skill bars say nothing" },
            { type: "p", text: "A bar at 85% is unfalsifiable and meaningless — 85% of what? I replaced the entire section with three projects, each with the problem it solved, the decision I found hardest, and a link to running code." },
            { type: "h2", text: "Write about the hard part" },
            { type: "p", text: "For each project I added a short note on something that went wrong and how I worked it out. This felt risky, like advertising my own gaps. It turned out to be the thing people mentioned most — one interviewer opened with a question about a bug I had described." },
            { type: "quote", text: "Nobody is impressed that your project worked. They are interested in what you did when it didn't." },
            { type: "h2", text: "Boring technical decisions" },
            { type: "ul", items: [
                "Static generation — the content changes a few times a year",
                "No animation library; a handful of CSS transitions did the job",
                "Lighthouse above 95 on mobile, which mattered because most traffic came from phones",
                "One page, honest sections, no scroll-jacking",
            ]},
            { type: "h2", text: "Did it work" },
            { type: "p", text: "Reply rate on applications went from roughly one in twenty to about one in six. Small sample, plenty of confounders, and I was also a year more experienced. But the conversations changed shape — people asked about specific decisions instead of asking me to describe React." },
        ],
    },
];

/** Realistic comment threads keyed to post index, seeded for texture. */
export const seedComments: {
    postImage: string;
    authorKey: string;
    body: string;
    replies?: { authorKey: string; body: string }[];
}[] = [
    {
        postImage: "web-security-pentest",
        authorKey: "varad",
        body: "Finding 2 is uncomfortably familiar — I found the exact same thing in my own project last week. Selecting explicit fields instead of returning whole rows should honestly be the default everywhere.",
        replies: [
            { authorKey: "aditya", body: "It's the single most common one I see. The UI not rendering a field makes it invisible during development, so nobody catches it until someone opens devtools." },
        ],
    },
    {
        postImage: "line-following-robot",
        authorKey: "meera",
        body: "The blocked control loop is such a good catch. I lost a week on an AR jitter issue that turned out to be a logging call in the update loop.",
        replies: [
            { authorKey: "rohan", body: "Serial prints have cost me more debugging hours than any actual bug. Now I put them behind a compile-time flag from the start." },
        ],
    },
    {
        postImage: "air-quality-dashboard",
        authorKey: "ananya",
        body: "The random-split mistake is a rite of passage. Did you try adding holiday calendars beyond the Diwali flag?",
        replies: [
            { authorKey: "karthik", body: "Not yet — the festival flag was hand-built. A proper calendar is the obvious next step, especially for crop burning season which I haven't modelled at all." },
        ],
    },
    {
        postImage: "portal-ux-case-study",
        authorKey: "priya",
        body: "Happy to share the interview script and task list if anyone wants to run this on their own campus portal. The method transfers easily.",
    },
    {
        postImage: "qr-waste-bins",
        authorKey: "sneha",
        body: "Worth adding: the housekeeping staff were the reason this worked at all. We involved them from week one and their feedback reshaped the whole collection flow.",
    },
    {
        postImage: "crop-advisory",
        authorKey: "karthik",
        body: "Quantising to 4 MB for a 1.4 point accuracy drop is a great trade. Did you look at pruning before quantisation, or go straight to int8?",
        replies: [
            { authorKey: "ananya", body: "Straight to int8 — pruning was on the list but we ran out of semester. I suspect there's another megabyte or two available there." },
        ],
    },
];
