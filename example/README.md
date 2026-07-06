# test_leanmcp

## Example

```
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
```
