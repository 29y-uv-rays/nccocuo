-- CreateTable
CREATE TABLE "EventState" (
    "id" SERIAL NOT NULL,
    "durationMinutes" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "startTime" TIMESTAMP(3),
    "isStarted" BOOLEAN NOT NULL DEFAULT false,
    "isExploded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefusalRecord" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "timeTakenSeconds" DOUBLE PRECISION NOT NULL,
    "defusedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefusalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefusalRecord_groupId_timeTakenSeconds_key" ON "DefusalRecord"("groupId", "timeTakenSeconds");

-- AddForeignKey
ALTER TABLE "DefusalRecord" ADD CONSTRAINT "DefusalRecord_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
