import { Response } from "express";
import { db } from "../config/db";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { sendSuccess, sendError, isDbConnectionError } from "../utils/apiResponse";

function parseNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function emptyPagination(page: number, limit: number) {
  return {
    page,
    limit,
    total: 0,
    totalPages: 1,
  };
}

export class AdminController {
  // Dashboard Statistics
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalProjects,
        totalGenerations,
        totalTemplates,
        totalExports,
        successfulGenerations,
        failedGenerations,
        generationDuration,
        topProviders,
        recentUsers,
        recentProjects,
        recentGenerations,
        recentExports,
        dailyGenerations,
        weeklyGenerations,
        monthlyGenerations
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.user.count({ where: { isActive: false } }),
        db.project.count(),
        db.generation.count(),
        db.template.count(),
        db.exportHistory.count(),
        db.generation.count({ where: { status: "SUCCESS" } }),
        db.generation.count({ where: { status: "FAILED" } }),
        db.generation.aggregate({ _avg: { durationMs: true } }),
        db.generation.groupBy({
          by: ["provider"],
          _count: { provider: true },
          orderBy: { _count: { provider: "desc" } },
          take: 5,
        }),
        db.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            isActive: true,
          }
        }),
        db.project.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }),
        db.generation.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }),
        db.exportHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        db.generation.count({ where: { createdAt: { gte: today } } }),
        db.generation.count({ where: { createdAt: { gte: weekAgo } } }),
        db.generation.count({ where: { createdAt: { gte: monthAgo } } }),
      ]);

      sendSuccess(res, {
        stats: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          totalProjects,
          totalGenerations,
          totalTemplates,
          totalExports,
          successfulGenerations,
          failedGenerations,
          averageGenerationDuration: Math.round(generationDuration._avg.durationMs ?? 0),
          dailyGenerations,
          weeklyGenerations,
          monthlyGenerations,
        },
        topProviders: topProviders.map((provider) => ({ provider: provider.provider, count: provider._count.provider })),
        recent: {
          users: recentUsers,
          projects: recentProjects,
          generations: recentGenerations,
          exports: recentExports,
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching dashboard stats:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          stats: {
            totalUsers: 0,
            activeUsers: 0,
            suspendedUsers: 0,
            totalProjects: 0,
            totalGenerations: 0,
            totalTemplates: 0,
            totalExports: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            averageGenerationDuration: 0,
            dailyGenerations: 0,
            weeklyGenerations: 0,
            monthlyGenerations: 0,
          },
          topProviders: [],
          recent: {
            users: [],
            projects: [],
            generations: [],
            exports: [],
          },
        });
        return;
      }
      sendError(res, "Failed to fetch dashboard statistics", "ADMIN_FETCH_DASHBOARD_FAILED");
    }
  }

  // User Management
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, role, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'suspended') {
        where.isActive = false;
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                projects: true,
                generations: true
              }
            }
          }
        }),
        db.user.count({ where })
      ]);

      sendSuccess(res, {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching users:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          users: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 20)),
        });
        return;
      }
      sendError(res, "Failed to fetch users", "ADMIN_FETCH_USERS_FAILED");
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      const user = await db.user.update({
        where: { id },
        data: {
          name,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true
        }
      });

      sendSuccess(res, { user });
    } catch (error) {
      console.error("[AdminController] Error updating user:", error);
      sendError(res, "Failed to update user", "ADMIN_UPDATE_USER_FAILED");
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      await db.user.delete({
        where: { id }
      });

      sendSuccess(res, { message: "User deleted" });
    } catch (error) {
      console.error("[AdminController] Error deleting user:", error);
      sendError(res, "Failed to delete user", "ADMIN_DELETE_USER_FAILED");
    }
  }

  // Project Management
  static async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { prompt: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [projects, total] = await Promise.all([
        db.project.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            _count: {
              select: {
                versions: true
              }
            }
          }
        }),
        db.project.count({ where })
      ]);

      sendSuccess(res, {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching projects:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          projects: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 20)),
        });
        return;
      }
      sendError(res, "Failed to fetch projects", "ADMIN_FETCH_PROJECTS_FAILED");
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      await db.project.delete({
        where: { id }
      });

      sendSuccess(res, { message: "Project deleted" });
    } catch (error) {
      console.error("[AdminController] Error deleting project:", error);
      sendError(res, "Failed to delete project", "ADMIN_DELETE_PROJECT_FAILED");
    }
  }

  // Generation Logs
  static async getGenerations(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status, provider, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { prompt: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status as string;
      }

      if (provider) {
        where.provider = provider as string;
      }

      const [generations, total] = await Promise.all([
        db.generation.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }),
        db.generation.count({ where })
      ]);

      sendSuccess(res, {
        generations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching generations:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          generations: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 20)),
        });
        return;
      }
      sendError(res, "Failed to fetch generations", "ADMIN_FETCH_GENERATIONS_FAILED");
    }
  }

  static async deleteGeneration(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await db.generation.delete({ where: { id } });
      sendSuccess(res, { message: "Generation deleted" });
    } catch (error) {
      console.error("[AdminController] Error deleting generation:", error);
      sendError(res, "Failed to delete generation", "ADMIN_DELETE_GENERATION_FAILED");
    }
  }

  // Template Management
  static async getTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, category, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (category) {
        where.category = category as string;
      }

      const [templates, total] = await Promise.all([
        db.template.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        }),
        db.template.count({ where })
      ]);

      sendSuccess(res, {
        templates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.max(1, Math.ceil(total / Number(limit)))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching templates:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          templates: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 20)),
        });
        return;
      }
      sendError(res, "Failed to fetch templates", "ADMIN_FETCH_TEMPLATES_FAILED");
    }
  }

  static async deleteTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await db.template.delete({ where: { id } });
      sendSuccess(res, { message: "Template deleted" });
    } catch (error) {
      console.error("[AdminController] Error deleting template:", error);
      sendError(res, "Failed to delete template", "ADMIN_DELETE_TEMPLATE_FAILED");
    }
  }

  static async updateTemplateFeatured(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const template = await db.template.update({
        where: { id },
        data: { isFeatured },
      });

      sendSuccess(res, { template });
    } catch (error) {
      console.error("[AdminController] Error updating template feature status:", error);
      sendError(res, "Failed to update template", "ADMIN_UPDATE_TEMPLATE_FAILED");
    }
  }

  // Export History
  static async getExportHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20, search, format } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.OR = [
          { project: { name: { contains: search as string, mode: 'insensitive' } } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
          { user: { name: { contains: search as string, mode: 'insensitive' } } }
        ];
      }

      if (format) {
        where.format = format as string;
      }

      const [exportsHistory, total] = await Promise.all([
        db.exportHistory.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            },
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }),
        db.exportHistory.count({ where })
      ]);

      sendSuccess(res, {
        exports: exportsHistory.map((record) => ({
          id: record.id,
          type: record.format,
          projectId: record.projectId,
          projectName: record.project?.name ?? '',
          userId: record.userId,
          userEmail: record.user?.email ?? '',
          userName: record.user?.name ?? null,
          format: record.format,
          createdAt: record.createdAt,
          downloadCount: 1,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.max(1, Math.ceil(total / Number(limit)))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching export history:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          exports: [],
          pagination: {
            page: Number(req.query.page ?? 1),
            limit: Number(req.query.limit ?? 20),
            total: 0,
            totalPages: 1,
          },
        });
        return;
      }
      sendError(res, "Failed to fetch export history", "ADMIN_FETCH_EXPORT_HISTORY_FAILED");
    }
  }

  static async deleteExport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await db.exportHistory.delete({ where: { id } });
      sendSuccess(res, { message: "Export deleted" });
    } catch (error) {
      console.error("[AdminController] Error deleting export:", error);
      sendError(res, "Failed to delete export", "ADMIN_DELETE_EXPORT_FAILED");
    }
  }

  // Security Logs
  static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.OR = [
          { action: { contains: search as string, mode: 'insensitive' } },
          { resource: { contains: search as string, mode: 'insensitive' } },
          { metadata: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        }),
        db.auditLog.count({ where })
      ]);

      sendSuccess(res, {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching audit logs:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          logs: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 50)),
        });
        return;
      }
      sendError(res, "Failed to fetch audit logs", "ADMIN_FETCH_AUDIT_LOGS_FAILED");
    }
  }

  static async getLoginHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.OR = [
          { ipAddress: { contains: search as string, mode: 'insensitive' } },
          { userAgent: { contains: search as string, mode: 'insensitive' } },
          { failureReason: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [logs, total] = await Promise.all([
        db.loginHistory.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        }),
        db.loginHistory.count({ where })
      ]);

      sendSuccess(res, {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("[AdminController] Error fetching login history:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          logs: [],
          pagination: emptyPagination(parseNumber(req.query.page, 1), parseNumber(req.query.limit, 50)),
        });
        return;
      }
      sendError(res, "Failed to fetch login history", "ADMIN_FETCH_LOGIN_HISTORY_FAILED");
    }
  }

  // Provider Stats
  static async getProviderStats(req: AuthenticatedRequest, res: Response) {
    try {
      const providers = await db.providerStats.findMany({
        orderBy: { totalRequests: "desc" },
      });
      sendSuccess(res, { providers });
    } catch (error) {
      console.error("[AdminController] Error fetching provider stats:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, { providers: [] });
        return;
      }
      sendError(res, "Failed to fetch provider stats", "ADMIN_FETCH_PROVIDER_STATS_FAILED");
    }
  }

  static async updateProviderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { provider } = req.params;
      const { isEnabled } = req.body;

      const updated = await db.providerStats.update({
        where: { provider },
        data: { isEnabled },
      });

      sendSuccess(res, { provider: updated });
    } catch (error) {
      console.error("[AdminController] Error updating provider status:", error);
      sendError(res, "Failed to update provider status", "ADMIN_UPDATE_PROVIDER_STATUS_FAILED");
    }
  }

  // App Settings
  static async getAppSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await db.appSettings.findFirst();
      sendSuccess(res, { settings });
    } catch (error) {
      console.error("[AdminController] Error fetching app settings:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, { settings: null });
        return;
      }
      sendError(res, "Failed to fetch app settings", "ADMIN_FETCH_APP_SETTINGS_FAILED");
    }
  }

  static async updateAppSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      let settings = await db.appSettings.findFirst();

      if (!settings) {
        settings = await db.appSettings.create({ data });
      } else {
        settings = await db.appSettings.update({
          where: { id: settings.id },
          data,
        });
      }

      sendSuccess(res, { settings });
    } catch (error) {
      console.error("[AdminController] Error updating app settings:", error);
      sendError(res, "Failed to update app settings", "ADMIN_UPDATE_APP_SETTINGS_FAILED");
    }
  }

  // System Status
  static async getSystemStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const metrics = await db.systemMetrics.findFirst({
        orderBy: { createdAt: "desc" },
      });
      const settings = await db.appSettings.findFirst();

      sendSuccess(res, {
        metrics: metrics || null,
        settings: {
          maintenanceMode: settings?.maintenanceMode ?? false,
          maintenanceMessage: settings?.maintenanceMessage ?? null,
        },
      });
    } catch (error) {
      console.error("[AdminController] Error fetching system status:", error);
      if (isDbConnectionError(error)) {
        sendSuccess(res, {
          metrics: null,
          settings: {
            maintenanceMode: false,
            maintenanceMessage: null,
          },
        });
        return;
      }
      sendError(res, "Failed to fetch system status", "ADMIN_FETCH_SYSTEM_STATUS_FAILED");
    }
  }
}
