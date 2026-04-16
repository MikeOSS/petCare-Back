import type { Prisma } from "@/.generated/client";
import bcrypt from "bcryptjs";
import database from "..";
import "../../logging";

let data: Prisma.UserCreateManyInput[] = [
  {
    id: "cmisyby6m00002v6s2ah6lcn2",
    first_name: "Joao",
    last_name: "Kdouk",
    password: "123123",
    email: "joao@kdouk.com",
    role: "ADMIN",
  },
];

export default async function runner() {
  console.log("Seeding Users");

  data = data.map((entry) => {
    entry.password = bcrypt.hashSync(entry.password!, 12);
    return entry;
  });

  await database.user.createMany({
    skipDuplicates: true,
    data,
  });
}
