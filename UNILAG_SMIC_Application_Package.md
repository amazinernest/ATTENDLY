# UNILAG Shelf-to-Market Innovation Challenge (S-MIC)
## Academic Staff Application Proposal
**Theme:** *From Research Outputs to Market Impact*  
**Project / Venture Name:** ClassMark (Attendly) — Production Academic Attendance & Anti-Proxy Compliance Platform  

---

## 1. Project Overview & Meta Information

- **Title of Innovation:** ClassMark: An Anti-Proxy Digital Attendance & Institutional Examination Clearance Engine for Nigerian Tertiary Institutions
- **Primary Sector / Category:** Educational Technology (EdTech) / Software & Digital Enterprise / Governance & Institutional Compliance
- **Target Institution / Pilot:** University of Lagos (UNILAG) as primary launchpad, scaling across Nigerian Federal & State Universities, Polytechnics, and Colleges of Education
- **Current Technology Readiness Level (TRL):** **TRL 7 / TRL 8** (Fully functional production system with live cloud deployment on Supabase/PostgreSQL, complete multi-tenant security architecture, anti-buddy punching hardware device locks, multi-format roster parsers, and official NUC-compliant PDF/Excel reporting).

---

## 2. Executive Summary

### 50-Word Elevator Pitch
ClassMark is an enterprise EdTech platform designed for Nigerian tertiary institutions to eradicate proxy attendance, automate NUC-mandated 75% examination clearance, and replace paper-based sign-in sheets. Featuring dynamic QR codes, hardware device-locking, multi-format spreadsheet ingestion, and tamper-evident audit ledgers, ClassMark transforms paper-bound academic administration into actionable institutional intelligence.

### 250-Word Executive Abstract
In Nigerian tertiary institutions, academic integrity and accreditation compliance are heavily anchored on the National Universities Commission (NUC) mandatory 75% minimum attendance rule for semester examination qualification. However, over 90% of tertiary classrooms still rely on vulnerable paper sign-in sheets. This legacy approach fosters widespread proxy attendance ("buddy punching"), consumes hundreds of administrative hours reconciling student eligibility, generates irrecoverable paper waste, and deprives university management of real-time instructional oversight.

ClassMark bridges this gap by translating academic pedagogical research into a production-grade, commercially viable SaaS platform. Engineered specifically for African university infrastructure, ClassMark operates on a low-bandwidth, multi-tenant architecture. Lecturers generate dynamic cryptographic QR codes and projected 4-digit session codes during lectures. Students verify their presence via personal smartphones. To prevent proxy attendance, ClassMark deploys a proprietary 4-layer security model: hardware device-fingerprinting (preventing a single phone from marking for absent peers), private student security PINs/email OTPs, authoritative server-side timestamps, and database-level unique constraints.

ClassMark features universal ingestion of raw university rosters (Excel, CSV, Word, and PDF) with zero manual data scrubbing, alongside instant generation of tamper-resistant examination clearance certificates and NUC audit workbooks. With a primary beachhead at the University of Lagos and a serviceable market of over 270 tertiary institutions in Nigeria, ClassMark represents a high-yield institutional spin-off ready for patenting, commercial licensing, and nationwide deployment.

---

## 3. Problem Statement & Market Pain Point

### The Core Challenge in Nigerian Tertiary Education:
1. **Pervasive Proxy Attendance ("Buddy Punching"):** Paper attendance sheets passed around crowded lecture auditoriums (often seating 300 to 1,500 students) suffer from widespread malpractice. Students routinely sign for absent friends, invalidating attendance data.
2. **Administrative Bottlenecks & NUC 75% Rule Compliance:** The National Universities Commission mandates that students achieve at least 75% lecture attendance to be eligible for semester examinations. Manually tallying attendance across 15 weeks for thousands of students takes examination officers days, leading to frequent disputes, forged signatures, and compromised examination halls.
3. **Severe Resource Waste:** University faculties spend millions of Naira per academic session printing paper attendance sheets that are lost, damaged, or discarded at semester end.
4. **Lack of Institutional Visibility for Management:** Deans, Heads of Department (HODs), and Vice-Chancellors lack automated, real-time metrics on lecture delivery, syllabus coverage, and student disengagement trends until post-examination failure rates surface.

---

## 4. The Innovation & Proposed Solution

ClassMark replaces paper attendance with an intelligent, cloud-hosted academic compliance infrastructure:

1. **Anti-Proxy Multi-Layer Verification:**
   - **Hardware Device Lock:** Unlike naive IP-blocking (which fails on campus Wi-Fi networks where hundreds share one external IP), ClassMark captures an isolated hardware device identifier (`deviceId`). If Student A marks attendance on their phone, that phone is immediately locked for that lecture session; typing an absent friend's matric number on the same device triggers an immediate **HTTP 403 Proxy Block**.
   - **Dynamic In-Class Projected PIN:** A prominent 4-digit code rotates on the lecture hall projector, ensuring only students physically in the room can validate their session.
   - **Student Security PIN / Institutional Email OTP:** Enforces personal ownership of the matriculation record.
2. **Universal Roster Ingestion Engine:**
   - Supports messy real-world academic rosters: Excel (`.xlsx`, `.xls`), CSV, Word documents (`.docx`), and PDF class lists.
   - Preserves leading zeros in matriculation numbers (e.g., `090404011`), auto-extracts names, and binds course enrolments in one click.
3. **Automated Examination Clearance & Official Reporting:**
   - One-click export of formula-neutralized Excel workbooks and audit-ready PDF reports with institutional headers, attendance percentages, and clear "Eligible / Deficient" flags matching NUC benchmarks.
4. **Resilient Local Infrastructure Adaptation:**
   - Optimized for mobile data thriftiness: ultra-compact bundle size, sub-second latency, and graceful offline fallback handling intermittent cellular connectivity across Nigerian campuses.

---

## 5. Intellectual Property (IP) & Technological Novelty

- **Novel Anti-Proxy Heuristic:** Proprietary combination of client device-fingerprinting, dynamic session tokens, and relational constraint guards that resolve the university "shared-NAT / campus Wi-Fi" false-positive problem without requiring expensive biometric hardware.
- **Formula Neutralization Engine:** Security wrapper protecting academic spreadsheet exports from Excel formula injection attacks (CSV/XLSX injection) during export.
- **Relational Multi-Tenant Data Isolation:** Strict database-level lecturer boundary isolation guaranteeing that faculty members operate in hermetically sealed tenancies while institutional administrators retain aggregated oversight.
- **IP Protection Strategy:**
   - Copyright registration for software source code with the Nigerian Copyright Commission (NCC).
   - Patent filing on the *"Hardware Fingerprint Collision Detection Algorithm for Shared Educational Networks"*.
   - Trademark registration for *ClassMark* and associated brand identity.

---

## 6. Commercialization Model & Market Opportunity

### Target Market
- **Total Addressable Market (TAM):** Over 270 recognized universities, 150 polytechnics, and 120 colleges of education across Nigeria, with ~3.5 million enrolled tertiary students.
- **Serviceable Addressable Market (SAM):** Federal and state universities in South-West Nigeria (starting with UNILAG, LASU, OAU, UI, FUTA).
- **Serviceable Obtainable Market (SOM):** University of Lagos faculties (Engineering, Sciences, Social Sciences, Business Administration) representing ~45,000 students and 1,500 academic staff.

### Revenue Streams & Monetization Framework
1. **Institutional Enterprise B2B SaaS (Direct University Licensing):**
   - Annual per-student licensing fee (e.g., ₦500 – ₦1,200 per student per session), subsidized by the university's ICT / technology levy.
   - Delivers dedicated faculty portals, Single Sign-On (SSO) with the university portal, direct student records integration, and NUC accreditation audit dashboards.
2. **Departmental & Faculty Tier:**
   - Per-department semester subscription for specialized postgraduate and executive education programmes.
3. **Freemium Individual Lecturer Tier:**
   - Free tier for individual academic staff (up to 2 courses and 100 students) to seed viral adoption from the bottom up, driving institutional demand.

---

## 7. Societal, Educational & Economic Impact

- **Institutional Integrity & Accreditation:** Provides verifiable, tamper-evident audit trails for NUC institutional and program accreditation visits, ending the practice of fabricated attendance sheets.
- **Reduction in Examination Malpractice:** Prevents ineligible, under-attended students from infiltrating examination halls, significantly reducing overall exam failure and friction.
- **Environmental Sustainability (Zero-Paper University):** Saves an estimated 250,000+ sheets of paper per academic session at an institution the size of UNILAG, reducing the institution’s carbon footprint and printing budget.
- **Job Creation & Digital Talent Development:** Creates commercial spinoff employment in software engineering, university account management, technical support, and data analytics.

---

## 8. S-MIC Acceleration Milestones & Support Requirements

Through the UNILAG Shelf-to-Market Innovation Challenge (S-MIC), we seek:
1. **Institutional Validation & Pilot Approval:** Official mandate to run a structured, live pilot with UNILAG’s Centre for Information Technology and Systems (CITS) and 2–3 selected faculties.
2. **Intellectual Property & Technology Transfer Advisory:** Guidance from the UNILAG Innovation and Technology Transfer Office (ITTO) on patent drafting, software copyrighting, and spin-off enterprise structuring.
3. **Enterprise Partnership & Mentorship:** Mentorship on public-sector B2B sales pipelines, educational procurement compliance, and investor readiness.
4. **Seed Commercialization Grant:** To fund cloud scaling (multi-region database replication), high-volume transactional email/SMS gateways, and student onboarding campaigns.
