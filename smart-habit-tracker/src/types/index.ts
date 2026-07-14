import {
  Skill,
  Module,
  Subtopic,
  DailyTask,
  WeeklyTask,
  UserSettings,
  RotationCursor,
  CollegeClassRule,
  CollegeClassTask,
  TaskStatus,
  TaskSource,
} from "@prisma/client";

export type {
  Skill,
  Module,
  Subtopic,
  DailyTask,
  WeeklyTask,
  UserSettings,
  RotationCursor,
  CollegeClassRule,
  CollegeClassTask,
};

export { TaskStatus, TaskSource };

// View Models for UI
export type ModuleWithSubtopics = Module & {
  subtopics: Subtopic[];
};

export type SkillWithModules = Skill & {
  modules: ModuleWithSubtopics[];
};
