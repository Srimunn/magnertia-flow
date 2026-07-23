/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient, Db, ObjectId } from "mongodb";

export { ObjectId };
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const MOCK_DB_PATH = path.resolve("src/lib/mock_gl_db.json");

let client: MongoClient | null = null;
let db: Db | null = null;

let mockDbData: {
  accounts: any[];
  journals: any[];
  settings: any[];
  widget_preferences: any[];
  ideas: any[];
  idea_categories: any[];
  idea_notifications: any[];
  feasibility_projects: any[];
  opportunities: any[];
  design_thinking: any[];
  problem_validation_projects: any[];
  problem_validation: any[];
  innovation_portfolios: any[];
  technology_scouting: any[];
  research_management: any[];
  feasibility_studies: any[];
  proof_of_concept: any[];
  poc_projects: any[];
  prototype_development: any[];
  prototype_projects: any[];
  engineering_validation: any[];
  experiment_projects: any[];
  patents: any[];
  ip_development: any[];
  patent_portfolio: any[];
  licensing_opportunities: any[];
} = {
  accounts: [],
  journals: [],
  settings: [],
  widget_preferences: [],
  ideas: [],
  idea_categories: [],
  idea_notifications: [],
  feasibility_projects: [],
  opportunities: [],
  design_thinking: [],
  problem_validation_projects: [],
  problem_validation: [],
  innovation_portfolios: [],
  technology_scouting: [],
  research_management: [],
  feasibility_studies: [],
  proof_of_concept: [],
  poc_projects: [],
  prototype_development: [],
  prototype_projects: [],
  engineering_validation: [],
  experiment_projects: [],
  patents: [],
  ip_development: [],
  patent_portfolio: [],
  licensing_opportunities: [],
};

let mockDbLoaded = false;

function loadMockDb() {
  if (mockDbLoaded) return;
  try {
    const dir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(MOCK_DB_PATH)) {
      const raw = fs.readFileSync(MOCK_DB_PATH, "utf-8");
      mockDbData = JSON.parse(raw);
    } else {
      saveMockDb();
    }
  } catch (err) {
    console.error("Failed to load mock gl database file, using in-memory only:", err);
  }
  mockDbLoaded = true;
}

function saveMockDb() {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(mockDbData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save mock gl database file:", err);
  }
}

type MockCollectionName =
  | "accounts"
  | "journals"
  | "settings"
  | "widget_preferences"
  | "ideas"
  | "idea_categories"
  | "idea_notifications"
  | "feasibility_projects"
  | "opportunities"
  | "design_thinking"
  | "problem_validation_projects"
  | "problem_validation"
  | "innovation_portfolios"
  | "technology_scouting"
  | "research_management"
  | "feasibility_studies"
  | "proof_of_concept"
  | "poc_projects"
  | "prototype_development"
  | "prototype_projects"
  | "engineering_validation"
  | "experiment_projects"
  | "patents"
  | "ip_development"
  | "patent_portfolio"
  | "licensing_opportunities";

class MockCollection {
  name: MockCollectionName;

  constructor(name: MockCollectionName) {
    this.name = name;
  }

  get data() {
    loadMockDb();
    return mockDbData[this.name] || [];
  }

  set data(val: any[]) {
    loadMockDb();
    mockDbData[this.name] = val;
  }

  async countDocuments(): Promise<number> {
    return this.data.length;
  }

  async insertMany(docs: any[]): Promise<{ insertedCount: number }> {
    const docsWithId = docs.map((d) => {
      const copy = { ...d };
      if (!copy._id) {
        copy._id = new ObjectId().toString();
      } else if (copy._id instanceof ObjectId) {
        copy._id = copy._id.toString();
      }
      return copy;
    });
    this.data = [...this.data, ...docsWithId];
    saveMockDb();
    return { insertedCount: docs.length };
  }

  find(query: any = {}): any {
    let filtered = [...this.data];

    if (query && Object.keys(query).length > 0) {
      filtered = filtered.filter((doc) => {
        for (const k in query) {
          if (k === "_id") {
            const queryId =
              query._id instanceof ObjectId ? query._id.toString() : String(query._id);
            const docId = doc._id instanceof ObjectId ? doc._id.toString() : String(doc._id);
            if (docId !== queryId) return false;
          } else if (query[k] && typeof query[k] === "object" && "$in" in query[k]) {
            const allowed = query[k].$in;
            if (!allowed.includes(doc[k])) return false;
          } else {
            if (doc[k] !== query[k]) return false;
          }
        }
        return true;
      });
    }

    const cursor = {
      sortConfig: null as any,
      sort(sortObj: any) {
        this.sortConfig = sortObj;
        return this;
      },
      toArray: async () => {
        const result = [...filtered];
        if (cursor.sortConfig) {
          const keys = Object.keys(cursor.sortConfig);
          if (keys.length > 0) {
            const key = keys[0];
            const direction = cursor.sortConfig[key];
            result.sort((a, b) => {
              const valA = a[key];
              const valB = b[key];
              if (valA < valB) return direction === -1 ? 1 : -1;
              if (valA > valB) return direction === -1 ? -1 : 1;
              return 0;
            });
          }
        }
        return result.map((d) => ({
          ...d,
          _id: d._id && ObjectId.isValid(String(d._id)) ? new ObjectId(d._id) : d._id,
        }));
      },
    };
    return cursor;
  }

  async findOne(query: any): Promise<any | null> {
    const cursor = await this.find(query);
    const results = await cursor.toArray();
    return results[0] || null;
  }

  async insertOne(doc: any): Promise<{ insertedId: ObjectId }> {
    const copy = { ...doc };
    let idStr: string;
    if (!copy._id) {
      idStr = new ObjectId().toString();
      copy._id = idStr;
    } else {
      idStr = copy._id instanceof ObjectId ? copy._id.toString() : String(copy._id);
      copy._id = idStr;
    }
    this.data = [...this.data, copy];
    saveMockDb();
    return { insertedId: new ObjectId(idStr) };
  }

  async updateOne(
    query: any,
    update: any,
    options: any = {},
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    loadMockDb();
    let index = -1;

    if (query && Object.keys(query).length > 0) {
      index = this.data.findIndex((doc) => {
        for (const k in query) {
          if (k === "_id") {
            const queryId =
              query._id instanceof ObjectId ? query._id.toString() : String(query._id);
            const docId = doc._id instanceof ObjectId ? doc._id.toString() : String(doc._id);
            if (docId !== queryId) return false;
          } else {
            if (doc[k] !== query[k]) return false;
          }
        }
        return true;
      });
    }

    if (index === -1) {
      if (options.upsert) {
        const newDoc = { ...query };
        if (!newDoc._id) {
          newDoc._id = new ObjectId().toString();
        } else if (newDoc._id instanceof ObjectId) {
          newDoc._id = newDoc._id.toString();
        }
        if (update.$set) {
          Object.assign(newDoc, update.$set);
        }
        this.data = [...this.data, newDoc];
        saveMockDb();
        return { matchedCount: 0, modifiedCount: 1 };
      } else {
        return { matchedCount: 0, modifiedCount: 0 };
      }
    }

    const updatedDoc = { ...this.data[index] };
    if (update.$set) {
      Object.assign(updatedDoc, update.$set);
    }
    const newData = [...this.data];
    newData[index] = updatedDoc;
    this.data = newData;
    saveMockDb();
    return { matchedCount: 1, modifiedCount: 1 };
  }
}

function checkUseMockDb(): boolean {
  const uri = process.env.MONGODB_URI;
  return !uri || uri.includes("<db_password>");
}

let mockAccountsCollection: MockCollection | null = null;
let mockJournalsCollection: MockCollection | null = null;
let mockSettingsCollection: MockCollection | null = null;
let mockWidgetPreferencesCollection: MockCollection | null = null;
let mockIdeasCollection: MockCollection | null = null;
let mockIdeaCategoriesCollection: MockCollection | null = null;
let mockIdeaNotificationsCollection: MockCollection | null = null;
let mockFeasibilityProjectsCollection: MockCollection | null = null;
let mockOpportunitiesCollection: MockCollection | null = null;
let mockDesignThinkingCollection: MockCollection | null = null;
let mockProblemValidationCollection: MockCollection | null = null;
let mockProblemValidationFullCollection: MockCollection | null = null;
let mockInnovationPortfoliosCollection: MockCollection | null = null;
let mockTechnologyScoutingCollection: MockCollection | null = null;
let mockResearchManagementCollection: MockCollection | null = null;
let mockFeasibilityStudiesCollection: MockCollection | null = null;
let mockProofOfConceptCollection: MockCollection | null = null;
let mockPocProjectsCollection: MockCollection | null = null;
let mockPrototypeDevelopmentCollection: MockCollection | null = null;
let mockPrototypeProjectsCollection: MockCollection | null = null;
let mockEngineeringValidationCollection: MockCollection | null = null;
let mockExperimentProjectsCollection: MockCollection | null = null;
let mockPatentsCollection: MockCollection | null = null;
let mockIpDevelopmentCollection: MockCollection | null = null;
let mockPatentPortfolioCollection: MockCollection | null = null;
let mockLicensingOpportunitiesCollection: MockCollection | null = null;

function initMockCollections() {
  mockAccountsCollection = new MockCollection("accounts");
  mockJournalsCollection = new MockCollection("journals");
  mockSettingsCollection = new MockCollection("settings");
  mockWidgetPreferencesCollection = new MockCollection("widget_preferences");
  mockIdeasCollection = new MockCollection("ideas");
  mockIdeaCategoriesCollection = new MockCollection("idea_categories");
  mockIdeaNotificationsCollection = new MockCollection("idea_notifications");
  mockFeasibilityProjectsCollection = new MockCollection("feasibility_projects");
  mockOpportunitiesCollection = new MockCollection("opportunities");
  mockDesignThinkingCollection = new MockCollection("design_thinking");
  mockProblemValidationCollection = new MockCollection("problem_validation_projects");
  mockProblemValidationFullCollection = new MockCollection("problem_validation");
  mockInnovationPortfoliosCollection = new MockCollection("innovation_portfolios");
  mockTechnologyScoutingCollection = new MockCollection("technology_scouting");
  mockResearchManagementCollection = new MockCollection("research_management");
  mockFeasibilityStudiesCollection = new MockCollection("feasibility_studies");
  mockProofOfConceptCollection = new MockCollection("proof_of_concept");
  mockPocProjectsCollection = new MockCollection("poc_projects");
  mockPrototypeDevelopmentCollection = new MockCollection("prototype_development");
  mockPrototypeProjectsCollection = new MockCollection("prototype_projects");
  mockEngineeringValidationCollection = new MockCollection("engineering_validation");
  mockExperimentProjectsCollection = new MockCollection("experiment_projects");
  mockPatentsCollection = new MockCollection("patents");
  mockIpDevelopmentCollection = new MockCollection("ip_development");
  mockPatentPortfolioCollection = new MockCollection("patent_portfolio");
  mockLicensingOpportunitiesCollection = new MockCollection("licensing_opportunities");
}

let connectionFailed = false;
let connectionPromise: Promise<Db> | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  if (connectionFailed) {
    throw new Error("MongoDB connection previously failed. Using local fallback.");
  }
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "MONGODB_URI environment variable is not defined in your .env file. Please add it to start using General Ledger.",
      );
    }

    if (uri.includes("<db_password>")) {
      throw new Error(
        "Please configure MONGODB_URI in your .env file with your actual MongoDB password instead of the '<db_password>' placeholder.",
      );
    }

    const candidate = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    try {
      await candidate.connect();
      client = candidate;
      db = client.db("magnertia_flow");
      console.log("Connected to MongoDB successfully!");
      return db;
    } catch (err: any) {
      console.warn(
        "Failed to connect to MongoDB. Falling back to local/in-memory database.",
        err.message,
      );
      connectionFailed = true;
      await candidate.close().catch(() => {});
      connectionPromise = null;
      throw err;
    }
  })();

  return connectionPromise;
}

export async function getAccountsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockAccountsCollection) initMockCollections();
    return mockAccountsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("accounts");
  } catch (err) {
    if (!mockAccountsCollection) initMockCollections();
    return mockAccountsCollection as any;
  }
}

export async function getJournalsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockJournalsCollection) initMockCollections();
    return mockJournalsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("journals");
  } catch (err) {
    if (!mockJournalsCollection) initMockCollections();
    return mockJournalsCollection as any;
  }
}

export async function getSettingsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockSettingsCollection) initMockCollections();
    return mockSettingsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("settings");
  } catch (err) {
    if (!mockSettingsCollection) initMockCollections();
    return mockSettingsCollection as any;
  }
}

/** Per-user widget/dashboard layout preferences (Widget Management System). */
export async function getWidgetPreferencesCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockWidgetPreferencesCollection) initMockCollections();
    return mockWidgetPreferencesCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("widget_preferences");
  } catch (err) {
    if (!mockWidgetPreferencesCollection) initMockCollections();
    return mockWidgetPreferencesCollection as any;
  }
}

/* ===========================================================================
   Idea Management (Development → Research & Innovation Development)
   ---------------------------------------------------------------------------
   Each idea is one document in `ideas` that embeds every logical "table" from
   the spec (master, classification, problem, solution, scores, IP, financials,
   risks, market, workflow, approvals, history, attachments, team) as nested
   fields/arrays. `idea_categories` is a seeded lookup; `idea_notifications` is
   the in-app notification center; `feasibility_projects` holds the records
   auto-created when an idea is approved.
   =========================================================================== */
export async function getIdeasCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockIdeasCollection) initMockCollections();
    return mockIdeasCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("ideas");
  } catch (err) {
    if (!mockIdeasCollection) initMockCollections();
    return mockIdeasCollection as any;
  }
}

export async function getIdeaCategoriesCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockIdeaCategoriesCollection) initMockCollections();
    return mockIdeaCategoriesCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("idea_categories");
  } catch (err) {
    if (!mockIdeaCategoriesCollection) initMockCollections();
    return mockIdeaCategoriesCollection as any;
  }
}

export async function getIdeaNotificationsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockIdeaNotificationsCollection) initMockCollections();
    return mockIdeaNotificationsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("idea_notifications");
  } catch (err) {
    if (!mockIdeaNotificationsCollection) initMockCollections();
    return mockIdeaNotificationsCollection as any;
  }
}

export async function getFeasibilityProjectsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockFeasibilityProjectsCollection) initMockCollections();
    return mockFeasibilityProjectsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("feasibility_projects");
  } catch (err) {
    if (!mockFeasibilityProjectsCollection) initMockCollections();
    return mockFeasibilityProjectsCollection as any;
  }
}

/** Design Thinking — one document per project, embedding the 5 stages,
 *  assessment, AI assistant output and the audit trail. */
export async function getDesignThinkingCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockDesignThinkingCollection) initMockCollections();
    return mockDesignThinkingCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("design_thinking");
  } catch (err) {
    if (!mockDesignThinkingCollection) initMockCollections();
    return mockDesignThinkingCollection as any;
  }
}

/** Problem Validation projects auto-created when a Design Thinking record is approved. */
export async function getProblemValidationCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockProblemValidationCollection) initMockCollections();
    return mockProblemValidationCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("problem_validation_projects");
  } catch (err) {
    if (!mockProblemValidationCollection) initMockCollections();
    return mockProblemValidationCollection as any;
  }
}

/** Innovation Portfolio — one document per portfolio. Does not embed project
 *  data; it stores rollup snapshots plus the portfolio's own budget/resource/
 *  risk/review fields and audit trail. */
export async function getInnovationPortfoliosCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockInnovationPortfoliosCollection) initMockCollections();
    return mockInnovationPortfoliosCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("innovation_portfolios");
  } catch (err) {
    if (!mockInnovationPortfoliosCollection) initMockCollections();
    return mockInnovationPortfoliosCollection as any;
  }
}

/** Technology Scouting — one document per scouting record, embedding the
 *  4 assessment stages, AI technology analysis, decision summary, reviewers
 *  and the audit trail. */
export async function getTechnologyScoutingCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockTechnologyScoutingCollection) initMockCollections();
    return mockTechnologyScoutingCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("technology_scouting");
  } catch (err) {
    if (!mockTechnologyScoutingCollection) initMockCollections();
    return mockTechnologyScoutingCollection as any;
  }
}

/** Experiment Management — one document per experiment, embedding the 5
 *  stages, 12 section shapes, AI experiment assessment, experiment summary,
 *  reviewers and the audit trail. */
export async function getExperimentProjectsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockExperimentProjectsCollection) initMockCollections();
    return mockExperimentProjectsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("experiment_projects");
  } catch (err) {
    if (!mockExperimentProjectsCollection) initMockCollections();
    return mockExperimentProjectsCollection as any;
  }
}

/** Patent Management — one document per patent, embedding the 5 lifecycle
 *  stages, 12 section shapes, AI analytics, patent summary, review table and
 *  the audit trail. Created from an approved IP record. */
export async function getPatentsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockPatentsCollection) initMockCollections();
    return mockPatentsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("patents");
  } catch (err) {
    if (!mockPatentsCollection) initMockCollections();
    return mockPatentsCollection as any;
  }
}

/** IP Development — approved IP records that seed patent creation. */
export async function getIpDevelopmentCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockIpDevelopmentCollection) initMockCollections();
    return mockIpDevelopmentCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("ip_development");
  } catch (err) {
    if (!mockIpDevelopmentCollection) initMockCollections();
    return mockIpDevelopmentCollection as any;
  }
}

/** Patent Portfolio — one entry auto-created when a patent is granted. */
export async function getPatentPortfolioCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockPatentPortfolioCollection) initMockCollections();
    return mockPatentPortfolioCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("patent_portfolio");
  } catch (err) {
    if (!mockPatentPortfolioCollection) initMockCollections();
    return mockPatentPortfolioCollection as any;
  }
}

/** Licensing Opportunities — one record auto-created at commercialization. */
export async function getLicensingOpportunitiesCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockLicensingOpportunitiesCollection) initMockCollections();
    return mockLicensingOpportunitiesCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("licensing_opportunities");
  } catch (err) {
    if (!mockLicensingOpportunitiesCollection) initMockCollections();
    return mockLicensingOpportunitiesCollection as any;
  }
}

/** Prototype Development — one document per full prototype project, embedding
 *  the 4 engineering stages, section shapes, AI engineering assessment,
 *  prototype summary, reviewers and the audit trail. Distinct from
 *  `prototype_development` (the lightweight breadcrumbs auto-created on PoC
 *  approval). */
export async function getPrototypeProjectsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockPrototypeProjectsCollection) initMockCollections();
    return mockPrototypeProjectsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("prototype_projects");
  } catch (err) {
    if (!mockPrototypeProjectsCollection) initMockCollections();
    return mockPrototypeProjectsCollection as any;
  }
}

/** Engineering Validation — one document per validation project auto-created
 *  when a prototype is approved. */
export async function getEngineeringValidationCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockEngineeringValidationCollection) initMockCollections();
    return mockEngineeringValidationCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("engineering_validation");
  } catch (err) {
    if (!mockEngineeringValidationCollection) initMockCollections();
    return mockEngineeringValidationCollection as any;
  }
}

/** Proof of Concept — one document per full PoC project, embedding the 5
 *  build/test stages, section shapes, AI assessment, PoC summary, reviewers
 *  and the audit trail. Distinct from `proof_of_concept` (the lightweight PoC
 *  breadcrumbs auto-created by Feasibility Study approval). */
export async function getPocProjectsCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockPocProjectsCollection) initMockCollections();
    return mockPocProjectsCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("poc_projects");
  } catch (err) {
    if (!mockPocProjectsCollection) initMockCollections();
    return mockPocProjectsCollection as any;
  }
}

/** Prototype Development — one document per prototype project auto-created
 *  when a PoC is approved. */
export async function getPrototypeDevelopmentCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockPrototypeDevelopmentCollection) initMockCollections();
    return mockPrototypeDevelopmentCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("prototype_development");
  } catch (err) {
    if (!mockPrototypeDevelopmentCollection) initMockCollections();
    return mockPrototypeDevelopmentCollection as any;
  }
}

/** Feasibility Study — one document per full feasibility study, embedding the
 *  5 evaluation stages, 11 section shapes, AI assessment, decision summary,
 *  reviewers and the audit trail. Distinct from `feasibility_projects` (the
 *  lightweight FSP breadcrumbs auto-created by PV / Research approval). */
export async function getFeasibilityStudiesCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockFeasibilityStudiesCollection) initMockCollections();
    return mockFeasibilityStudiesCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("feasibility_studies");
  } catch (err) {
    if (!mockFeasibilityStudiesCollection) initMockCollections();
    return mockFeasibilityStudiesCollection as any;
  }
}

/** Proof of Concept — one document per PoC project auto-created when a
 *  feasibility study is approved. */
export async function getProofOfConceptCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockProofOfConceptCollection) initMockCollections();
    return mockProofOfConceptCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("proof_of_concept");
  } catch (err) {
    if (!mockProofOfConceptCollection) initMockCollections();
    return mockProofOfConceptCollection as any;
  }
}

/** Research Management — one document per research project, embedding the 4
 *  execution stages, milestones, AI research analytics, KPIs, reviewers and
 *  the audit trail. */
export async function getResearchManagementCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockResearchManagementCollection) initMockCollections();
    return mockResearchManagementCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("research_management");
  } catch (err) {
    if (!mockResearchManagementCollection) initMockCollections();
    return mockResearchManagementCollection as any;
  }
}

/** Problem Validation — one document per validation record, embedding the 5
 *  validation stages, AI scores, summary, reviewers and the audit trail. */
export async function getProblemValidationFullCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockProblemValidationFullCollection) initMockCollections();
    return mockProblemValidationFullCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("problem_validation");
  } catch (err) {
    if (!mockProblemValidationFullCollection) initMockCollections();
    return mockProblemValidationFullCollection as any;
  }
}

/** Opportunity Discovery — one document per opportunity, embedding all 10
 *  form sections plus reviews and the audit trail. */
export async function getOpportunitiesCollection() {
  if (checkUseMockDb() || connectionFailed) {
    if (!mockOpportunitiesCollection) initMockCollections();
    return mockOpportunitiesCollection as any;
  }
  try {
    const database = await connectToDatabase();
    return database.collection("opportunities");
  } catch (err) {
    if (!mockOpportunitiesCollection) initMockCollections();
    return mockOpportunitiesCollection as any;
  }
}
