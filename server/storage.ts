import * as schema from "@shared/schema";
import { generateHash, verifyHash } from "./auth";
import { IStorage } from "./storage.interface";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set",
  );
}

console.log("Initializing Supabase with URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage implements IStorage {
  private baseUrl: string;
  private headers: HeadersInit;
  private supabase: any;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    this.baseUrl = `${process.env.SUPABASE_URL}/rest/v1`;
    this.headers = {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    this.supabase = supabase;
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting user:", error.message);
      return undefined;
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select()
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error getting user by username:", error.message);
      return undefined;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error getting user by email:", error.message);
      return undefined;
    }
    return data;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const hashedUser = {
      ...user,
      password: await generateHash(user.password),
    };

    const { data, error } = await this.supabase
      .from("users")
      .insert([hashedUser])
      .select()
      .single();

    if (error) {
      console.error("Error inserting user:", error.message); // Log the error message
      throw error;
    }
    return data;
  }

  async updateUser(
    id: number,
    data: Partial<schema.InsertUser>,
  ): Promise<schema.User | undefined> {
    if (data.password) {
      data.password = await generateHash(data.password);
    }

    const { data: updatedUser, error } = await this.supabase
      .from("users")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error.message);
      return undefined;
    }

    return updatedUser;
  }

  async getUsers(): Promise<schema.User[]> {
    const { data, error } = await this.supabase.from("users").select();
    if (error) {
      console.error("Error getting users:", error.message);
      throw error;
    }
    return data;
  }

  async updateUserlast_login(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("users")
      .update({ last_login: new Date() })
      .eq("id", id);
    if (error) {
      console.error("Error updating user last login:", error.message);
      throw error;
    }
  }

  // Auth operations
  async verifyCredentials(
    username: string,
    password: string,
  ): Promise<schema.User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;

    const passwordValid = await verifyHash(password, user.password);
    return passwordValid ? user : undefined;
  }

  // Folder operations
  async createFolder(folder: schema.InsertFolder): Promise<schema.Folder> {
    const { data, error } = await this.supabase
      .from("folders")
      .insert([folder])
      .select()
      .single();

    if (error) {
      console.error("Error creating folder:", error.message);
      throw error;
    }

    return data;
  }

  async getFolder(id: number): Promise<schema.Folder | undefined> {
    const { data, error } = await this.supabase
      .from("folders")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting folder:", error.message);
      return undefined;
    }

    return data;
  }

  async getFolders(): Promise<schema.Folder[]> {
    const { data, error } = await this.supabase.from("folders").select();

    if (error) {
      console.error("Error getting folders:", error.message);
      throw error;
    }

    return data;
  }

  async updateFolder(
    id: number,
    data: Partial<schema.InsertFolder>,
  ): Promise<schema.Folder | undefined> {
    const { data: updatedFolder, error } = await this.supabase
      .from("folders")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating folder:", error.message);
      return undefined;
    }

    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    const { error } = await this.supabase.from("folders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting folder:", error.message);
      return false;
    }

    return true;
  }

  async getTestCountByFolder(): Promise<
    { folderId: number; testCount: number }[]
  > {
    // This function requires a more complex query that might be better suited for Supabase functions
    console.warn("getTestCountByFolder not yet implemented using supabase");
    return [];
  }

  async createTestCase(
    testCaseWithSteps: schema.TestCaseWithSteps,
  ): Promise<schema.TestCase> {
    const { steps, ...testCase } = testCaseWithSteps;

    const { data: newTestCase, error: testCaseError } = await this.supabase
      .from("test_cases")
      .insert([testCase])
      .select()
      .single();

    if (testCaseError) {
      console.error("Error creating test case:", testCaseError.message);
      throw testCaseError;
    }

    if (steps && steps.length > 0) {
      const stepsWithtest_case_id = steps.map((step) => ({
        ...step,
        test_case_id: newTestCase.id,
      }));

      const { error: stepsError } = await this.supabase
        .from("test_steps")
        .insert(stepsWithtest_case_id);

      if (stepsError) {
        console.error("Error creating test steps:", stepsError.message);
        throw stepsError;
      }
    }

    return newTestCase;
  }

  async getTestCase(id: number): Promise<schema.TestCase | undefined> {
    const { data, error } = await this.supabase
      .from("test_cases")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting test case:", error.message);
      return undefined;
    }

    return data;
  }

  async getTestCaseWithSteps(
    id: number,
  ): Promise<
    { testCase: schema.TestCase; steps: schema.TestStep[] } | undefined
  > {
    const testCase = await this.getTestCase(id);
    if (!testCase) return undefined;

    const steps = await this.getTestSteps(id);
    return { testCase, steps };
  }

  async getTestCases(filters?: {
    status?: string;
    folderId?: number;
  }): Promise<schema.TestCase[]> {
    let query = this.supabase.from("test_cases").select();

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.folderId) {
      query = query.eq("folderId", filters.folderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting test cases:", error.message);
      return [];
    }

    return data;
  }

  async updateTestCase(
    id: number,
    data: Partial<schema.InsertTestCase>,
    steps?: schema.InsertTestStep[],
  ): Promise<schema.TestCase | undefined> {
    const { data: updatedTestCase, error: updateError } = await this.supabase
      .from("test_cases")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating test case:", updateError.message);
      return undefined;
    }

    if (steps) {
      // Delete existing steps
      const { error: deleteError } = await this.supabase
        .from("test_steps")
        .delete()
        .eq("test_case_id", id);

      if (deleteError) {
        console.error("Error deleting test steps:", deleteError.message);
        return undefined;
      }

      // Insert new steps
      const stepsWithtest_case_id = steps.map((step) => ({
        ...step,
        test_case_id: id,
      }));

      const { error: insertError } = await this.supabase
        .from("test_steps")
        .insert(stepsWithtest_case_id);

      if (insertError) {
        console.error("Error inserting test steps:", insertError.message);
        return undefined;
      }
    }

    return updatedTestCase;
  }

  async deleteTestCase(id: number): Promise<boolean> {
    // Delete steps first (foreign key constraint)
    const { error: deleteStepsError } = await this.supabase
      .from("test_steps")
      .delete()
      .eq("test_case_id", id);

    if (deleteStepsError) {
      console.error("Error deleting test steps:", deleteStepsError.message);
      return false;
    }

    // Delete test case
    const { error: deleteTestCaseError } = await this.supabase
      .from("test_cases")
      .delete()
      .eq("id", id);

    if (deleteTestCaseError) {
      console.error("Error deleting test case:", deleteTestCaseError.message);
      return false;
    }

    return true;
  }

  async getTestCasesByFolder(folderId: number): Promise<schema.TestCase[]> {
    const { data, error } = await this.supabase
      .from("test_cases")
      .select()
      .eq("folderId", folderId);

    if (error) {
      console.error("Error getting test cases by folder:", error.message);
      return [];
    }

    return data;
  }

  // Test steps operations
  async getTestSteps(test_case_id: number): Promise<schema.TestStep[]> {
    const { data, error } = await this.supabase
      .from("test_steps")
      .select()
      .eq("test_case_id", test_case_id);

    if (error) {
      console.error("Error getting test steps:", error.message);
      return [];
    }

    return data;
  }

  // Test case version operations
  async createTestVersion(
    version: schema.InsertTestVersion,
  ): Promise<schema.TestVersion> {
    const { data, error } = await this.supabase
      .from("test_versions")
      .insert([version])
      .select()
      .single();

    if (error) {
      console.error("Error creating test version:", error.message);
      throw error;
    }

    return data;
  }

  async getTestVersions(test_case_id: number): Promise<schema.TestVersion[]> {
    const { data, error } = await this.supabase
      .from("test_versions")
      .select()
      .eq("test_case_id", test_case_id);

    if (error) {
      console.error("Error getting test versions:", error.message);
      return [];
    }

    return data;
  }

  async revertToVersion(test_case_id: number, version: number): Promise<boolean> {
    // I'm not entirely sure if this is correct, need to investigate
    const { data: versions, error } = await this.supabase
      .from("test_versions")
      .select()
      .eq("test_case_id", test_case_id);

    if (error) {
      console.error("Error getting test versions:", error.message);
      return false;
    }

    if (versions.length === 0) return false;

    // Update the test case
    const { error: updateError } = await this.supabase
      .from("test_cases")
      .update(versions[version - 1]) // assuming the version number starts from 1
      .eq("id", test_case_id);

    if (updateError) {
      console.error("Error updating test case:", updateError.message);
      return false;
    }

    return true;
  }

  async removeTestCaseFromFolder(
    test_case_id: number,
    folderId: number,
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("test_case_folders")
      .delete()
      .eq("test_case_id", test_case_id)
      .eq("folderId", folderId);

    if (error) {
      console.error("Error removing test case from folder:", error.message);
      return false;
    }

    return true;
  }

  async getTestCaseFolders(test_case_id: number): Promise<schema.Folder[]> {
    const { data, error } = await this.supabase
      .from("test_case_folders")
      .select("folders(*)")
      .eq("test_case_id", test_case_id);

    if (error) {
      console.error("Error getting test case folders:", error.message);
      return [];
    }

    // Extract the folder data from the nested structure
    const folders = data.map((item) => item.folders);
    return folders;
  }

  // Test run operations
  async createTestRun(testRun: schema.InsertTestRun): Promise<schema.TestRun> {
    const { data, error } = await this.supabase
      .from("test_runs")
      .insert([testRun])
      .select()
      .single();

    if (error) {
      console.error("Error creating test run:", error.message);
      throw error;
    }

    return data;
  }

  async getTestRun(id: number): Promise<schema.TestRun | undefined> {
    const { data, error } = await this.supabase
      .from("test_runs")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting test run:", error.message);
      return undefined;
    }

    return data;
  }

  async getTestRuns(): Promise<schema.TestRun[]> {
    const { data, error } = await this.supabase
      .from("test_runs")
      .select()
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error getting test runs:", error.message);
      return [];
    }

    return data;
  }

  async updateTestRun(
    id: number,
    data: Partial<schema.InsertTestRun>,
  ): Promise<schema.TestRun | undefined> {
    const { data: updatedTestRun, error } = await this.supabase
      .from("test_runs")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating test run:", error.message);
      return undefined;
    }

    return updatedTestRun;
  }

  async completeTestRun(id: number): Promise<schema.TestRun | undefined> {
    const now = new Date();

    // Get the test run to calculate duration
    const { data: testRun, error: getRunError } = await this.supabase
      .from("test_runs")
      .select()
      .eq("id", id)
      .single();

    if (getRunError) {
      console.error("Error getting test run:", getRunError.message);
      return undefined;
    }

    if (!testRun) {
      console.warn("Test run not found with id:", id);
      return undefined;
    }

    const startTime = new Date(testRun.started_at).getTime();
    const endTime = now.getTime();
    const durationMs = endTime - startTime;
    const durationSeconds = Math.floor(durationMs / 1000);

    const { data: completedTestRun, error: completeError } = await this.supabase
      .from("test_runs")
      .update({
        status: "completed",
        complete_at: now,
        duration: durationSeconds,
      })
      .eq("id", id)
      .select()
      .single();

    if (completeError) {
      console.error("Error completing test run:", completeError.message);
      return undefined;
    }

    return completedTestRun;
  }

  // Test run results operations
  async createTestRunResult(
    result: schema.InsertTestRunResult,
  ): Promise<schema.TestRunResult> {
    const { data: insertedResult, error } = await this.supabase
      .from("test_run_results")
      .insert([result])
      .select()
      .single();

    if (error) {
      console.error("Error creating test run result:", error.message);
      throw error;
    }

    // Update test case status based on this result
    if (insertedResult) {
      await this.updateTestCaseStatus(result.test_case_id, result.status);
    }

    return insertedResult;
  }

  async getTestRunResults(runId: number): Promise<schema.TestRunResult[]> {
    const { data, error } = await this.supabase
      .from("test_run_results")
      .select()
      .eq("runId", runId)
      .order("executed_at", { ascending: false });

    if (error) {
      console.error("Error getting test run results:", error.message);
      return [];
    }

    return data;
  }

  async getTestStatusCounts(): Promise<{ status: string; count: number }[]> {
    // This logic can potentially be implemented directly in Supabase using SQL views or functions for better performance
    console.warn("getTestStatusCounts not yet implemented using supabase");
    return [];
  }

  // Bug operations
  async createBug(bug: schema.InsertBug): Promise<schema.Bug> {
    const { data, error } = await this.supabase
      .from("bugs")
      .insert([bug])
      .select()
      .single();

    if (error) {
      console.error("Error creating bug:", error.message);
      throw error;
    }

    return data;
  }

  async getBug(id: number): Promise<schema.Bug | undefined> {
    const { data, error } = await this.supabase
      .from("bugs")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting bug:", error.message);
      return undefined;
    }

    return data;
  }

  async getBugs(filters?: {
    status?: string;
    test_case_id?: number;
  }): Promise<schema.Bug[]> {
    let query = this.supabase
      .from("bugs")
      .select()
      .order("reported_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.test_case_id) {
      query = query.eq("test_case_id", filters.test_case_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting bugs:", error.message);
      return [];
    }

    return data;
  }

  async updateBug(
    id: number,
    data: Partial<schema.InsertBug>,
  ): Promise<schema.Bug | undefined> {
    const { data: updatedBug, error } = await this.supabase
      .from("bugs")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating bug:", error.message);
      return undefined;
    }

    return updatedBug;
  }

  // Whiteboard operations
  async createWhiteboard(
    whiteboard: schema.InsertWhiteboard,
  ): Promise<schema.Whiteboard> {
    const { data, error } = await this.supabase
      .from("whiteboards")
      .insert([whiteboard])
      .select()
      .single();

    if (error) {
      console.error("Error creating whiteboard:", error.message);
      throw error;
    }

    return data;
  }

  async getWhiteboard(id: number): Promise<schema.Whiteboard | undefined> {
    const { data, error } = await this.supabase
      .from("whiteboards")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting whiteboard:", error.message);
      return undefined;
    }

    return data;
  }

  async getWhiteboards(): Promise<schema.Whiteboard[]> {
    const { data, error } = await this.supabase
      .from("whiteboards")
      .select()
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error getting whiteboards:", error.message);
      return [];
    }

    return data;
  }

  async updateWhiteboard(
    id: number,
    data: Partial<schema.InsertWhiteboard>,
  ): Promise<schema.Whiteboard | undefined> {
    const { data: updatedWhiteboard, error } = await this.supabase
      .from("whiteboards")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating whiteboard:", error.message);
      return undefined;
    }

    return updatedWhiteboard;
  }

  // AI Test Case operations
  async saveAITestCase(
    aiTestCase: schema.InsertAITestCase,
  ): Promise<schema.AITestCase> {
    const { data, error } = await this.supabase
      .from("ai_test_cases")
      .insert([aiTestCase])
      .select()
      .single();

    if (error) {
      console.error("Error saving AI test case:", error.message);
      throw error;
    }

    return data;
  }

  async markAITestCaseAsImported(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("ai_test_cases")
      .update({ imported: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking AI test case as imported:", error.message);
    }
  }

  async getAITestCases(userId: number): Promise<schema.AITestCase[]> {
    const { data, error } = await this.supabase
      .from("ai_test_cases")
      .select()
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting AI test cases:", error.message);
      return [];
    }

    return data;
  }

  // Activity log operations
  async logActivity(
    log: schema.InsertActivityLog,
  ): Promise<schema.ActivityLog> {
    const { data, error } = await this.supabase
      .from("activity_logs")
      .insert([log])
      .select()
      .single();

    if (error) {
      console.error("Error logging activity:", error.message);
      throw error;
    }
    return data;
  }

  async getRecentActivities(limit: number = 10): Promise<
    (schema.ActivityLog & {
      user: Pick<schema.User, "username" | "full_name">;
    })[]
  > {
    const { data, error } = await this.supabase
      .from("activity_logs")
      .select("*, users(username, full_name)")
      .limit(limit)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error getting recent activities:", error.message);
      return [];
    }

    return data.map((activity) => ({
      ...activity,
      user: {
        username: activity.users?.username || "Unknown",
        full_name: activity.users?.full_name || "Unknown",
      },
    }));
  }

  // Dashboard statistics
  async getTestStatusStats(): Promise<{ status: string; count: number }[]> {
    // This logic can potentially be implemented directly in Supabase using SQL views or functions for better performance
    console.warn("getTestStatusStats not yet implemented using supabase");
    return [];
  }

  async getRecentTestCases(limit: number = 5): Promise<schema.TestCase[]> {
    const { data, error } = await this.supabase
      .from("test_cases")
      .select()
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error getting recent test cases:", error.message);
      return [];
    }

    return data;
  }

  async getTestRunStats(): Promise<{
    totalRuns: number;
    avgDuration: number | null;
    passRate: number | null;
  }> {
    // This logic can potentially be implemented directly in Supabase using SQL views or functions for better performance
    console.warn("getTestRunStats not yet implemented using supabase");
    return {
      totalRuns: 0,
      avgDuration: null,
      passRate: null,
    };
  }

  // Helper function to update test case status
  private async updateTestCaseStatus(
    test_case_id: number,
    status: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("test_cases")
      .update({ status })
      .eq("id", test_case_id);

    if (error) {
      console.error(
        `Error updating test case ${test_case_id} status to ${status}:`,
        error.message,
      );
    }
  }
}

// For in-memory testing
export class MemStorage implements IStorage {
  private users: Map<number, schema.User>;
  private folders: Map<number, schema.Folder>;
  private testCases: Map<number, schema.TestCase>;
  private testSteps: Map<number, schema.TestStep[]>;
  private testVersions: Map<number, schema.TestVersion[]>;
  private testCaseFolders: Map<number, Set<number>>;
  private testRuns: Map<number, schema.TestRun>;
  private testRunResults: Map<number, schema.TestRunResult[]>;
  private bugs: Map<number, schema.Bug>;
  private whiteboards: Map<number, schema.Whiteboard>;
  private aiTestCases: Map<number, schema.AITestCase>;
  private activityLogs: schema.ActivityLog[];

  private userId: number = 1;
  private folderId: number = 1;
  private test_case_id: number = 1;
  private testStepId: number = 1;
  private testVersionId: number = 1;
  private testCaseFolderId: number = 1;
  private testRunId: number = 1;
  private test_run_result_id: number = 1;
  private bugId: number = 1;
  private whiteboardId: number = 1;
  private aitest_case_id: number = 1;
  private activityLogId: number = 1;

  async createTestCase(
    testCaseWithSteps: schema.TestCaseWithSteps,
  ): Promise<schema.TestCase> {
    const { steps, ...testCase } = testCaseWithSteps;
    const id = this.test_case_id++;

    const newTestCase: schema.TestCase = {
      ...testCase,
      id,
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
      last_run: null,
    };

    this.testCases.set(id, newTestCase);

    if (steps?.length) {
      this.testSteps.set(
        id,
        steps.map((step, index) => ({
          ...step,
          id: this.testStepId++,
          test_case_id: id,
          step_number: index + 1,
          expected_result: step.expected_result ?? null,
        })),
      );
    }

    return newTestCase;
  }

  constructor() {
    this.users = new Map();
    this.folders = new Map();
    this.testCases = new Map();
    this.testSteps = new Map();
    this.testVersions = new Map();
    this.testCaseFolders = new Map();
    this.testRuns = new Map();
    this.testRunResults = new Map();
    this.bugs = new Map();
    this.whiteboards = new Map();
    this.aiTestCases = new Map();
    this.activityLogs = [];

    // Create a system owner user
    this.createUser({
      username: "admin",
      email: "admin@example.com",
      password: "password",
      full_name: "System Admin",
      role: "system_owner",
      is_active: true,
    });

    // Create some initial folders
    this.createFolder({
      name: "Regression Tests",
      description: "Tests for regression testing",
      created_by: 1,
    });

    this.createFolder({
      name: "Smoke Tests",
      description: "Quick smoke tests",
      created_by: 1,
    });

    this.createFolder({
      name: "Feature Tests",
      description: "Feature specific tests",
      created_by: 1,
    });

    // Create some initial test cases
    const testCase1 = this.createTestCase({
      title: "User Login Verification",
      description: "Verify that users can login with valid credentials",
      status: "passed",
      priority: "high",
      type: "functional",
      assigned_to: 1,
      created_by: 1,
      expected_result: "User should be logged in successfully",
      steps: [
        {
          description: "Navigate to login page",
          expected_result: "Login page is displayed",
          step_number: 1,
        },
        {
          description: "Enter valid username and password",
          expected_result: "Credentials are accepted",
          step_number: 2,
        },
        {
          description: "Click on Login button",
          expected_result: "User is redirected to dashboard",
          step_number: 3,
        },
      ],
    });

    this.assignTestCaseToFolder(1, 1);

    const testCase2 = this.createTestCase({
      title: "Password Reset Flow",
      description: "Test the complete password reset workflow",
      status: "failed",
      priority: "critical",
      type: "functional",
      assigned_to: 1,
      created_by: 1,
      expected_result:
        "Password reset email should be sent and new password should work",
      steps: [
        {
          description: "Navigate to login page",
          expected_result: "Login page is displayed",
          step_number: 1,
        },
        {
          description: "Click on Forgot Password link",
          expected_result: "Reset page is displayed",
          step_number: 2,
        },
        {
          description: "Enter valid email address",
          expected_result: "Success message is shown",
          step_number: 3,
        },
        {
          description: "Check email and click reset link",
          expected_result: "Reset form is displayed",
          step_number: 4,
        },
        {
          description: "Enter new password and confirm",
          expected_result: "Password is updated",
          step_number: 5,
        },
      ],
    });

    this.assignTestCaseToFolder(2, 1);

    this.createTestCase({
      title: "User Registration Form Validation",
      description: "Validate all form fields during user registration",
      status: "pending",
      priority: "medium",
      type: "functional",
      assigned_to: 1,
      created_by: 1,
      expected_result: "Form should validate all fields correctly",
      steps: [
        {
          description:
            "Navigate to registration page          expected_result: Registration form is displayed",
          step_number: 1,
        },
        {
          description: "Leave required fields empty and submit",
          expected_result: "Validation errors are shown",
          step_number: 2,
        },
        {
          description: "Enter invalid format for email",
          expected_result: "Email validation error is shown",
          step_number: 3,
        },
        {
          description: "Enter short password",
          expected_result: "Password validation error is shown",
          step_number: 4,
        },
        {
          description: "Enter valid details and submit",
          expected_result: "Registration is successful",
          step_number: 5,
        },
      ],
    });

    this.assignTestCaseToFolder(3, 2);
  }

  async getUser(id: number): Promise<schema.User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const id = this.userId++;
    const newUser: schema.User = {
      ...user,
      id,
      last_login: null,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(
    id: number,
    data: Partial<schema.InsertUser>,
  ): Promise<schema.User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<schema.User[]> {
    return Array.from(this.users.values());
  }

  async updateUserlast_login(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.last_login = new Date();
      this.users.set(id, user);
    }
  }

  async verifyCredentials(
    username: string,
    password: string,
  ): Promise<schema.User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  async createFolder(folder: schema.InsertFolder): Promise<schema.Folder> {
    const id = this.folderId++;
    const newFolder: schema.Folder = {
      ...folder,
      id,
      created_at: new Date(),
    };
    this.folders.set(id, newFolder);
    return newFolder;
  }

  async getFolder(id: number): Promise<schema.Folder | undefined> {
    return this.folders.get(id);
  }

  async getFolders(): Promise<schema.Folder[]> {
    return Array.from(this.folders.values());
  }

  async updateFolder(
    id: number,
    data: Partial<schema.InsertFolder>,
  ): Promise<schema.Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;

    const updatedFolder = { ...folder, ...data };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    return this.folders.delete(id);
  }

  async getTestCountByFolder(): Promise<
    { folderId: number; testCount: number }[]
  > {
    const result: { folderId: number; testCount: number }[] = [];

    for (const [folderId, test_case_ids] of this.testCaseFolders.entries()) {
      result.push({
        folderId,
        testCount: test_case_ids.size,
      });
    }

    return result;
  }

  async assignTestCaseToFolder(
    test_case_id: number,
    folderId: number,
  ): Promise<schema.TestCaseFolder> {
    // Initialize folder set if it doesn't exist
    if (!this.testCaseFolders.has(folderId)) {
      this.testCaseFolders.set(folderId, new Set());
    }

    const folderSet = this.testCaseFolders.get(folderId)!;

    // Check if already assigned
    if (folderSet.has(test_case_id)) {
      return {
        id: this.testCaseFolderId++,
        test_case_id,
        folderId,
      };
    }

    // Assign to folder
    folderSet.add(test_case_id);

    const result: schema.TestCaseFolder = {
      id: this.testCaseFolderId++,
      test_case_id,
      folderId,
    };

    return result;
  }

  async removeTestCaseFromFolder(
    test_case_id: number,
    folderId: number,
  ): Promise<boolean> {
    let folderSet = this.testCaseFolders.get(folderId);

    if (!folderSet) {
      return false;
    }

    let result = folderSet.delete(test_case_id);
    return result;
  }

  async getTestCaseFolders(test_case_id: number): Promise<schema.Folder[]> {
    const folders: schema.Folder[] = [];

    for (let [folderId, test_case_ids] of this.testCaseFolders.entries()) {
      if (test_case_ids.has(test_case_id)) {
        let folder = this.folders.get(folderId);
        if (folder) {
          folders.push(folder);
        }
      }
    }

    return folders;
  }

  // Test run operations
  async createTestRun(testRun: schema.InsertTestRun): Promise<schema.TestRun> {
    const id = this.testRunId++;
    const newTestRun: schema.TestRun = {
      ...testRun,
      id,
      started_at: new Date(),
      complete_at: null,
      duration: null,
    };
    this.testRuns.set(id, newTestRun);
    return newTestRun;
  }

  async getTestRun(id: number): Promise<schema.TestRun | undefined> {
    return this.testRuns.get(id);
  }

  async getTestRuns(): Promise<schema.TestRun[]> {
    return Array.from(this.testRuns.values()).sort(
      (a, b) => b.started_at.getTime() - a.started_at.getTime(),
    );
  }

  async updateTestRun(
    id: number,
    data: Partial<schema.InsertTestRun>,
  ): Promise<schema.TestRun | undefined> {
    const testRun = this.testRuns.get(id);
    if (!testRun) return undefined;

    const updatedTestRun = { ...testRun, ...data };
    this.testRuns.set(id, updatedTestRun);
    return updatedTestRun;
  }

  async completeTestRun(id: number): Promise<schema.TestRun | undefined> {
    const testRun = this.testRuns.get(id);
    if (!testRun) return undefined;

    const now = new Date();
    testRun.status = "completed";
    testRun.complete_at = now;
    testRun.duration = Math.floor(
      (now.getTime() - testRun.started_at.getTime()) / 1000,
    );
    this.testRuns.set(id, testRun);
    return testRun;
  }

  // Test run results operations
  async createTestRunResult(
    result: schema.InsertTestRunResult,
  ): Promise<schema.TestRunResult> {
    const id = this.test_run_result_id++;
    const newResult: schema.TestRunResult = {
      ...result,
      id,
      executed_at: new Date(),
    };

    if (!this.testRunResults.has(result.runId)) {
      this.testRunResults.set(result.runId, []);
    }

    this.testRunResults.get(result.runId)!.push(newResult);

    // Update test case status
    const testCase = this.testCases.get(result.test_case_id);
    if (testCase) {
      testCase.status = result.status;
      testCase.last_run = new Date();
      this.testCases.set(result.test_case_id, testCase);
    }

    return newResult;
  }

  async getTestRunResults(runId: number): Promise<schema.TestRunResult[]> {
    return this.testRunResults.get(runId) || [];
  }

  async getTestStatusCounts(): Promise<{ status: string; count: number }[]> {
    const statusCounts: { status: string; count: number }[] = [];
    const statusMap: { [key: string]: number } = {};

    for (const testCase of this.testCases.values()) {
      if (statusMap[testCase.status]) {
        statusMap[testCase.status]++;
      } else {
        statusMap[testCase.status] = 1;
      }
    }

    for (const status in statusMap) {
      statusCounts.push({ status, count: statusMap[status] });
    }

    return statusCounts;
  }

  // Bug operations
  async createBug(bug: schema.InsertBug): Promise<schema.Bug> {
    const id = this.bugId++;
    const newBug: schema.Bug = {
      ...bug,
      id,
      reported_at: new Date(),
      updated_at: new Date(),
    };
    this.bugs.set(id, newBug);
    return newBug;
  }

  async getBug(id: number): Promise<schema.Bug | undefined> {
    return this.bugs.get(id);
  }

  async getBugs(filters?: {
    status?: string;
    test_case_id?: number;
  }): Promise<schema.Bug[]> {
    let bugs = Array.from(this.bugs.values());

    if (filters?.status) {
      bugs = bugs.filter((bug) => bug.status === filters.status);
    }

    if (filters?.test_case_id) {
      bugs = bugs.filter((bug) => bug.test_case_id === filters.test_case_id);
    }

    return bugs.sort((a, b) => b.reported_at.getTime() - a.reported_at.getTime());
  }

  async updateBug(
    id: number,
    data: Partial<schema.InsertBug>,
  ): Promise<schema.Bug | undefined> {
    const bug = this.bugs.get(id);
    if (!bug) return undefined;

    const updated_ata = {
      ...data,
      updated_at: new Date(),
    };

    const updatedBug = { ...bug, ...updated_ata };
    this.bugs.set(id, updatedBug);
    return updatedBug;
  }

  // Whiteboard operations
  async createWhiteboard(
    whiteboard: schema.InsertWhiteboard,
  ): Promise<schema.Whiteboard> {
    const id = this.whiteboardId++;
    const newWhiteboard: schema.Whiteboard = {
      ...whiteboard,
      id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.whiteboards.set(id, newWhiteboard);
    return newWhiteboard;
  }

  async getWhiteboard(id: number): Promise<schema.Whiteboard | undefined> {
    return this.whiteboards.get(id);
  }

  async getWhiteboards(): Promise<schema.Whiteboard[]> {
    return Array.from(this.whiteboards.values()).sort(
      (a, b) => b.updated_at.getTime() - a.updated_at.getTime(),
    );
  }

  async updateWhiteboard(
    id: number,
    data: Partial<schema.InsertWhiteboard>,
  ): Promise<schema.Whiteboard | undefined> {
    const whiteboard = this.whiteboards.get(id);
    if (!whiteboard) return undefined;

    const updated_ata = {
      ...data,
      updated_at: new Date(),
    };

    const updatedWhiteboard = { ...whiteboard, ...updated_ata };
    this.whiteboards.set(id, updatedWhiteboard);
    return updatedWhiteboard;
  }

  // AI Test Case operations
  async saveAITestCase(
    aiTestCase: schema.InsertAITestCase,
  ): Promise<schema.AITestCase> {
    const id = this.aitest_case_id++;
    const newAITestCase: schema.AITestCase = {
      ...aiTestCase,
      id,
      created_at: new Date(),
      imported: false,
    };
    this.aiTestCases.set(id, newAITestCase);
    return newAITestCase;
  }

  async markAITestCaseAsImported(id: number): Promise<void> {
    const aiTestCase = this.aiTestCases.get(id);
    if (aiTestCase) {
      aiTestCase.imported = true;
      this.aiTestCases.set(id, aiTestCase);
    }
  }

  async getAITestCases(userId: number): Promise<schema.AITestCase[]> {
    return Array.from(this.aiTestCases.values())
      .filter((aiTestCase) => aiTestCase.created_by === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Activity log operations
  async logActivity(
    log: schema.InsertActivityLog,
  ): Promise<schema.ActivityLog> {
    const id = this.activityLogId++;
    const newActivityLog: schema.ActivityLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.activityLogs.push(newActivityLog);
    return newActivityLog;
  }

  async getRecentActivities(limit: number = 10): Promise<
    (schema.ActivityLog & {
      user: Pick<schema.User, "username" | "full_name">;
    })[]
  > {
    return this.activityLogs
      .slice(0, limit)
      .map((log) => {
        const user = this.users.get(log.user_id);
        return {
          ...log,
          user: {
            username: user?.username || "Unknown",
            full_name: user?.full_name || "Unknown",
          },
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTestStatusStats(): Promise<{ status: string; count: number }[]> {
    return this.getTestStatusCounts();
  }

  async getRecentTestCases(limit: number = 5): Promise<schema.TestCase[]> {
    return Array.from(this.testCases.values())
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
      .slice(0, limit);
  }

  async getTestRunStats(): Promise<{
    totalRuns: number;
    avgDuration: number | null;
    passRate: number | null;
  }> {
    const testRuns = Array.from(this.testRuns.values());
    const totalRuns = testRuns.length;

    const completedRuns = testRuns.filter(
      (run) => run.status === "completed" && run.duration !== null,
    );
    const avgDuration =
      completedRuns.length > 0
        ? completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0) /
          completedRuns.length
        : null;

    let passedCount = 0;
    let totalCount = 0;

    for (const results of this.testRunResults.values()) {
      totalCount += results.length;
      passedCount += results.filter(
        (result) => result.status === "passed",
      ).length;
    }

    const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : null;

    return {
      totalRuns,
      avgDuration,
      passRate,
    };
  }
}

export const storage = new SupabaseStorage();
