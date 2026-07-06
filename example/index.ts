import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import {
  type CallToolResult,
  type JSONRPCErrorResponse,
  type ToolDefinitionGeneric,
  type ToolSet,
  type JSONRPCResponse,
  ToolDefinition,
} from 'leanmcp/types'
import { treaty } from '@elysiajs/eden';
import {
  MCPServerService,
  elysiaJsonRPC
 } from 'leanmcp';

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


const serverService = new MCPServerService(
  "testServerTitle",
  "1.0.0",
  "No instructions",
  (toolName: string) => {
    return serverService;
  },
  [new TestToolSet()],
);

export const app = new Elysia().use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "mcp-protocol-version",
    "mcp-session-id",
  ]
})).use(elysiaJsonRPC({
  debug: true,
  dns_rebind_origin: undefined,
  service: serverService,
  onError: (res: JSONRPCErrorResponse) => {
    // console.log("onError", res.error.data);
  },
  onResponse: (res: any) => {
    // console.log("onResponse");
  },
  onRequest: (res: any) => {
    // console.log("onRequest");
  },
}));

const client = treaty<typeof app>(app);
const resp = await client["stream"].post({
  id: "1",
  jsonrpc: "2.0",
  method: "tools/list",
});

const response = resp.data as JSONRPCResponse;
if (response.id == "1" && response.jsonrpc == "2.0" && response.result) {
  console.log("works!")
} else {
  console.error("failed!")
}
