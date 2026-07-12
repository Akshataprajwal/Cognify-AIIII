import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/adminAuth";

export const adminRouter = Router();

// Apply authentication and admin check to all admin routes
adminRouter.use(authenticate as any, requireAdmin);

// Dashboard
adminRouter.get("/dashboard", AdminController.getDashboardStats);

// User Management
adminRouter.get("/users", AdminController.getUsers);
adminRouter.patch("/users/:id", AdminController.updateUser);
adminRouter.delete("/users/:id", AdminController.deleteUser);

// Project Management
adminRouter.get("/projects", AdminController.getProjects);
adminRouter.delete("/projects/:id", AdminController.deleteProject);

// Generation Logs
adminRouter.get("/generations", AdminController.getGenerations);
adminRouter.delete("/generations/:id", AdminController.deleteGeneration);

// Template Management
adminRouter.get("/templates", AdminController.getTemplates);
adminRouter.delete("/templates/:id", AdminController.deleteTemplate);
adminRouter.patch("/templates/:id/featured", AdminController.updateTemplateFeatured);

// Export History
adminRouter.get("/exports", AdminController.getExportHistory);
adminRouter.delete("/exports/:id", AdminController.deleteExport);

// Security
adminRouter.get("/audit-logs", AdminController.getAuditLogs);
adminRouter.get("/login-history", AdminController.getLoginHistory);

// Provider Management
adminRouter.get("/providers", AdminController.getProviderStats);
adminRouter.patch("/providers/:provider/status", AdminController.updateProviderStatus);

// App Settings
adminRouter.get("/settings", AdminController.getAppSettings);
adminRouter.patch("/settings", AdminController.updateAppSettings);

// System Status
adminRouter.get("/system-status", AdminController.getSystemStatus);
