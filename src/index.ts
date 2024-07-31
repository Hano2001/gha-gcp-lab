import express, { NextFunction } from "express";
import bunyan from "bunyan";
import { v4 } from "uuid";

const log = bunyan.createLogger({
  name: "gcp-lab",
  serializers: bunyan.stdSerializers,
});

type Car = {
  id: string;
  status: "available" | "purchased";
};

const cars: Car[] = [
  {
    id: "1",
    status: "available",
  },
  {
    id: "2",
    status: "purchased",
  },
  {
    id: "3",
    status: "available",
  },
];

const app = express();
const port = 8080;

app.use((req: any, res, next: NextFunction) => {
  req.log = log.child({ req_id: v4() }, true);
  req.log.info({ message: req.method, req: req });
  res.on("finish", () => req.log.info({ message: "Response!", res }));
  next();
});

app.use(express.json());

app.get("/cars", (req: any, res: any) => {
  req.log.info({ message: "GET /cars" });
  res.json(cars);
});

app.get("/cars/:id", (req: any, res: any) => {
  const { id } = req.body;
  req.log.info({ message: `GET /cars/${id}` });
  const car = cars.find((car) => car.id == id);
  if (!car) {
    res.sendStatus(404);
  } else {
    res.json(car);
  }
});

app.post("/cars", (req, res) => {
  const { id } = req.body;

  const car = cars.find((car) => car.id == id);
  if (!car) {
    return res.sendStatus(404);
  }
  if (car.status == "purchased") {
    return res.json("Not available");
  }
  car.status = "purchased";
  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use((err: any, req: any, res: any, next: NextFunction) => {
  req.log.error({ message: err.message, err });
  res.status(500).json("Internal server error");
});
