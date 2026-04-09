/**
 * Seed script — wipes all collections and inserts fresh demo data.
 * Run: npm run seed
 *
 * Creates:
 *   3 users  (alice, bob, carol)
 *   1 team   (alice is owner, bob + carol are members)
 *   6 tasks  (mix of statuses / priorities, some assigned)
 *   subtasks, comments, shared tasks, action logs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
import User       from "../src/schemas/userSchema.js";
import Task       from "../src/schemas/taskSchema.js";
import Teams      from "../src/schemas/teamSchema.js";
import Comments   from "../src/schemas/commentSchema.js";
import SubTasks   from "../src/schemas/subtasksSchema.js";
import SharedTask from "../src/schemas/sharedTaskSchema.js";
import Action     from "../src/schemas/ActionLogSchema.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✔  Connected to MongoDB");

  // ── Wipe ──────────────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Teams.deleteMany({}),
    Comments.deleteMany({}),
    SubTasks.deleteMany({}),
    SharedTask.deleteMany({}),
    Action.deleteMany({}),
  ]);
  console.log("✔  Cleared all collections");

  // ── Users ─────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("Test@1234", 10);

  const [alice, bob, carol] = await User.insertMany([
    { fullName: "Alice Johnson",  email: "alice@taskforge.dev",  password, role: "user" },
    { fullName: "Bob Martinez",   email: "bob@taskforge.dev",    password, role: "user" },
    { fullName: "Carol Williams", email: "carol@taskforge.dev",  password, role: "user" },
  ]);
  console.log("✔  Created 3 users  (password: Test@1234)");

  // ── Team ──────────────────────────────────────────────────────────────────
  const team = await Teams.create({
    name: "Product Squad",
    description: "Core product development team",
    createdBy: alice._id,
    members: [alice._id, bob._id, carol._id],
  });
  console.log("✔  Created team: Product Squad");

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const taskDefs = [
    {
      title: "Design new onboarding flow",
      description: "Redesign the user onboarding experience to improve activation rate. Include tooltips, progress indicators, and a welcome checklist.",
      status: "In Progress",
      priority: "High",
      createdBy: alice._id,
      assignedUser: bob._id,
    },
    {
      title: "Fix login rate-limit bug",
      description: "The rate limiter is blocking legitimate users after 3 failed attempts instead of 10. Investigate and patch the express-rate-limit config.",
      status: "Todo",
      priority: "High",
      createdBy: alice._id,
      assignedUser: alice._id,
    },
    {
      title: "Write API documentation",
      description: "Document all REST endpoints using OpenAPI 3.0 spec. Cover auth, tasks, teams, comments, attachments, and shared tasks.",
      status: "Todo",
      priority: "Medium",
      createdBy: bob._id,
      assignedUser: carol._id,
    },
    {
      title: "Add pagination to task list",
      description: "Implement cursor-based pagination on GET /tasks. Default page size 20, max 100. Return total count and next cursor in response.",
      status: "Done",
      priority: "Medium",
      createdBy: bob._id,
      assignedUser: bob._id,
    },
    {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions to run tests on every PR and auto-deploy to Render on merge to main.",
      status: "In Progress",
      priority: "Low",
      createdBy: carol._id,
      assignedUser: carol._id,
    },
    {
      title: "Implement dark mode",
      description: "Add class-based dark mode using Tailwind. Persist preference in localStorage. Add Moon/Sun toggle in navbar.",
      status: "Done",
      priority: "Low",
      createdBy: carol._id,
      assignedUser: alice._id,
    },
  ];

  const tasks = await Task.insertMany(taskDefs);
  console.log(`✔  Created ${tasks.length} tasks`);

  const [t1, t2, t3, t4, t5, t6] = tasks;

  // ── Subtasks ──────────────────────────────────────────────────────────────
  await SubTasks.insertMany([
    // t1 subtasks
    { title: "Sketch wireframes",          status: "Done",        parentTask: t1._id, createdBy: alice._id, assignedUser: bob._id   },
    { title: "Build welcome checklist UI", status: "In Progress", parentTask: t1._id, createdBy: alice._id, assignedUser: bob._id   },
    { title: "Write copy for tooltips",    status: "Todo",        parentTask: t1._id, createdBy: alice._id, assignedUser: carol._id },
    // t2 subtasks
    { title: "Reproduce the bug locally",  status: "Done",        parentTask: t2._id, createdBy: alice._id, assignedUser: alice._id },
    { title: "Patch rate-limit config",    status: "Todo",        parentTask: t2._id, createdBy: alice._id, assignedUser: alice._id },
    // t3 subtasks
    { title: "Document /tasks endpoints",  status: "In Progress", parentTask: t3._id, createdBy: bob._id,   assignedUser: carol._id },
    { title: "Document /teams endpoints",  status: "Todo",        parentTask: t3._id, createdBy: bob._id,   assignedUser: carol._id },
  ]);
  console.log("✔  Created subtasks");

  // ── Comments ──────────────────────────────────────────────────────────────
  await Comments.insertMany([
    { taskId: t1._id, userId: alice._id, comment: "Wireframes look great! Let's move to implementation." },
    { taskId: t1._id, userId: bob._id,   comment: "I'll have the checklist component ready by Friday." },
    { taskId: t2._id, userId: alice._id, comment: "Confirmed — the threshold is set to 3 in the config. Fixing now." },
    { taskId: t3._id, userId: carol._id, comment: "Starting with the tasks endpoints first since they're most complex." },
    { taskId: t4._id, userId: bob._id,   comment: "Pagination is live. Default 20, max 100 per page." },
    { taskId: t5._id, userId: carol._id, comment: "Pipeline is running. Tests pass on every PR now." },
    { taskId: t6._id, userId: alice._id, comment: "Dark mode shipped! Preference persists across sessions." },
  ]);
  console.log("✔  Created comments");

  // ── Shared tasks ──────────────────────────────────────────────────────────
  await SharedTask.insertMany([
    { team: team._id, task: t1._id, sharedBy: alice._id, permissions: "edit" },
    { team: team._id, task: t3._id, sharedBy: bob._id,   permissions: "view" },
    { team: team._id, task: t5._id, sharedBy: carol._id, permissions: "full" },
  ]);
  console.log("✔  Shared 3 tasks with Product Squad");

  // ── Action logs ───────────────────────────────────────────────────────────
  const logs = [
    { user: alice._id, task: t1._id, actionType: "created"       },
    { user: alice._id, task: t2._id, actionType: "created"       },
    { user: bob._id,   task: t3._id, actionType: "created"       },
    { user: bob._id,   task: t4._id, actionType: "created"       },
    { user: carol._id, task: t5._id, actionType: "created"       },
    { user: carol._id, task: t6._id, actionType: "created"       },
    { user: alice._id, task: t1._id, actionType: "assigned",      metadata: { assignedTo: bob._id   } },
    { user: bob._id,   task: t3._id, actionType: "assigned",      metadata: { assignedTo: carol._id } },
    { user: alice._id, task: t1._id, actionType: "comment_added"  },
    { user: bob._id,   task: t4._id, actionType: "updated"        },
    { user: carol._id, task: t6._id, actionType: "updated"        },
    { user: alice._id, task: null,   actionType: "team_created",  metadata: { teamName: "Product Squad" } },
    { user: alice._id, task: null,   actionType: "member_invited", metadata: { invitedEmail: bob.email   } },
    { user: alice._id, task: null,   actionType: "member_invited", metadata: { invitedEmail: carol.email } },
  ];
  await Action.insertMany(logs);
  console.log("✔  Created action logs");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────");
  console.log("  Seed complete! Login with any account:");
  console.log("  alice@taskforge.dev  /  Test@1234");
  console.log("  bob@taskforge.dev    /  Test@1234");
  console.log("  carol@taskforge.dev  /  Test@1234");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
