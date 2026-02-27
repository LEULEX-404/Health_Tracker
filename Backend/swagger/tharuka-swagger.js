/**
 * OpenAPI 3.0 spec for Tharuka Sanjeewa — Health System APIs
 * Swagger UI: http://localhost:5000/api-docs
 */

export const tharukaSwaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Tharuka — Health System APIs",
    version: "1.0.0",
    description: "Health Data, Simulator, Reports, Nutrition, Meal Plans, Meal Reminders",
    contact: { name: "Tharuka Sanjeewa" },
  },
  servers: [{ url: "http://localhost:5000", description: "Development" }],
  tags: [
    { name: "Health Data", description: "Manual vitals, PDF upload, records, alerts" },
    { name: "Simulator", description: "Simulated health readings" },
    { name: "Reports", description: "Weekly/monthly reports, PDF export" },
    { name: "Nutrition", description: "Meal logging, analysis, recommendations" },
    { name: "Meal Plans", description: "Meal plans CRUD and suggestions" },
    { name: "Meal Reminders", description: "Reminders generation and status" },
  ],
  paths: {
    // ─── Health Data ─────────────────────────────────────────
    "/api/health-data/manual": {
      post: {
        tags: ["Health Data"],
        summary: "Save manual health vitals",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string", example: "6992c5e3bd17b4b1f475e988" },
                  heartRate: { type: "number", example: 75 },
                  bloodPressure: {
                    type: "object",
                    properties: { systolic: { type: "number" }, diastolic: { type: "number" } },
                  },
                  oxygenLevel: { type: "number", example: 98 },
                  temperature: { type: "number", example: 36.5 },
                  glucoseLevel: { type: "number", example: 100 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Health data saved" }, 400: { description: "Bad request" } },
      },
    },
    "/api/health-data/pdf-upload": {
      post: {
        tags: ["Health Data"],
        summary: "Upload PDF health report",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  pdf: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "PDF processed" }, 400: { description: "Bad request" } },
      },
    },
    "/api/health-data/{userId}": {
      get: {
        tags: ["Health Data"],
        summary: "Get user health records",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "source", in: "query", schema: { type: "string", enum: ["manual", "pdf", "simulator"] } },
        ],
        responses: { 200: { description: "List of records" } },
      },
    },
    "/api/health-data/record/{id}": {
      get: {
        tags: ["Health Data"],
        summary: "Get single health record by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Record" }, 404: { description: "Not found" } },
      },
    },
    "/api/health-data/alerts/{userId}": {
      get: {
        tags: ["Health Data"],
        summary: "Get alert history",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "severity", in: "query", schema: { type: "string" } },
          { name: "resolved", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "List of alerts" } },
      },
    },
    "/api/health-data/alerts/{alertId}/resolve": {
      patch: {
        tags: ["Health Data"],
        summary: "Mark alert as resolved",
        parameters: [{ name: "alertId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Alert resolved" }, 404: { description: "Not found" } },
      },
    },
    // ─── Simulator ───────────────────────────────────────────
    "/api/health-data/simulator": {
      post: {
        tags: ["Simulator"],
        summary: "Run single simulation",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string" },
                  scenario: { type: "string", enum: ["normal", "emergency", "oxygen_drop"], default: "normal" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Simulated reading created" } },
      },
    },
    "/api/health-data/simulator/bulk": {
      post: {
        tags: ["Simulator"],
        summary: "Bulk simulate readings",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string" },
                  count: { type: "integer", default: 5 },
                  scenario: { type: "string", enum: ["normal", "emergency", "oxygen_drop"] },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Readings created" } },
      },
    },
    // ─── Reports ─────────────────────────────────────────────
    "/api/reports/weekly/{userId}": {
      get: {
        tags: ["Reports"],
        summary: "Get weekly health report",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Weekly report" } },
      },
    },
    "/api/reports/monthly/{userId}": {
      get: {
        tags: ["Reports"],
        summary: "Get monthly health report",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Monthly report" } },
      },
    },
    "/api/reports/export/pdf/{userId}": {
      get: {
        tags: ["Reports"],
        summary: "Export report as PDF",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["weekly", "monthly"], default: "weekly" } },
        ],
        responses: { 200: { description: "PDF file" } },
      },
    },
    // ─── Nutrition ───────────────────────────────────────────
    "/api/nutrition": {
      post: {
        tags: ["Nutrition"],
        summary: "Log meal",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "mealType"],
                properties: {
                  userId: { type: "string" },
                  mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                  mealName: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { name: { type: "string" }, quantity: { type: "number" }, unit: { type: "string" } },
                    },
                  },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Meal logged" } },
      },
    },
    "/api/nutrition/{userId}": {
      get: {
        tags: ["Nutrition"],
        summary: "Get user nutrition records",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "date", in: "query", schema: { type: "string" } },
          { name: "mealType", in: "query", schema: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Records" } },
      },
    },
    "/api/nutrition/analysis/{userId}": {
      get: {
        tags: ["Nutrition"],
        summary: "Get nutrition analysis",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["weekly", "monthly"], default: "weekly" } },
        ],
        responses: { 200: { description: "Analysis" } },
      },
    },
    "/api/nutrition/{id}": {
      put: {
        tags: ["Nutrition"],
        summary: "Update meal",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string" },
                  mealType: { type: "string" },
                  mealName: { type: "string" },
                  items: { type: "array" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } },
      },
      delete: {
        tags: ["Nutrition"],
        summary: "Delete meal",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", required: ["userId"], properties: { userId: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } },
      },
    },
    "/api/nutrition/{id}/recommendation": {
      post: {
        tags: ["Nutrition"],
        summary: "Add doctor recommendation",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["doctorId"],
                properties: {
                  doctorId: { type: "string" },
                  message: { type: "string" },
                  targetCalories: { type: "number" },
                  targetProtein: { type: "number" },
                  targetCarbohydrates: { type: "number" },
                  targetFat: { type: "number" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Recommendation added" }, 404: { description: "Not found" } },
      },
    },
    // ─── Meal Plans ──────────────────────────────────────────
    "/api/meal-plans": {
      post: {
        tags: ["Meal Plans"],
        summary: "Create meal plan",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "planName", "mealType"],
                properties: {
                  userId: { type: "string" },
                  planName: { type: "string" },
                  mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
                  mealName: { type: "string" },
                  healthConditions: { type: "array", items: { type: "string" } },
                  items: { type: "array", items: { type: "object" } },
                  scheduledDays: { type: "array", items: { type: "integer" } },
                  scheduledTime: { type: "string", example: "08:00" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Meal plan created" } },
      },
    },
    "/api/meal-plans/{userId}": {
      get: {
        tags: ["Meal Plans"],
        summary: "Get user meal plans",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "healthCondition", in: "query", schema: { type: "string" } },
          { name: "mealType", in: "query", schema: { type: "string" } },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Meal plans" } },
      },
    },
    "/api/meal-plans/detail/{id}": {
      get: {
        tags: ["Meal Plans"],
        summary: "Get meal plan by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "userId", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Meal plan" }, 404: { description: "Not found" } },
      },
    },
    "/api/meal-plans/suggest/{userId}": {
      get: {
        tags: ["Meal Plans"],
        summary: "Suggest meal plans by health conditions",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Suggested plans" } },
      },
    },
    "/api/meal-plans/health-condition/{userId}/{healthCondition}": {
      get: {
        tags: ["Meal Plans"],
        summary: "Get plans by health condition",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "healthCondition", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Meal plans" } },
      },
    },
    "/api/meal-plans/{id}": {
      put: {
        tags: ["Meal Plans"],
        summary: "Update meal plan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string" },
                  planName: { type: "string" },
                  mealType: { type: "string" },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } },
      },
      delete: {
        tags: ["Meal Plans"],
        summary: "Delete meal plan",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", required: ["userId"], properties: { userId: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } },
      },
    },
    // ─── Meal Reminders ──────────────────────────────────────
    "/api/meal-reminders/{userId}": {
      get: {
        tags: ["Meal Reminders"],
        summary: "Get user reminders",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string" } },
          { name: "endDate", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Reminders" } },
      },
    },
    "/api/meal-reminders/generate/{userId}": {
      post: {
        tags: ["Meal Reminders"],
        summary: "Generate reminders from active meal plans",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Generated reminders" } },
      },
    },
    "/api/meal-reminders/{id}/complete": {
      put: {
        tags: ["Meal Reminders"],
        summary: "Mark reminder completed",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", required: ["userId"], properties: { userId: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Completed" }, 404: { description: "Not found" } },
      },
    },
    "/api/meal-reminders/{id}/skip": {
      put: {
        tags: ["Meal Reminders"],
        summary: "Mark reminder skipped",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", required: ["userId"], properties: { userId: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Skipped" }, 404: { description: "Not found" } },
      },
    },
  },
};
