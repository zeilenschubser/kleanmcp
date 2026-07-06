import {
  ToolDefinition,
  type CallToolResult,
  type ToolDefinitionGeneric,
  type ToolSet,
} from "../src/types";

export const Tool1 = ToolDefinition(
  "tool_name_1",
  "this tool is a test tool 1",
  [
    {
      name: "arg1",
      description: "describing arg1",
      type: "string",
      required: false,
    },
  ] as const,
)(async (
  _reference: object,
  arg_string: string,
  _extra?: any,
): Promise<CallToolResult> => {
  return {
    content: [
      {
        type: "text",
        text: arg_string,
      },
    ],
  };
});

export const Tool2 = ToolDefinition(
  "tool_name_2",
  "this tool is a test tool 2",
  [
    {
      name: "arg1",
      description: "describing arg1",
      type: "string",
      required: false,
    },
    {
      name: "arg2",
      description: "describing arg2",
      type: "boolean",
      required: false,
    },
  ] as const,
)(async (
  _reference: any,
  arg1: string,
  arg2: boolean,
  _extra?: any,
): Promise<CallToolResult> => {
  throw new Error("this always fails");
});

export class TestToolSet implements ToolSet {
  getTools(): ToolDefinitionGeneric[] {
    return [Tool1, Tool2];
  }
  getTool(toolName: string): ToolDefinitionGeneric | undefined {
    return this.getTools().find(x => x.name == toolName);
  }
}
