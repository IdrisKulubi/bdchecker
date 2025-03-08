# 🚀 AI-Powered Opportunity Analysis System

## 1. Overview

**Goal:** Transform the current **manual “Go/No Go”** process into an **AI-driven** system that evaluates business opportunities quickly and consistently.

**Context:**  
- Employees (Workers) source new opportunities and share them with Managers.  
- Managers manually analyze each opportunity using a set of criteria (Lead Time Check, Project Insight, etc.).  
- This project automates that evaluation, saving time and ensuring consistent decisions.

**Tech Stack Highlights:**  
- **Next.js 15** for the frontend & backend routes.  
- **Shadcn UI** for a polished, consistent user interface.  
- **Neon DB** + **Drizzle ORM** for data persistence.  
- **AI Integration** (e.g., DEEPSEEK R1) to automatically score opportunities.

---

## 2. Objectives

1. **Reduce Manual Work**  
   Automate the opportunity scoring process, allowing managers to focus on strategic decisions rather than repetitive evaluations.

2. **Enhance Consistency**  
   Standardize “Go/No Go” decisions through a transparent scoring mechanism.

3. **Improve Efficiency**  
   Speed up response times to new opportunities, enabling faster go-to-market or partnership decisions.

4. **Scalable & Maintainable**  
   Build a system that can grow with the organization, using modern frameworks and best practices.

---

## 3. Scope

### 3.1 In-Scope
- **AI-Powered Analysis**: Automatic scoring based on textual data (e.g., project description, requirements).  
- **Scoring Criteria**:  
  - Lead Time Check  
  - Project Insight  
  - Client Relationship  
  - Expertise Alignment  
  - Commercial Viability  
  - Strategic Value  
  - Resources  
  - (Optional) Other internal criteria
- **User Roles**:  
  - **Worker**: Submits opportunities  
  - **Manager**: Reviews AI scores, can override decisions  
  - **Admin**: Configures system settings, user roles, scoring weights
- **Reporting**: Basic dashboards showing current opportunities, final decisions, and analytics over time.

### 3.2 Out-of-Scope
- Complex CRM/ERP integrations (future phase).  
- Payment or billing modules.  
- Detailed project management (e.g., task assignments, Gantt charts).

---

## 4. Technical Stack

| **Layer**     | **Technology**                | **Notes**                               |
|---------------|-------------------------------|-----------------------------------------|
| **Frontend**  | Next.js 15 + Shadcn UI       | Modern, component-based, responsive UI |
| **Backend**   | Next.js API Routes (Node.js) | Server-side logic & AI integration     |
| **Database**  | Neon DB + Drizzle ORM        | Scalable, easy migrations & queries    |
| **AI**        | OpenAI API (or custom NLP)   | Automatic text scoring & analysis      |

---

## 5. Architecture Diagram

┌───────────────┐ ┌─────────────────────┐ │ Frontend │ <----> │ Next.js API │ │ (Next.js + UI) │ │ (Server Logic) │ └───────────────┘ └─────────┬───────────┘ │ (Drizzle ORM) │ v ┌──────────────┐ │ Neon DB │ └──────────────┘ ^ │ (API) │ v ┌──────────────┐ │ AI Model │ └──────────────┘ 


---

## 6. Use Cases

1. **Worker Submits an Opportunity**  
   - **Description**: Worker fills out a form with details like their name   project name, requirements, timeline, etc.   
   - **System Response**:  
     1. Stores data in Neon DB.  
     2. Sends text to AI for scoring.  
     3. Returns a preliminary “Go/No Go” recommendation.

2. **Manager Reviews & Overrides**  
   - **Description**: Manager sees AI-generated scores, can confirm or override.  
   - **System Response**:  
     1. Displays final recommended decision.  
     2. Allows manager to provide comments and override if necessary.  
     3. Saves final decision in DB.

3. **Admin Adjusts Scoring Criteria**  
   - **Description**: Admin modifies weight for “Expertise Alignment” or changes threshold for “Go/No Go.”  
   - **System Response**:  
     1. Updates internal scoring logic.  
     2. Persists new settings for future evaluations.

---

## 7. Functional Requirements

1. **Opportunity Intake**  
   - **FR-1**: System must allow users to submit new opportunities with required fields ( the users name of who submited the opportunity,title, description, timeline).  
   - **FR-2**: Must validate mandatory fields (e.g., “title” cannot be empty).

2. **AI Scoring**  
   - **FR-3**: On submission, the system calls an AI service to generate scores (1–4 or 1–5) for each criterion.  
   - **FR-4**: Aggregate the criterion scores into an overall recommendation (“Go”/“No Go”).

3. **Manager Review**  
   - **FR-5**: Managers can view AI scores and final recommendation in a dashboard.  
   - **FR-6**: Managers can override AI decisions and provide rationale.

4. **Reporting & Dashboards**  
   - **FR-7**: Provide a list of all opportunities with statuses (Open, In Review, Go, No Go).  
   - **FR-8**: Offer basic analytics (e.g., number of “Go” vs. “No Go” per month).

5. **User Management**  
   - **FR-9**: All the other users will not have to login ,, they will just add their names when submitting the opportunity ,, there will be a button there named manager  and on click the users has to enter a passcode that only the manager will have.  so on that correct passcode  the user will aaccess the managers side to do the manager staff. mke it just good UI/UX  for the users 
   - **FR-10**: Support role-based access (Worker, Manager, Admin).

6. **Notifications**  
   - **FR-11**: a generall board for everyone to see all the GO OR NO GO  opportunities  that the manager has approved . 

---

## 8. Non-Functional Requirements

1. **Performance**  
   - System should handle concurrent submissions with minimal latency.  
   - AI calls should return results within ~5 seconds.

2. **Security**  
   - Use secure connections (HTTPS).  
   - Implement JWT or session-based auth.  
   - Sanitize user inputs to prevent XSS/SQL injection.

3. **Scalability**  
   - Neon DB can scale to handle increased data volume.  
   - Architecture supports horizontal scaling of Next.js instances if needed.

4. **Reliability**  
   - Maintain an audit log of overrides.  
   - Automatic backups of the Neon DB.

5. **Maintainability**  
   - Code should be modular and well-documented.  
   - Use Drizzle ORM migrations for schema changes.

6. **Usability**  
   - Responsive UI with Shadcn components.  
   - Clear navigation and instructions for non-technical users.

---

## 9. Data Model (Draft)

**Entities**  
1. **User**  
   - `id` (UUID), `name`, `email`, `role`, timestamps  
2. **Opportunity**  
   - `id` (UUID), `title`, `description`, `status`, timestamps  
3. **OpportunityScore**  
   - `id` (UUID), `opportunity_id`, `criterion`, `score`, `ai_decision`, `manager_decision`, timestamps  

**Relationships**  
- `Opportunity` 1—∞ `OpportunityScore`  
- `User` can be associated with `Opportunity` (creator, or manager assigned).

---

## 10. AI Integration

- **Process**:  
  1. **Extract** relevant text from submission.  
  2. **Send** to AI (OpenAI or custom model).  
  3. **Receive** criterion-based scores + short explanations.  
  4. **Aggregate** scores into final recommendation.  
- **Fallback**: If AI is unreachable, allow manual scoring.

---

## 11. Roles & Permissions

- **Admin**  
  - Manage user roles, scoring weights, and system-wide settings.  
- **Manager**  
  - View/override AI decisions.  
  - Finalize “Go/No Go.”  
- **Worker**  
  - Submit opportunities.  
  - View own submissions and AI results.

---

## 12. Implementation Roadmap

1. **Phase 1: Core Setup**  
   - Implement user auth (Next.js + Neon DB).  
   - Basic CRUD for opportunities.  
   - Shadcn UI integration.

2. **Phase 2: AI Scoring**  
   - Connect to AI API.  
   - Create logic to parse text and generate criterion scores.  
   - Display scores in Manager Dashboard.

3. **Phase 3: Manager Review & Override**  
   - Build override functionality with comments.  
   - Store override data in DB.

4. **Phase 4: Reporting & Analytics**  
   - Implement dashboards for “Go” vs. “No Go” stats.  
   - Export or print reports.

5. **Phase 5: Refinement & Hardening**  
   - Add robust testing (unit, integration).  
   - CI/CD pipeline setup.  
   - Performance tuning & final security checks.

---

## 13. Success Indicators

- **Time Saved**: Managers spend less time on repetitive evaluations.  
- **Decision Quality**: Consistency in “Go/No Go” outcomes across similar opportunities.  
- **User Adoption**: Positive feedback from Workers and Managers on ease of use.  
- **System Reliability**: Minimal downtime and quick AI responses.

---

## 14. Final Notes

By leveraging **Next.js 15**, **Shadcn UI**, **Neon DB**, and **Drizzle ORM**, this system will provide a **modern, efficient, and AI-driven** approach to opportunity analysis. It empowers teams to focus on **strategy** rather than **manual** scoring, ensuring **faster** and **more consistent** decisions.

**Ready to revolutionize your “Go/No Go” process? Let’s build it!**  
