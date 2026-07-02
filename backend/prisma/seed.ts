import { PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@company.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@company.com" },
    update: {},
    create: {
      name: "Team Member",
      email: "member@company.com",
      passwordHash,
      role: Role.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "Product Launch",
      description: "Q2 launch planning and execution",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: member.id, role: Role.MEMBER },
        ],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Design landing page",
        description: "Hero section and CTA",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Write API documentation",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        projectId: project.id,
        assigneeId: admin.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Setup CI/CD",
        priority: TaskPriority.LOW,
        status: TaskStatus.DONE,
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete:");
  console.log("  admin@company.com / Password123!");
  console.log("  member@company.com / Password123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
