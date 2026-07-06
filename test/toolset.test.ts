import { describe, expect, it, test } from "bun:test";
import { TestToolSet } from "./testToolSet";


describe("TestToolSet", () => {
  const toolSet = new TestToolSet();
  test("that the toolset can handle any name", async () => {
    expect(toolSet.getTool("tool_name_1")).not.toBeUndefined();
  });
  const tools = toolSet.getTools();
  for (const toolId in tools) {
    const tool = tools[toolId];
    if (!tool) continue;
    test(`that the toolset ${toolId} is constructed correctly`, async () => {
      expect(tool.name).toBeOneOf(["tool_name_1", "tool_name_2"]);
      expect(tool.description).not.toBe("");
      expect(tool.params).toBeArray();
      expect(tool.params).not.toBeArrayOfSize(0);
      expect(tool.params.length).toBeOneOf([1, 2]);
    });
    // test(`that the toolset ${i} is callable with any amount of args`, async () => {
    const callback = tool.callback;
    const args = [this, "test", false, "test"];

    for (let n = 0; n < args.length + 1; n++) {
      test(`should handle ${n} args correctly `, async () => {
        const result = await expect(async () => {
          const xargs = args.slice(0, n);
          const ret = await (callback as any)(...xargs);
          expect(ret).toBeObject();
          expect(ret.content).toBeArrayOfSize(1);
          if(n > 1) expect(ret.content[0].text).toBe(args[1]);
        });
        if (toolId == "0") {
          result.not.toThrow();
        } else if (toolId == "1") {
          result.toThrow("this always fails");
        }
      });
    }
  }
});
