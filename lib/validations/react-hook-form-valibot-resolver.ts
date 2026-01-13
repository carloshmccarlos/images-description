import type { FieldValues, Resolver } from 'react-hook-form';
import * as v from 'valibot';

function formatPath(path: Array<string | number>): string {
  if (path.length === 0) return '';
  return path.map(String).join('.');
}

export function valibotResolver<TInput extends FieldValues>(
  schema: v.BaseSchema<unknown, TInput, v.BaseIssue<unknown>>
): Resolver<TInput> {
  return async (values) => {
    const result = v.safeParse(schema, values);

    if (result.success) {
      return {
        values: result.output as unknown as TInput,
        errors: {},
      };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.issues) {
      const key = formatPath((issue.path?.map((p) => p.key) ?? []) as (string | number)[]);
      const fieldKey = key || 'root';
      if (!errors[fieldKey]) {
        errors[fieldKey] = { type: issue.type ?? 'validation', message: issue.message };
      }
    }

    return {
      values: {},
      errors: errors as any,
    };
  };
}
