"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const env_1 = require("./src/utils/env");
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/pg-rbac/schema.prisma",
    migrations: {
        path: "prisma/pg-rbac/migrations",
    },
    datasource: {
        url: env_1.env.str("PG_RBAC_DATABASE_URL"),
    },
});
//# sourceMappingURL=prisma.config.js.map