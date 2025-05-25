export default {
  translation: {
    message: {
      dag_save_success: {
        title: "Saved DAG",
        description: "Successfully saved DAG.",
      },
      dag_save_failed: {
        title: "Failed to save DAG",
        description: "Failed to save DAG.",
      },
      cycle_detected: {
        title: "Invalid Connection",
        description: "This connection would create a cycle in the workflow.",
      },
    },
    placeholders: {
      // Database Operation
      tableName: "Enter table name",
      whereConditions: '{"field": "value"}',

      // Join
      joinType: "Select join type",
      leftTable: "Enter left table",
      rightTable: "Enter right table",
      joinConditions: '{"leftField": "rightField"}',

      // Filter
      filterConditions: '{"field": "value"}',

      // Map
      mapFunction: "Enter map function",

      // Condition
      ifCondition: '{"left": "value1", "operator": "eq", "right": "value2"}',
      elseSteps: "Comma-separated step IDs",

      // Step Form
      stepId: "Enter step ID",
      stepType: "Select a step type",
      nextSteps: "Select next steps",
      dependencies: "Select dependencies",
    },
    labels: {
      // Database Operation
      table: "Table",
      whereConditions: "Where Conditions (JSON)",

      // Join
      joinType: "Join Type",
      leftTable: "Left Table",
      rightTable: "Right Table",
      joinConditions: "Join Conditions (JSON)",

      // Filter
      filterConditions: "Filter Conditions (JSON)",

      // Map
      mapFunction: "Map Function",

      // Condition
      ifCondition: "If Condition (JSON)",
      elseSteps: "Else Steps",

      // Step Form
      stepId: "Step ID",
      stepType: "Step Type",
      nextSteps: "Then (Next Steps)",
      dependencies: "Depends On",
    },
    options: {
      joinTypes: {
        inner: "Inner Join",
        left: "Left Join",
        right: "Right Join",
      },
      stepTypes: {
        dbOperation: "Database Operation",
        join: "Join",
        filter: "Filter",
        map: "Map",
        condition: "Condition",
        http: "HTTP",
      },
    },
  },
} as const;
