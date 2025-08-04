import { connect } from "mongoose";
import dotenv from "dotenv";
import { buildServer } from "./server";

dotenv.config();

const start = async () => {
  try {
    await connect(process.env.MONGO_URI as string);
    const app = buildServer();

    const port = parseInt(process.env.PORT || "3000", 10);
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
