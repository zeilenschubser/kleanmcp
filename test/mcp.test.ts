


import { describe, expect, it, test } from "bun:test";
import { MCPServerService } from "../src";
import { TestToolSet } from "./testToolSet";

describe("MCPServerService", () => {
  const serverService = new MCPServerService(
    "testServerTitle",
    "1.0.0",
    "No instructions",
    (toolName: string) => { return serverService },
    [
      new TestToolSet(),
    ]
  );

  test("that the server has the tools", async () => {
    const toolsListResult = await serverService["tools/list"]({});
    expect(toolsListResult.tools).toBeArrayOfSize(2);
    expect(toolsListResult.tools.at(0)?.name).toBe("tool_name_1");
    expect(toolsListResult.tools.at(1)?.name).toBe("tool_name_2");
  });

  test("that the server has callable tools that works without args", async () => {
    const toolsListResult = await serverService["tools/call"]({
      name: "tool_name_1"
    });
    expect(toolsListResult.isError).toBeFalse();
    expect(toolsListResult.content).toBeArrayOfSize(1)
    expect(toolsListResult.content[0]).toBeObject();
    expect(toolsListResult.content[0]?.type).toBe("text");
    expect(toolsListResult.content[0]?.text).toBe(undefined);
  });

  test("that the server has callable tools that works with args", async () => {
    const toolsListResult = await serverService["tools/call"]({
      name: "tool_name_1",
      arguments: {
        "arg1": "any"
      }
    });
    expect(toolsListResult.isError).toBeFalse();
    expect(toolsListResult.content).toBeArrayOfSize(1)
    expect(toolsListResult.content[0]).toBeObject();
    expect(toolsListResult.content[0]?.type).toBe("text");
    expect(toolsListResult.content[0]?.text).toBe("any");
  });

  test("that the server has callable tools that works with arg name validation", async () => {
    const toolsListResult = await serverService["tools/call"]({
      name: "tool_name_1",
      arguments: {
        "arg0": "any"
      }
    });
    expect(toolsListResult.isError).toBeFalse();
    expect(toolsListResult.content).toBeArrayOfSize(1)
    expect(toolsListResult.content[0]).toBeObject();
    expect(toolsListResult.content[0]?.type).toBe("text");
    expect(toolsListResult.content[0]?.text).toBe(undefined); // since we dont have the correct argument name
  });

});
