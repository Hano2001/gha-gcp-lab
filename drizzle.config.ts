export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  tablesFilter: ["gha_gcp_payments_*"],
};
