import "dotenv/config";
import express, { NextFunction } from "express";
import bunyan from "bunyan";
import { v4 } from "uuid";
import * as schema from "./db/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cars } from "./db/schema.js";
import { eq } from "drizzle-orm";

const log = bunyan.createLogger({
  name: "gcp-lab",
  serializers: bunyan.stdSerializers,
});

const dbUrl = process.env.POSTGRES_URL!;

const client = postgres(dbUrl);

const db = drizzle(client, { schema });

const app = express();
const port = 8080;

app.use((req: any, res, next: NextFunction) => {
  req.log = log.child({ req_id: v4() }, true);
  req.log.info({ message: req.method, req: req });
  res.on("finish", () => req.log.info({ message: "Response!", res }));
  next();
});

app.use(express.json());

app.get("/status", (req: any, res: any) => {
  req.log.info({ message: "GET /status" });
  res.json("OK");
});

app.get("/cars", (req: any, res: any) => {
  req.log.info({ message: "GET /cars" });
  res.json(cars);
});

app.get("/cars/:id", async (req: any, res: any) => {
  const { id } = req.body;
  req.log.info({ message: `GET /cars/${id}` });
  const car = await db.query.cars.findFirst({ where: eq(cars.id, id) });
  if (!car) {
    res.sendStatus(404);
  } else {
    res.json(car);
  }
});

app.patch("/cars", async (req, res) => {
  const { carId } = req.body;
  const car = await db.query.cars.findFirst({ where: eq(cars.id, carId) });
  if (!car) {
    return res.sendStatus(404);
  }
  if (car.status == "purchased") {
    return res.json("Not available");
  }
  await db
    .update(cars)
    .set({ status: "purchased" })
    .where(eq(cars.id, carId))
    .returning();

  res.send();
});

app.post("/cars", async (req, res) => {
  const car = await db.insert(cars).values({ status: "available" }).returning();
  res.json(car);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use((err: any, req: any, res: any, next: NextFunction) => {
  req.log.error({ message: err.message, err });
  res.status(500).json("Internal server error");
});
