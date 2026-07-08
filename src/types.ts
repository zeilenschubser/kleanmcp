export * from "elysia-jsonrpc/mcp";
export * from "elysia-jsonrpc/rpc";
export * from "elysia-jsonrpc";

export type ParamType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "Record<string, any>";

export type ParamDef = {
  type: ParamType;
  required?: boolean;
  default?: ParamDef["type"];
  name: string;
  description: string;
};

export type ExtractType<T extends ParamDef["type"]> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "object"
        ? object
        : T extends "Record<string, any>"
          ? Record<string, any>
          : never;

export type MethodResult<
  TResult,
  TParams extends readonly ParamDef[],
  TExtra = any,
> = {
  name: string;
  params: TParams;
  callback: (...args: [...ParamsToTuple<TParams>, TExtra]) => Promise<TResult>;
};

export type NamedParam<N extends string, T extends ParamDef> = T & { name: N };

export type ParamsToTuple<T extends readonly ParamDef[]> = {
  [K in keyof T]: T[K] extends ParamDef ? ExtractType<T[K]["type"]> : never;
};
export type NamedParamsToTuple<
  T extends readonly NamedParam<string, ParamDef>[],
> = {
  [K in keyof T]: T[K] extends NamedParam<string, infer P>
    ? P extends ParamDef
      ? ExtractType<P["type"]>
      : never
    : never;
};

export interface PropertyDescription {
  type: string;
  description: string;
}

export interface InputSchemaType {
  [x: string]: unknown;
  type: "object";
  properties?: Record<string, PropertyDescription>;
  required?: string[];
}

export type ToolParameterDefinition = {
  required: boolean;
  type: string;
  description: string;
  default?: object;
};

export type NamedToolParameterDefinition = ToolParameterDefinition & {
  name: string;
};

export interface CallToolResult {
  content: any[];
  isError?: boolean;
}

export function InputSchemaFromParameters(
  params: NamedToolParameterDefinition[],
): InputSchemaType {
  return {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(params).map(([k,v]) => [
        v.name,
        {
          description: v.description,
          type: v.type,
          default: v.default,
        } as PropertyDescription,
      ]),
    ) as Record<string, PropertyDescription>,
    required: Object.entries(params)
      .map(([k, v]) => (v.required ? k : undefined))
      .filter((v): v is string => v !== undefined),
  } as InputSchemaType;
}
export function ToolArgsToParameterList<
  TParams extends readonly NamedParam<string, ParamDef>[] = [],
>(toolArgs: Record<string, any>, params: TParams): (any | undefined)[] {
  let res: any[] = [];
  for (const param of params) {
    res.push(toolArgs[param.name] ?? param.default ?? undefined);
  }
  return res;
}

export type ToolDefinitionCreator<
  ReferencedServerType,
  TParams extends readonly NamedParam<string, ParamDef>[] = [],
> = <UserRef extends ReferencedServerType, TExtra = any>(
  callback: (
    ...args: [UserRef, ...NamedParamsToTuple<TParams>, TExtra?]
  ) => Promise<CallToolResult>,
) => any;

export function ToolDefinition<
  ReferencedServerType = any,
  TParams extends readonly NamedParam<string, ParamDef>[] = [],
>(methodName: string, methodDescription: string, params: TParams): ToolDefinitionCreator<ReferencedServerType, TParams> {
  return <UserRef extends ReferencedServerType, TExtra = any>(
    callback: (
      ...args: [UserRef, ...NamedParamsToTuple<TParams>, TExtra?]
    ) => Promise<CallToolResult>,
  ) => {
    return {
      name: methodName,
      description: methodDescription,
      params,
      callback,
    };
  };
}

export type ToolDefinitionGeneric<
  ReferencedServerType = any,
  // TParams extends readonly NamedParam<string, ParamDef>[] = [],
  TParams = any,
> = {
  name: string;
  description: string;
  params: TParams;
  callback: (
    argfirst: ReferencedServerType,
    ...args: any[]
  ) => Promise<CallToolResult>;
};

export interface ToolResult {
  content: PropertyDescription[]; // TODO: maybe change
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: InputSchemaType;
}

export interface ToolSet {
  getTools(): ToolDefinitionGeneric[];
  getTool(toolName: string): ToolDefinitionGeneric | undefined;
}
