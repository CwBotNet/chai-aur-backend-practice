import { Router } from "express";
import { healthcheck } from "../Controllers/Healthcheck.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(healthcheck)
  .post(healthcheck)
  .delete(healthcheck)
  .patch(healthcheck);
router
  .route("/secure")
  .get(verifyJwt, healthcheck)
  .post(healthcheck)
  .patch(healthcheck)
  .delete(healthcheck);

export default router;
