import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import TaskService from "../services/taskService.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeTask = (overrides = {}) => ({
  _id: "task1",
  title: "Test Task",
  description: "desc",
  status: "Todo",
  priority: "Low",
  version: 1,
  lastModified: new Date("2024-01-01"),
  createdBy: { _id: "user1", toString: () => "user1" },
  assignedUser: null,
  updatedBy: null,
  toObject: function () { return { ...this }; },
  ...overrides,
});

const makeService = (overrides = {}) => {
  const taskRepository = {
    findTaskById: jest.fn(),
    updateTask: jest.fn(),
    countActiveTasksForUser: jest.fn(),
    ...overrides.taskRepository,
  };
  const actionService = {
    logAndEmit: jest.fn().mockResolvedValue(null),
    ...overrides.actionService,
  };
  const userRepository = {
    findUserById: jest.fn().mockResolvedValue({ fullName: "Alice", email: "a@b.com" }),
    findUser: jest.fn(),
    ...overrides.userRepository,
  };
  const sharedTaskRepository = {
    getTeamsByTask: jest.fn().mockResolvedValue([]),
    ...overrides.sharedTaskRepository,
  };
  const teamRepository = {
    getTeamsByUser: jest.fn().mockResolvedValue([]),
    getTeamById: jest.fn(),
    ...overrides.teamRepository,
  };
  const io = { emit: jest.fn() };

  const service = new TaskService(
    taskRepository,
    actionService,
    userRepository,
    sharedTaskRepository,
    teamRepository,
    io
  );

  return { service, taskRepository, actionService, userRepository, sharedTaskRepository, teamRepository, io };
};

// ─── smartAssign ────────────────────────────────────────────────────────────

describe("TaskService.smartAssign", () => {
  it("throws if teamId is not provided", async () => {
    const { service } = makeService();
    await expect(service.smartAssign("task1", "user1", null)).rejects.toThrow(
      "teamId is required"
    );
  });

  it("throws if task is not found", async () => {
    const { service, taskRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(null);
    await expect(service.smartAssign("task1", "user1", "team1")).rejects.toThrow(
      "Task not found"
    );
  });

  it("throws if caller is not the task creator", async () => {
    const { service, taskRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(makeTask());
    // user2 is not the creator (user1)
    await expect(service.smartAssign("task1", "user2", "team1")).rejects.toThrow(
      "Only the task creator can use smart assign"
    );
  });

  it("throws if team is not found", async () => {
    const { service, taskRepository, teamRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(makeTask());
    teamRepository.getTeamById.mockResolvedValue(null);
    await expect(service.smartAssign("task1", "user1", "team1")).rejects.toThrow(
      "Team not found"
    );
  });

  it("throws if caller is not a team member", async () => {
    const { service, taskRepository, teamRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(makeTask());
    teamRepository.getTeamById.mockResolvedValue({
      _id: "team1",
      members: [{ _id: "user99", toString: () => "user99" }],
    });
    await expect(service.smartAssign("task1", "user1", "team1")).rejects.toThrow(
      "You must be a member of the team"
    );
  });

  it("assigns to creator when no other team members exist", async () => {
    const { service, taskRepository, teamRepository, io, actionService } = makeService();
    const task = makeTask();
    taskRepository.findTaskById.mockResolvedValue(task);
    taskRepository.updateTask.mockResolvedValue({ ...task, assignedUser: "user1" });
    teamRepository.getTeamById.mockResolvedValue({
      _id: "team1",
      // only the creator is a member
      members: [{ _id: "user1", toString: () => "user1" }],
    });

    const result = await service.smartAssign("task1", "user1", "team1");

    expect(taskRepository.updateTask).toHaveBeenCalledWith("task1", { assignedUser: "user1" });
    expect(io.emit).toHaveBeenCalledWith("taskAssigned", expect.any(Object));
    expect(result.message).toMatch(/no team members available/i);
  });

  it("assigns to the member with the lowest active task count", async () => {
    const { service, taskRepository, teamRepository, io } = makeService();
    const task = makeTask();
    taskRepository.findTaskById.mockResolvedValue(task);
    taskRepository.updateTask.mockResolvedValue({ ...task, assignedUser: "user3" });
    teamRepository.getTeamById.mockResolvedValue({
      _id: "team1",
      members: [
        { _id: "user1", toString: () => "user1" }, // creator — excluded
        { _id: "user2", toString: () => "user2" },
        { _id: "user3", toString: () => "user3" },
      ],
    });
    // user2 has 5 tasks, user3 has 2 — should pick user3
    taskRepository.countActiveTasksForUser
      .mockResolvedValueOnce(5)  // user2
      .mockResolvedValueOnce(2); // user3

    const result = await service.smartAssign("task1", "user1", "team1");

    expect(taskRepository.updateTask).toHaveBeenCalledWith("task1", {
      assignedUser: "user3",
    });
    expect(io.emit).toHaveBeenCalledWith("taskAssigned", expect.objectContaining({
      _id: task._id,
    }));
    expect(result.message).toMatch(/2 active tasks/i);
  });
});

// ─── resolveConflict ────────────────────────────────────────────────────────

describe("TaskService.resolveConflict", () => {
  it("throws if task is not found", async () => {
    const { service, taskRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(null);
    await expect(
      service.resolveConflict("task1", "user1", "overwrite", {})
    ).rejects.toThrow("Task not found");
  });

  it("throws if user has no access", async () => {
    const { service, taskRepository } = makeService();
    // task owned by user99, no team access
    taskRepository.findTaskById.mockResolvedValue(
      makeTask({ createdBy: { _id: "user99", toString: () => "user99" } })
    );
    await expect(
      service.resolveConflict("task1", "user1", "overwrite", {})
    ).rejects.toThrow("not authorized");
  });

  it("throws on invalid resolution type", async () => {
    const { service, taskRepository } = makeService();
    taskRepository.findTaskById.mockResolvedValue(makeTask());
    taskRepository.updateTask.mockResolvedValue(makeTask({ version: 2 }));
    await expect(
      service.resolveConflict("task1", "user1", "invalid", {})
    ).rejects.toThrow("Invalid resolution type");
  });

  it("overwrites server version with client data", async () => {
    const { service, taskRepository, io } = makeService();
    const serverTask = makeTask({ version: 3, title: "Server Title" });
    const clientData = { title: "Client Title", description: "new desc" };
    const updatedTask = makeTask({ version: 4, title: "Client Title" });

    taskRepository.findTaskById.mockResolvedValue(serverTask);
    taskRepository.updateTask.mockResolvedValue(updatedTask);

    const result = await service.resolveConflict("task1", "user1", "overwrite", clientData);

    expect(taskRepository.updateTask).toHaveBeenCalledWith(
      "task1",
      expect.objectContaining({
        title: "Client Title",
        version: 4, // serverTask.version + 1
        updatedBy: "user1",
      })
    );
    expect(io.emit).toHaveBeenCalledWith("taskUpdated", updatedTask);
    expect(result).toEqual(updatedTask);
  });

  it("merges server and client data with client taking precedence", async () => {
    const { service, taskRepository } = makeService();
    const serverTask = makeTask({
      version: 2,
      title: "Server Title",
      description: "Server Desc",
      priority: "High",
    });
    const clientData = { title: "Client Title" }; // only overrides title
    const updatedTask = makeTask({ version: 3 });

    taskRepository.findTaskById.mockResolvedValue(serverTask);
    taskRepository.updateTask.mockResolvedValue(updatedTask);

    await service.resolveConflict("task1", "user1", "merge", clientData);

    expect(taskRepository.updateTask).toHaveBeenCalledWith(
      "task1",
      expect.objectContaining({
        title: "Client Title",      // client wins
        description: "Server Desc", // server preserved
        priority: "High",           // server preserved
        version: 3,
      })
    );
  });

  it("logs conflict_resolved action after successful resolution", async () => {
    const { service, taskRepository, actionService } = makeService();
    const serverTask = makeTask({ version: 1 });
    taskRepository.findTaskById.mockResolvedValue(serverTask);
    taskRepository.updateTask.mockResolvedValue(makeTask({ version: 2 }));

    await service.resolveConflict("task1", "user1", "overwrite", { title: "x" });

    expect(actionService.logAndEmit).toHaveBeenCalledWith(
      "user1",
      expect.anything(),
      "conflict_resolved",
      expect.objectContaining({ resolutionType: "overwrite" })
    );
  });
});
