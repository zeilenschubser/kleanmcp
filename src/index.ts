
import {
  InputSchemaFromParameters,
  ToolArgsToParameterList,
  type CallToolResult,
  type Tool,
  type ToolDefinitionGeneric,
  type ToolSet
} from "./types";

import {
  MCPError,
  type InitializeParams,
  type InitializeResult,
  type MCPServerInterface,
  type PingParams,
  type PingResult,
  type PromptsGetParams,
  type PromptsGetResult,
  type PromptsListParams,
  type PromptsListResult,
  type ResourcesListParams,
  type ResourcesListResult,
  type ResourcesReadParams,
  type ResourcesReadResult,
  type ResourcesSubscribeParams,
  type ResourcesSubscribeResult,
  type ResourcesTemplatesListParams,
  type ResourcesTemplatesListResult,
  type ToolsCallParams,
  type ToolsCallResult,
  type ToolsListParams,
  type ToolsListResult,
} from "elysia-jsonrpc/mcp";

import elysiaJsonRPC from "elysia-jsonrpc";
export { elysiaJsonRPC };

export type ReferenceForToolCallFunction = (toolName: string) => any;

export class MCPServerService implements MCPServerInterface {
  constructor(
    readonly serverTitle: string,
    readonly serverVersion: string,
    readonly serverInstructions: string,
    readonly getReferenceInstanceForToolCall: ReferenceForToolCallFunction,
    readonly toolsets: ToolSet[],
  ) {}
  initialize(params: InitializeParams): Promise<InitializeResult> {
    return Promise.resolve({
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: this.serverTitle,
        version: this.serverVersion,
      },
      protocolVersion: "2025-11-25",
      instructions: this.serverInstructions,
    } as InitializeResult);
  }
  ping(params: PingParams): Promise<PingResult> {
    return Promise.resolve({} as PingResult);
  }
  "tools/list"(params: ToolsListParams): Promise<ToolsListResult> {
    return Promise.resolve({
      tools: this.toolsets.flatMap((toolset: ToolSet): Tool[] => {
        return toolset.getTools().map((tool: ToolDefinitionGeneric): Tool => {
          return {
            name: tool.name,
            description: tool.description,
            inputSchema: InputSchemaFromParameters(
              tool.params,
            )
          }
        });
      })
    } as ToolsListResult);
  }

  getTool(toolName: string): ToolDefinitionGeneric | null {
    for (const toolset of this.toolsets) {
      const maybeTool = toolset.getTool(toolName);
      if (maybeTool) return maybeTool;
    }
    return null;
  }

  async "tools/call"(params: ToolsCallParams): Promise<ToolsCallResult> {
    const toolName: string = params.name;
    const toolArgs: any = params.arguments || {};
    const tool = this.getTool(toolName);
    if (!tool) throw new MCPError("Tool not found!", { toolName: toolName });
    const referenceInstance = this.getReferenceInstanceForToolCall(toolName);
    const result: CallToolResult = await tool.callback(
      referenceInstance,
      ...ToolArgsToParameterList(toolArgs, tool.params),
      {},
    );
    return ((result: CallToolResult) => {toolArgs
      return {
        toolUseId: "",
        content: result.content,
        type: "tool_result",
        isError: result.isError || false,
      } as ToolsCallResult;
    })(result);
  }
  "prompts/list"(params: PromptsListParams): Promise<PromptsListResult> {
    throw new Error("Method not implemented.");
  }
  "prompts/get"(params: PromptsGetParams): Promise<PromptsGetResult> {
    throw new Error("Method not implemented.");
  }
  "resources/list"(params: ResourcesListParams): Promise<ResourcesListResult> {
    throw new Error("Method not implemented.");
  }
  "resources/read"(params: ResourcesReadParams): Promise<ResourcesReadResult> {
    throw new Error("Method not implemented.");
  }
  "resources/subscribe"(
    params: ResourcesSubscribeParams,
  ): Promise<ResourcesSubscribeResult> {
    throw new Error("Method not implemented.");
  }
  "resources/templates/list"(
    params: ResourcesTemplatesListParams,
  ): Promise<ResourcesTemplatesListResult> {
    throw new Error("Method not implemented.");
  }
}
